from typing import Any
from pydantic import BaseModel

class RuleResult(BaseModel):
    rule_id: str
    passed: bool
    reason: str
    details: dict[str, Any] = {}
