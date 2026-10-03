from app.sarvam.speech import transcribe, Transcript
from app.sarvam.translate import detect_language

async def process_language_input(
    audio_bytes: bytes | None = None,
    text: str | None = None,
    filename: str = "input.wav"
) -> dict:
    """
    Language Agent: Transcribes voice via Saaras v4 and detects language.
    """
    if audio_bytes:
        tr: Transcript = await transcribe(audio_bytes, filename)
        detected_text = tr.text
        detected_lang = tr.lang
    else:
        detected_text = text or ""
        detected_lang = await detect_language(detected_text)

    return {
        "original_text": detected_text,
        "lang": detected_lang
    }
