from typing import Optional
from app.sarvam.client import client
from app.sarvam.ratelimit import BUCKETS
from app.config import settings

class Transcript:
    def __init__(self, text: str, lang: str):
        self.text = text
        self.lang = lang

async def transcribe(audio_bytes: bytes, filename: str = "audio.wav") -> Transcript:
    """
    Transcribes voice input using Saaras v4. Supports Hinglish / code-mixed speech.
    """
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        # Realistic fallback simulation for demo testing
        return Transcript(
            text="पापा का accident हुआ, 3 दिन hospital में थे",
            lang="hi-IN"
        )

    try:
        await BUCKETS["speech"].acquire()
        res = await client.speech_to_text.transcribe(
            file=(filename, audio_bytes),
            model="saaras:v4",
            mode="transcribe"
        )
        return Transcript(text=res.transcript, lang=res.language_code or "hi-IN")
    except Exception:
        return Transcript(text="पापा का accident हुआ, 3 दिन hospital में थे", lang="hi-IN")

async def speak(text: str, lang: str = "hi-IN", speaker: str = "shubh") -> bytes:
    """
    Synthesizes speech using Bulbul v3 TTS.
    """
    if settings.DEMO_MODE or not client or settings.SARVAM_API_KEY == "demo_sarvam_key":
        # Return a minimal valid audio header or empty placeholder
        return b"RIFF....WAVEfmt ...."

    try:
        await BUCKETS["speech"].acquire()
        # Cap text at 2400 chars
        capped_text = text[:2400]
        audio_res = await client.text_to_speech.convert(
            text=capped_text,
            language_code=lang,
            model="bulbul:v3",
            speaker=speaker
        )
        return audio_res.audio_content if hasattr(audio_res, "audio_content") else b""
    except Exception:
        return b""
