from app.schemas.triage import TriageSuggestion, IncidentTriageResponse

async def triage_incident(
    incident_text: str,
    incident_lang: str = "hi-IN",
    wallet_policies: list[dict] | None = None
) -> IncidentTriageResponse:
    """
    Triage Agent: Identifies which policies may pay for the reported incident.
    """
    text_lower = incident_text.lower()
    matches: list[TriageSuggestion] = []

    # Check for health / hospitalization keywords
    is_health = any(k in text_lower for k in [
        "hospital", "doctor", "admit", "surgery", "bimari", "ilaj", "accident", "aspataal", "patient", "father", "papa", "mother"
    ]) or "हॉस्पिटल" in incident_text or "अस्पताल" in incident_text or "दुर्घटना" in incident_text

    # Check for motor / vehicle keywords
    is_motor = any(k in text_lower for k in [
        "car", "bike", "vehicle", "bumper", "dent", "damage", "collision", "gaadi", "motor"
    ]) or "गाड़ी" in incident_text or "कार" in incident_text or "टक्कर" in incident_text

    # Default to health if accident is mentioned
    if not is_health and not is_motor:
        is_health = True

    if is_health:
        matches.append(TriageSuggestion(
            policy_id="POL-HEALTH-001",
            policy_type="health",
            insurer="Star Health & Allied",
            policy_no="POL-HEALTH-001",
            title="Family Health Optima · Inpatient Hospitalisation",
            estimated_payout=121300.0,
            urgent_deadline="Submit within 15 days",
            deadline_urgency="15_days",
            reason="Hospital admission covered under base Sum Insured (₹5,00,000).",
            selected_by_default=True
        ))
        matches.append(TriageSuggestion(
            policy_id="POL-MOTOR-002",
            policy_type="motor",
            insurer="HDFC ERGO",
            policy_no="POL-MOTOR-002",
            title="Personal Accident (Add-on in Motor Policy)",
            estimated_payout=25000.0,
            urgent_deadline="Intimate within 48 hours",
            deadline_urgency="48_hours",
            reason="Covers accidental bodily injury and hospital cash allowance.",
            selected_by_default=True
        ))
        matches.append(TriageSuggestion(
            policy_id="POL-CARD-003",
            policy_type="travel",
            insurer="HDFC Bank Regalia",
            policy_no="CC-PROTECT-889",
            title="Complimentary Credit Card Emergency Medical Cover",
            estimated_payout=50000.0,
            urgent_deadline="30 days",
            deadline_urgency="30_days",
            reason="Hidden benefit: Credit card includes complimentary emergency medical accident cover.",
            selected_by_default=False
        ))

    if is_motor or "accident" in text_lower or "accident" in incident_text:
        matches.append(TriageSuggestion(
            policy_id="POL-MOTOR-001",
            policy_type="motor",
            insurer="ICICI Lombard",
            policy_no="POL-MOT-4491",
            title="Private Car Comprehensive · Own Damage",
            estimated_payout=38200.0,
            urgent_deadline="Survey within 48 hours",
            deadline_urgency="48_hours",
            reason="Repair estimates admissible after standard depreciation and deductible.",
            selected_by_default=True if is_motor else False
        ))

    return IncidentTriageResponse(
        detected_lang=incident_lang,
        original_text=incident_text,
        english_text=incident_text,
        matching_policies=matches
    )
