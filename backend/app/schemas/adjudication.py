from typing import Literal, Optional
from pydantic import BaseModel, Field

class Citation(BaseModel):
    policy_id: str
    clause: str
    page: int
    quote: str
    verified: bool = True

class LineDecision(BaseModel):
    id: str
    line_id: str
    doc_id: str
    description: str
    date: Optional[str] = None
    category: str
    billed: float
    payable: float
    deducted: float = 0.0
    decision: Literal["payable", "partial", "deducted", "uncertain"]
    rule_id: str
    reason: str
    reason_localized: Optional[str] = None
    calc: Optional[str] = None  # e.g. "5,000 / 8,000 = 62.5%"
    citation: Optional[Citation] = None
    confidence: float = 0.95
    user_overridden: bool = False
    flag_id: Optional[str] = None

class ClaimSummary(BaseModel):
    claim_id: str
    policy_id: Optional[str] = None
    status: str
    patient_name: str
    admitted_on: Optional[str] = None
    discharged_on: Optional[str] = None
    total_billed: float
    total_payable: float
    total_deducted: float
    total_uncertain: float
    missed_pre_post: float = 0.0
    lines: list[LineDecision] = Field(default_factory=list)
    flags: list[dict] = Field(default_factory=list)
    checklist: list[dict] = Field(default_factory=list)
    deadlines: list[dict] = Field(default_factory=list)
    explanation_script: Optional[str] = None
    explanation_audio_url: Optional[str] = None

class WhatIfRequest(BaseModel):
    room_rent_per_day: float

class WhatIfResponse(BaseModel):
    room_rent_per_day: float
    old_payable: float
    new_payable: float
    difference: float
    explanation: str

class NCBRecommendation(BaseModel):
    estimate_amount: float
    depreciation_total: float
    deductible_total: float
    net_claim_payable: float
    ncb_loss_3_years: float
    should_claim: bool
    difference: float
    recommendation_text: str
    recommendation_text_localized: Optional[str] = None
    calc_table: list[dict] = Field(default_factory=list)
