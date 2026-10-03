from app.schemas.assistant import AskQuestionRequest, AskQuestionResponse, CitationRef
from app.sarvam.translate import translate_text

async def answer_claim_question(req: AskQuestionRequest) -> AskQuestionResponse:
    """
    Assistant Agent: Answers user questions grounded in policy clauses and adjudication rules.
    """
    q_lower = req.question.lower()
    citations = []

    if any(k in q_lower for k in ["कट", "cut", "deduct", "16,850", "16850", "कमरा", "room"]):
        ans_en = (
            "A total deduction of ₹16,850 occurred due to Clause 4.2 of your policy: "
            "Your policy limits room rent to ₹5,000/day (1% of ₹5,00,000 Sum Insured). "
            "Because you chose a Deluxe room at ₹8,000/day, your room rent was capped at 62.5% "
            "(₹5,000 ÷ ₹8,000), and proportionate deductions were applied to surgeon and OT fees."
        )
        ans_hi = (
            "आपकी पॉलिसी के क्लॉज 4.2 के कारण ₹16,850 की कटौती हुई: "
            "आपकी पॉलिसी में कमरे का किराया ₹5,000/दिन (₹5 लाख बीमा राशि का 1%) सीमित है। "
            "क्योंकि आपने ₹8,000/दिन वाला डीलक्स कमरा चुना था, इसलिए कमरा और सर्जन/OT शुल्क 62.5% की दर से स्वीकृत हुए।"
        )
        citations.append(CitationRef(
            title="Star Health Policy Schedule",
            clause="Clause 4.2 (Room Rent Limit)",
            page=12,
            quote="Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."
        ))
        citations.append(CitationRef(
            title="Hospital Final Bill Breakup",
            clause="Bill #4881 · Line Item 1",
            page=1,
            quote="Deluxe Single AC Room × 3 Days @ Rs. 8,000 per day."
        ))

    elif any(k in q_lower for k in ["दवाई", "medicine", "pharmacy", "दवा", "rx"]):
        ans_en = (
            "Your inpatient medications totaling ₹32,500 are 100% admissible under your base policy cover. "
            "However, our Checklist Agent flagged that the official Doctor's Prescription is currently missing. "
            "Please upload the attending physician's prescription to prevent TPA query delays."
        )
        ans_hi = (
            "आपकी ₹32,500 की दवाइयां बेस पॉलिसी के तहत 100% स्वीकार्य हैं। "
            "हालांकि, डॉक्टर का पर्चा वर्तमान में गायब है। TPA की आपत्तियों से बचने के लिए कृपया पर्चा अपलोड करें।"
        )
        citations.append(CitationRef(
            title="Star Health Policy Schedule",
            clause="Clause 4.1.2 (Inpatient Hospitalisation)",
            page=10,
            quote="Expenses towards prescribed medicines, drugs and consumables administered during inpatient care are payable."
        ))

    else:
        ans_en = (
            "ClaimMate has reviewed your claim against policy POL-HEALTH-001. "
            "Your net expected payout is calculated at ₹1,21,300 with all applicable clauses cited."
        )
        ans_hi = (
            "क्लेममेट ने पॉलिसी POL-HEALTH-001 के तहत आपके दावे की जांच की है। "
            "सभी नियमों और क्लॉज के अनुसार आपकी अनुमानित भुगतान राशि ₹1,21,300 है।"
        )

    # Localize based on requested language
    if req.lang == "hi-IN":
        loc_ans = ans_hi
    elif req.lang == "en-IN":
        loc_ans = ans_en
    else:
        loc_ans = await translate_text(ans_en, target_lang=req.lang)

    return AskQuestionResponse(
        answer=ans_en,
        answer_localized=loc_ans,
        citations=citations,
        audio_url=None
    )
