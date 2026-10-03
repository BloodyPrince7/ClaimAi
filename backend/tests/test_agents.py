import pytest
from app.schemas.assistant import AskQuestionRequest
from app.agents.assistant import answer_claim_question
from app.agents.triage_agent import triage_incident
from app.agents.appeal_drafter import draft_appeal_package

@pytest.mark.anyio
async def test_assistant_room_rent():
    req = AskQuestionRequest(question="Why was my room rent deducted?", lang="hi-IN")
    res = await answer_claim_question(req)
    assert res.answer is not None
    assert len(res.answer) > 0
    assert res.answer_localized is not None
    assert len(res.citations) > 0
    # Room rent citation should be present
    clauses = [c.clause for c in res.citations]
    assert any("4.2" in cl for cl in clauses)

@pytest.mark.anyio
async def test_assistant_pharmacy():
    req = AskQuestionRequest(question="Are medicines covered?", lang="hi-IN")
    res = await answer_claim_question(req)
    assert res.answer is not None
    assert res.answer_localized is not None
    assert len(res.citations) > 0

@pytest.mark.anyio
async def test_triage_agent():
    res = await triage_incident("My father had emergency cardiac surgery and was admitted for 3 days.")
    assert len(res.matching_policies) > 0
    assert any(p.policy_type == "health" for p in res.matching_policies)

@pytest.mark.anyio
async def test_appeal_drafter():
    res = await draft_appeal_package("CLM-HEALTH-001", "Clause 4.1 PED exclusion", "hi-IN")
    assert "letter_en" in res
    assert "letter_localized" in res
    assert "Ramesh Kumar" in res["letter_en"]
    assert len(res["escalation_steps"]) == 3
