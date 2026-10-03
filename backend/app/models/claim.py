from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field

class Claim(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(default="demo_user", index=True)
    policy_id: Optional[str] = Field(default=None, index=True)
    type: str = Field(default="health")  # "health" | "motor"
    status: str = Field(default="draft")  # draft -> extracting -> adjudicated -> awaiting_review -> approved -> pack_ready -> submitted_by_user -> settled | rejected -> appealing
    incident_text: Optional[str] = None
    incident_lang: Optional[str] = "en-IN"
    event_date: Optional[date] = None
    patient_name: Optional[str] = "Ramesh Kumar"
    admit_date: Optional[date] = None
    discharge_date: Optional[date] = None
    graph_thread_id: Optional[str] = None
    summary_json: Optional[str] = None  # JSON string of ClaimSummary
    appeal_json: Optional[str] = None   # JSON string of appeal details
