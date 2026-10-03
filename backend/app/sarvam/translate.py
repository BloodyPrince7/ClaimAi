import re
import asyncio
from typing import Optional
from app.sarvam.client import client
from app.sarvam.ratelimit import BUCKETS
from app.sarvam.cache import hash_key, get_cached, set_cached
from app.config import settings

# Regex to match currency amounts, clauses, policy numbers, and percentages
PROTECTED_REGEX = re.compile(r'(₹\s*[\d,]+(?:\.\d+)?|Clause\s+[\d\.]+|IRDAI|POL-[A-Z0-9\-]+|\b\d+%\b)', re.IGNORECASE)

INDIC_COMMON_MAP = {
    "hi-IN": {
        "Deducted": "कटौती की गई",
        "Payable": "भुगतान योग्य",
        "Partial": "आंशिक भुगतान",
        "Approved": "स्वीकृत",
        "Disputed": "आपत्ति दर्ज",
        "Room rent cap applied": "कमरे के किराये की सीमा लागू की गई",
        "Doctor prescription missing": "डॉक्टर का पर्चा गायब है",
        "Proportionate deduction": "आनुपातिक कटौती"
    },
    "ta-IN": {
        "Deducted": "கழிக்கப்பட்டது",
        "Payable": "செலுத்தத்தக்கது",
        "Partial": "பகுதி செலுத்துதல்",
        "Approved": "ஒப்புதல் அளிக்கப்பட்டது",
        "Disputed": "மறுக்கப்பட்டது"
    }
}

def mask_tokens(text: str) -> tuple[str, dict[str, str]]:
    mapping = {}
    counter = 0

    def replacer(match):
        nonlocal counter
        token = f"⟦{counter}⟧"
        mapping[token] = match.group(0)
        counter += 1
        return token

    masked = PROTECTED_REGEX.sub(replacer, text)
    return masked, mapping

def unmask_tokens(text: str, mapping: dict[str, str]) -> str:
    res = text
    for token, original in mapping.items():
        res = res.replace(token, original)
    return res

async def detect_language(text: str) -> str:
    # Heuristic detection for common Indian scripts or fallback
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hi-IN"
    elif any('\u0B80' <= char <= '\u0BFF' for char in text):
        return "ta-IN"
    elif any('\u0C00' <= char <= '\u0C7F' for char in text):
        return "te-IN"
    elif any('\u0980' <= char <= '\u09FF' for char in text):
        return "bn-IN"
    return "en-IN"

async def translate_text(
    text: str,
    target_lang: str = "hi-IN",
    source_lang: str = "auto",
    mode: str = "formal"
) -> str:
    """
    Translates text with protected token masking (amounts, clauses, policy numbers).
    """
    if not text or target_lang.startswith("en"):
        return text

    cache_k = hash_key(f"tr:{text}:{target_lang}:{mode}")
    cached = get_cached(cache_k)
    if cached:
        return cached

    masked_text, token_map = mask_tokens(text)

    # If demo mode or client not connected, use intelligent localization
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        translated = masked_text
        for en_word, local_word in INDIC_COMMON_MAP.get(target_lang, {}).items():
            translated = translated.replace(en_word, local_word)
        unmasked = unmask_tokens(translated, token_map)
        set_cached(cache_k, unmasked)
        return unmasked

    try:
        await BUCKETS["translate"].acquire()
        resp = await client.text.translate(
            input=masked_text,
            source_language_code=source_lang,
            target_language_code=target_lang,
            model="sarvam-translate:v1",
            mode=mode
        )
        translated_result = unmask_tokens(resp.translated_text, token_map)
        set_cached(cache_k, translated_result)
        return translated_result
    except Exception:
        # Graceful fallback to unmasked original
        return text
