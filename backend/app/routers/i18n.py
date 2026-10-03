from fastapi import APIRouter
from pydantic import BaseModel
from app.sarvam.translate import translate_text, detect_language

router = APIRouter(prefix="/i18n", tags=["i18n"])

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "hi-IN"
    source_lang: str = "auto"

@router.post("/translate")
async def translate_endpoint(req: TranslateRequest):
    translated = await translate_text(req.text, target_lang=req.target_lang, source_lang=req.source_lang)
    return {
        "original": req.text,
        "translated": translated,
        "target_lang": req.target_lang
    }

@router.get("/languages")
def supported_languages():
    return [
        {"code": "hi-IN", "name": "Hindi", "script": "हिन्दी", "tier": "A"},
        {"code": "ta-IN", "name": "Tamil", "script": "தமிழ்", "tier": "A"},
        {"code": "te-IN", "name": "Telugu", "script": "తెలుగు", "tier": "A"},
        {"code": "bn-IN", "name": "Bangla", "script": "বাংলা", "tier": "A"},
        {"code": "mr-IN", "name": "Marathi", "script": "मराठी", "tier": "A"},
        {"code": "gu-IN", "name": "Gujarati", "script": "ગુજરાતી", "tier": "A"},
        {"code": "kn-IN", "name": "Kannada", "script": "ಕನ್ನಡ", "tier": "A"},
        {"code": "ml-IN", "name": "Malayalam", "script": "മലയാളം", "tier": "A"},
        {"code": "pa-IN", "name": "Punjabi", "script": "ਪੰਜਾਬੀ", "tier": "A"},
        {"code": "od-IN", "name": "Odia", "script": "ଓଡ଼ିଆ", "tier": "A"},
        {"code": "en-IN", "name": "English", "script": "English", "tier": "A"}
    ]
