from typing import Optional
from pydantic import BaseModel, Field

class CitationRef(BaseModel):
    title: str
    clause: str
    page: int
    quote: str

class AskQuestionRequest(BaseModel):
    claim_id: Optional[str] = None
    question: str
    lang: str = "en-IN"

class AskQuestionResponse(BaseModel):
    answer: str
    answer_localized: str
    citations: list[CitationRef] = Field(default_factory=list)
    audio_url: Optional[str] = None
