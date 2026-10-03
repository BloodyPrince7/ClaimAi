import io
from pypdf import PdfReader, PdfWriter
from app.services.form_filler import generate_claim_summary_pdf

def build_claim_pack(claim_summary_dict: dict, document_paths: list[str]) -> bytes:
    """
    Merges the generated claim summary and all uploaded evidence PDFs into a single indexed bundle.
    """
    writer = PdfWriter()

    # 1. Add summary PDF as page 1
    summary_pdf_bytes = generate_claim_summary_pdf(claim_summary_dict)
    summary_reader = PdfReader(io.BytesIO(summary_pdf_bytes))
    for p in summary_reader.pages:
        writer.add_page(p)

    # 2. Add uploaded documents
    for doc_path in document_paths:
        try:
            reader = PdfReader(doc_path)
            for p in reader.pages:
                writer.add_page(p)
        except Exception:
            # If image or unreadable pdf, skip gracefully
            pass

    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()
