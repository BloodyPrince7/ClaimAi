import json
import uuid
from datetime import datetime
from sqlmodel import Session
from app.models.audit import AuditEvent

def log_audit_event(
    session: Session,
    claim_id: str | None,
    action: str,
    actor: str = "system",
    payload: dict | None = None
) -> AuditEvent:
    event = AuditEvent(
        id=f"audit_{uuid.uuid4().hex[:8]}",
        claim_id=claim_id,
        ts=datetime.utcnow(),
        actor=actor,
        action=action,
        payload_json=json.dumps(payload or {}, ensure_ascii=False)
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event
