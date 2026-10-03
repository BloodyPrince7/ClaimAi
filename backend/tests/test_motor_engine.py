from app.schemas.evidence import RepairEstimate
from app.schemas.policy_rules import MotorPolicyRules, Cited
from app.engine.motor import calculate_motor_claim

def test_motor_depreciation_and_zero_dep():
    estimates = [
        RepairEstimate(id="1", doc_id="d1", part_name="Plastic Bumper", part_type="plastic", billed=10000.0),
        RepairEstimate(id="2", doc_id="d1", part_name="Windshield Glass", part_type="glass", billed=5000.0),
        RepairEstimate(id="3", doc_id="d1", part_name="Labour", part_type="labour", billed=4000.0)
    ]

    # Without Zero-Dep
    rules_standard = MotorPolicyRules(
        zero_depreciation=Cited(value=False),
        engine_capacity_cc=Cited(value=1200.0),
        vehicle_age_years=Cited(value=2.0)
    )
    rec_standard = calculate_motor_claim(estimates, rules_standard)
    # Plastic 50% = 5,000; Glass 0% = 0; Labour 0% = 0. Total dep = 5,000
    assert rec_standard.depreciation_total == 5000.0

    # With Zero-Dep add-on
    rules_zero_dep = MotorPolicyRules(
        zero_depreciation=Cited(value=True),
        engine_capacity_cc=Cited(value=1200.0),
        vehicle_age_years=Cited(value=2.0)
    )
    rec_zero = calculate_motor_claim(estimates, rules_zero_dep)
    assert rec_zero.depreciation_total == 0.0

def test_should_i_claim_ncb_decision():
    estimates = [
        RepairEstimate(id="1", doc_id="d1", part_name="Scratch Touchup", part_type="labour", billed=3000.0)
    ]
    rules = MotorPolicyRules(
        zero_depreciation=Cited(value=False),
        engine_capacity_cc=Cited(value=1200.0),
        no_claim_bonus_percent=Cited(value=35.0)
    )
    rec = calculate_motor_claim(estimates, rules, own_damage_base_premium=10000.0)
    # Deductible is 1,000 -> Net payout = 2,000.
    # NCB loss over 3 years is thousands of rupees.
    # Therefore, should_claim must be FALSE
    assert rec.should_claim is False
