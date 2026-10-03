import pytest
from app.schemas.evidence import BillLineItem
from app.schemas.policy_rules import HealthPolicyRules, Cited
from app.engine.health import adjudicate_health_claim, is_non_payable

def test_non_payable_fuzzy_matching():
    # Should catch common variations of Gloves and Sanitizer
    is_np, match = is_non_payable("SURGICAL EXAMINATION GLOVES 5 PAIRS")
    assert is_np is True
    assert "GLOVES" in match

    is_np2, match2 = is_non_payable("ALCOHOL HAND SANITIZER")
    assert is_np2 is True

    # Genuine medicine should NOT be non-payable
    is_np3, _ = is_non_payable("INJ CEFTRIAXONE 1G")
    assert is_np3 is False

def test_room_rent_cap_and_proportionate_deduction():
    # SI = 5,00,000; 1% cap = 5,000/day
    # Room rent = 8,000/day for 3 days = 24,000
    # Room ratio = 5,000 / 8,000 = 62.5%
    rules = HealthPolicyRules(
        sum_insured=Cited(value=500000.0),
        room_rent_cap_value=Cited(value=1.0),
        copay_percent=Cited(value=0.0)
    )

    lines = [
        BillLineItem(id="1", doc_id="d1", description="Deluxe Room Rent", qty=3.0, rate=8000.0, billed=24000.0, category="room_rent"),
        BillLineItem(id="2", doc_id="d1", description="Surgeon Fee", qty=1.0, rate=40000.0, billed=40000.0, category="surgeon_fee"),
        BillLineItem(id="3", doc_id="d1", description="Medicines", qty=1.0, rate=10000.0, billed=10000.0, category="medicine"),
    ]

    summary = adjudicate_health_claim(lines, rules)

    # Room rent: 24,000 * 0.625 = 15,000 payable
    room_dec = next(d for d in summary.lines if d.category == "room_rent")
    assert room_dec.payable == 15000.0
    assert room_dec.deducted == 9000.0
    assert room_dec.decision == "partial"

    # Surgeon fee: proportionate deduction 40,000 * 0.625 = 25,000 payable
    surg_dec = next(d for d in summary.lines if d.category == "surgeon_fee")
    assert surg_dec.payable == 25000.0
    assert surg_dec.deducted == 15000.0

    # Medicines: EXEMPT from proportionate deduction!
    med_dec = next(d for d in summary.lines if d.category == "medicine")
    assert med_dec.payable == 10000.0
    assert med_dec.deducted == 0.0

def test_copay_application_order():
    rules = HealthPolicyRules(
        sum_insured=Cited(value=500000.0),
        room_rent_cap_value=Cited(value=10.0), # High limit so no room cut
        copay_percent=Cited(value=10.0)        # 10% co-pay
    )

    lines = [
        BillLineItem(id="1", doc_id="d1", description="Consultation", qty=1.0, rate=10000.0, billed=10000.0, category="doctor_consultation"),
    ]

    summary = adjudicate_health_claim(lines, rules)
    # 10,000 - 10% copay (1,000) = 9,000
    assert summary.total_payable == 9000.0
    assert summary.total_deducted == 1000.0
