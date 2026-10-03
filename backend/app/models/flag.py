from typing import Optional
from sqlmodel import SQLModel, Field

class Flag(SQLModel, table=True):
    id: str = Field(primary_key=True)
    claim_id: str = Field(index=True)
    line_id: Optional[str] = Field(default=None, index=True)
    severity: str = Field(default="warning")  # "info" | "warning" | "danger"
    kind: str  # "missing_document" | "non_payable" | "room_rent_cap" | "waiting_period" | "unverified_citation"
    message: str
    message_localized: Optional[str] = None
    status: str = Field(default="pending")  # "pending" | "approved" | "disputed"
    user_comment: Optional[str] = None
