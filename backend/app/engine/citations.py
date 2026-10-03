from rapidfuzz import fuzz

def verify_citation(quote: str, pages_text: list[dict], threshold: float = 85.0) -> tuple[bool, int | None, float]:
    """
    Verifies that an extracted quote actually exists in the document pages.
    pages_text: list of dicts with {"page_no": int, "text": str}
    Returns: (is_verified, matched_page_no, highest_score)
    """
    if not quote or not pages_text:
        return False, None, 0.0

    clean_quote = " ".join(quote.strip().lower().split())
    best_score = 0.0
    best_page = None

    for page in pages_text:
        page_no = page.get("page_no")
        text = page.get("text", "")
        clean_text = " ".join(text.strip().lower().split())

        # Check partial ratio
        score = fuzz.partial_ratio(clean_quote, clean_text)
        if score > best_score:
            best_score = score
            best_page = page_no

        if best_score >= threshold:
            return True, best_page, best_score

    return best_score >= threshold, best_page, best_score
