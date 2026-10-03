from typing import Optional
from sqlmodel import SQLModel, Field

class Document(SQLModel, table=True):
    id: str = Field(primary_key=True)
    claim_id: Optional[str] = Field(default=None, index=True)
    policy_id: Optional[str] = Field(default=None, index=True)
    kind: str  # "bill" | "discharge_summary" | "estimate" | "investigation" | "rejection_letter" | "policy_wording"
    name: str
    file_path: str
    sha256: Optional[str] = None
    docai_job_id: Optional[str] = None
    status: str = Field(default="done")  # "uploading" | "reading" | "done" | "issue"
    extracted_json: Optional[str] = None
    pages_text: Optional[str] = None
    thumb_url: Optional[str] = None
    doc_lang: Optional[str] = "en-IN"
