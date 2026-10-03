from typing import Optional, Literal
from datetime import date
from pydantic import BaseModel, Field

class BillLineItem(BaseModel):
    id: str
    doc_id: str
    doc_name: Optional[str] = None
    description: str
    date: Optional[str] = None
    qty: float = 1.0
    rate: float = 0.0
    billed: float = 0.0
    category: str = "general"  # room_rent, icu, surgeon_fee, nursing, ot_charges, anaesthetist, medicine, consumables, investigation, ambulance, pre_hosp, post_hosp
    confidence: float = 0.95
    source_page: Optional[int] = 1

class RepairEstimate(BaseModel):
    id: str
    doc_id: str
    part_name: str
    part_type: Literal["glass", "metal", "plastic", "rubber", "nylon", "labour", "painting"]
    billed: float
    confidence: float = 0.95

class DischargeSummary(BaseModel):
    patient_name: str
    hospital_name: str
    admit_date: str
    discharge_date: str
    diagnosis: str
    procedures: list[str] = Field(default_factory=list)
    has_doctor_signature: bool = True
