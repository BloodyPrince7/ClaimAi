from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class AuditEvent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    claim_id: Optional[str] = Field(default=None, index=True)
    ts: datetime = Field(default_factory=datetime.utcnow)
    actor: str = Field(default="system")  # "system" | "user" | "sarvam_105b" | "rules_engine"
    action: str
    payload_json: Optional[str] = None
