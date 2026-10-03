from fastapi import APIRouter, UploadFile, File, Form, Response
from app.sarvam.speech import transcribe, speak

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    tr = await transcribe(audio_bytes, filename=file.filename or "audio.wav")
    return {
        "text": tr.text,
        "lang": tr.lang
    }

@router.post("/tts")
async def text_to_speech(
    text: str = Form(...),
    lang: str = Form("hi-IN"),
    speaker: str = Form("shubh")
):
    audio_bytes = await speak(text, lang=lang, speaker=speaker)
    return Response(content=audio_bytes, media_type="audio/wav")
