import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from app.db import get_session
from app.models.policy import Policy
from app.schemas.policy_rules import HealthPolicyRules, Cited
from app.agents.policy_decoder import decode_health_policy

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.get("/policies")
def list_policies(session: Session = Depends(get_session)):
    policies = session.exec(select(Policy)).all()
    res = []
    for p in policies:
        rules_data = json.loads(p.rules_json) if p.rules_json else None
        res.append({
            "id": p.id,
            "type": p.type,
            "insurer": p.insurer,
            "policy_no": p.policy_no,
            "plan_name": p.plan_name,
            "sum_insured": p.sum_insured,
            "status": p.status,
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "end_date": p.end_date.isoformat() if p.end_date else None,
            "rules": rules_data
        })
    return res

@router.get("/policies/{policy_id}")
def get_policy(policy_id: str, session: Session = Depends(get_session)):
    p = session.get(Policy, policy_id)
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {
        "id": p.id,
        "type": p.type,
        "insurer": p.insurer,
        "policy_no": p.policy_no,
        "plan_name": p.plan_name,
        "sum_insured": p.sum_insured,
        "status": p.status,
        "rules": json.loads(p.rules_json) if p.rules_json else None,
        "pages_text": json.loads(p.pages_text_json) if p.pages_text_json else []
    }
