from typing import TypedDict, Optional, Any

class ClaimState(TypedDict, total=False):
    claim_id: str
    user_id: str
    policy_id: str
    incident_text: str
    incident_lang: str
    documents: list[dict]
    policy_rules: dict
    line_items: list[dict]
    adjudication_summary: dict
    flags: list[dict]
    checklist: list[dict]
    current_gate: int  # 0: triage confirm, 1: review flags, 2: final approve
    audit_trail: list[dict]
    explanation: str
    explanation_audio_url: Optional[str]
    status: str
