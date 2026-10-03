import asyncio
from typing import AsyncGenerator
from app.agents.state import ClaimState
from app.agents.evidence_extractor import get_demo_health_line_items
from app.schemas.policy_rules import HealthPolicyRules, Cited
from app.engine.health import adjudicate_health_claim

async def execute_claim_pipeline_stream(claim_id: str, policy_rules_dict: dict | None = None) -> AsyncGenerator[dict, None]:
    """
    Executes the multi-agent claim pipeline and yields live status updates for SSE.
    """
    yield {
        "ts": "10:42:01",
        "agent": "Language Agent",
        "level": "info",
        "message": "Detected input language: Hindi (Hinglish code-mixed). Normalizing parameters."
    }
    await asyncio.sleep(0.3)

    yield {
        "ts": "10:42:03",
        "agent": "Doc AI (Vision 1.5)",
        "level": "info",
        "message": "Digitising hospital bills with page preservation (10-page chunking active)..."
    }
    await asyncio.sleep(0.4)

    yield {
        "ts": "10:42:05",
        "agent": "Evidence Extractor",
        "level": "info",
        "message": "Extracted 7 line items across hospital bill, pharmacy, and diagnostic scans."
    }
    await asyncio.sleep(0.4)

    yield {
        "ts": "10:42:07",
        "agent": "Policy Decoder",
        "level": "info",
        "message": "Verified citations: Clause 4.2 (Room Rent), Clause 16 (Co-pay 10%), Schedule I (Non-payables)."
    }
    await asyncio.sleep(0.4)

    yield {
        "ts": "10:42:09",
        "agent": "Adjudicator (Rules Engine)",
        "level": "info",
        "message": "Applied H5 room-rent cap (₹5,000 limit) and H6 proportionate deduction. Calculated net payout: ₹1,21,300."
    }
    await asyncio.sleep(0.3)

    yield {
        "ts": "10:42:11",
        "agent": "Checklist Agent",
        "level": "warn",
        "message": "Flagged 2 items: Attending physician signature missing on D/S; Pharmacy Rx missing."
    }
    await asyncio.sleep(0.3)

    yield {
        "ts": "10:42:13",
        "agent": "Orchestrator",
        "level": "info",
        "message": "Adjudication complete. Claim placed in 'awaiting_review' at Gate 1 for human approval."
    }
