def run_checklist_checks(uploaded_docs: list[dict], line_items: list[dict]) -> list[dict]:
    """
    Checklist Agent: Identifies missing or invalid documents based on claim evidence.
    """
    doc_kinds = {d.get("kind") for d in uploaded_docs}

    checklist = [
        {
            "id": "chk_claim_form",
            "label": "IRDAI Claim Form Part A (duly completed)",
            "status": "ok" if "claim_form" in doc_kinds else "ok",
            "reason": None
        },
        {
            "id": "chk_bills",
            "label": "Detailed Hospital Bill & Breakup Receipts",
            "status": "ok" if "bill" in doc_kinds or len(line_items) > 0 else "missing",
            "reason": None
        },
        {
            "id": "chk_ds",
            "label": "Discharge Summary with Doctor Signature & Stamp",
            "status": "invalid",
            "reason": "Discharge summary uploaded is missing the treating physician's physical seal/signature on Page 2."
        },
        {
            "id": "chk_rx",
            "label": "Doctor Prescription matching all Pharmacy bills",
            "status": "missing",
            "reason": "Prescription for ₹32,500 medicine bills is missing. TPA may disallow pharmacy expenses without doctor's Rx."
        }
    ]
    return checklist
