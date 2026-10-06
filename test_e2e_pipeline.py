#!/usr/bin/env python3
"""
Risk Engine — End-to-End Pipeline Smoke Test
Validates the full system flow across Spring Boot, NLP Engine, and Database:
  1. System Status & Cluster Telemetry
  2. Portfolio Integrity ($585M Notional, 15 Assets)
  3. Predefined Shock Scenarios (7 Event Types)
  4. Manual Strategic Stress Test Execution
  5. High-Impact News Ingestion -> Automatic Stress Test Trigger (Impact >= 7)
  6. Low-Impact Ingestion -> Verify No Auto-Trigger
  7. Aggregate Risk Statistics & Historical Audit Trail
"""

import sys
import json
import urllib.request
import urllib.error

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://localhost:8080/api"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"error": err_body}
    except Exception as e:
        return 0, {"error": str(e)}

def log_test(step_num, title, passed, detail=""):
    mark = "\033[92m[PASS]\033[0m" if passed else "\033[91m[FAIL]\033[0m"
    print(f" {mark} Step {step_num}: {title}")
    if detail:
        try:
            print(f"        └─ {detail}")
        except UnicodeEncodeError:
            print(f"        |-- {detail}")

def run_smoke_test():
    print("=" * 70)
    print(" S&P Global & CRISIL Hackathon — E2E Smoke Test Suite")
    print(f" Target API: {BASE_URL}")
    print("=" * 70)

    all_passed = True

    # Step 1: System Status
    status_code, data = make_request("/system/status")
    step1_pass = status_code == 200 and data.get("status") == "UP"
    all_passed = all_passed and step1_pass
    log_test(1, "Cluster Health & Telemetry", step1_pass,
             f"Status: {data.get('status')} | Assets: {data.get('assetCount')}")

    # Step 2: Portfolio Verification
    status_code, data = make_request("/portfolio/summary")
    step2_pass = status_code == 200 and data.get("totalAssetCount") == 15 and data.get("totalNotionalValue") == 585.0
    all_passed = all_passed and step2_pass
    log_test(2, "Portfolio Summary Verification", step2_pass,
             f"Total Notional: ${data.get('totalNotionalValue')}M across {data.get('totalAssetCount')} assets")

    # Step 3: Shock Scenarios
    status_code, data = make_request("/stress-tests/scenarios")
    step3_pass = status_code == 200 and isinstance(data, list) and len(data) >= 7
    all_passed = all_passed and step3_pass
    log_test(3, "Scenario Catalog Availability", step3_pass,
             f"Loaded {len(data) if isinstance(data, list) else 0} shock scenarios (Geopolitical, Credit, Macro...)")

    # Step 4: High-Impact Ingestion (Auto-trigger expected)
    high_impact_payload = {
        "text": "Severe geopolitical war conflict escalates with direct sanctions disrupting global shipping and energy infrastructure.",
        "source": "GDELT",
        "entity": "Global Energy"
    }
    status_code, data = make_request("/signals/ingest", method="POST", data=high_impact_payload)
    sig = data.get("signal", {})
    impact = sig.get("impactScore", 0)
    triggered = data.get("stressTestTriggered", False)
    step4_pass = status_code == 200 and impact >= 7 and triggered is True
    all_passed = all_passed and step4_pass
    log_test(4, "High-Impact Ingestion & Auto-Trigger (Impact >= 7)", step4_pass,
             f"Impact Score: {impact}/10 | Stress Test Auto-Triggered: {triggered}")

    # Step 5: Low-Impact Ingestion (No trigger expected)
    low_impact_payload = {
        "text": "Software provider announces minor version release of internal office automation suite.",
        "source": "TWITTER",
        "entity": "TechCo"
    }
    status_code, data = make_request("/signals/ingest", method="POST", data=low_impact_payload)
    sig = data.get("signal", {})
    impact = sig.get("impactScore", 0)
    triggered = data.get("stressTestTriggered", False)
    step5_pass = status_code == 200 and impact < 7 and triggered is False
    all_passed = all_passed and step5_pass
    log_test(5, "Low-Impact Ingestion Guard (Impact < 7)", step5_pass,
             f"Impact Score: {impact}/10 | Stress Test Auto-Triggered: {triggered} (Correctly Suppressed)")

    # Step 6: Manual Stress Test Execution
    manual_payload = {
        "scenarioName": "Smoke Test Rate Spike",
        "eventType": "MACROECONOMIC",
        "equityShock": -0.08,
        "interestRateShock": 0.02,
        "creditSpreadShockBps": 100.0,
        "fxShock": -0.03,
        "commodityShock": -0.05
    }
    status_code, data = make_request("/stress-tests/run", method="POST", data=manual_payload)
    pnl = data.get("totalPnlImpact", 0.0)
    details_count = len(data.get("assetDetails", []))
    step6_pass = status_code == 200 and pnl < 0.0 and details_count == 15
    all_passed = all_passed and step6_pass
    log_test(6, "On-Demand Stress Test Calculation", step6_pass,
             f"Portfolio Loss: ${pnl:.2f}M | Asset Details Calculated: {details_count}")

    # Step 7: Signal Aggregation Stats
    status_code, data = make_request("/signals/stats")
    step7_pass = status_code == 200 and data.get("totalSignals", 0) > 0
    all_passed = all_passed and step7_pass
    log_test(7, "Risk Signal Statistical Telemetry", step7_pass,
             f"Total Processed Signals: {data.get('totalSignals')} | High Impact: {data.get('highImpactCount')}")

    print("=" * 70)
    if all_passed:
        print("\033[92m>>> ALL END-TO-END SMOKE TESTS PASSED SUCCESSFULLY! <<<\033[0m")
        return 0
    else:
        print("\033[91m>>> SOME SMOKE TESTS FAILED OR ENDPOINTS WERE UNREACHABLE <<<\033[0m")
        return 1

if __name__ == "__main__":
    sys.exit(run_smoke_test())
