from app.schemas.evidence import BillLineItem

def get_demo_health_line_items() -> list[BillLineItem]:
    """
    Returns standard evidence line items matching Demo Health Case 1.
    """
    return [
        BillLineItem(
            id="item_1",
            doc_id="doc_bill_hospital",
            doc_name="Hospital Final Bill #4881",
            description="Room Rent & Boarding (Deluxe Room × 3 Days @ ₹8,000/day)",
            date="2026-09-12",
            qty=3.0,
            rate=8000.0,
            billed=24000.0,
            category="room_rent",
            confidence=0.98,
            source_page=1
        ),
        BillLineItem(
            id="item_2",
            doc_id="doc_bill_hospital",
            doc_name="Hospital Final Bill #4881",
            description="Senior Consultant Surgeon & Anaesthesia Charges",
            date="2026-09-13",
            qty=1.0,
            rate=40000.0,
            billed=40000.0,
            category="surgeon_fee",
            confidence=0.96,
            source_page=1
        ),
        BillLineItem(
            id="item_3",
            doc_id="doc_bill_hospital",
            doc_name="Hospital Final Bill #4881",
            description="Operation Theatre (OT) & Monitoring Charges",
            date="2026-09-13",
            qty=1.0,
            rate=25000.0,
            billed=25000.0,
            category="ot_charges",
            confidence=0.95,
            source_page=1
        ),
        BillLineItem(
            id="item_4",
            doc_id="doc_bill_pharmacy",
            doc_name="Apollo Pharmacy Bill #9021",
            description="Inpatient Prescribed Medications & IV Antibiotics",
            date="2026-09-14",
            qty=1.0,
            rate=32500.0,
            billed=32500.0,
            category="medicine",
            confidence=0.97,
            source_page=1
        ),
        BillLineItem(
            id="item_5",
            doc_id="doc_bill_consumables",
            doc_name="Hospital Consumables Annexure",
            description="Sterile Surgical Gloves, Admission Kit & PPE Pack",
            date="2026-09-13",
            qty=40.0,
            rate=31.25,
            billed=1250.0,
            category="consumables",
            confidence=0.99,
            source_page=2
        ),
        BillLineItem(
            id="item_6",
            doc_id="doc_bill_pre_hosp",
            doc_name="Pre-op Diagnostic MRI Spine",
            description="Pre-hospitalisation MRI Scan (12 days prior to admit)",
            date="2026-08-31",
            qty=1.0,
            rate=8400.0,
            billed=8400.0,
            category="pre_hosp",
            confidence=0.94,
            source_page=1
        ),
        BillLineItem(
            id="item_7",
            doc_id="doc_bill_post_hosp",
            doc_name="Post-discharge Consultation & Rx",
            description="Post-hospitalisation Surgeon Review & Physiotherapy (Day 15)",
            date="2026-09-30",
            qty=1.0,
            rate=4000.0,
            billed=4000.0,
            category="post_hosp",
            confidence=0.95,
            source_page=1
        )
    ]
