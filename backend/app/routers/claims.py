import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from pydantic import BaseModel

from app.db import get_session
from app.models.claim import Claim
from app.models.policy import Policy
from app.models.flag import Flag
from app.models.audit import AuditEvent
from app.schemas.triage import IncidentTriageRequest, IncidentTriageResponse
from app.schemas.adjudication import WhatIfRequest, WhatIfResponse, NCBRecommendation
from app.schemas.policy_rules import HealthPolicyRules, MotorPolicyRules, Cited
from app.schemas.evidence import RepairEstimate
from app.agents.triage_agent import triage_incident
from app.agents.evidence_extractor import get_demo_health_line_items
from app.engine.health import adjudicate_health_claim
from app.engine.motor import calculate_motor_claim
from app.services.form_filler import generate_claim_summary_pdf
from app.services.pack_builder import build_claim_pack
from app.services.audit import log_audit_event
from app.agents.appeal_drafter import draft_appeal_package

router = APIRouter(tags=["claims"])

# In-memory storage for interactive session overrides during demo
CLAIM_OVERRIDES: dict[str, dict[str, dict]] = {}
MOTOR_SIM_CACHE: dict[str, NCBRecommendation] = {}

class CreateClaimRequest(BaseModel):
    policy_id: str
    incident_text: Optional[str] = None
    type: str = "health"

class LineOverrideRequest(BaseModel):
    decision: str  # "payable" | "deducted" | "partial"
    payable: float
    category: Optional[str] = None
    reason: Optional[str] = "Approved manually by claimant"

class FlagActionRequest(BaseModel):
    action: str  # "approve" | "dispute"
    comment: Optional[str] = None

class GateApprovalRequest(BaseModel):
    gate: int  # 1 or 2
    signature_data: Optional[str] = None

@router.post("/incidents", response_model=IncidentTriageResponse)
async def triage_incident_endpoint(req: IncidentTriageRequest):
    return await triage_incident(req.incident_text, req.incident_lang or "hi-IN")

@router.post("/claims")
def create_claim(req: CreateClaimRequest, session: Session = Depends(get_session)):
    claim = Claim(
        id=f"CLM-{req.type.upper()}-001",
        policy_id=req.policy_id,
        type=req.type,
        status="adjudicated",
        incident_text=req.incident_text,
        patient_name="Ramesh Kumar"
    )
    session.add(claim)
    session.commit()
    log_audit_event(session, claim.id, "CLAIM_CREATED", "user", {"policy_id": req.policy_id})
    return {"claim_id": claim.id, "status": claim.status}

@router.get("/claims/{claim_id}")
def get_claim(claim_id: str, session: Session = Depends(get_session)):
    claim = session.get(Claim, claim_id)
    policy_id = claim.policy_id if claim else "POL-HEALTH-001"

    # Load policy rules
    p = session.get(Policy, policy_id) if claim else None
    if p and p.rules_json:
        rules_dict = json.loads(p.rules_json)
        rules = HealthPolicyRules(**rules_dict)
    else:
        rules = HealthPolicyRules(
            sum_insured=Cited(value=500000.0),
            room_rent_cap_value=Cited(value=1.0, page=12, quote="Room Rent up to 1% of Sum Insured per day."),
            copay_percent=Cited(value=10.0, page=16, quote="Compulsory co-payment of 10% on each admissible claim.")
        )

    lines = get_demo_health_line_items()
    overrides = CLAIM_OVERRIDES.get(claim_id, {})
    summary = adjudicate_health_claim(lines, rules, custom_overrides=overrides)

    # Attach documents tray list
    docs = [
        {"id": "doc_bill_hospital", "kind": "bill", "name": "Apollo_Hospital_Final_Bill_4881.pdf", "thumbUrl": "/thumbs/bill1.png", "status": "done", "lang": "en-IN"},
        {"id": "doc_bill_pharmacy", "kind": "bill", "name": "Pharmacy_Rx_Invoice_9021.pdf", "thumbUrl": "/thumbs/pharmacy.png", "status": "done", "lang": "en-IN"},
        {"id": "doc_bill_consumables", "kind": "bill", "name": "Consumables_Annexure.pdf", "thumbUrl": "/thumbs/consumables.png", "status": "done", "lang": "en-IN"},
        {"id": "doc_ds", "kind": "discharge_summary", "name": "Discharge_Summary_RameshKumar.pdf", "thumbUrl": "/thumbs/ds.png", "status": "issue", "lang": "en-IN"},
        {"id": "doc_mri", "kind": "investigation", "name": "Pre_Hosp_MRI_Diagnostic_Report.pdf", "thumbUrl": "/thumbs/mri.png", "status": "done", "lang": "en-IN"},
        {"id": "doc_marathi", "kind": "bill", "name": "Local_Ambulance_ पावती (Marathi).pdf", "thumbUrl": "/thumbs/marathi.png", "status": "done", "lang": "mr-IN"}
    ]

    summary_dict = summary.model_dump()
    summary_dict["documents"] = docs
    summary_dict["status"] = claim.status if claim else "awaiting_review"
    return summary_dict

@router.patch("/claims/{claim_id}/lines/{line_id}")
def override_line(claim_id: str, line_id: str, req: LineOverrideRequest, session: Session = Depends(get_session)):
    if claim_id not in CLAIM_OVERRIDES:
        CLAIM_OVERRIDES[claim_id] = {}

    CLAIM_OVERRIDES[claim_id][line_id] = {
        "decision": req.decision,
        "payable": req.payable,
        "category": req.category,
        "reason": req.reason
    }

    log_audit_event(session, claim_id, "LINE_OVERRIDE", "user", {
        "line_id": line_id,
        "new_decision": req.decision,
        "new_payable": req.payable
    })
    return {"success": True, "line_id": line_id}

@router.post("/claims/{claim_id}/flags/{flag_id}")
def resolve_flag(claim_id: str, flag_id: str, req: FlagActionRequest, session: Session = Depends(get_session)):
    log_audit_event(session, claim_id, f"FLAG_{req.action.upper()}", "user", {
        "flag_id": flag_id,
        "comment": req.comment
    })
    return {"success": True, "flag_id": flag_id, "status": req.action}

@router.post("/claims/{claim_id}/approve")
def approve_gate(claim_id: str, req: GateApprovalRequest, session: Session = Depends(get_session)):
    claim = session.get(Claim, claim_id)
    if claim:
        if req.gate == 1:
            claim.status = "approved"
        elif req.gate == 2:
            claim.status = "pack_ready"
        session.add(claim)
        session.commit()

    log_audit_event(session, claim_id, f"GATE_{req.gate}_APPROVED", "user", {
        "signature": req.signature_data or "hold_to_sign_verified"
    })
    return {"success": True, "gate": req.gate, "new_status": "pack_ready" if req.gate == 2 else "approved"}

@router.post("/claims/{claim_id}/what-if", response_model=WhatIfResponse)
def what_if_simulation(claim_id: str, req: WhatIfRequest):
    """
    Instantly recalculates the payout if the user chose a different room rent per day.
    """
    rules = HealthPolicyRules(
        sum_insured=Cited(value=500000.0),
        room_rent_cap_value=Cited(value=1.0)
    )
    lines = get_demo_health_line_items()

    old_res = adjudicate_health_claim(lines, rules, simulated_room_rent=8000.0)
    new_res = adjudicate_health_claim(lines, rules, simulated_room_rent=req.room_rent_per_day)

    diff = round(new_res.total_payable - old_res.total_payable, 2)
    if diff > 0:
        exp = f"At ₹{req.room_rent_per_day:,.0f}/day room rent, you save ₹{diff:,.0f} in proportionate deductions!"
    elif diff < 0:
        exp = f"At ₹{req.room_rent_per_day:,.0f}/day, proportionate deductions increase by ₹{abs(diff):,.0f}."
    else:
        exp = "Room rent stays within eligible policy limits."

    return WhatIfResponse(
        room_rent_per_day=req.room_rent_per_day,
        old_payable=old_res.total_payable,
        new_payable=new_res.total_payable,
        difference=diff,
        explanation=exp
    )

@router.get("/claims/{claim_id}/motor-sim", response_model=NCBRecommendation)
def motor_simulation(claim_id: str):
    """
    Returns Motor 'Should I Claim?' calculation comparing net payout to 3-year NCB loss.
    """
    rules = MotorPolicyRules(
        zero_depreciation=Cited(value=False),
        engine_capacity_cc=Cited(value=1197.0),
        vehicle_age_years=Cited(value=3.0),
        no_claim_bonus_percent=Cited(value=35.0),
        voluntary_deductible=Cited(value=0.0)
    )
    estimates = [
        RepairEstimate(id="m_1", doc_id="est_1", part_name="Front Bumper (Plastic)", part_type="plastic", billed=4500.0),
        RepairEstimate(id="m_2", doc_id="est_1", part_name="Windshield Glass", part_type="glass", billed=6200.0),
        RepairEstimate(id="m_3", doc_id="est_1", part_name="Right Front Door Panel (Metal)", part_type="metal", billed=8500.0),
        RepairEstimate(id="m_4", doc_id="est_1", part_name="Denting, Painting & Labour", part_type="labour", billed=5200.0)
    ]
    return calculate_motor_claim(estimates, rules)

@router.get("/claims/{claim_id}/form.pdf")
def download_claim_form_pdf(claim_id: str, session: Session = Depends(get_session)):
    lines = get_demo_health_line_items()
    rules = HealthPolicyRules(sum_insured=Cited(value=500000.0), room_rent_cap_value=Cited(value=1.0))
    summary = adjudicate_health_claim(lines, rules, custom_overrides=CLAIM_OVERRIDES.get(claim_id, {}))

    pdf_bytes = generate_claim_summary_pdf(summary.model_dump())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ClaimMate_Form_{claim_id}.pdf"}
    )

@router.get("/claims/{claim_id}/pack.pdf")
def download_claim_pack_pdf(claim_id: str, session: Session = Depends(get_session)):
    lines = get_demo_health_line_items()
    rules = HealthPolicyRules(sum_insured=Cited(value=500000.0), room_rent_cap_value=Cited(value=1.0))
    summary = adjudicate_health_claim(lines, rules, custom_overrides=CLAIM_OVERRIDES.get(claim_id, {}))

    pdf_bytes = build_claim_pack(summary.model_dump(), [])
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ClaimMate_Bundle_{claim_id}.pdf"}
    )

@router.post("/claims/{claim_id}/appeal")
async def draft_appeal(claim_id: str, lang: str = "hi-IN"):
    return await draft_appeal_package(claim_id, target_lang=lang)

@router.get("/claims/{claim_id}/audit")
def get_audit_trail(claim_id: str, session: Session = Depends(get_session)):
    events = session.exec(select(AuditEvent).where(AuditEvent.claim_id == claim_id)).all()
    return events
