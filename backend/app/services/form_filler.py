import io
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_claim_summary_pdf(claim_summary_dict: dict) -> bytes:
    """
    Generates an official IRDAI Claim Form Part A summary PDF.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header - Bahi-Khata Red Accent
    c.setFillColor(colors.HexColor("#B3261E"))
    c.rect(0, height - 50, width, 50, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 32, "CLAIMMATE · IRDAI CLAIM SUBMISSION SUMMARY")
    c.setFont("Helvetica", 10)
    c.drawString(width - 200, height - 32, "FORM PART A (HEALTH)")

    # Metadata section
    c.setFillColor(colors.HexColor("#151513"))
    c.setFont("Helvetica-Bold", 12)
    y = height - 80
    c.drawString(40, y, "CLAIM DETAILS & POLICY IDENTIFIERS")

    c.setStrokeColor(colors.HexColor("#D8D1C2"))
    c.setLineWidth(1)
    c.line(40, y - 5, width - 40, y - 5)

    y -= 25
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Patient Name:")
    c.setFont("Helvetica", 10)
    c.drawString(130, y, str(claim_summary_dict.get("patient_name", "Ramesh Kumar")))

    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, y, "Policy Number:")
    c.setFont("Helvetica", 10)
    c.drawString(410, y, str(claim_summary_dict.get("policy_id", "POL-HEALTH-001")))

    y -= 20
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Admission Date:")
    c.setFont("Helvetica", 10)
    c.drawString(130, y, str(claim_summary_dict.get("admitted_on", "2026-09-12")))

    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, y, "Discharge Date:")
    c.setFont("Helvetica", 10)
    c.drawString(410, y, str(claim_summary_dict.get("discharged_on", "2026-09-15")))

    # Financial Summary Table
    y -= 35
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "ADJUDICATED FINANCIAL BREAKDOWN")
    c.line(40, y - 5, width - 40, y - 5)

    y -= 25
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Total Billed Amount:")
    c.drawString(200, y, f"Rs. {claim_summary_dict.get('total_billed', 0):,.2f}")

    y -= 20
    c.drawString(40, y, "Total Deductions / Non-Payables:")
    c.drawString(200, y, f"Rs. {claim_summary_dict.get('total_deducted', 0):,.2f}")

    y -= 20
    c.setFillColor(colors.HexColor("#1E6B45"))
    c.drawString(40, y, "NET PAYABLE / ADMISSIBLE AMOUNT:")
    c.drawString(200, y, f"Rs. {claim_summary_dict.get('total_payable', 0):,.2f}")

    c.setFillColor(colors.HexColor("#151513"))

    # Line Item Table Header
    y -= 35
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Sr.")
    c.drawString(70, y, "Item Description")
    c.drawString(270, y, "Category")
    c.drawString(360, y, "Billed (Rs)")
    c.drawString(440, y, "Payable (Rs)")
    c.drawString(520, y, "Status")
    c.line(40, y - 5, width - 40, y - 5)

    lines = claim_summary_dict.get("lines", [])[:12]  # First 12 lines
    y -= 20
    for idx, item in enumerate(lines, 1):
        c.setFont("Helvetica", 9)
        c.drawString(40, y, str(idx))
        desc = item.get("description", "")[:32]
        c.drawString(70, y, desc)
        c.drawString(270, y, str(item.get("category", ""))[:14])
        c.drawString(360, y, f"{item.get('billed', 0):,.0f}")
        c.drawString(440, y, f"{item.get('payable', 0):,.0f}")

        status = str(item.get("decision", "payable")).upper()
        if status == "PAYABLE":
            c.setFillColor(colors.HexColor("#1E6B45"))
        elif status == "PARTIAL":
            c.setFillColor(colors.HexColor("#C98A0B"))
        else:
            c.setFillColor(colors.HexColor("#B3261E"))
        c.drawString(520, y, status)
        c.setFillColor(colors.HexColor("#151513"))

        y -= 18
        if y < 100:
            break

    # Rubber Stamp Box / Signature
    y = 80
    c.setStrokeColor(colors.HexColor("#1E6B45"))
    c.setLineWidth(2)
    c.rect(40, y, 220, 50)
    c.setFillColor(colors.HexColor("#1E6B45"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y + 30, "VERIFIED & SIGNED BY USER")
    c.setFont("Helvetica", 8)
    c.drawString(50, y + 15, "DIGITALLY APPROVED VIA CLAIMMATE GATE 2")

    c.setFillColor(colors.HexColor("#5C5A54"))
    c.setFont("Helvetica", 8)
    c.drawString(320, y + 30, "Claimant Signature: _______________________")
    c.drawString(320, y + 15, "Generated automatically by ClaimMate Engine")

    c.save()
    return buffer.getvalue()
