from datetime import date, timedelta
from typing import Optional

def compute_claim_deadlines(event_date: Optional[date] = None, policy_rules: Optional[dict] = None) -> list[dict]:
    base_date = event_date or date.today()
    intimation_limit = base_date + timedelta(hours=48/24)
    submission_limit = base_date + timedelta(days=30)
    appeal_limit = base_date + timedelta(days=90)

    return [
        {
            "id": "dl_intimation",
            "label": "TPA Claim Intimation",
            "due": intimation_limit.isoformat(),
            "status": "urgent" if (intimation_limit - date.today()).days <= 2 else "pending",
            "description": "Must intimate TPA within 48 hours of admission"
        },
        {
            "id": "dl_submission",
            "label": "Final Documents Submission",
            "due": submission_limit.isoformat(),
            "status": "pending",
            "description": "Submit all original bills and discharge summary within 30 days of discharge"
        },
        {
            "id": "dl_grievance",
            "label": "Insurer Grievance Escalation (GRO)",
            "due": appeal_limit.isoformat(),
            "status": "pending",
            "description": "If rejected or short-settled, 30 days to reply before Ombudsman filing"
        }
    ]
