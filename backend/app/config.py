import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine env file location (check root first, then backend)
ROOT_ENV = Path(__file__).resolve().parent.parent.parent / ".env"
BACKEND_ENV = Path(__file__).resolve().parent.parent / ".env"
TARGET_ENV = str(ROOT_ENV if ROOT_ENV.exists() else BACKEND_ENV)

class Settings(BaseSettings):
    SARVAM_API_KEY: str = "demo_sarvam_key"
    DEMO_MODE: bool = False
    DATABASE_URL: str = "sqlite:///./claimmate.db"
    STORAGE_DIR: str = "./storage"
    CACHE_DIR: str = "./.sarvam_cache"
    DEFAULT_LANG: str = "hi-IN"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=TARGET_ENV,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.CACHE_DIR).mkdir(parents=True, exist_ok=True)
