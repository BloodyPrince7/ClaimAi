import hashlib
import json
from pathlib import Path
from typing import Any, Optional
from app.config import settings

CACHE_DIR = Path(settings.CACHE_DIR)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def hash_key(key_data: str | bytes) -> str:
    if isinstance(key_data, str):
        key_data = key_data.encode("utf-8")
    return hashlib.sha256(key_data).hexdigest()

def get_cached(key_hash: str) -> Optional[Any]:
    cache_file = CACHE_DIR / f"{key_hash}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

def set_cached(key_hash: str, value: Any):
    cache_file = CACHE_DIR / f"{key_hash}.json"
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=2)
    except Exception:
        pass
