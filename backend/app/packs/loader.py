from pathlib import Path
import yaml

PACKS_DIR = Path(__file__).resolve().parent

def load_claim_pack(insurance_type: str) -> dict:
    pack_file = PACKS_DIR / f"{insurance_type.lower()}.yaml"
    if not pack_file.exists():
        # Fallback to health
        pack_file = PACKS_DIR / "health.yaml"
    with open(pack_file, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def list_claim_packs() -> list[dict]:
    packs = []
    for f in PACKS_DIR.glob("*.yaml"):
        with open(f, "r", encoding="utf-8") as fp:
            data = yaml.safe_load(fp)
            if data:
                packs.append(data)
    return packs
