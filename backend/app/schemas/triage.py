from typing import Optional
from pydantic import BaseModel, Field

class IncidentTriageRequest(BaseModel):
    incident_text: str
    incident_lang: Optional[str] = "en-IN"

class TriageSuggestion(BaseModel):
    policy_id: str
    policy_type: str
    insurer: str
    policy_no: str
    title: str
    estimated_payout: float
    urgent_deadline: Optional[str] = None
    deadline_urgency: Optional[str] = None  # "48_hours" | "15_days"
    reason: str
    selected_by_default: bool = True

class IncidentTriageResponse(BaseModel):
    detected_lang: str
    original_text: str
    english_text: str
    matching_policies: list[TriageSuggestion] = Field(default_factory=list)
