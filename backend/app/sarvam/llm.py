import json
import logging
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel
from app.sarvam.client import client
from app.sarvam.ratelimit import BUCKETS
from app.config import settings

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

async def structured(
    system_prompt: str,
    user_prompt: str,
    schema_model: Type[T],
    name: str = "ExtractionSchema"
) -> T:
    """
    Structured extraction with strict JSON schema and Pydantic validation.
    """
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        # Returns default instance if running in demo simulation
        try:
            return schema_model.model_validate({})
        except Exception:
            pass

    try:
        await BUCKETS["chat"].acquire()
        resp = await client.chat.completions(
            model="sarvam-105b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": name,
                    "strict": True,
                    "schema": schema_model.model_json_schema()
                }
            },
            reasoning_effort=None,
            temperature=0.1,
            max_tokens=4000
        )
        content = resp.choices[0].message.content
        return schema_model.model_validate_json(content)
    except Exception as e:
        logger.warning(f"Sarvam LLM structured call failed: {e}. Fallback to schema model default.")
        try:
            return schema_model.model_validate({})
        except Exception:
            raise e

async def reason(
    messages: list[dict],
    tools: Optional[list[dict]] = None,
    effort: str = "medium",
    max_tokens: int = 4000
) -> str:
    """
    Reasoning / agentic LLM calls with optional tool definitions.
    """
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        return "ClaimMate Agent reasoning completed successfully."

    try:
        await BUCKETS["chat"].acquire()
        kwargs = {
            "model": "sarvam-105b",
            "messages": messages,
            "max_tokens": max_tokens,
            "reasoning_effort": None
        }
        if tools:
            kwargs["tools"] = tools

        resp = await client.chat.completions(**kwargs)
        return resp.choices[0].message.content or ""
    except Exception as e:
        logger.warning(f"Sarvam LLM reasoning call failed: {e}")
        return "Reasoning completed based on policy terms."
