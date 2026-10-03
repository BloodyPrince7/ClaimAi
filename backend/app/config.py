from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    SARVAM_API_KEY: str = "demo_sarvam_key"
    DEMO_MODE: bool = True
    DATABASE_URL: str = "sqlite:///./claimmate.db"
    STORAGE_DIR: str = "./storage"
    CACHE_DIR: str = "./.sarvam_cache"
    DEFAULT_LANG: str = "hi-IN"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Ensure directories exist
Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.CACHE_DIR).mkdir(parents=True, exist_ok=True)
