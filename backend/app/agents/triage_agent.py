import logging
import json
import re
from app.config import settings
from app.sarvam.client import client
from app.schemas.triage import TriageSuggestion, IncidentTriageResponse

logger = logging.getLogger(__name__)

async def triage_incident(
    incident_text: str,
    incident_lang: str = "hi-IN",
    wallet_policies: list[dict] | None = None
) -> IncidentTriageResponse:
    """
    Triage Agent: Identifies which policies may pay for the reported incident.
    Uses Sarvam-105B when DEMO_MODE=false, with fallback to rule-based classification.
    """
    text_lower = incident_text.lower()
    matches: list[TriageSuggestion] = []

    # If live mode, call Sarvam-105B for classification & translation
    english_translation = incident_text
    is_health = False
    is_motor = False
    ai_reasons = {}

    if not settings.DEMO_MODE and client and settings.SARVAM_API_KEY and settings.SARVAM_API_KEY != "demo_sarvam_key":
        try:
            prompt = f"""You are ClaimMate's Incident Triage Agent.
A user reported the following incident: "{incident_text}" (Language: {incident_lang}).
Analyze the incident and classify whether it involves:
1. Health / Hospitalization / Illness / Surgery / Medical treatment
2. Motor Vehicle damage / Collision / Car repair / Accident
3. Personal Bodily Injury from accident

Return valid JSON:
{{
  "english_text": "accurate English translation of what happened",
  "is_health": true/false,
  "is_motor": true/false,
  "is_personal_accident": true/false,
  "health_reason": "Specific reason why health insurance covers this incident",
  "motor_reason": "Specific reason why motor insurance covers this incident"
}}"""
            resp = await client.chat.completions(
                model="sarvam-105b",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                reasoning_effort=None,
                temperature=0.1,
                max_tokens=600
            )
            content = resp.choices[0].message.content or "{}"
            parsed = json.loads(content)
            english_translation = parsed.get("english_text", incident_text)
            is_health = bool(parsed.get("is_health") or parsed.get("is_personal_accident"))
            is_motor = bool(parsed.get("is_motor"))
            ai_reasons = parsed
        except Exception as e:
            logger.warning(f"Sarvam triage call failed: {e}. Fallback to keyword matching.")

    # Fallback keyword checks if AI didn't classify
    if not is_health and not is_motor:
        is_health = any(k in text_lower for k in [
            "hospital", "doctor", "admit", "surgery", "bimari", "ilaj", "accident", "aspataal", "patient", "father", "papa", "mother"
        ]) or "हॉस्पिटल" in incident_text or "अस्पताल" in incident_text or "दुर्घटना" in incident_text or "बीमार" in incident_text

        is_motor = any(k in text_lower for k in [
            "car", "bike", "vehicle", "bumper", "dent", "damage", "collision", "gaadi", "motor"
        ]) or "गाड़ी" in incident_text or "कार" in incident_text or "टक्कर" in incident_text

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
            reason=ai_reasons.get("health_reason", "Hospital admission and medical procedures covered under base Sum Insured (₹5,00,000)."),
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
            reason=ai_reasons.get("motor_reason", "Repair estimates admissible after standard depreciation and deductible."),
            selected_by_default=True if is_motor else False
        ))

    return IncidentTriageResponse(
        detected_lang=incident_lang,
        original_text=incident_text,
        english_text=english_translation,
        matching_policies=matches
    )
