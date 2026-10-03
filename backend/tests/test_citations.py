from app.engine.citations import verify_citation

def test_citation_verification_true_match():
    pages = [
        {"page_no": 1, "text": "This is introductory text."},
        {"page_no": 12, "text": "Clause 4.2 Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."}
    ]

    quote = "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day."
    verified, matched_page, score = verify_citation(quote, pages)

    assert verified is True
    assert matched_page == 12
    assert score >= 90.0

def test_citation_hallucinated_quote():
    pages = [
        {"page_no": 1, "text": "Standard exclusions apply for cosmetic surgery."},
    ]

    fake_quote = "Free dental care and cosmetic laser treatments will be covered up to 100%."
    verified, matched_page, score = verify_citation(fake_quote, pages)

    assert verified is False
    assert score < 85.0
