import re
import json
import logging
from typing import Optional
from app.config import settings
from app.sarvam.client import client
from app.schemas.assistant import AskQuestionRequest, AskQuestionResponse, CitationRef
from app.sarvam.translate import translate_text

logger = logging.getLogger(__name__)

CANONICAL_CITATIONS = {
    "room_rent": [
        CitationRef(
            title="Star Health Policy Schedule (POL-HEALTH-001)",
            clause="Clause 4.2 (Room Rent Limit)",
            page=12,
            quote="Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."
        ),
        CitationRef(
            title="Hospital Final Bill Breakup",
            clause="Bill #4881 · Line Item 1",
            page=1,
            quote="Deluxe Single AC Room × 3 Days @ Rs. 8,000 per day."
        )
    ],
    "proportionate": [
        CitationRef(
            title="Star Health Policy Terms & Conditions",
            clause="Clause 4.2.1 (Associated Medical Expenses Scaling)",
            page=13,
            quote="If the Insured occupies a room higher than the eligible category, charges for surgeon, consultant, operation theatre shall be paid in the same proportion."
        ),
        CitationRef(
            title="IRDAI Master Circular (2020)",
            clause="Ref: IRDAI/HLT/REG/CIR/194/07/2020",
            page=4,
            quote="Insurers shall not apply proportionate deduction to cost of pharmacy, diagnostics, and medical implants."
        )
    ],
    "pharmacy": [
        CitationRef(
            title="Star Health Policy Schedule",
            clause="Clause 4.1.2 (Inpatient Hospitalisation)",
            page=10,
            quote="Expenses towards prescribed medicines, drugs and consumables administered during inpatient care are payable."
        ),
        CitationRef(
            title="Apollo Pharmacy Bill #9021",
            clause="Hospital Pharmacy Annexure",
            page=1,
            quote="Inpatient Prescribed Medications & IV Antibiotics totaling Rs. 32,500."
        )
    ],
    "consumables": [
        CitationRef(
            title="IRDAI Standardization Guidelines",
            clause="Annexure I · Non-Payable Items List",
            page=18,
            quote="Charges for gloves, sanitizer, luxury items, and registration fees are non-payable by the insurer."
        )
    ],
    "copay": [
        CitationRef(
            title="Star Health Policy Terms",
            clause="Clause 7.1 (Compulsory Co-pay)",
            page=16,
            quote="A compulsory co-payment of 10% is applicable on each and every admissible claim amount."
        )
    ],
    "pre_post_hosp": [
        CitationRef(
            title="Star Health Policy Schedule",
            clause="Clause 4.3 (Pre & Post Hospitalisation)",
            page=14,
            quote="Pre-hospitalisation medical expenses incurred up to 30 days prior and post-hospitalisation up to 60 days are payable."
        )
    ],
    "motor": [
        CitationRef(
            title="ICICI Lombard Motor Policy (POL-MOTOR-001)",
            clause="Section 1 · Own Damage Deductible & Depreciation",
            page=5,
            quote="Compulsory deductible of Rs. 1,000 applicable on all private car claims. Depreciation on rubber and plastic parts is 50%."
        )
    ],
    "appeal": [
        CitationRef(
            title="IRDAI Protection of Policyholders' Interests Regulations",
            clause="Regulation 15 · Grievance Redressal SLA",
            page=7,
            quote="Insurers must acknowledge grievances within 3 working days and resolve them within 15 calendar days."
        )
    ]
}

SYSTEM_PROMPT = """You are ClaimMate AI, the senior adjudication assistant for Indian insurance claims (The Modern Bahi-Khata).
Your role is to empower Indian families by providing crystal-clear, transparent, and empathetic explanations of their health and motor insurance claims, grounded strictly in policy wording and IRDAI regulations.

Ground Truth Knowledge Base:
1. Health Claim (CLM-HEALTH-001):
   - Claimant: Ramesh Kumar (Age 52)
   - Policy: Star Health & Allied Insurance · Family Health Optima (POL-HEALTH-001), Sum Insured Rs 5,00,000.
   - Hospital: Apollo Hospital (3 days admission, Laparoscopic Cholecystectomy).
   - Total Billed: Rs 1,35,150
   - Admissible Payout: Rs 1,00,525 (payable after co-pay Rs 1,21,300 gross admissible)
   - Total Deductions: Rs 34,625
   - Key Deductions & Rules:
     * Room Rent Cap (Clause 4.2): Room rent capped at 1% of Sum Insured per day = Rs 5,000/day. Ramesh occupied a Deluxe room at Rs 8,000/day for 3 days (Rs 24,000 billed). Room rent payable is Rs 15,000; excess Rs 9,000 deducted.
     * Proportionate Scaling (Clause 4.2.1): Because room rent exceeded the 1% cap, associated medical fees are scaled down to 62.5% (Rs 5,000 / Rs 8,000):
       - Surgeon & Anaesthesia: Billed Rs 40,000 -> payable Rs 25,000 (Rs 15,000 deducted).
       - Operation Theatre (OT): Billed Rs 25,000 -> payable Rs 15,625 (Rs 9,375 deducted).
       (Total proportionate medical cut = Rs 24,375).
     * Consumables (IRDAI List I): Rs 1,250 for sterile surgical gloves & PPE kit deducted under IRDAI Non-Payable Items List.
     * Pharmacy Medications (Clause 4.1.2): Rs 32,500 billed. Prescribed medicines are 100% covered and EXEMPT from proportionate cuts under IRDAI 2020 circular (IRDAI/HLT/REG/CIR/194/07/2020). However, the doctor's formal prescription slip is currently missing from uploaded documents and must be submitted to avoid TPA query delays.
     * Co-Payment (Clause 7.1): 10% compulsory co-payment on admissible expenses.
     * Pre/Post Hospitalization (Clause 4.3): Pre-hospitalization MRI (Rs 8,400, 12 days prior) is payable within 30-day window. Post-hosp physiotherapy is payable within 60-day window.

2. Motor Claim (CLM-MOTOR-001):
   - Vehicle: Honda City (DL-01-AB-1234)
   - Policy: ICICI Lombard Private Car Comprehensive (POL-MOTOR-001), IDV Rs 6,40,000.
   - Workshop Estimate: Rs 24,400.
   - Depreciation: 50% on plastic bumper (-Rs 5,000). Compulsory deductible: Rs 1,000.
   - Net Insurer Payout: Rs 18,400.
   - No-Claim Bonus (NCB): 35%. Claiming resets NCB to 0%, resulting in Rs 11,400 loss over 3 years.
   - Recommendation: "Should I Claim?" -> Yes, net gain is Rs 7,000 (Rs 18,400 payout - Rs 11,400 NCB loss).

3. Escalation Pathways:
   - Level 1: Insurer Grievance Redressal Officer (GRO) - SLA: 15 days.
   - Level 2: IRDAI Bima Bharosa Portal (bimabharosa.irdai.gov.in / 155255) - SLA: 15 days.
   - Level 3: Insurance Ombudsman (cioins.co.in) - SLA: 30 days, legally binding up to Rs 50 Lakhs.

Instructions for Response:
- Answer the user's specific query accurately and concisely.
- Never hallucinate rupee numbers outside the ground truth.
- Output valid JSON with three keys:
  {
    "answer_en": "Clear, professional, and detailed explanation in English.",
    "answer_localized": "Empathetic, clear, and natural explanation in the user's requested language (Hindi if hi-IN, etc.). If requested in English, provide the English answer.",
    "topics": ["room_rent", "proportionate", "pharmacy", "consumables", "copay", "motor", "appeal", "pre_post_hosp"]
  }
"""

def extract_json(text: str) -> Optional[dict]:
    text = text.strip()
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        text = match.group(1)
    try:
        return json.loads(text)
    except Exception:
        first = text.find('{')
        last = text.rfind('}')
        if first != -1 and last != -1:
            try:
                return json.loads(text[first:last+1])
            except Exception:
                pass
    return None

def build_citations(topics: list[str], question: str, answer: str) -> list[CitationRef]:
    citations: list[CitationRef] = []
    seen = set()

    def add_topic(t: str):
        for c in CANONICAL_CITATIONS.get(t, []):
            key = (c.clause, c.page)
            if key not in seen:
                seen.add(key)
                citations.append(c)

    for t in topics:
        add_topic(t)

    # Keyword safety checks
    q_all = (question + " " + answer).lower()
    if ("room" in q_all or "कमरा" in q_all or "rent" in q_all) and "room_rent" not in topics:
        add_topic("room_rent")
    if ("cut" in q_all or "कट" in q_all or "deduct" in q_all or "proportion" in q_all or "16,850" in q_all or "16850" in q_all) and "proportionate" not in topics:
        add_topic("proportionate")
    if ("दवाई" in q_all or "medicine" in q_all or "pharmacy" in q_all or "rx" in q_all) and "pharmacy" not in topics:
        add_topic("pharmacy")
    if ("gloves" in q_all or "sanitizer" in q_all or "consumable" in q_all) and "consumables" not in topics:
        add_topic("consumables")
    if ("motor" in q_all or "car" in q_all or "गाड़ी" in q_all or "ncb" in q_all) and "motor" not in topics:
        add_topic("motor")
    if ("appeal" in q_all or "ombudsman" in q_all or "grievance" in q_all or "शिकायत" in q_all) and "appeal" not in topics:
        add_topic("appeal")

    return citations[:4]  # Return top 4 most relevant citations

async def answer_claim_question(req: AskQuestionRequest) -> AskQuestionResponse:
    """
    Assistant Agent: Answers user questions grounded in policy clauses and adjudication rules.
    Invokes Sarvam-105B when DEMO_MODE=false, with fallback to deterministic grounded answers.
    """
    target_lang = req.lang or "hi-IN"

    # 1. Live Sarvam AI 105B Call if DEMO_MODE is false
    if not settings.DEMO_MODE and client and settings.SARVAM_API_KEY and settings.SARVAM_API_KEY != "demo_sarvam_key":
        try:
            user_prompt = (
                f"User Question: \"{req.question}\"\n"
                f"Active Claim ID: {req.claim_id or 'CLM-HEALTH-001'}\n"
                f"Target Language: {target_lang}\n"
                f"Please reply with the required JSON structure."
            )

            resp = await client.chat.completions(
                model="sarvam-105b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                reasoning_effort=None,
                temperature=0.2,
                max_tokens=1500
            )

            raw_content = resp.choices[0].message.content or ""
            parsed = extract_json(raw_content)

            if parsed and parsed.get("answer_en"):
                ans_en = parsed["answer_en"]
                ans_loc = parsed.get("answer_localized") or ans_en
                topics = parsed.get("topics", [])
                citations = build_citations(topics, req.question, ans_en)

                return AskQuestionResponse(
                    answer=ans_en,
                    answer_localized=ans_loc,
                    citations=citations,
                    audio_url=None
                )
        except Exception as e:
            logger.warning(f"Sarvam-105B assistant call failed: {e}. Falling back to grounded rule engine.")

    # 2. Resilient Rule-Based Grounded Fallback
    q_lower = req.question.lower()
    citations = []

    if any(k in q_lower for k in ["कट", "cut", "deduct", "16,850", "16850", "कमरा", "room"]):
        ans_en = (
            "A deduction of ₹16,850 to ₹24,375 occurred due to Clause 4.2 of your policy: "
            "Your policy limits room rent to ₹5,00,000 × 1% = ₹5,000/day. "
            "Because you chose a Deluxe room at ₹8,000/day, your room rent was capped at 62.5% "
            "(₹5,000 ÷ ₹8,000), and proportionate deductions were applied to surgeon and OT fees."
        )
        ans_hi = (
            "आपकी पॉलिसी के क्लॉज 4.2 के कारण ₹16,850 की कटौती हुई: "
            "आपकी पॉलिसी में कमरे का किराया ₹5,000/दिन (₹5 लाख बीमा राशि का 1%) सीमित है। "
            "क्योंकि आपने ₹8,000/दिन वाला डीलक्स कमरा चुना था, इसलिए कमरा और सर्जन/OT शुल्क 62.5% की दर से स्वीकृत हुए।"
        )
        citations.extend(CANONICAL_CITATIONS["room_rent"])
        citations.extend(CANONICAL_CITATIONS["proportionate"])

    elif any(k in q_lower for k in ["दवाई", "medicine", "pharmacy", "दवा", "rx"]):
        ans_en = (
            "Your inpatient medications totaling ₹32,500 are 100% admissible under Clause 4.1.2 of your policy. "
            "Additionally, IRDAI regulations strictly exempt medicines from proportionate room rent cuts. "
            "However, our Checklist Agent flagged that the official Doctor's Prescription is missing. "
            "Please upload the attending physician's prescription to prevent TPA deduction."
        )
        ans_hi = (
            "आपकी ₹32,500 की दवाइयां क्लॉज 4.1.2 के तहत 100% स्वीकार्य हैं और IRDAI के अनुसार इन पर कमरे की कटौती लागू नहीं होती। "
            "हालांकि, डॉक्टर का पर्चा वर्तमान में अपलोड नहीं है। TPA की आपत्तियों से बचने के लिए कृपया पर्चा अपलोड करें।"
        )
        citations.extend(CANONICAL_CITATIONS["pharmacy"])

    elif any(k in q_lower for k in ["car", "motor", "गाड़ी", "कार", "bumper", "ncb"]):
        ans_en = (
            "For your Honda City (POL-MOTOR-001), the estimated repair cost is ₹24,400. "
            "After 50% depreciation on the plastic bumper (₹5,000) and ₹1,000 deductible, the net insurer payout is ₹18,400. "
            "Since your 3-year NCB loss is ₹11,400, filing this claim yields a net financial benefit of ₹7,000."
        )
        ans_hi = (
            "आपकी होंडा सिटी (POL-MOTOR-001) के लिए मरम्मत का अनुमान ₹24,400 है। "
            "प्लास्टिक बंपर पर 50% मूल्यह्रास (₹5,000) और ₹1,000 कटौती के बाद आपको ₹18,400 मिलेंगे। "
            "चूँकि 3 साल का NCB नुकसान ₹11,400 है, इसलिए दावा करने पर आपको ₹7,000 का सीधा लाभ होगा।"
        )
        citations.extend(CANONICAL_CITATIONS["motor"])

    elif any(k in q_lower for k in ["appeal", "शिकायत", "grievance", "ombudsman", "bima bharosa"]):
        ans_en = (
            "Under IRDAI Protection of Policyholders' Interests Regulations, you have a 3-tier appeal right: "
            "1. Insurer's Grievance Redressal Officer (GRO) - 15 days SLA. "
            "2. IRDAI Bima Bharosa Portal (bimabharosa.irdai.gov.in / Toll-free 155255). "
            "3. Insurance Ombudsman - legally binding resolution for claims up to ₹50 Lakhs."
        )
        ans_hi = (
            "IRDAI के नियमों के तहत आपके पास 3-स्तरीय अपील का अधिकार है: "
            "1. बीमा कंपनी के शिकायत निवारण अधिकारी (GRO) - 15 दिन की समय सीमा। "
            "2. IRDAI 'बीमा भरोसा' पोर्टल (bimabharosa.irdai.gov.in)। "
            "3. बीमा लोकपाल (Insurance Ombudsman) - ₹50 लाख तक के दावों के लिए बाध्यकारी फैसला।"
        )
        citations.extend(CANONICAL_CITATIONS["appeal"])

    else:
        ans_en = (
            "ClaimMate has reviewed your claim against policy POL-HEALTH-001 (Sum Insured ₹5,00,000). "
            "Out of ₹1,35,150 billed, your calculated net payable amount is ₹1,00,525 with ₹34,625 in identified deductions "
            "governed by Clause 4.2 room-rent limits and IRDAI non-payable consumables."
        )
        ans_hi = (
            "क्लेममेट ने पॉलिसी POL-HEALTH-001 (बीमा राशि ₹5,00,000) के तहत आपके दावे की समीक्षा की है। "
            "कुल ₹1,35,150 के बिल में से, क्लॉज 4.2 रूम रेंट सीमा और IRDAI नियमों के आधार पर आपका शुद्ध देय भुगतान ₹1,00,525 है।"
        )
        citations.extend(CANONICAL_CITATIONS["room_rent"])

    # Localize based on requested language
    if target_lang == "hi-IN":
        loc_ans = ans_hi
    elif target_lang == "en-IN":
        loc_ans = ans_en
    else:
        loc_ans = await translate_text(ans_en, target_lang=target_lang)

    return AskQuestionResponse(
        answer=ans_en,
        answer_localized=loc_ans,
        citations=citations,
        audio_url=None
    )
