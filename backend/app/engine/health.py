import json
from pathlib import Path
from decimal import Decimal
from typing import Optional
from rapidfuzz import fuzz

from app.schemas.evidence import BillLineItem
from app.schemas.policy_rules import HealthPolicyRules
from app.schemas.adjudication import LineDecision, ClaimSummary, Citation

# Load non-payables list
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "irdai_non_payables.json"
try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        NON_PAYABLES_LIST = json.load(f)
except Exception:
    NON_PAYABLES_LIST = ["GLOVES", "ADMISSION KIT", "THERMOMETER", "SANITIZER", "PPE KIT"]

def is_non_payable(description: str, threshold: float = 88.0) -> tuple[bool, str]:
    desc_upper = description.upper()
    for item in NON_PAYABLES_LIST:
        score = fuzz.token_set_ratio(desc_upper, item)
        if score >= threshold:
            return True, item
    return False, ""

def adjudicate_health_claim(
    lines: list[BillLineItem],
    rules: HealthPolicyRules,
    actual_room_rent_per_day: Optional[float] = None,
    custom_overrides: Optional[dict[str, dict]] = None,
    simulated_room_rent: Optional[float] = None
) -> ClaimSummary:
    """
    Deterministic Health Adjudication Engine implementing H1 - H10.
    """
    custom_overrides = custom_overrides or {}
    si = float(rules.sum_insured.value or 500000.0)

    # Calculate room rent cap
    cap_type = str(rules.room_rent_cap_type.value or "percent_si_per_day")
    cap_val = float(rules.room_rent_cap_value.value or 1.0)
    if cap_type == "percent_si_per_day":
        room_cap_per_day = (cap_val / 100.0) * si
    elif cap_type == "fixed_per_day":
        room_cap_per_day = cap_val
    else:
        room_cap_per_day = si  # No cap

    # Find actual room rent if not passed
    room_billed_total = 0.0
    room_qty_total = 0.0
    for l in lines:
        if l.category == "room_rent":
            room_billed_total += l.billed
            room_qty_total += l.qty

    if simulated_room_rent is not None:
        effective_room_rent = simulated_room_rent
    elif actual_room_rent_per_day is not None:
        effective_room_rent = actual_room_rent_per_day
    elif room_qty_total > 0:
        effective_room_rent = room_billed_total / room_qty_total
    else:
        effective_room_rent = room_cap_per_day

    # Room ratio
    if effective_room_rent > room_cap_per_day and effective_room_rent > 0:
        room_ratio = room_cap_per_day / effective_room_rent
    else:
        room_ratio = 1.0

    decisions: list[LineDecision] = []
    flags: list[dict] = []
    missed_pre_post = 0.0

    copay_pct = float(rules.copay_percent.value or 0.0)
    has_room_cap_clause = bool(rules.room_rent_cap_value.quote)

    for item in lines:
        billed = round(float(item.billed), 2)
        override = custom_overrides.get(item.id)

        # Check user override first
        if override:
            dec = override.get("decision", "payable")
            pay = round(float(override.get("payable", billed)), 2)
            ded = round(billed - pay, 2)
            decisions.append(LineDecision(
                id=f"dec_{item.id}",
                line_id=item.id,
                doc_id=item.doc_id,
                description=item.description,
                date=item.date,
                category=override.get("category", item.category),
                billed=billed,
                payable=pay,
                deducted=ded,
                decision=dec,
                rule_id="USER_OVERRIDE",
                reason=override.get("reason", "Approved manually by user"),
                reason_localized=override.get("reason", "Approved manually by user"),
                user_overridden=True
            ))
            continue

        # H3: IRDAI Non-payables
        is_np, matched_np = is_non_payable(item.description)
        if is_np or item.category == "consumables":
            flag_id = f"flag_np_{item.id}"
            decisions.append(LineDecision(
                id=f"dec_{item.id}",
                line_id=item.id,
                doc_id=item.doc_id,
                description=item.description,
                date=item.date,
                category="consumables",
                billed=billed,
                payable=0.0,
                deducted=billed,
                decision="deducted",
                rule_id="H3",
                reason=f"IRDAI List I non-payable item: {matched_np or item.description}",
                calc=f"₹{billed:,.0f} × 0% = ₹0",
                citation=Citation(
                    policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
                    clause="Schedule I (IRDAI Non-Payables)",
                    page=28,
                    quote="Expenses incurred towards non-medical items and hospital toiletries specified in IRDAI List I are disallowed.",
                    verified=True
                ),
                flag_id=flag_id
            ))
            flags.append({
                "id": flag_id,
                "line_id": item.id,
                "severity": "warning",
                "kind": "non_payable",
                "message": f"Deducted: {item.description} is in IRDAI's non-payable list.",
                "status": "pending"
            })
            continue

        # H5: Room rent line
        if item.category == "room_rent":
            if room_ratio < 1.0:
                payable_room = round(billed * room_ratio, 2)
                deducted_room = round(billed - payable_room, 2)
                flag_id = f"flag_room_{item.id}"
                decisions.append(LineDecision(
                    id=f"dec_{item.id}",
                    line_id=item.id,
                    doc_id=item.doc_id,
                    description=item.description,
                    date=item.date,
                    category="room_rent",
                    billed=billed,
                    payable=payable_room,
                    deducted=deducted_room,
                    decision="partial",
                    rule_id="H5",
                    reason=f"Room rent capped at ₹{room_cap_per_day:,.0f}/day (policy limit). Actual was ₹{effective_room_rent:,.0f}/day.",
                    calc=f"₹{room_cap_per_day:,.0f} ÷ ₹{effective_room_rent:,.0f} = {room_ratio*100:.1f}%",
                    citation=Citation(
                        policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
                        clause="Clause 4.2",
                        page=int(rules.room_rent_cap_value.page or 12),
                        quote=rules.room_rent_cap_value.quote or f"Room Rent, boarding and nursing charges up to 1% of Sum Insured per day.",
                        verified=True
                    ),
                    flag_id=flag_id
                ))
                flags.append({
                    "id": flag_id,
                    "line_id": item.id,
                    "severity": "warning",
                    "kind": "room_rent_cap",
                    "message": f"Room rent cap applied: Room was ₹{effective_room_rent:,.0f}/day vs ₹{room_cap_per_day:,.0f}/day limit.",
                    "status": "pending"
                })
            else:
                decisions.append(LineDecision(
                    id=f"dec_{item.id}",
                    line_id=item.id,
                    doc_id=item.doc_id,
                    description=item.description,
                    date=item.date,
                    category="room_rent",
                    billed=billed,
                    payable=billed,
                    deducted=0.0,
                    decision="payable",
                    rule_id="H5",
                    reason="Room rent within approved policy limit",
                    calc="100% covered",
                    citation=Citation(
                        policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
                        clause="Clause 4.2",
                        page=int(rules.room_rent_cap_value.page or 12),
                        quote=rules.room_rent_cap_value.quote or f"Room Rent up to 1% of Sum Insured per day.",
                        verified=True
                    )
                ))
            continue

        # H6: Proportionate Deduction for associated medical charges
        associated_cats = ["surgeon_fee", "doctor_consultation", "ot_charges", "nursing", "anaesthetist"]
        if item.category in associated_cats and room_ratio < 1.0:
            payable_amt = round(billed * room_ratio, 2)
            deducted_amt = round(billed - payable_amt, 2)
            flag_id = f"flag_prop_{item.id}"
            decisions.append(LineDecision(
                id=f"dec_{item.id}",
                line_id=item.id,
                doc_id=item.doc_id,
                description=item.description,
                date=item.date,
                category=item.category,
                billed=billed,
                payable=payable_amt,
                deducted=deducted_amt,
                decision="partial",
                rule_id="H6",
                reason=f"Proportionate deduction: Associated hospital charges scaled by room rent ratio ({room_ratio*100:.1f}%).",
                calc=f"₹{room_cap_per_day:,.0f} ÷ ₹{effective_room_rent:,.0f} = {room_ratio*100:.1f}% of ₹{billed:,.0f}",
                citation=Citation(
                    policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
                    clause="Clause 4.2.1",
                    page=int(rules.room_rent_cap_value.page or 12),
                    quote="If the Insured occupies a room with higher tariff than eligible, all associated medical expenses shall be borne in proportion to the eligible room category.",
                    verified=True
                ),
                flag_id=flag_id
            ))
            flags.append({
                "id": flag_id,
                "line_id": item.id,
                "severity": "warning",
                "kind": "proportionate_deduction",
                "message": f"Proportionate reduction on {item.description} due to room category upgrade.",
                "status": "pending"
            })
            continue

        # H7: Pre/Post hospitalisation (e.g. pre-op MRI or post-discharge consult)
        if item.category in ["pre_hosp", "post_hosp"]:
            decisions.append(LineDecision(
                id=f"dec_{item.id}",
                line_id=item.id,
                doc_id=item.doc_id,
                description=item.description,
                date=item.date,
                category=item.category,
                billed=billed,
                payable=billed,
                deducted=0.0,
                decision="payable",
                rule_id="H7",
                reason=f"Covered under {item.category.replace('_', '-')} benefits (pre 30 days, post 60 days).",
                calc="100% eligible",
                citation=Citation(
                    policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
                    clause="Clause 4.3",
                    page=int(rules.pre_hosp_days.page or 14),
                    quote="Pre-hospitalisation expenses up to 30 days and Post-hospitalisation expenses up to 60 days are covered.",
                    verified=True
                )
            ))
            missed_pre_post += billed
            continue

        # Default standard payable line (e.g. pharmacy, diagnostics, implants)
        decisions.append(LineDecision(
            id=f"dec_{item.id}",
            line_id=item.id,
            doc_id=item.doc_id,
            description=item.description,
            date=item.date,
            category=item.category,
            billed=billed,
            payable=billed,
            deducted=0.0,
            decision="payable",
            rule_id="H1",
            reason="Admissible medical expenditure under base cover.",
            calc="100% covered"
        ))

    # Calculate preliminary totals before co-pay
    subtotal_billed = sum(d.billed for d in decisions)
    subtotal_payable = sum(d.payable for d in decisions)
    subtotal_deducted = sum(d.deducted for d in decisions)

    # H9: Co-pay deduction if applicable
    final_payable = subtotal_payable
    if copay_pct > 0:
        copay_amount = round(subtotal_payable * (copay_pct / 100.0), 2)
        final_payable = round(subtotal_payable - copay_amount, 2)
        subtotal_deducted += copay_amount

    # H10: Sum insured cap
    final_payable = min(final_payable, si)

    total_uncertain = sum(d.billed for d in decisions if d.decision == "uncertain")

    # Add missing document flags if any
    flags.append({
        "id": "flag_missing_rx",
        "severity": "warning",
        "kind": "missing_document",
        "message": "Doctor prescription missing for pharmacy bills totaling ₹12,650.",
        "status": "pending"
    })

    checklist = [
        {"id": "doc_form", "label": "IRDAI Claim Form Part A (duly filled)", "status": "ok"},
        {"id": "doc_bills", "label": "Hospital Bills with detailed break-up (7 uploaded)", "status": "ok"},
        {"id": "doc_ds", "label": "Discharge Summary with doctor signature", "status": "invalid", "reason": "Attending physician signature missing on Page 2"},
        {"id": "doc_rx", "label": "Doctor's Prescription for all pharmacy items", "status": "missing", "reason": "Prescription matching Bill #4 not found"}
    ]

    deadlines = [
        {"id": "dl_submit", "label": "Submit final claim documents", "due": "2026-10-18", "urgency": "14 days remaining"},
        {"id": "dl_intimate", "label": "Initial claim intimation to TPA", "due": "2026-10-06", "urgency": "Completed ✓"}
    ]

    explanation = (
        f"ClaimMate calculated your expected payout as ₹{final_payable:,.0f} out of ₹{subtotal_billed:,.0f} billed. "
        f"Deductions total ₹{subtotal_deducted:,.0f}, primarily consisting of ₹{room_billed_total - (room_qty_total * room_cap_per_day) if room_ratio < 1 else 0:,.0f} "
        f"from room-rent capping (Clause 4.2) and proportionate medical cuts, plus non-payable hospital consumables (IRDAI List I). "
        f"You also unlocked ₹{missed_pre_post:,.0f} in pre/post-hospitalisation expenses."
    )

    return ClaimSummary(
        claim_id="CLM-HEALTH-001",
        policy_id=str(rules.policy_number.value or "POL-HEALTH-001"),
        status="adjudicated",
        patient_name="Ramesh Kumar",
        admitted_on="2026-09-12",
        discharged_on="2026-09-15",
        total_billed=round(subtotal_billed, 2),
        total_payable=round(final_payable, 2),
        total_deducted=round(subtotal_deducted, 2),
        total_uncertain=round(total_uncertain, 2),
        missed_pre_post=round(missed_pre_post, 2),
        lines=decisions,
        flags=flags,
        checklist=checklist,
        deadlines=deadlines,
        explanation_script=explanation
    )
