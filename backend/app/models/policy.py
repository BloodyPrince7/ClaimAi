from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field

class Policy(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(default="demo_user", index=True)
    type: str = Field(index=True)  # "health" | "motor" | "life" | "travel" | "property" | "crop"
    insurer: str
    policy_no: str
    plan_name: Optional[str] = None
    sum_insured: float = 0.0
    status: str = Field(default="ready")  # "decoding" | "ready" | "needs_review"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    wording_pdf_path: Optional[str] = None
    rules_json: Optional[str] = None  # JSON string of decoded rules with citations
    pages_text_json: Optional[str] = None  # JSON list of {page_no, markdown}
