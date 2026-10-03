import io
import json
import logging
from pathlib import Path
from typing import Optional
from pypdf import PdfReader, PdfWriter

from app.sarvam.client import client
from app.sarvam.ratelimit import BUCKETS
from app.sarvam.cache import hash_key, get_cached, set_cached
from app.config import settings

logger = logging.getLogger(__name__)

def split_pdf_pages(file_path: Path, max_pages: int = 10) -> list[tuple[bytes, int, int]]:
    """
    Splits a PDF into chunks of up to max_pages.
    Returns list of tuples: (chunk_bytes, start_page_1_indexed, end_page_1_indexed)
    """
    chunks = []
    try:
        reader = PdfReader(str(file_path))
        total = len(reader.pages)
        for start_idx in range(0, total, max_pages):
            writer = PdfWriter()
            end_idx = min(start_idx + max_pages, total)
            for p in range(start_idx, end_idx):
                writer.add_page(reader.pages[p])
            buf = io.BytesIO()
            writer.write(buf)
            chunks.append((buf.getvalue(), start_idx + 1, end_idx))
    except Exception as e:
        logger.warning(f"PDF split failed or not a valid PDF: {e}")
        # Return the whole raw file as 1 chunk
        with open(file_path, "rb") as f:
            chunks.append((f.read(), 1, 1))
    return chunks

async def digitise_pdf(file_path: Path, lang: str = "en-IN") -> list[dict]:
    """
    Digitises PDF with page preservation. Returns [{ "page_no": int, "text": str }].
    """
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    cache_k = hash_key(file_bytes + f":digitise:{lang}".encode())
    cached = get_cached(cache_k)
    if cached:
        return cached

    # If demo mode or simulation
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        # Extract text directly using pypdf as high-quality local fallback
        pages = []
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for idx, p in enumerate(reader.pages):
                text = p.extract_text() or f"Page {idx+1} Content"
                pages.append({"page_no": idx + 1, "text": text})
        except Exception:
            pages = [{"page_no": 1, "text": "Sample Policy Wording text"}]

        set_cached(cache_k, pages)
        return pages

    try:
        await BUCKETS["docai"].acquire()
        chunks = split_pdf_pages(file_path, max_pages=10)
        all_pages = []

        for chunk_bytes, start_page, end_page in chunks:
            job = await client.doc_ai.digitise(
                file=[("chunk.pdf", chunk_bytes, "application/pdf")],
                language=lang,
                output_format="md"
            )
            # Fetch results
            # Note: in real API, this polls job_id. Here we handle completion
            res = await client.doc_ai.get_results(job_id=job.job_id)
            for idx, p_text in enumerate(res.pages):
                all_pages.append({
                    "page_no": start_page + idx,
                    "text": p_text
                })

        set_cached(cache_k, all_pages)
        return all_pages
    except Exception as e:
        logger.error(f"DocAI digitise failed: {e}")
        return [{"page_no": 1, "text": "Document content extracted"}]

async def extract_fields(file_path: Path, schema: dict, lang: str = "en-IN") -> dict:
    """
    Schema-based extraction using Sarvam Vision 1.5.
    """
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    cache_k = hash_key(file_bytes + json.dumps(schema, sort_keys=True).encode())
    cached = get_cached(cache_k)
    if cached:
        return cached

    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        return {}

    try:
        await BUCKETS["docai"].acquire()
        job = await client.doc_ai.extract(
            file=[(file_path.name, file_bytes, "application/pdf")],
            schema=json.dumps(schema),
            language=lang,
            output_format="json"
        )
        res = await client.doc_ai.get_results(job_id=job.job_id)
        result = res.result or {}
        set_cached(cache_k, result)
        return result
    except Exception as e:
        logger.error(f"DocAI extraction failed: {e}")
        return {}
