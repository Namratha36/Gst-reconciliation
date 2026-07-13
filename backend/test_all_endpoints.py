"""
Full end-to-end test of every backend endpoint.
Runs against the live FastAPI server at http://localhost:8000
"""
import requests
import json
import sys

BASE = "http://localhost:8000/api"
RESULTS = []

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def check(name, ok, detail=""):
    icon = "[PASS]" if ok else "[FAIL]" if ok is False else "[SKIP]"
    msg = f"{icon} {name}"
    if detail:
        msg += f" -- {detail}"
    print(msg)
    RESULTS.append((name, ok, detail))


# ─── 1. AUTH ───────────────────────────────────────────────
print("\n=== PHASE 1: AUTH ===")
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Test User", "email": "testfull@example.com",
    "password": "Test1234!", "organizationName": "Test Org Full"
})
if r.status_code in (200, 201):
    token = r.json().get("access_token") or r.json().get("token")
    check("Register", True, f"status={r.status_code}")
elif r.status_code == 400 and "already" in r.text.lower():
    # Already registered, try login
    token = None
    check("Register", True, "Already exists (OK)")
else:
    check("Register", False, f"status={r.status_code} {r.text[:100]}")
    token = None

r2 = requests.post(f"{BASE}/auth/login", json={
    "email": "testfull@example.com", "password": "Test1234!"
})
if r2.status_code == 200:
    data = r2.json()
    token = data.get("access_token") or data.get("token") or data.get("accessToken")
    check("Login", bool(token), f"Got token: {str(token)[:20]}..." if token else f"Response keys: {list(data.keys())}")
else:
    check("Login", False, f"status={r2.status_code} {r2.text[:100]}")
    token = None

if not token:
    print("FATAL: No token, cannot test authenticated endpoints")
    sys.exit(1)

H = {"Authorization": f"Bearer {token}"}

# ─── 2. UPLOAD ─────────────────────────────────────────────
print("\n=== PHASE 2: UPLOAD ===")
# List uploads
r = requests.get(f"{BASE}/upload", headers=H)
check("GET /upload", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")

# Upload a test CSV
csv_content = b"""vendor_gstin,buyer_gstin,invoice_number,invoice_date,invoice_value,taxable_value,igst,cgst,sgst,financial_year,doc_type
29ABCDE1234F1Z5,27XYZ9876A1Z1,INV-TEST-001,2026-06-01,11800,10000,1800,0,0,2025-26,B2B
27ABCDE1234F1Z5,29XYZ9876A1Z1,INV-TEST-002,2026-06-15,5900,5000,900,0,0,2025-26,B2B
"""
files = [("files", ("test_gstr1.csv", csv_content, "text/csv"))]
r = requests.post(f"{BASE}/upload/csv", headers=H, files=files)
check("POST /upload/csv", r.status_code == 200, f"{r.text[:120]}")
upload_data = r.json() if r.ok else {}

# ─── 3. VENDORS ────────────────────────────────────────────
print("\n=== PHASE 3: VENDORS ===")
r = requests.get(f"{BASE}/vendors", headers=H)
check("GET /vendors", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")
vendor_id = r.json()[0]["id"] if r.ok and r.json() else None

if vendor_id:
    r = requests.get(f"{BASE}/vendors/{vendor_id}", headers=H)
    check("GET /vendors/{id}", r.status_code == 200, f"name={r.json().get('name','?') if r.ok else r.text[:60]}")

    r = requests.post(f"{BASE}/vendors/{vendor_id}/notice-approval", headers=H, json={
        "body": "Test compliance notice"
    })
    check("POST /vendors/{id}/notice-approval", r.status_code == 200,
          f"approval_id={r.json().get('id','?')[:8] if r.ok else r.text[:80]}")

# ─── 4. GRAPH ──────────────────────────────────────────────
print("\n=== PHASE 4: GRAPH ===")
r = requests.get(f"{BASE}/graph", headers=H)
check("GET /graph", r.status_code == 200, f"{str(r.json())[:100] if r.ok else r.text[:80]}")

# ─── 5. RECONCILIATION ─────────────────────────────────────
print("\n=== PHASE 5: RECONCILIATION ===")
r = requests.get(f"{BASE}/reconciliation/exceptions", headers=H)
check("GET /reconciliation/exceptions", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")

r = requests.get(f"{BASE}/reconciliation/summary", headers=H)
check("GET /reconciliation/summary", r.status_code == 200, f"{r.json() if r.ok else r.text[:80]}")

r = requests.post(f"{BASE}/reconciliation/run", headers=H, json={"uploadIds": [], "periodStart": "", "periodEnd": ""})
check("POST /reconciliation/run", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")

# ─── 6. CASES ──────────────────────────────────────────────
print("\n=== PHASE 6: CASES ===")
r = requests.get(f"{BASE}/cases", headers=H)
check("GET /cases", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")
case_id = r.json()[0]["id"] if r.ok and r.json() else None

# ─── 7. ACTIONS ────────────────────────────────────────────
print("\n=== PHASE 7: ACTIONS ===")
r = requests.get(f"{BASE}/actions", headers=H)
check("GET /actions", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")
action_id = r.json()[0]["id"] if r.ok and r.json() else None

if action_id:
    r = requests.patch(f"{BASE}/actions/{action_id}", headers=H, json={"status": "Running"})
    check("PATCH /actions/{id} status=Running", r.status_code == 200,
          f"status={r.json().get('status','?') if r.ok else r.text[:80]}")

    r = requests.patch(f"{BASE}/actions/{action_id}", headers=H, json={"status": "Queued"})
    check("PATCH /actions/{id} reset=Queued", r.status_code == 200,
          f"status={r.json().get('status','?') if r.ok else r.text[:80]}")

# ─── 8. APPROVALS ──────────────────────────────────────────
print("\n=== PHASE 8: APPROVALS ===")
r = requests.get(f"{BASE}/approvals", headers=H)
check("GET /approvals", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")
approval_id = next((a["id"] for a in (r.json() if r.ok else []) if a.get("status") == "Pending"), None)

if approval_id:
    r = requests.post(f"{BASE}/approvals/{approval_id}/decision", headers=H, json={"decision": "Approve"})
    check("POST /approvals/{id}/decision", r.status_code == 200,
          f"status={r.json().get('status','?') if r.ok else r.text[:80]}")
else:
    check("POST /approvals/{id}/decision", None, "SKIP — no pending approvals")

# ─── 9. AI COPILOT ─────────────────────────────────────────
print("\n=== PHASE 9: AI COPILOT ===")
r = requests.get(f"{BASE}/ai/conversation", headers=H)
check("GET /ai/conversation", r.status_code == 200, f"{str(r.json())[:80] if r.ok else r.text[:80]}")

r = requests.get(f"{BASE}/ai/context", headers=H)
has_data = r.ok and (len(r.json().get("cases", [])) > 0 or len(r.json().get("vendors", [])) > 0)
check("GET /ai/context (has real data)", r.status_code == 200 and has_data,
      f"cases={len(r.json().get('cases',[]))}, vendors={len(r.json().get('vendors',[]))}" if r.ok else r.text[:80])

r = requests.post(f"{BASE}/ai/chat", headers=H, json={"question": "Which vendors have the highest risk?"})
has_answer = r.ok and r.json().get("content", "") not in ["", "Copilot backend is not connected or no data is available in your workspace."]
check("POST /ai/chat (real answer)", r.status_code == 200 and has_answer,
      f"answer_preview={r.json().get('content','')[:80] if r.ok else r.text[:80]}")

# ─── 10. DASHBOARD ─────────────────────────────────────────
print("\n=== PHASE 10: DASHBOARD ===")
r = requests.get(f"{BASE}/dashboard", headers=H)
live = r.ok and r.json().get("metrics") and r.json()["metrics"][0]["value"] != "12"
check("GET /dashboard (live data)", r.status_code == 200 and live,
      f"cases={r.json()['metrics'][0]['value'] if r.ok and r.json().get('metrics') else '?'}" )

# ─── 11. REPORTS ───────────────────────────────────────────
print("\n=== PHASE 11: REPORTS ===")
r = requests.get(f"{BASE}/reports", headers=H)
check("GET /reports", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")

r = requests.post(f"{BASE}/reports", headers=H)
check("POST /reports (generate)", r.status_code == 200,
      f"id={r.json().get('id','?')[:8] if r.ok else r.text[:80]}")

# ─── 12. ALERTS ────────────────────────────────────────────
print("\n=== PHASE 12: ALERTS ===")
r = requests.get(f"{BASE}/alerts", headers=H)
check("GET /alerts", r.status_code == 200, f"count={len(r.json()) if r.ok else r.text[:80]}")
alert_ids = [a["id"] for a in (r.json() if r.ok else [])]

r = requests.post(f"{BASE}/alerts/mark-read", headers=H, json={"alertIds": alert_ids})
check("POST /alerts/mark-read", r.status_code == 200, f"{r.json() if r.ok else r.text[:80]}")

r = requests.post(f"{BASE}/alerts/delete", headers=H, json={"alertIds": []})
check("POST /alerts/delete", r.status_code == 200, f"{r.json() if r.ok else r.text[:80]}")

# ─── SUMMARY ───────────────────────────────────────────────
print("\n" + "="*50)
print("FINAL RESULTS")
print("="*50)
passed = sum(1 for _, ok, _ in RESULTS if ok is True)
failed = sum(1 for _, ok, _ in RESULTS if ok is False)
skipped = sum(1 for _, ok, _ in RESULTS if ok is None)
print(f"✅ PASSED:  {passed}")
print(f"❌ FAILED:  {failed}")
print(f"⚠️  SKIPPED: {skipped}")
print(f"TOTAL:     {len(RESULTS)}")
if failed:
    print("\nFailed tests:")
    for name, ok, detail in RESULTS:
        if ok is False:
            print(f"  ❌ {name}: {detail}")
