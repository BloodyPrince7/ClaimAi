from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

DEMO_DIR = Path(__file__).resolve().parent.parent.parent / "demo-data"
DEMO_DIR.mkdir(parents=True, exist_ok=True)
POLICIES_DIR = DEMO_DIR / "policies"
POLICIES_DIR.mkdir(parents=True, exist_ok=True)

def generate_health_policy_pdf():
    pdf_path = POLICIES_DIR / "Star_Health_Family_Optima_Wording.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter

    # Page 1
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Star Health and Allied Insurance Company Limited")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, "Policy Number: POL-HEALTH-001 · Family Health Optima Insurance Plan")
    c.drawString(50, height - 90, "Insured: Ramesh Kumar, Asha Kumar")
    c.drawString(50, height - 110, "Policy Period: 01 Nov 2025 to 31 Oct 2026")
    c.showPage()

    # Page 3
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "Section 1: Schedule of Benefits & Coverage")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, "Sum Insured: Rs. 5,00,000 (Rupees Five Lakhs only) on floater basis.")
    c.showPage()

    # Page 12
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "Clause 4.2 Room Rent, Boarding and Nursing Expenses")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day.")
    c.drawString(50, height - 100, "Clause 4.2.1: If the Insured occupies a room with higher tariff than eligible,")
    c.drawString(50, height - 115, "all associated medical expenses shall be borne in proportion to the eligible room category.")
    c.showPage()

    # Page 14
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "Clause 4.3 Pre & Post Hospitalisation Expenses")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, "Pre-hospitalisation medical expenses incurred up to 30 days prior to admission are payable.")
    c.drawString(50, height - 100, "Post-hospitalisation medical expenses incurred up to 60 days post discharge are payable.")
    c.showPage()

    # Page 16
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "Clause 16 Co-Payment Condition")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, "A compulsory co-payment of 10% shall be applicable on each admissible claim amount.")
    c.showPage()

    # Page 28
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "Schedule I: List of Non-Payables (IRDAI)")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, "Expenses incurred towards non-medical items, sterile surgical gloves and hospital toiletries are disallowed.")
    c.save()

def generate_rejection_letter_pdf():
    pdf_path = DEMO_DIR / "rejection_letter.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter

    c.setFillColor(colors.HexColor("#B3261E"))
    c.rect(0, height - 40, width, 40, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 26, "CLAIM REPUDIATION NOTICE · STAR HEALTH & ALLIED INSURANCE")

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 70, "To: Ramesh Kumar")
    c.drawString(50, height - 85, "Claim Ref: CLM-HEALTH-001 / POL-HEALTH-001")

    c.setFont("Helvetica", 10)
    c.drawString(50, height - 120, "Dear Policyholder,")
    c.drawString(50, height - 140, "We regret to inform you that upon medical audit of your hospitalization claim at Apollo Hospital,")
    c.drawString(50, height - 155, "the competent authority has disallowed the claim under:")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, height - 180, "Repudiation Reason: Pre-Existing Disease (PED) Exclusion Clause 4.1.")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 210, "You may register a grievance with our Grievance Redressal Officer within 30 days.")
    c.drawString(50, height - 230, "Email: gro@starhealth.in | Toll-free: 1800-425-2255")
    c.save()

if __name__ == "__main__":
    generate_health_policy_pdf()
    generate_rejection_letter_pdf()
    print("Demo PDFs generated successfully!")
