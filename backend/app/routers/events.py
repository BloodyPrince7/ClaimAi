import json
import asyncio
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from app.agents.graph import execute_claim_pipeline_stream

router = APIRouter(tags=["events"])

@router.get("/claims/{claim_id}/events")
async def claim_events_stream(claim_id: str):
    """
    Live Server-Sent Events (SSE) progress feed for the multi-agent claim workspace.
    """
    async def event_generator():
        async for step in execute_claim_pipeline_stream(claim_id):
            yield {
                "event": "message",
                "data": json.dumps(step, ensure_ascii=False)
            }
        # Final keep-alive message
        yield {
            "event": "done",
            "data": json.dumps({"status": "complete", "message": "All agents finished."})
        }

    return EventSourceResponse(event_generator())
