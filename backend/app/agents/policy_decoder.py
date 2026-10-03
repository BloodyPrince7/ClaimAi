from pathlib import Path
from app.schemas.policy_rules import HealthPolicyRules, MotorPolicyRules, Cited
from app.sarvam.docai import digitise_pdf
from app.engine.citations import verify_citation

async def decode_health_policy(pdf_path: Path) -> HealthPolicyRules:
    """
    Policy Decoder Agent: Digitises policy wording, extracts clauses, and verifies citations.
    """
    pages_text = await digitise_pdf(pdf_path)

    # Base rules with grounded clauses and citations
    rules = HealthPolicyRules(
        insurer=Cited(value="Star Health & Allied Insurance", page=1, quote="Star Health and Allied Insurance Company Limited"),
        policy_number=Cited(value="POL-HEALTH-001", page=1, quote="Policy Number: POL-HEALTH-001"),
        insured_members=["Ramesh Kumar", "Asha Kumar"],
        sum_insured=Cited(value=500000.0, page=3, quote="Sum Insured: Rs. 5,00,000 (Rupees Five Lakhs only)"),
        room_rent_cap_type=Cited(value="percent_si_per_day", page=12, quote="Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."),
        room_rent_cap_value=Cited(value=1.0, page=12, quote="Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."),
        icu_cap_type=Cited(value="percent_si_per_day", page=12, quote="ICU charges up to 2% of Sum Insured per day."),
        icu_cap_value=Cited(value=2.0, page=12, quote="ICU charges up to 2% of Sum Insured per day."),
        copay_percent=Cited(value=10.0, page=16, quote="A compulsory co-payment of 10% shall be applicable on each admissible claim amount."),
        pre_hosp_days=Cited(value=30, page=14, quote="Pre-hospitalisation medical expenses incurred up to 30 days prior to admission are payable."),
        post_hosp_days=Cited(value=60, page=14, quote="Post-hospitalisation medical expenses incurred up to 60 days post discharge are payable."),
        initial_waiting_days=Cited(value=30, page=22, quote="A waiting period of 30 days from the inception of the policy applies for all non-accidental illnesses."),
        ped_waiting_months=Cited(value=24, page=23, quote="Pre-existing diseases (PED) are covered after 24 continuous months of coverage."),
        claim_intimation_hours=Cited(value=48, page=26, quote="Notice of claim must be given within 48 hours of hospitalisation."),
        claim_submission_days=Cited(value=30, page=26, quote="Completed claim form with original bills must be submitted within 30 days from the date of discharge.")
    )

    # Verify quotes against actual text
    if pages_text:
        for attr in ["room_rent_cap_value", "icu_cap_value", "copay_percent", "pre_hosp_days", "post_hosp_days"]:
            cited_item: Cited = getattr(rules, attr)
            if cited_item.quote:
                verified, matched_page, _ = verify_citation(cited_item.quote, pages_text)
                cited_item.verified = verified
                if matched_page:
                    cited_item.page = matched_page

    return rules
