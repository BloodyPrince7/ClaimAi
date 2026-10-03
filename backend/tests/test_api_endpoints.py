from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_api_wallet_policies():
    res = client.get("/wallet/policies")
    assert res.status_code == 200
    policies = res.json()
    assert len(policies) >= 3
    assert any(p["type"] == "health" for p in policies)

def test_api_claim_workspace():
    res = client.get("/claims/CLM-HEALTH-001")
    assert res.status_code == 200
    claim = res.json()
    assert "total_payable" in claim
    assert len(claim["lines"]) >= 5

def test_api_incident_triage():
    res = client.post("/incidents", json={"incident_text": "पापा का accident हुआ, 3 दिन hospital में थे", "incident_lang": "hi-IN"})
    assert res.status_code == 200
    triage = res.json()
    assert len(triage["matching_policies"]) >= 2

def test_api_what_if():
    res = client.post("/claims/CLM-HEALTH-001/what-if", json={"room_rent_per_day": 5000.0})
    assert res.status_code == 200
    assert "new_payable" in res.json()
