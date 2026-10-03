from fastapi import APIRouter
from app.schemas.assistant import AskQuestionRequest, AskQuestionResponse
from app.agents.assistant import answer_claim_question

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/ask", response_model=AskQuestionResponse)
async def ask_assistant(req: AskQuestionRequest):
    return await answer_claim_question(req)
