from typing import Literal, Optional, Any
from pydantic import BaseModel, Field

class Cited(BaseModel):
    value: Any = None
    page: Optional[int] = None
    quote: Optional[str] = None          # exact sentence from the policy
    confidence: Literal["high", "medium", "low"] = "high"
    verified: bool = True

class SubLimit(BaseModel):
    procedure: str
    limit: float
    page: Optional[int] = None
    quote: Optional[str] = None

class Exclusion(BaseModel):
    name: str
    page: Optional[int] = None
    quote: Optional[str] = None
    keywords: list[str] = Field(default_factory=list)

class HealthPolicyRules(BaseModel):
    insurer: Cited = Field(default_factory=Cited)
    policy_number: Cited = Field(default_factory=Cited)
    insured_members: list[str] = Field(default_factory=list)
    sum_insured: Cited = Field(default_factory=Cited)
    room_rent_cap_type: Cited = Field(default_factory=Cited)      # "percent_si_per_day" | "fixed_per_day" | "room_category" | "none"
    room_rent_cap_value: Cited = Field(default_factory=Cited)
    icu_cap_type: Cited = Field(default_factory=Cited)
    icu_cap_value: Cited = Field(default_factory=Cited)
    copay_percent: Cited = Field(default_factory=Cited)
    pre_hosp_days: Cited = Field(default_factory=Cited)
    post_hosp_days: Cited = Field(default_factory=Cited)
    sublimits: list[SubLimit] = Field(default_factory=list)
    initial_waiting_days: Cited = Field(default_factory=Cited)
    ped_waiting_months: Cited = Field(default_factory=Cited)
    specific_disease_waiting: list[dict] = Field(default_factory=list)
    exclusions: list[Exclusion] = Field(default_factory=list)
    claim_intimation_hours: Cited = Field(default_factory=Cited)
    claim_submission_days: Cited = Field(default_factory=Cited)
    policy_start_date: Cited = Field(default_factory=Cited)
    policy_end_date: Cited = Field(default_factory=Cited)

class MotorPolicyRules(BaseModel):
    insurer: Cited = Field(default_factory=Cited)
    policy_number: Cited = Field(default_factory=Cited)
    vehicle_registration: Cited = Field(default_factory=Cited)
    idv: Cited = Field(default_factory=Cited)
    zero_depreciation: Cited = Field(default_factory=Cited)
    compulsory_deductible: Cited = Field(default_factory=Cited)
    voluntary_deductible: Cited = Field(default_factory=Cited)
    no_claim_bonus_percent: Cited = Field(default_factory=Cited)
    engine_capacity_cc: Cited = Field(default_factory=Cited)
    vehicle_age_years: Cited = Field(default_factory=Cited)
    policy_start_date: Cited = Field(default_factory=Cited)
    policy_end_date: Cited = Field(default_factory=Cited)
