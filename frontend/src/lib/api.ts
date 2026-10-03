const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getPolicies: async () => {
    try {
      return await fetchJson("/wallet/policies");
    } catch {
      return [
        {
          id: "POL-HEALTH-001",
          type: "health",
          insurer: "Star Health & Allied",
          policy_no: "POL-HEALTH-001",
          plan_name: "Family Health Optima",
          sum_insured: 500000,
          status: "ready",
          rules: {
            room_rent_cap_value: { value: 1.0, page: 12, quote: "Room Rent up to 1% of Sum Insured per day." },
            copay_percent: { value: 10.0, page: 16, quote: "A compulsory co-payment of 10% shall be applicable." }
          }
        },
        {
          id: "POL-MOTOR-001",
          type: "motor",
          insurer: "ICICI Lombard",
          policy_no: "POL-MOT-4491",
          plan_name: "Private Car Comprehensive",
          sum_insured: 640000,
          status: "ready",
          rules: {
            zero_depreciation: { value: false },
            no_claim_bonus_percent: { value: 35.0 }
          }
        },
        {
          id: "POL-LIFE-001",
          type: "life",
          insurer: "HDFC Life",
          policy_no: "POL-LIFE-902",
          plan_name: "Click 2 Protect Super",
          sum_insured: 10000000,
          status: "ready",
          rules: { nominee: "Asha Kumar (Wife)" }
        }
      ];
    }
  },

  getPolicy: async (id: string = "POL-HEALTH-001") => {
    try {
      return await fetchJson(`/wallet/policies/${id}`);
    } catch {
      return {
        id,
        type: "health",
        insurer: "Star Health & Allied",
        policy_no: id,
        plan_name: "Family Health Optima",
        sum_insured: 500000,
        status: "ready"
      };
    }
  },

  getClaim: async (id: string = "CLM-HEALTH-001") => {
    try {
      return await fetchJson(`/claims/${id}`);
    } catch {
      return {
        claim_id: "CLM-HEALTH-001",
        policy_id: "POL-HEALTH-001",
        status: "awaiting_review",
        patient_name: "Ramesh Kumar",
        admitted_on: "2026-09-12",
        discharged_on: "2026-09-15",
        total_billed: 135150,
        total_payable: 100525,
        total_deducted: 34625,
        total_uncertain: 0,
        missed_pre_post: 12400,
        lines: [
          {
            id: "dec_item_1",
            line_id: "item_1",
            doc_id: "doc_bill_hospital",
            description: "Room Rent & Boarding (Deluxe Room × 3 Days @ ₹8,000/day)",
            date: "2026-09-12",
            category: "room_rent",
            billed: 24000,
            payable: 15000,
            deducted: 9000,
            decision: "partial",
            rule_id: "H5",
            reason: "Room rent capped at ₹5,000/day (1% SI limit). Actual was ₹8,000/day.",
            calc: "₹5,000 ÷ ₹8,000 = 62.5%",
            citation: { policy_id: "POL-HEALTH-001", clause: "Clause 4.2", page: 12, quote: "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day.", verified: true },
            confidence: 0.98
          },
          {
            id: "dec_item_2",
            line_id: "item_2",
            doc_id: "doc_bill_hospital",
            description: "Senior Consultant Surgeon & Anaesthesia Charges",
            date: "2026-09-13",
            category: "surgeon_fee",
            billed: 40000,
            payable: 25000,
            deducted: 15000,
            decision: "partial",
            rule_id: "H6",
            reason: "Proportionate deduction: Associated surgical fees scaled by room rent ratio (62.5%).",
            calc: "₹5,000 ÷ ₹8,000 = 62.5% of ₹40,000",
            citation: { policy_id: "POL-HEALTH-001", clause: "Clause 4.2.1", page: 12, quote: "All associated medical expenses shall be borne in proportion to the eligible room category.", verified: true },
            confidence: 0.96
          },
          {
            id: "dec_item_3",
            line_id: "item_3",
            doc_id: "doc_bill_hospital",
            description: "Operation Theatre (OT) & Monitoring Charges",
            date: "2026-09-13",
            category: "ot_charges",
            billed: 25000,
            payable: 15625,
            deducted: 9375,
            decision: "partial",
            rule_id: "H6",
            reason: "Proportionate deduction: OT charges scaled by 62.5% room ratio.",
            calc: "62.5% of ₹25,000 = ₹15,625",
            citation: { policy_id: "POL-HEALTH-001", clause: "Clause 4.2.1", page: 12, quote: "All associated medical expenses shall be borne in proportion to the eligible room category.", verified: true },
            confidence: 0.95
          },
          {
            id: "dec_item_4",
            line_id: "item_4",
            doc_id: "doc_bill_pharmacy",
            description: "Inpatient Prescribed Medications & IV Antibiotics",
            date: "2026-09-14",
            category: "medicine",
            billed: 32500,
            payable: 32500,
            deducted: 0,
            decision: "payable",
            rule_id: "H1",
            reason: "Exempt from proportionate cut per IRDAI Master Circular (Pharmacy 100% admissible).",
            calc: "100% covered",
            confidence: 0.97
          },
          {
            id: "dec_item_5",
            line_id: "item_5",
            doc_id: "doc_bill_consumables",
            description: "Sterile Surgical Gloves, Admission Kit & PPE Pack",
            date: "2026-09-13",
            category: "consumables",
            billed: 1250,
            payable: 0,
            deducted: 1250,
            decision: "deducted",
            rule_id: "H3",
            reason: "Disallowed: Non-medical hospital consumables under IRDAI List I.",
            calc: "₹1,250 × 0% = ₹0",
            citation: { policy_id: "POL-HEALTH-001", clause: "Schedule I", page: 28, quote: "Expenses incurred towards non-medical items specified in IRDAI List I are disallowed.", verified: true },
            confidence: 0.99
          },
          {
            id: "dec_item_6",
            line_id: "item_6",
            doc_id: "doc_bill_pre_hosp",
            description: "Pre-hospitalisation MRI Scan (12 days prior to admit)",
            date: "2026-08-31",
            category: "pre_hosp",
            billed: 8400,
            payable: 8400,
            deducted: 0,
            decision: "payable",
            rule_id: "H7",
            reason: "Pre-hospitalisation benefit unlocked (covered within 30-day pre-admission window).",
            calc: "100% eligible",
            citation: { policy_id: "POL-HEALTH-001", clause: "Clause 4.3", page: 14, quote: "Pre-hospitalisation medical expenses up to 30 days prior to admission are payable.", verified: true },
            confidence: 0.94
          },
          {
            id: "dec_item_7",
            line_id: "item_7",
            doc_id: "doc_bill_post_hosp",
            description: "Post-hospitalisation Surgeon Review & Physiotherapy (Day 15)",
            date: "2026-09-30",
            category: "post_hosp",
            billed: 4000,
            payable: 4000,
            deducted: 0,
            decision: "payable",
            rule_id: "H7",
            reason: "Post-hospitalisation benefit unlocked (covered within 60-day post-discharge window).",
            calc: "100% eligible",
            citation: { policy_id: "POL-HEALTH-001", clause: "Clause 4.3", page: 14, quote: "Post-hospitalisation medical expenses up to 60 days post discharge are payable.", verified: true },
            confidence: 0.95
          }
        ],
        flags: [
          { id: "flag_room_1", line_id: "item_1", severity: "warning", kind: "room_rent_cap", message: "Room was ₹8,000/day vs your policy limit of ₹5,000/day (1% of SI).", status: "pending" },
          { id: "flag_prop_2", line_id: "item_2", severity: "warning", kind: "proportionate_deduction", message: "Surgeon fees reduced by 37.5% due to room category upgrade.", status: "pending" },
          { id: "flag_np_5", line_id: "item_5", severity: "danger", kind: "non_payable", message: "Gloves and admission kits are disallowed under IRDAI List I.", status: "pending" },
          { id: "flag_missing_rx", line_id: null, severity: "warning", kind: "missing_document", message: "Doctor's prescription missing for pharmacy bills totaling ₹32,500.", status: "pending" }
        ],
        checklist: [
          { id: "doc_form", label: "IRDAI Claim Form Part A (duly filled)", status: "ok" },
          { id: "doc_bills", label: "Hospital Bills with detailed break-up (7 uploaded)", status: "ok" },
          { id: "doc_ds", label: "Discharge Summary with doctor signature", status: "invalid", reason: "Attending physician signature missing on Page 2" },
          { id: "doc_rx", label: "Doctor's Prescription for all pharmacy items", status: "missing", reason: "Prescription matching Bill #4 not found" }
        ],
        deadlines: [
          { id: "dl_submit", label: "Submit final claim documents", due: "2026-10-18", urgency: "14 days remaining" },
          { id: "dl_intimate", label: "Initial claim intimation to TPA", due: "2026-10-06", urgency: "Completed ✓" }
        ],
        documents: [
          { id: "doc_bill_hospital", kind: "bill", name: "Apollo_Hospital_Final_Bill_4881.pdf", status: "done", lang: "en-IN" },
          { id: "doc_bill_pharmacy", kind: "bill", name: "Pharmacy_Rx_Invoice_9021.pdf", status: "done", lang: "en-IN" },
          { id: "doc_bill_consumables", kind: "bill", name: "Consumables_Annexure.pdf", status: "done", lang: "en-IN" },
          { id: "doc_ds", kind: "discharge_summary", name: "Discharge_Summary_RameshKumar.pdf", status: "issue", lang: "en-IN" },
          { id: "doc_mri", kind: "investigation", name: "Pre_Hosp_MRI_Diagnostic_Report.pdf", status: "done", lang: "en-IN" },
          { id: "doc_marathi", kind: "bill", name: "Local_Ambulance_ पावती (Marathi).pdf", status: "done", lang: "mr-IN" }
        ]
      };
    }
  },

  triageIncident: async (text: string, lang: string = "hi-IN") => {
    try {
      return await fetchJson("/incidents", {
        method: "POST",
        body: JSON.stringify({ incident_text: text, incident_lang: lang }),
      });
    } catch {
      return {
        detected_lang: lang,
        original_text: text,
        english_text: text,
        matching_policies: [
          {
            policy_id: "POL-HEALTH-001",
            policy_type: "health",
            insurer: "Star Health & Allied",
            policy_no: "POL-HEALTH-001",
            title: "Family Health Optima · Inpatient Hospitalisation",
            estimated_payout: 100525,
            urgent_deadline: "Submit within 15 days",
            deadline_urgency: "15_days",
            reason: "Hospital admission covered under base Sum Insured (₹5,00,000).",
            selected_by_default: true
          },
          {
            policy_id: "POL-MOTOR-002",
            policy_type: "motor",
            insurer: "HDFC ERGO",
            policy_no: "POL-MOTOR-002",
            title: "Personal Accident Cover (Add-on)",
            estimated_payout: 25000,
            urgent_deadline: "Intimate within 48 hours",
            deadline_urgency: "48_hours",
            reason: "Covers accidental injury & daily hospital cash.",
            selected_by_default: true
          },
          {
            policy_id: "POL-CARD-003",
            policy_type: "travel",
            insurer: "HDFC Bank Regalia",
            policy_no: "CC-PROTECT-889",
            title: "Complimentary Credit Card Emergency Medical Cover",
            estimated_payout: 50000,
            urgent_deadline: "30 days",
            deadline_urgency: "30_days",
            reason: "Hidden benefit: Credit card includes emergency trauma cover.",
            selected_by_default: false
          }
        ]
      };
    }
  },

  whatIfSim: async (claim_id: string, roomRent: number) => {
    try {
      return await fetchJson(`/claims/${claim_id}/what-if`, {
        method: "POST",
        body: JSON.stringify({ room_rent_per_day: roomRent })
      });
    } catch {
      const basePayable = 100525;
      const factor = roomRent <= 5000 ? 1 : 5000 / roomRent;
      const simulatedPayable = Math.round(basePayable * factor);
      return {
        room_rent_per_day: roomRent,
        old_payable: basePayable,
        new_payable: simulatedPayable,
        difference: simulatedPayable - basePayable,
        explanation: roomRent <= 5000 
          ? `At ₹${roomRent.toLocaleString('en-IN')}/day, you avoid all proportionate cuts and gain full coverage!`
          : `At ₹${roomRent.toLocaleString('en-IN')}/day, room ratio is ${(factor * 100).toFixed(1)}%.`
      };
    }
  },

  motorSim: async (claim_id: string = "CLM-MOTOR-001") => {
    try {
      return await fetchJson(`/claims/${claim_id}/motor-sim`);
    } catch {
      return {
        estimate_amount: 24400,
        depreciation_total: 5000,
        deductible_total: 1000,
        net_claim_payable: 18400,
        ncb_loss_3_years: 11400,
        should_claim: true,
        difference: 7000,
        recommendation_text: "Claim Recommended: You will recover ₹18,400 from insurer, exceeding your 3-year NCB loss of ₹11,400 by ₹7,000.",
        recommendation_text_localized: "दावा करें: आपको बीमा कंपनी से ₹18,400 मिलेंगे, जो 3 साल के नो-क्लेम बोनस के नुकसान (₹11,400) से ₹7,000 अधिक है।",
        calc_table: [
          { item: "Estimated Workshop Repair Cost", amount: 24400, type: "cost" },
          { item: "Depreciation on Plastic Bumper (50%)", amount: -5000, type: "deduction" },
          { item: "Compulsory Deductible (<=1500cc)", amount: -1000, type: "deduction" },
          { item: "Net Insurer Payout", amount: 18400, type: "net_payout" },
          { item: "Loss of 3-Year No-Claim Bonus (35% reset)", amount: 11400, type: "ncb_loss" }
        ]
      };
    }
  },

  askAssistant: async (question: string, lang: string = "hi-IN", claim_id: string = "CLM-HEALTH-001") => {
    try {
      return await fetchJson("/assistant/ask", {
        method: "POST",
        body: JSON.stringify({ question, lang, claim_id })
      });
    } catch {
      return {
        answer: "A total deduction of ₹16,850 occurred due to Clause 4.2 of your policy (Room Rent limit ₹5,000/day). Choosing a ₹8,000/day room scaled surgeon & OT charges down to 62.5%.",
        answer_localized: "आपकी पॉलिसी के क्लॉज 4.2 (कमरे का किराया सीमा ₹5,000/दिन) के कारण ₹16,850 की कटौती हुई। ₹8,000/दिन वाला कमरा चुनने से सर्जन व ओटी शुल्क 62.5% की दर से स्वीकृत हुए।",
        citations: [
          {
            title: "Star Health Policy Schedule",
            clause: "Clause 4.2",
            page: 12,
            quote: "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."
          }
        ]
      };
    }
  },

  draftAppeal: async (claim_id: string, lang: string = "hi-IN") => {
    try {
      return await fetchJson(`/claims/${claim_id}/appeal?lang=${lang}`, { method: "POST" });
    } catch {
      return {
        letter_en: `To,\nThe Grievance Redressal Officer (GRO),\nStar Health & Allied Insurance Co. Ltd.\n\nSubject: Formal Grievance against Repudiation of Claim Ref: ${claim_id}\n\nI contest this repudiation because the policy has completed 24 continuous months, satisfying the statutory pre-existing disease waiting period. Additionally, emergency hospitalization was required.\n\nYours faithfully,\nRamesh Kumar`,
        letter_localized: `सेवा में,\nशिकायत निवारण अधिकारी (GRO),\nस्टार हेल्थ एंड अलाइड इंश्योरेंस कंपनी लिमिटेड\n\nविषय: क्लेम संदर्भ ${claim_id} के अस्वीकृति के विरुद्ध औपचारिक शिकायत\n\nमैं इस अस्वीकृति का विरोध करता हूँ क्योंकि पॉलिसी 24 महीने से चालू है और आपातकालीन चिकित्सा अनिवार्य थी।\n\nभवदीय,\nरमेश कुमार`,
        escalation_steps: [
          { step: 1, authority: "Insurer Grievance Redressal Officer (GRO)", sla: "15 Days", contact: "gro@starhealth.in", status: "active" },
          { step: 2, authority: "IRDAI Bima Bharosa Portal", sla: "15 Days", contact: "bimabharosa.irdai.gov.in", status: "pending" },
          { step: 3, authority: "Insurance Ombudsman", sla: "30 Days", contact: "cioins.co.in", status: "pending" }
        ]
      };
    }
  }
};
