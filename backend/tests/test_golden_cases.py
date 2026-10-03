from app.schemas.evidence import BillLineItem, RepairEstimate
from app.schemas.policy_rules import HealthPolicyRules, MotorPolicyRules, Cited
from app.engine.health import adjudicate_health_claim
from app.engine.motor import calculate_motor_claim

def test_golden_case_1_room_rent_upgrade():
    # Ground truth: Deluxe room with cap + non-payables
    rules = HealthPolicyRules(
        sum_insured=Cited(value=500000.0),
        room_rent_cap_value=Cited(value=1.0), # ₹5,000/day
        copay_percent=Cited(value=0.0)
    )
    lines = [
        BillLineItem(id="1", doc_id="d", description="Deluxe Room 3d", qty=3.0, rate=8000.0, billed=24000.0, category="room_rent"),
        BillLineItem(id="2", doc_id="d", description="Surgeon Fee", qty=1.0, rate=40000.0, billed=40000.0, category="surgeon_fee"),
        BillLineItem(id="3", doc_id="d", description="OT Charges", qty=1.0, rate=25000.0, billed=25000.0, category="ot_charges"),
        BillLineItem(id="4", doc_id="d", description="Medicines", qty=1.0, rate=32500.0, billed=32500.0, category="medicine"),
        BillLineItem(id="5", doc_id="d", description="Surgical Gloves", qty=40.0, rate=31.25, billed=1250.0, category="consumables"),
        BillLineItem(id="6", doc_id="d", description="Pre-hosp MRI", qty=1.0, rate=8400.0, billed=8400.0, category="pre_hosp"),
        BillLineItem(id="7", doc_id="d", description="Post-hosp Consult", qty=1.0, rate=4000.0, billed=4000.0, category="post_hosp")
    ]
    summary = adjudicate_health_claim(lines, rules)

    # Expected: Room rent paid at 15,000 (cut 9,000)
    # Surgeon paid at 25,000 (cut 15,000)
    # OT paid at 15,625 (cut 9,375)
    # Medicines paid at 32,500 (cut 0)
    # Gloves paid at 0 (cut 1,250)
    # Pre-hosp MRI paid at 8,400
    # Post-hosp consult paid at 4,000
    # Total payable = 15,000 + 25,000 + 15,625 + 32,500 + 0 + 8,400 + 4,000 = 100,525
    assert summary.total_payable == 100525.0
    assert summary.total_deducted == 34625.0

def test_golden_case_2_sum_insured_cap():
    rules = HealthPolicyRules(
        sum_insured=Cited(value=100000.0), # Low SI
        room_rent_cap_value=Cited(value=10.0),
        copay_percent=Cited(value=0.0)
    )
    lines = [
        BillLineItem(id="1", doc_id="d", description="Total Treatment", qty=1.0, rate=150000.0, billed=150000.0, category="surgery")
    ]
    summary = adjudicate_health_claim(lines, rules)
    # Must cap at Sum Insured 1,00,000
    assert summary.total_payable == 100000.0

def test_golden_case_3_zero_dep_motor_payout():
    rules = MotorPolicyRules(
        zero_depreciation=Cited(value=True),
        engine_capacity_cc=Cited(value=1197.0),
        no_claim_bonus_percent=Cited(value=20.0)
    )
    estimates = [
        RepairEstimate(id="1", doc_id="e", part_name="Bumper", part_type="plastic", billed=10000.0),
        RepairEstimate(id="2", doc_id="e", part_name="Labour", part_type="labour", billed=5000.0)
    ]
    rec = calculate_motor_claim(estimates, rules)
    # 0 depreciation, 1,000 deductible -> 14,000 net payable
    assert rec.depreciation_total == 0.0
    assert rec.net_claim_payable == 14000.0
