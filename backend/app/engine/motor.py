from typing import Optional
from app.schemas.evidence import RepairEstimate
from app.schemas.policy_rules import MotorPolicyRules
from app.schemas.adjudication import NCBRecommendation

def calculate_motor_claim(
    estimates: list[RepairEstimate],
    rules: MotorPolicyRules,
    own_damage_base_premium: float = 12000.0
) -> NCBRecommendation:
    """
    Motor Claims & Should-I-Claim (NCB) Engine implementing M1 - M5.
    """
    is_zero_dep = bool(rules.zero_depreciation.value)
    engine_cc = float(rules.engine_capacity_cc.value or 1197.0)
    vehicle_age_yrs = float(rules.vehicle_age_years.value or 3.0)
    current_ncb = float(rules.no_claim_bonus_percent.value or 35.0)

    # Compulsory deductible
    compulsory_ded = 2000.0 if engine_cc > 1500 else 1000.0
    voluntary_ded = float(rules.voluntary_deductible.value or 0.0)
    total_deductible = compulsory_ded + voluntary_ded

    # Depreciation rates
    dep_total = 0.0
    total_estimate = 0.0
    line_breakdowns = []

    # Metal dep by vehicle age
    if vehicle_age_yrs <= 0.5:
        metal_rate = 0.0
    elif vehicle_age_yrs <= 1.0:
        metal_rate = 0.05
    elif vehicle_age_yrs <= 2.0:
        metal_rate = 0.10
    elif vehicle_age_yrs <= 3.0:
        metal_rate = 0.15
    elif vehicle_age_yrs <= 4.0:
        metal_rate = 0.25
    elif vehicle_age_yrs <= 5.0:
        metal_rate = 0.35
    else:
        metal_rate = 0.40

    for part in estimates:
        total_estimate += part.billed
        rate = 0.0

        if not is_zero_dep:
            if part.part_type in ["plastic", "rubber", "nylon"]:
                rate = 0.50
            elif part.part_type == "glass":
                rate = 0.00
            elif part.part_type == "metal":
                rate = metal_rate
            elif part.part_type in ["labour", "painting"]:
                rate = 0.00
            else:
                rate = 0.20
        else:
            rate = 0.00

        dep_amt = round(part.billed * rate, 2)
        payable_amt = round(part.billed - dep_amt, 2)
        dep_total += dep_amt

        line_breakdowns.append({
            "part": part.part_name,
            "type": part.part_type,
            "billed": part.billed,
            "dep_rate": f"{rate*100:.0f}%",
            "depreciation": dep_amt,
            "payable": payable_amt
        })

    net_claim_payable = max(0.0, round(total_estimate - dep_total - total_deductible, 2))

    # Calculate 3-year NCB loss
    # If no claim: year 1 = 45%, year 2 = 50%, year 3 = 50%
    # If claim made: year 1 = 0%, year 2 = 20%, year 3 = 25%
    # Projected OD premium difference
    ncb_without_claim = [0.45, 0.50, 0.50]
    ncb_with_claim = [0.00, 0.20, 0.25]

    loss_yr1 = own_damage_base_premium * (ncb_without_claim[0] - ncb_with_claim[0])
    loss_yr2 = own_damage_base_premium * (ncb_without_claim[1] - ncb_with_claim[1])
    loss_yr3 = own_damage_base_premium * (ncb_without_claim[2] - ncb_with_claim[2])
    total_ncb_loss = round(loss_yr1 + loss_yr2 + loss_yr3, 2)

    diff = round(net_claim_payable - total_ncb_loss, 2)
    should_claim = net_claim_payable > (total_ncb_loss + 1000.0)

    if should_claim:
        rec_en = f"Claim Recommended: You will recover ₹{net_claim_payable:,.0f} from insurer, which exceeds your 3-year NCB loss of ₹{total_ncb_loss:,.0f} by ₹{diff:,.0f}."
        rec_hi = f"दावा करें: आपको बीमा कंपनी से ₹{net_claim_payable:,.0f} मिलेंगे, जो 3 साल के नो-क्लेम बोनस के नुकसान (₹{total_ncb_loss:,.0f}) से ₹{diff:,.0f} अधिक है।"
    else:
        rec_en = f"Do Not Claim: You would only recover ₹{net_claim_payable:,.0f} (after depreciation & ₹{total_deductible:,.0f} deductible), but lose ₹{total_ncb_loss:,.0f} in No-Claim Bonus over the next 3 renewals. Paying ₹{total_estimate:,.0f} out-of-pocket saves you ₹{abs(diff):,.0f}."
        rec_hi = f"दावा न करें: कटौती के बाद आपको केवल ₹{net_claim_payable:,.0f} मिलेंगे, जबकि अगले 3 वर्षों में ₹{total_ncb_loss:,.0f} का नो-क्लेम बोनस छूट जाएगा। स्वयं भुगतान करने से ₹{abs(diff):,.0f} की बचत होगी।"

    calc_table = [
        {"item": "Estimated Repair Cost", "amount": total_estimate, "type": "cost"},
        {"item": f"Depreciation on Parts ({'Zero-Dep applied' if is_zero_dep else 'Standard IRDAI slabs'})", "amount": -dep_total, "type": "deduction"},
        {"item": f"Compulsory & Voluntary Deductible", "amount": -total_deductible, "type": "deduction"},
        {"item": "Net Payout from Insurer", "amount": net_claim_payable, "type": "net_payout"},
        {"item": "Loss of 3-Year No Claim Bonus", "amount": total_ncb_loss, "type": "ncb_loss"}
    ]

    return NCBRecommendation(
        estimate_amount=round(total_estimate, 2),
        depreciation_total=round(dep_total, 2),
        deductible_total=round(total_deductible, 2),
        net_claim_payable=round(net_claim_payable, 2),
        ncb_loss_3_years=round(total_ncb_loss, 2),
        should_claim=should_claim,
        difference=diff,
        recommendation_text=rec_en,
        recommendation_text_localized=rec_hi,
        calc_table=calc_table
    )
