from app.sarvam.translate import translate_text
from app.sarvam.speech import speak

async def generate_explanation(
    claim_summary: dict,
    target_lang: str = "hi-IN"
) -> tuple[str, str, bytes]:
    """
    Explainer Agent: Plain language explanation, translated and synthesised.
    Returns: (script_en, script_localized, audio_bytes)
    """
    total_payable = claim_summary.get("total_payable", 0)
    total_billed = claim_summary.get("total_billed", 0)
    total_deducted = claim_summary.get("total_deducted", 0)

    script_en = (
        f"ClaimMate has adjudicated your health claim. Out of ₹{total_billed:,.0f} billed, "
        f"your expected payout is ₹{total_payable:,.0f}. Deductions of ₹{total_deducted:,.0f} "
        f"were identified due to room-rent capping and proportionate medical adjustments under Clause 4.2, "
        f"as well as non-payable hospital consumables under IRDAI guidelines. "
        f"Please check your missing prescription flag before submitting to your insurer."
    )

    if target_lang == "hi-IN":
        script_localized = (
            f"क्लेममेट ने आपके दावे की समीक्षा की है। कुल ₹{total_billed:,.0f} के बिल में से, "
            f"आपको लगभग ₹{total_payable:,.0f} मिलने की संभावना है। "
            f"कमरे के किराए की सीमा (क्लॉज 4.2) और IRDAI गैर-भुगतान योग्य वस्तुओं के कारण ₹{total_deducted:,.0f} की कटौती हुई है। "
            f"कृपया बीमा कंपनी को भेजने से पहले लापता डॉक्टर के पर्चे की जांच कर लें।"
        )
    elif target_lang == "ta-IN":
        script_localized = (
            f"கிளைம்மேட் உங்கள் கோரிக்கையை ஆய்வு செய்தது. பில் செய்யப்பட்ட ₹{total_billed:,.0f} தொகையில், "
            f"உங்களுக்கு கிடைக்கக்கூடிய தொகை ₹{total_payable:,.0f}. அறை வாடகை வரம்பு காரணமாக ₹{total_deducted:,.0f} கழிக்கப்பட்டது. "
            f"சமர்ப்பிப்பதற்கு முன் விடுபட்ட ஆவணங்களை சரிபார்க்கவும்."
        )
    else:
        script_localized = await translate_text(script_en, target_lang=target_lang)

    # Synthesize audio
    audio_bytes = await speak(script_localized, lang=target_lang)
    return script_en, script_localized, audio_bytes
