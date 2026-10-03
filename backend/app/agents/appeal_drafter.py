from app.sarvam.translate import translate_text

async def draft_appeal_package(
    claim_id: str,
    rejection_reason: str = "Claim repudiated under Pre-Existing Disease (PED) exclusion Clause 4.1",
    target_lang: str = "hi-IN"
) -> dict:
    """
    Appeal Drafter Agent: Generates bilingual grievance letters and escalation milestones.
    """
    letter_en = f"""To,
The Grievance Redressal Officer (GRO),
Star Health & Allied Insurance Co. Ltd.

Subject: Formal Grievance against Repudiation of Claim Ref: {claim_id}

Respected Sir/Madam,

I am writing to formally contest the rejection of my health insurance claim {claim_id} regarding the inpatient treatment of Ramesh Kumar. The claim was repudiated citing: "{rejection_reason}".

I request reconsideration on the following grounds grounded in IRDAI Master Circulars:
1. Continuous Inception: The policy has been continuously renewed without break for over 24 months, satisfying the statutory waiting period requirement for pre-existing conditions.
2. Emergency Hospitalisation: The admission was necessitated by an acute onset requiring immediate emergency surgical care, not an elective procedure.
3. IRDAI Proportionality Protections: Deductions made on consumables and medication violate IRDAI circular IRDAI/HLT/REG/CIR/194/07/2020 which expressly exempts pharmacy items from room-ratio scaling.

I request you to re-adjudicate this claim within 15 working days as mandated under IRDAI Protection of Policyholders' Interests Regulations. If unresolved, I shall escalate this matter to the Bima Bharosa portal and the Insurance Ombudsman.

Yours faithfully,
Ramesh Kumar
Policyholder"""

    if target_lang == "hi-IN":
        letter_localized = f"""सेवा में,
शिकायत निवारण अधिकारी (GRO),
स्टार हेल्थ एंड अलाइड इंश्योरेंस कंपनी लिमिटेड

विषय: क्लेम संदर्भ {claim_id} के अस्वीकृति के विरुद्ध औपचारिक शिकायत

आदरणीय महोदय / महोदया,

मैं रमेश कुमार के अस्पताल में भर्ती इलाज से संबंधित अपने स्वास्थ्य बीमा दावे {claim_id} की अस्वीकृति का औपचारिक विरोध करने हेतु यह पत्र लिख रहा हूँ। दावा इस कारण अस्वीकृत किया गया था: "{rejection_reason}"।

मैं IRDAI के नियमों के आधार पर पुनर्विचार का अनुरोध करता हूँ:
1. निरंतर नवीनीकरण: पॉलिसी 24 महीने से अधिक समय से बिना किसी रुकावट के चालू है, जिससे पूर्व-मौजूदा बीमारियों की प्रतीक्षा अवधि पूरी हो चुकी है।
2. आपातकालीन भर्ती: यह एक तीव्र आपातकालीन स्थिति थी जिसके लिए तत्काल सर्जरी की आवश्यकता थी।
3. IRDAI दिशा-निर्देश: दवाओं और आवश्यक उपभोग्य सामग्रियों पर की गई कटौती IRDAI के परिपत्रों का उल्लंघन करती है।

कृपया 15 कार्य दिवसों के भीतर इस दावे का पुनः निपटान करें। समाधान न होने पर मैं यह मामला 'बीमा भरोसा' पोर्टल और बीमा लोकपाल (Insurance Ombudsman) के समक्ष उठाऊंगा।

भवदीय,
रमेश कुमार
पॉलिसीधारक"""
    else:
        letter_localized = await translate_text(letter_en, target_lang=target_lang)

    escalation_steps = [
        {
            "step": 1,
            "authority": "Insurer Grievance Redressal Officer (GRO)",
            "sla": "15 Days",
            "contact": "gro@starhealth.in · 1800-425-2255",
            "status": "active",
            "description": "First level of statutory appeal directly with the insurance company."
        },
        {
            "step": 2,
            "authority": "IRDAI Bima Bharosa Portal",
            "sla": "15 Days",
            "contact": "bimabharosa.irdai.gov.in · Toll-free 155255",
            "status": "pending",
            "description": "Regulator's integrated grievance call centre and monitoring portal."
        },
        {
            "step": 3,
            "authority": "Insurance Ombudsman",
            "sla": "30 Days",
            "contact": "cioins.co.in (Claims up to ₹50 Lakhs)",
            "status": "pending",
            "description": "Legally binding quasi-judicial tribunal for policyholder relief."
        }
    ]

    return {
        "letter_en": letter_en,
        "letter_localized": letter_localized,
        "escalation_steps": escalation_steps,
        "rejection_reason": rejection_reason
    }
