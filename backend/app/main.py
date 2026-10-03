import json
from datetime import date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.config import settings
from app.db import init_db, engine
from app.models.policy import Policy
from app.models.claim import Claim
from app.models.user import User
from app.routers import wallet, claims, events, assistant, voice, i18n

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data()
    yield

app = FastAPI(
    title="ClaimMate API",
    description="Multilingual AI Claim Copilot for Indian Insurance",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wallet.router)
app.include_router(claims.router)
app.include_router(events.router)
app.include_router(assistant.router)
app.include_router(voice.router)
app.include_router(i18n.router)

def seed_demo_data():
    with Session(engine) as session:
        # Seed default user
        if not session.get(User, "demo_user"):
            user = User(id="demo_user", name="Ramesh Kumar", preferred_lang="hi-IN")
            session.add(user)

        # Seed Health Policy
        if not session.get(Policy, "POL-HEALTH-001"):
            health_rules = {
                "insurer": {"value": "Star Health & Allied Insurance", "page": 1, "quote": "Star Health and Allied Insurance Company Limited", "verified": True},
                "policy_number": {"value": "POL-HEALTH-001", "page": 1, "quote": "Policy Number: POL-HEALTH-001", "verified": True},
                "insured_members": ["Ramesh Kumar", "Asha Kumar"],
                "sum_insured": {"value": 500000.0, "page": 3, "quote": "Sum Insured: Rs. 5,00,000", "verified": True},
                "room_rent_cap_type": {"value": "percent_si_per_day", "page": 12, "quote": "Room Rent up to 1% of Sum Insured per day.", "verified": True},
                "room_rent_cap_value": {"value": 1.0, "page": 12, "quote": "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day.", "verified": True},
                "copay_percent": {"value": 10.0, "page": 16, "quote": "A compulsory co-payment of 10% shall be applicable.", "verified": True},
                "pre_hosp_days": {"value": 30, "page": 14, "quote": "Pre-hospitalisation expenses up to 30 days are payable.", "verified": True},
                "post_hosp_days": {"value": 60, "page": 14, "quote": "Post-hospitalisation expenses up to 60 days are payable.", "verified": True}
            }
            pages_text = [
                {"page_no": 1, "text": "Star Health and Allied Insurance Company Limited. Policy Number: POL-HEALTH-001."},
                {"page_no": 3, "text": "Schedule of Benefits. Sum Insured: Rs. 5,00,000 (Rupees Five Lakhs only)."},
                {"page_no": 12, "text": "Clause 4.2 Room Rent, boarding and nursing charges up to 1% of Sum Insured per day. If higher room is chosen, proportionate deduction applies."},
                {"page_no": 14, "text": "Clause 4.3 Pre-hospitalisation expenses up to 30 days are payable. Post-hospitalisation up to 60 days."},
                {"page_no": 16, "text": "Clause 16 Co-payment: A compulsory co-payment of 10% shall be applicable on each admissible claim amount."}
            ]
            health_pol = Policy(
                id="POL-HEALTH-001",
                user_id="demo_user",
                type="health",
                insurer="Star Health & Allied",
                policy_no="POL-HEALTH-001",
                plan_name="Family Health Optima",
                sum_insured=500000.0,
                status="ready",
                start_date=date(2025, 11, 1),
                end_date=date(2026, 10, 31),
                rules_json=json.dumps(health_rules),
                pages_text_json=json.dumps(pages_text)
            )
            session.add(health_pol)

        # Seed Motor Policy
        if not session.get(Policy, "POL-MOTOR-001"):
            motor_pol = Policy(
                id="POL-MOTOR-001",
                user_id="demo_user",
                type="motor",
                insurer="ICICI Lombard",
                policy_no="POL-MOT-4491",
                plan_name="Private Car Comprehensive (Own Damage + TP)",
                sum_insured=640000.0,
                status="ready",
                start_date=date(2025, 12, 15),
                end_date=date(2026, 12, 14),
                rules_json=json.dumps({
                    "vehicle_age_years": {"value": 3.0},
                    "engine_capacity_cc": {"value": 1197.0},
                    "no_claim_bonus_percent": {"value": 35.0},
                    "zero_depreciation": {"value": False}
                })
            )
            session.add(motor_pol)

        # Seed Life Policy
        if not session.get(Policy, "POL-LIFE-001"):
            life_pol = Policy(
                id="POL-LIFE-001",
                user_id="demo_user",
                type="life",
                insurer="HDFC Life",
                policy_no="POL-LIFE-902",
                plan_name="Click 2 Protect Super (Term Plan)",
                sum_insured=10000000.0,
                status="ready",
                start_date=date(2024, 1, 1),
                end_date=date(2054, 1, 1),
                rules_json=json.dumps({"nominee": "Asha Kumar (Wife)"})
            )
            session.add(life_pol)

        # Seed Active Demo Claim
        if not session.get(Claim, "CLM-HEALTH-001"):
            claim = Claim(
                id="CLM-HEALTH-001",
                user_id="demo_user",
                policy_id="POL-HEALTH-001",
                type="health",
                status="awaiting_review",
                incident_text="पापा का accident हुआ, 3 दिन hospital में थे",
                incident_lang="hi-IN",
                event_date=date(2026, 9, 12),
                patient_name="Ramesh Kumar",
                admit_date=date(2026, 9, 12),
                discharge_date=date(2026, 9, 15)
            )
            session.add(claim)

        session.commit()

# Initialize tables and seed on import
init_db()
seed_demo_data()

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "ClaimMate", "version": "1.0.0"}
