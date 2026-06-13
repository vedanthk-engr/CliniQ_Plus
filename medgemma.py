import os, time, json, random
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import anthropic

app = FastAPI(title="ClinIQ Demo")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


PATIENTS = {
    "P-0042": {
        "id": "P-0042", "name": "Ravi Menon", "age": 58, "sex": "Male",
        "dob": "1966-03-12",
        "diagnoses": [
            {"code": "E11.9", "name": "Type 2 Diabetes Mellitus", "since": "2018-06-01"},
            {"code": "I10",   "name": "Essential Hypertension",   "since": "2017-02-14"},
            {"code": "N18.2", "name": "Chronic Kidney Disease Stage 2", "since": "2022-09-01"},
        ],
        "medications": [
            {"drug": "Metformin",    "dose": "1000mg", "route": "oral", "freq": "BD",  "since": "2018-06-01"},
            {"drug": "Amlodipine",   "dose": "10mg",   "route": "oral", "freq": "OD",  "since": "2019-01-10"},
            {"drug": "Ramipril",     "dose": "5mg",    "route": "oral", "freq": "OD",  "since": "2022-09-15"},
            {"drug": "Atorvastatin", "dose": "40mg",   "route": "oral", "freq": "ON",  "since": "2020-03-01"},
            {"drug": "Aspirin",      "dose": "75mg",   "route": "oral", "freq": "OD",  "since": "2020-03-01"},
        ],
        "labs": {
            "HbA1c":     [{"date":"2024-01-10","value":7.2,"unit":"%"},{"date":"2024-04-08","value":7.8,"unit":"%"},{"date":"2024-07-15","value":8.4,"unit":"%"},{"date":"2024-10-21","value":9.1,"unit":"%"}],
            "eGFR":      [{"date":"2024-01-10","value":68,"unit":"mL/min/1.73m²"},{"date":"2024-04-08","value":65,"unit":"mL/min/1.73m²"},{"date":"2024-07-15","value":61,"unit":"mL/min/1.73m²"},{"date":"2024-10-21","value":58,"unit":"mL/min/1.73m²"}],
            "Creatinine":[{"date":"2024-01-10","value":1.1,"unit":"mg/dL"},{"date":"2024-04-08","value":1.2,"unit":"mg/dL"},{"date":"2024-07-15","value":1.3,"unit":"mg/dL"},{"date":"2024-10-21","value":1.4,"unit":"mg/dL"}],
            "BP_systolic":[{"date":"2024-02-05","value":152,"unit":"mmHg"},{"date":"2024-05-12","value":158,"unit":"mmHg"},{"date":"2024-08-19","value":161,"unit":"mmHg"},{"date":"2024-11-03","value":162,"unit":"mmHg"}],
        },
        "notes": "Patient reports increased thirst and fatigue. Compliance with medications confirmed. Diet counselling provided. Urine ACR last done Feb 2023. Retinal screening last done Apr 2023.",
        "alert_count": 4,
    },
    "P-0019": {
        "id": "P-0019", "name": "Divya Sharma", "age": 34, "sex": "Female",
        "dob": "1990-11-28",
        "diagnoses": [
            {"code": "N39.0", "name": "Recurrent Urinary Tract Infection", "since": "2023-01-01"},
            {"code": "D50.9", "name": "Iron Deficiency Anaemia",           "since": "2023-06-15"},
        ],
        "medications": [
            {"drug": "Nitrofurantoin",  "dose": "100mg",  "route": "oral", "freq": "BD",  "since": "2024-09-01"},
            {"drug": "Ferrous Sulphate","dose": "200mg",  "route": "oral", "freq": "TDS", "since": "2024-01-10"},
        ],
        "labs": {
            "Haemoglobin":[{"date":"2023-12-01","value":9.8,"unit":"g/dL"},{"date":"2024-02-14","value":10.1,"unit":"g/dL"},{"date":"2024-04-20","value":9.6,"unit":"g/dL"},{"date":"2024-06-30","value":9.2,"unit":"g/dL"}],
            "MCV":        [{"date":"2023-12-01","value":62,"unit":"fL"},{"date":"2024-02-14","value":64,"unit":"fL"},{"date":"2024-04-20","value":63,"unit":"fL"},{"date":"2024-06-30","value":67,"unit":"fL"}],
            "Urine_MIC":  [{"date":"2024-01-05","value":16,"unit":"mg/L"},{"date":"2024-05-18","value":32,"unit":"mg/L"},{"date":"2024-09-02","value":64,"unit":"mg/L"}],
        },
        "notes": "Third course of Nitrofurantoin in 5 months. E.coli on all three cultures with progressively rising MIC. Haemoglobin not responding to 6 months of oral iron. Coeliac screen not yet performed.",
        "alert_count": 3,
    },
    "P-0087": {
        "id": "P-0087", "name": "Arjun Patel", "age": 71, "sex": "Male",
        "dob": "1953-07-04",
        "diagnoses": [
            {"code": "I50.2", "name": "Heart Failure with Reduced EF", "since": "2020-11-01"},
            {"code": "I48.0", "name": "Atrial Fibrillation",           "since": "2021-03-15"},
            {"code": "E11.9", "name": "Type 2 Diabetes Mellitus",      "since": "2016-05-20"},
        ],
        "medications": [
            {"drug": "Bisoprolol",  "dose": "5mg",    "route": "oral", "freq": "OD",  "since": "2020-11-15"},
            {"drug": "Furosemide",  "dose": "40mg",   "route": "oral", "freq": "OD",  "since": "2020-11-15"},
            {"drug": "Warfarin",    "dose": "3mg",    "route": "oral", "freq": "OD",  "since": "2021-03-20"},
            {"drug": "Metformin",   "dose": "500mg",  "route": "oral", "freq": "BD",  "since": "2016-05-20"},
            {"drug": "Digoxin",     "dose": "125mcg", "route": "oral", "freq": "OD",  "since": "2021-06-01"},
            {"drug": "Amiodarone",  "dose": "200mg",  "route": "oral", "freq": "OD",  "since": "2024-01-10"},
        ],
        "labs": {
            "INR":       [{"date":"2024-01-20","value":1.4,"unit":""},{"date":"2024-03-15","value":3.8,"unit":""},{"date":"2024-05-10","value":2.1,"unit":""},{"date":"2024-07-22","value":4.2,"unit":""},{"date":"2024-09-18","value":1.9,"unit":""}],
            "BNP":       [{"date":"2024-03-01","value":340,"unit":"pg/mL"},{"date":"2024-06-15","value":410,"unit":"pg/mL"},{"date":"2024-09-20","value":520,"unit":"pg/mL"}],
            "Potassium": [{"date":"2024-04-01","value":3.2,"unit":"mmol/L"},{"date":"2024-07-01","value":3.1,"unit":"mmol/L"},{"date":"2024-10-01","value":3.0,"unit":"mmol/L"}],
        },
        "notes": "Amiodarone started Jan 2024 for AF rate control. INR has been erratic since. Patient reports occasional palpitations. Potassium trending down on Furosemide.",
        "alert_count": 5,
    },
}

# ══════════════════════════════════════════════════════════════
# MEDGEMMA SIMULATION LAYER
# ══════════════════════════════════════════════════════════════

MEDGEMMA_TAG = "⚕ DEMO: Simulates MedGemma 27B (google/medgemma-27b-it). For physician review only."

def medgemma_simulate(latency_range=(0.8, 2.0)):
    """Simulate MedGemma inference latency."""
    time.sleep(random.uniform(*latency_range))

# ══════════════════════════════════════════════════════════════
# TOOLS
# ══════════════════════════════════════════════════════════════

def get_patient_case_sheet(patient_id: str) -> dict:
    p = PATIENTS.get(patient_id)
    if not p:
        return {"error": f"Patient {patient_id} not found"}
    medgemma_simulate((0.3, 0.6))
    return {
        "tool": "get_patient_case_sheet", "patient_id": patient_id,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B — DEMO SIMULATION",
        "physician_review_required": True,
        "data": p,
        "medgemma_note": MEDGEMMA_TAG,
    }

def extract_lab_trends(patient_id: str, test_name: str, months: int = 12) -> dict:
    p = PATIENTS.get(patient_id)
    if not p:
        return {"error": "Patient not found"}
    medgemma_simulate()
    labs = p["labs"].get(test_name, [])
    if not labs:
        available = list(p["labs"].keys())
        return {"error": f"Test '{test_name}' not found. Available: {available}"}

    vals = [r["value"] for r in labs]
    trend = "WORSENING ↑" if vals[-1] > vals[0] else ("IMPROVING ↓" if vals[-1] < vals[0] else "STABLE →")
    pct = abs(round((vals[-1]-vals[0])/vals[0]*100, 1))

    # Clinical interpretation per test
    interp = {
        "HbA1c":      f"HbA1c has risen from {vals[0]}% to {vals[-1]}% — a {pct}% increase over the observation period. Current value of {vals[-1]}% significantly exceeds ADA target of <7.0%. Trend suggests progressive glycaemic deterioration. Diabetes management review warranted.",
        "eGFR":       f"eGFR has declined from {vals[0]} to {vals[-1]} mL/min/1.73m² — a {pct}% reduction. Trajectory suggests CKD progression. At current rate of decline (~2.5 mL/min/quarter), Stage 3a threshold (eGFR<60) may be reached within 1-2 quarters. Nephrology review consideration warranted.",
        "Creatinine": f"Serum creatinine rising from {vals[0]} to {vals[-1]} mg/dL ({pct}% increase). Consistent with declining eGFR trend. Renal function monitoring should continue at 3-monthly intervals per KDIGO guidelines.",
        "BP_systolic":f"Systolic BP has ranged {min(vals)}-{max(vals)} mmHg across {len(labs)} readings, currently {vals[-1]} mmHg. Despite dual antihypertensive therapy (Amlodipine 10mg + Ramipril 5mg), BP remains persistently above 140mmHg threshold. Resistant hypertension pattern — medication review warranted.",
        "Haemoglobin":f"Haemoglobin {vals[0]} → {vals[-1]} g/dL. Despite 6+ months of Ferrous Sulphate 200mg TDS, haemoglobin remains below normal range (women: 12-16 g/dL) and has not shown sustained improvement. Non-response to iron supplementation may suggest malabsorption (coeliac?) or ongoing blood loss.",
        "INR":        f"INR readings highly erratic: {', '.join(str(v) for v in vals)}. Target therapeutic range 2.0-3.0 for AF. Two readings supratherapeutic (>3.5), two subtherapeutic (<2.0). Erratic INR since Amiodarone initiation (Jan 2024) consistent with known CYP2C9 inhibition by Amiodarone increasing Warfarin effect.",
        "BNP":        f"BNP rising: {vals[0]} → {vals[-1]} pg/mL ({pct}% increase). Progressive elevation above 400 pg/mL threshold suggests worsening heart failure. Clinical reassessment of fluid status, weight, and functional class warranted.",
        "Potassium":  f"Potassium trending down: {vals[0]} → {vals[-1]} mmol/L. Currently below normal lower limit (3.5 mmol/L). Hypokalaemia in context of Digoxin therapy increases risk of Digoxin toxicity. Potassium supplementation and Digoxin level monitoring warranted.",
    }.get(test_name, f"{test_name} trend: {vals[0]} → {vals[-1]} ({trend}, {pct}% change)")

    return {
        "tool": "extract_lab_trends", "patient_id": patient_id, "test_name": test_name,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B — DEMO SIMULATION",
        "physician_review_required": True,
        "data": {
            "results": labs, "trend_direction": trend,
            "percent_change": pct, "first_value": vals[0],
            "latest_value": vals[-1], "unit": labs[0]["unit"],
        },
        "clinical_interpretation": interp,
        "flags": _lab_flags(test_name, vals, labs),
        "medgemma_note": MEDGEMMA_TAG,
    }

def _lab_flags(test_name, vals, labs):
    flags = []
    rules = {
        "HbA1c":     lambda v: v[-1] > 8.0 and {"severity":"HIGH",  "message":f"HbA1c {v[-1]}% — significantly above ADA target <7.0%","evidence":f"Latest reading {labs[-1]['date']}: {v[-1]}%"},
        "eGFR":      lambda v: v[-1] < 60  and {"severity":"HIGH",  "message":f"eGFR {v[-1]} — entering CKD Stage 3a threshold","evidence":f"Declined from {v[0]} to {v[-1]} over 4 readings"},
        "BP_systolic":lambda v: v[-1]>140  and {"severity":"MEDIUM","message":f"BP non-response: {v[-1]}mmHg despite dual therapy","evidence":"Consistently >140mmHg across all readings"},
        "INR":       lambda v: v[-1]<2.0 or v[-1]>3.5 and {"severity":"HIGH","message":f"INR {v[-1]} outside therapeutic range 2.0-3.0","evidence":"Erratic INR pattern since Amiodarone initiation"},
        "BNP":       lambda v: v[-1]>400  and {"severity":"HIGH",  "message":f"BNP {v[-1]} pg/mL — above 400 threshold, worsening HF","evidence":f"Rising trend: {v[0]}→{v[-1]} pg/mL"},
        "Potassium": lambda v: v[-1]<3.5  and {"severity":"HIGH",  "message":f"Hypokalaemia K+ {v[-1]} mmol/L — Digoxin toxicity risk","evidence":"Downward trend with Furosemide therapy"},
    }
    if test_name in rules:
        flag = rules[test_name](vals)
        if flag:
            flags.append(flag)
    return flags

def check_drug_interactions(patient_id: str) -> dict:
    p = PATIENTS.get(patient_id)
    if not p:
        return {"error": "Patient not found"}
    medgemma_simulate()
    meds = [m["drug"] for m in p["medications"]]

    INTERACTIONS = {
        ("Amiodarone","Warfarin"):   {"severity":"MAJOR","mechanism":"Amiodarone inhibits CYP2C9 and CYP3A4, the primary enzymes responsible for Warfarin (S-warfarin) metabolism. This significantly increases Warfarin plasma concentration and anticoagulant effect.","effect":"INR elevation, haemorrhage risk. Likely explains erratic INR readings observed since Amiodarone initiation in Jan 2024.","action":"Warfarin dose reduction (typically 30-50%) required. Increase INR monitoring frequency to weekly until stable. Consider anticoagulation specialist review."},
        ("Digoxin","Amiodarone"):    {"severity":"MAJOR","mechanism":"Amiodarone inhibits P-glycoprotein, reducing Digoxin renal and non-renal clearance. Plasma Digoxin levels increase by 70-100%.","effect":"Digoxin toxicity risk: nausea, bradycardia, arrhythmia, visual disturbance.","action":"Reduce Digoxin dose by 50% on Amiodarone initiation. Monitor Digoxin levels. Current dose review recommended."},
        ("Furosemide","Digoxin"):    {"severity":"MODERATE","mechanism":"Furosemide-induced hypokalaemia and hypomagnesaemia potentiate Digoxin toxicity by increasing myocardial sensitivity to Digoxin.","effect":"Enhanced Digoxin toxicity at therapeutic or sub-therapeutic Digoxin levels. Patient K+ is 3.0 mmol/L — critical in this context.","action":"Electrolyte monitoring and replacement. Potassium supplementation consideration."},
        ("Ramipril","Aspirin"):      {"severity":"MODERATE","mechanism":"NSAIDs/Aspirin may attenuate the antihypertensive and nephroprotective effects of ACE inhibitors via prostaglandin inhibition, and increase risk of renal impairment.","effect":"Reduced antihypertensive efficacy of Ramipril. Risk of acute kidney injury, particularly relevant given CKD Stage 2.","action":"Monitor renal function (eGFR, creatinine) at each visit. Consider cardiology/nephrology review of aspirin indication."},
        ("Metformin","Furosemide"):  {"severity":"LOW","mechanism":"Furosemide may increase risk of lactic acidosis with Metformin in setting of dehydration or renal impairment.","effect":"Low risk at current doses but relevant given concurrent CKD/HF.","action":"Ensure adequate hydration. Monitor renal function. Withhold Metformin if acute illness/dehydration."},
    }

    found = []
    for (d1, d2), info in INTERACTIONS.items():
        if d1 in meds and d2 in meds:
            found.append({"drug_a": d1, "drug_b": d2, **info})

    found.sort(key=lambda x: {"MAJOR":0,"MODERATE":1,"LOW":2}[x["severity"]])

    return {
        "tool": "check_drug_interactions", "patient_id": patient_id,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B — DEMO SIMULATION",
        "physician_review_required": True,
        "data": {"medications_reviewed": meds, "interaction_count": len(found), "interactions": found},
        "flags": [{"severity": i["severity"], "message": f"{i['drug_a']} + {i['drug_b']}: {i['severity']} interaction", "evidence": i["mechanism"]} for i in found],
        "medgemma_note": MEDGEMMA_TAG,
    }

def get_clinical_guideline(patient_id: str) -> dict:
    p = PATIENTS.get(patient_id)
    if not p:
        return {"error": "Patient not found"}
    medgemma_simulate()

    GUIDELINES = {
        "P-0042": [
            {"investigation":"Urine Albumin-to-Creatinine Ratio (ACR)","diagnosis":"CKD + T2DM (E11.9, N18.2)","guideline":"ADA Standards of Care 2024","frequency":"Annual","last_done":"2023-02-10","overdue_by":"14 months","priority":"HIGH","rationale":"Annual ACR is mandatory for diabetic nephropathy screening. Progressive eGFR decline makes this urgent."},
            {"investigation":"Dilated Fundus Examination","diagnosis":"T2DM (E11.9)","guideline":"ADA / RCOphth","frequency":"Annual","last_done":"2023-04-15","overdue_by":"18 months","priority":"HIGH","rationale":"Diabetic retinopathy screening. Risk increases with worsening glycaemic control (HbA1c 9.1%)."},
            {"investigation":"Diabetic Foot Examination","diagnosis":"T2DM (E11.9)","guideline":"NICE NG28","frequency":"Annual","last_done":"2023-01-20","overdue_by":"21 months","priority":"HIGH","rationale":"Annual foot examination for neuropathy and vascular disease screening."},
            {"investigation":"Fasting Lipid Profile","diagnosis":"T2DM + CVD risk","guideline":"AHA/ACC 2023","frequency":"Annual","last_done":"2024-01-10","overdue_by":"On schedule","priority":"LOW","rationale":"Annual lipid monitoring on Atorvastatin therapy."},
        ],
        "P-0019": [
            {"investigation":"Coeliac Antibody Screen (anti-tTG IgA)","diagnosis":"Iron deficiency anaemia not responding to oral iron (D50.9)","guideline":"BSG Guidelines 2023","frequency":"Once — if not previously done","last_done":"Never","overdue_by":"Indicated now","priority":"HIGH","rationale":"Non-response to oral iron supplementation after 6 months is an indication for coeliac disease screening. Malabsorption is the most common cause of treatment-refractory IDA."},
            {"investigation":"Urine Culture + Sensitivity","diagnosis":"Recurrent UTI (N39.0)","guideline":"NICE NG112","frequency":"With each recurrence","last_done":"2024-09-02","overdue_by":"On schedule","priority":"MEDIUM","rationale":"Culture required given 3rd episode and rising MIC — AMR monitoring."},
            {"investigation":"Haematology Referral","diagnosis":"IDA non-responsive to oral iron","guideline":"BSH Guidelines","frequency":"After 3 months of non-response","last_done":"Never referred","overdue_by":"3 months overdue","priority":"HIGH","rationale":"Haematology review indicated after failure of 6 months of iron supplementation."},
        ],
        "P-0087": [
            {"investigation":"Echocardiogram","diagnosis":"Heart Failure with reduced EF (I50.2)","guideline":"ESC HF Guidelines 2023","frequency":"Annual or with clinical deterioration","last_done":"2023-11-01","overdue_by":"On schedule — review given rising BNP","priority":"MEDIUM","rationale":"Rising BNP (340→520 pg/mL) may indicate HF progression. Repeat echo warranted to assess LVEF."},
            {"investigation":"Digoxin Plasma Level","diagnosis":"HF + AF + Digoxin therapy","guideline":"BNF / SIGN","frequency":"After any dose change or clinical concern","last_done":"2024-01-15","overdue_by":"9 months — Amiodarone added since","priority":"HIGH","rationale":"Amiodarone doubles Digoxin levels via P-gp inhibition. Level not checked since Amiodarone initiation."},
            {"investigation":"Thyroid Function Tests","diagnosis":"Amiodarone therapy","guideline":"NICE / ESC","frequency":"Every 6 months on Amiodarone","last_done":"2024-02-01","overdue_by":"8 months","priority":"HIGH","rationale":"Amiodarone causes thyroid dysfunction (both hypo and hyper) in up to 15% of patients. 6-monthly TFT monitoring mandatory."},
        ],
    }

    overdue = [g for g in GUIDELINES.get(patient_id, []) if g["priority"] in ("HIGH","MEDIUM") and g["overdue_by"] != "On schedule"]
    return {
        "tool": "get_clinical_guideline", "patient_id": patient_id,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B — DEMO SIMULATION",
        "physician_review_required": True,
        "data": {"all_guidelines": GUIDELINES.get(patient_id, []), "overdue_count": len(overdue), "overdue": overdue},
        "flags": [{"severity": g["priority"], "message": f"Overdue: {g['investigation']}", "evidence": g["rationale"]} for g in overdue],
        "medgemma_note": MEDGEMMA_TAG,
    }

def flag_clinical_pattern(patient_id: str) -> dict:
    p = PATIENTS.get(patient_id)
    if not p:
        return {"error": "Patient not found"}
    medgemma_simulate()

    PATTERNS = {
        "P-0042": [
            {"pattern":"Progressive Glycaemic Deterioration","detected":True,"severity":"HIGH","evidence":"HbA1c: Jan 7.2% → Apr 7.8% → Jul 8.4% → Oct 9.1% — consistent upward trajectory over 9 months (+26.4%). Current value 9.1% significantly exceeds ADA target <7.0%.","clinical_significance":"Progressive HbA1c rise despite Metformin 1000mg BD suggests either medication non-adherence, dietary non-compliance, or inadequate monotherapy. Additional agent (SGLT2i, GLP-1 RA) or dose escalation may be warranted.","confidence":"High"},
            {"pattern":"Antihypertensive Treatment Non-Response","detected":True,"severity":"HIGH","evidence":"BP readings: 152, 158, 161, 162 mmHg systolic across 4 visits. Despite maximum dose Amlodipine (10mg) and Ramipril (5mg). No reading below 150mmHg in 9 months.","clinical_significance":"Meets criteria for resistant hypertension (BP >140mmHg despite 3-drug regimen or 2 drugs at maximum dose). Medication review, secondary hypertension investigation, or addition of third agent warranted.","confidence":"High"},
            {"pattern":"Progressive CKD Trajectory","detected":True,"severity":"HIGH","evidence":"eGFR: 68 → 65 → 61 → 58 mL/min/1.73m² (14.7% decline in 9 months, ~2.5 mL/min/quarter). CKD Stage 2 diagnosis now at lower boundary. Creatinine rising in parallel.","clinical_significance":"Rate of eGFR decline exceeds expected age-related loss (~1mL/min/year). At current trajectory, Stage 3a threshold (eGFR<60) will be crossed within 1-2 quarters. Nephrology referral consideration.","confidence":"High"},
        ],
        "P-0019": [
            {"pattern":"Antibiotic Resistance Risk — Nitrofurantoin","detected":True,"severity":"HIGH","evidence":"Nitrofurantoin prescribed: Jan 2024, May 2024, Sep 2024. Three courses in 8 months for E.coli UTI. Urine culture MIC rising: 16 → 32 → 64 mg/L (doubling each episode). MIC of 64 mg/L approaches resistance threshold for Nitrofurantoin (≥128 mg/L EUCAST).","clinical_significance":"Pattern meets WHO AMR surveillance criteria for resistance risk review. Rapidly rising MIC with repeated same-antibiotic exposure. Culture-directed therapy with urology/microbiology input warranted for next episode.","confidence":"High"},
            {"pattern":"Iron Supplementation Non-Response","detected":True,"severity":"MEDIUM","evidence":"Ferrous Sulphate 200mg TDS prescribed since Jan 2024 (6+ months). Haemoglobin: 9.8 → 10.1 → 9.6 → 9.2 g/dL. No sustained improvement. MCV persistently low (62-67 fL).","clinical_significance":"Failure to respond to adequate oral iron dose suggests malabsorption (coeliac disease most common), ongoing occult blood loss, or incorrect diagnosis. Coeliac screen and GI review indicated.","confidence":"High"},
        ],
        "P-0087": [
            {"pattern":"Major Drug Interaction — Amiodarone + Warfarin","detected":True,"severity":"HIGH","evidence":"Amiodarone initiated Jan 2024. INR before: stable 2.0-2.5 (inferred). INR after: 1.4, 3.8, 2.1, 4.2, 1.9 — highly erratic pattern. Amiodarone inhibits CYP2C9, the primary enzyme for S-warfarin metabolism, increasing Warfarin effect by 30-50%.","clinical_significance":"CRITICAL: This interaction is the likely cause of erratic INR readings. Patient at increased bleeding risk when INR supratherapeutic (3.8, 4.2). Warfarin dose reduction and INR monitoring increase required urgently.","confidence":"High"},
            {"pattern":"Worsening Heart Failure — Rising BNP","detected":True,"severity":"HIGH","evidence":"BNP: Mar 340 → Jun 410 → Sep 520 pg/mL. Consistent upward trend. Values >400 pg/mL indicate significant HF decompensation risk per ESC guidelines.","clinical_significance":"BNP trajectory suggests inadequate HF control despite current regimen. Clinical reassessment of fluid balance, weight trend, functional class, and medication optimisation (Furosemide dose, SGLT2i addition per ESC 2023 guidelines) warranted.","confidence":"High"},
            {"pattern":"Digoxin Toxicity Risk — Hypokalaemia + Amiodarone","detected":True,"severity":"HIGH","evidence":"Potassium: 3.2 → 3.1 → 3.0 mmol/L (trending down on Furosemide). Amiodarone co-administration doubles Digoxin levels via P-glycoprotein inhibition. Hypokalaemia independently potentiates Digoxin cardiac toxicity.","clinical_significance":"Confluence of three risk factors: Furosemide-induced hypokalaemia, Amiodarone-elevated Digoxin levels, and age (71M). Digoxin plasma level and electrolyte correction urgently indicated.","confidence":"High"},
        ],
    }

    patterns = PATTERNS.get(patient_id, [])
    return {
        "tool": "flag_clinical_pattern", "patient_id": patient_id,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B — DEMO SIMULATION",
        "physician_review_required": True,
        "data": {"patterns_detected": len(patterns), "patterns": patterns},
        "flags": [{"severity": pat["severity"], "message": pat["pattern"], "evidence": pat["evidence"][:120]+"..."} for pat in patterns],
        "medgemma_note": MEDGEMMA_TAG,
    }

def generate_consultation_brief(patient_id: str) -> dict:
    cs   = get_patient_case_sheet(patient_id)
    labs = {t: extract_lab_trends(patient_id, t) for t in PATIENTS[patient_id]["labs"]}
    drug = check_drug_interactions(patient_id)
    gl   = get_clinical_guideline(patient_id)
    pat  = flag_clinical_pattern(patient_id)
    p    = PATIENTS[patient_id]
    medgemma_simulate((1.5, 2.5))

    all_flags = []
    for src in [drug, gl, pat]:
        all_flags.extend(src.get("flags", []))
    all_flags.sort(key=lambda x: {"HIGH":0,"MAJOR":0,"MEDIUM":1,"MODERATE":1,"LOW":2}.get(x["severity"],2))

    return {
        "tool": "generate_consultation_brief", "patient_id": patient_id,
        "generated_at": datetime.now().isoformat(),
        "model_simulated": "MedGemma 27B (google/medgemma-27b-it) — DEMO SIMULATION",
        "physician_review_required": True,
        "data": {
            "patient":      {"name": p["name"], "age": p["age"], "sex": p["sex"], "dob": p["dob"]},
            "diagnoses":    p["diagnoses"],
            "medications":  p["medications"],
            "chief_complaint_note": p["notes"],
            "lab_trends":   {t: {"latest": r["data"]["results"][-1] if r.get("data",{}).get("results") else None, "trend": r["data"].get("trend_direction",""), "interpretation": r.get("clinical_interpretation","")} for t, r in labs.items()},
            "drug_interactions": drug["data"]["interactions"],
            "overdue_investigations": gl["data"]["overdue"],
            "clinical_patterns": pat["data"]["patterns"],
            "all_flags": all_flags,
            "flag_count": {"HIGH": sum(1 for f in all_flags if f["severity"] in ("HIGH","MAJOR")), "MEDIUM": sum(1 for f in all_flags if f["severity"] in ("MEDIUM","MODERATE")), "LOW": sum(1 for f in all_flags if f["severity"]=="LOW")},
        },
        "medgemma_note": MEDGEMMA_TAG,
    }

# ══════════════════════════════════════════════════════════════
# AGENT (Claude as brain)
# ══════════════════════════════════════════════════════════════

AGENT_SYSTEM = """You are ClinIQ, a clinical intelligence assistant. You help physicians 
understand their patient's case history by calling clinical tools.

Available tools (call by name):
- get_patient_case_sheet(patient_id)
- extract_lab_trends(patient_id, test_name)  [tests: HbA1c, eGFR, Creatinine, BP_systolic, Haemoglobin, INR, BNP, Potassium, MCV, Urine_MIC]
- check_drug_interactions(patient_id)
- get_clinical_guideline(patient_id)
- flag_clinical_pattern(patient_id)
- generate_consultation_brief(patient_id)

Rules:
1. ALWAYS frame outputs as "insights for physician review" — never make diagnoses
2. Cite specific dates and values from tool results
3. Be concise and clinically precise
4. For "brief" or "prepare" requests → call generate_consultation_brief
5. For lab/trend questions → call extract_lab_trends with the specific test
6. For drug/interaction questions → call check_drug_interactions
7. For pattern/flag/alert questions → call flag_clinical_pattern
8. Always end responses with: ⚕ All insights for physician review. Powered by MedGemma 27B (Simulated).
"""

TOOL_MAP = {
    "get_patient_case_sheet":     lambda args: get_patient_case_sheet(args.get("patient_id","")),
    "extract_lab_trends":         lambda args: extract_lab_trends(args.get("patient_id",""), args.get("test_name",""), args.get("months",12)),
    "check_drug_interactions":    lambda args: check_drug_interactions(args.get("patient_id","")),
    "get_clinical_guideline":     lambda args: get_clinical_guideline(args.get("patient_id","")),
    "flag_clinical_pattern":      lambda args: flag_clinical_pattern(args.get("patient_id","")),
    "generate_consultation_brief":lambda args: generate_consultation_brief(args.get("patient_id","")),
}

CLAUDE_TOOLS = [
    {"name":"get_patient_case_sheet","description":"Get full patient case sheet","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"}},"required":["patient_id"]}},
    {"name":"extract_lab_trends","description":"Get lab test trend over time","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"},"test_name":{"type":"string"},"months":{"type":"integer"}},"required":["patient_id","test_name"]}},
    {"name":"check_drug_interactions","description":"Check drug interactions for patient","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"}},"required":["patient_id"]}},
    {"name":"get_clinical_guideline","description":"Get overdue investigations per guidelines","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"}},"required":["patient_id"]}},
    {"name":"flag_clinical_pattern","description":"Detect clinical patterns and red flags","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"}},"required":["patient_id"]}},
    {"name":"generate_consultation_brief","description":"Generate full pre-consultation brief","input_schema":{"type":"object","properties":{"patient_id":{"type":"string"}},"required":["patient_id"]}},
]

def run_agent(patient_id: str, query: str) -> dict:
    messages = [{"role":"user","content":f"Patient: {patient_id}\nQuery: {query}"}]
    tool_calls_log = []
    final_text = ""

    for _ in range(5):  # max 5 turns
        resp = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=AGENT_SYSTEM,
            tools=CLAUDE_TOOLS,
            messages=messages,
        )

        if resp.stop_reason == "end_turn":
            for blk in resp.content:
                if hasattr(blk, "text"):
                    final_text = blk.text
            break

        if resp.stop_reason == "tool_use":
            tool_results = []
            messages.append({"role":"assistant","content": resp.content})
            for blk in resp.content:
                if blk.type == "tool_use":
                    fn = TOOL_MAP.get(blk.name)
                    result = fn(blk.input) if fn else {"error": "Unknown tool"}
                    tool_calls_log.append({"tool": blk.name, "input": blk.input})
                    tool_results.append({"type":"tool_result","tool_use_id":blk.id,"content":json.dumps(result)})
            messages.append({"role":"user","content": tool_results})

    return {"answer": final_text, "tools_called": tool_calls_log, "patient_id": patient_id, "query": query}

# ══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════════════════════════

class QueryRequest(BaseModel):
    patient_id: str
    query: str

@app.get("/api/patient/{patient_id}")
def api_patient(patient_id: str):
    p = PATIENTS.get(patient_id)
    if not p: return JSONResponse({"error":"Not found"}, 404)
    return {"id":p["id"],"name":p["name"],"age":p["age"],"sex":p["sex"],"primary_diagnosis":p["diagnoses"][0]["name"],"alert_count":p["alert_count"]}

@app.get("/api/patients")
def api_patients():
    return [{"id":p["id"],"name":p["name"],"age":p["age"],"sex":p["sex"],"primary_diagnosis":p["diagnoses"][0]["name"],"alert_count":p["alert_count"]} for p in PATIENTS.values()]

@app.post("/api/brief/{patient_id}")
def api_brief(patient_id: str):
    return generate_consultation_brief(patient_id)

@app.get("/api/flags/{patient_id}")
def api_flags(patient_id: str):
    pat = flag_clinical_pattern(patient_id)
    drug = check_drug_interactions(patient_id)
    all_flags = pat.get("flags",[]) + drug.get("flags",[])
    all_flags.sort(key=lambda x: {"HIGH":0,"MAJOR":0,"MEDIUM":1,"MODERATE":1,"LOW":2}.get(x["severity"],2))
    return {"patient_id": patient_id, "flags": all_flags}

@app.post("/api/query")
def api_query(req: QueryRequest):
    return run_agent(req.patient_id, req.query)

@app.get("/api/tools/lab-trends/{patient_id}/{test_name}")
def api_lab(patient_id: str, test_name: str):
    return extract_lab_trends(patient_id, test_name)

@app.post("/api/tools/drug-interactions/{patient_id}")
def api_drug(patient_id: str):
    return check_drug_interactions(patient_id)

# ══════════════════════════════════════════════════════════════
# DASHBOARD UI
# ══════════════════════════════════════════════════════════════

@app.get("/", response_class=HTMLResponse)
def dashboard():
    return HTMLResponse("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ClinIQ — Patient Intelligence</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0B1929;color:#D8E8F4;min-height:100vh;display:flex;flex-direction:column}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0B1929}::-webkit-scrollbar-thumb{background:#00C2C7;border-radius:3px}

/* TOP BAR */
#topbar{background:#060f1a;padding:12px 24px;display:flex;align-items:center;gap:16px;border-bottom:1px solid #1a3a5c;position:sticky;top:0;z-index:100}
#topbar .logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:3px}
#topbar .logo span{color:#00C2C7}
#topbar .model-badge{background:#112240;border:1px solid #00C2C7;color:#00C2C7;padding:4px 10px;border-radius:20px;font-size:11px;margin-left:auto}
#alert-ribbon{flex:1;display:flex;gap:8px;flex-wrap:wrap;margin-left:20px}
.alert-chip{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;animation:pulse 2s infinite}
.alert-chip.HIGH{background:#FF4757;color:#fff}.alert-chip.MEDIUM{background:#FFA600;color:#000}.alert-chip.LOW{background:#1a3a5c;color:#7A9BBB}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}

/* LAYOUT */
#main{display:grid;grid-template-columns:240px 1fr 340px;gap:0;flex:1;overflow:hidden;height:calc(100vh - 53px)}

/* LEFT PANEL */
#patients{background:#060f1a;border-right:1px solid #1a3a5c;padding:16px;overflow-y:auto}
#patients h3{font-size:11px;color:#7A9BBB;letter-spacing:2px;margin-bottom:12px;text-transform:uppercase}
.patient-card{background:#112240;border:1px solid #1a3a5c;border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;transition:.2s}
.patient-card:hover,.patient-card.active{border-color:#00C2C7;background:#162B4A}
.patient-card .pname{font-weight:700;font-size:14px;color:#fff}
.patient-card .pmeta{font-size:11px;color:#7A9BBB;margin-top:2px}
.patient-card .pdiag{font-size:11px;color:#D8E8F4;margin-top:4px;font-style:italic}
.badge{display:inline-block;background:#FF4757;color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;float:right}

/* CENTRE PANEL */
#centre{padding:20px;overflow-y:auto;background:#0B1929}
#centre h2{font-size:16px;color:#fff;margin-bottom:16px;display:flex;align-items:center;gap:10px}
#generate-btn{background:#00C2C7;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;transition:.2s}
#generate-btn:hover{background:#4DDDE0}
#generate-btn:disabled{background:#1a3a5c;color:#7A9BBB;cursor:not-allowed}
#brief-output{margin-top:16px}
.section-card{background:#112240;border:1px solid #1a3a5c;border-radius:8px;padding:16px;margin-bottom:12px}
.section-card h4{font-size:12px;color:#00C2C7;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;font-weight:700}
.flag-item{padding:8px 12px;border-radius:6px;margin-bottom:6px;font-size:12px;border-left:3px solid}
.flag-item.HIGH,.flag-item.MAJOR{background:#1f0a0d;border-color:#FF4757;color:#ffb3bb}
.flag-item.MEDIUM,.flag-item.MODERATE{background:#1f1200;border-color:#FFA600;color:#ffd580}
.flag-item.LOW{background:#0d1a2a;border-color:#7A9BBB;color:#a0b8cc}
.flag-sev{font-weight:800;margin-right:6px}
.med-item,.dx-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a3a5c;font-size:12px}
.med-item:last-child,.dx-item:last-child{border-bottom:none}
.med-name{font-weight:600;color:#fff}.med-dose{color:#7A9BBB}
.lab-row{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #1a3a5c;font-size:12px;gap:8px}
.lab-name{width:120px;font-weight:600;color:#fff;font-size:11px}
.lab-trend{flex:1;font-size:11px;color:#D8E8F4}
.trend-up{color:#FF4757;font-weight:700}.trend-down{color:#00D68F;font-weight:700}.trend-stable{color:#FFA600}
.overdue-item{padding:8px 12px;background:#0d1a2a;border-radius:6px;margin-bottom:6px;font-size:12px}
.overdue-item .oi-name{font-weight:700;color:#fff}.oi-meta{color:#7A9BBB;margin-top:2px}
.spinner{display:inline-block;width:20px;height:20px;border:2px solid #1a3a5c;border-top-color:#00C2C7;border-radius:50%;animation:spin .8s linear infinite;vertical-align:middle;margin-right:8px}
@keyframes spin{to{transform:rotate(360deg)}}
.watermark{font-size:10px;color:#1a3a5c;text-align:right;margin-top:8px;font-style:italic}

/* RIGHT PANEL */
#query-panel{background:#060f1a;border-left:1px solid #1a3a5c;padding:16px;display:flex;flex-direction:column}
#query-panel h3{font-size:11px;color:#7A9BBB;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.chip{background:#112240;border:1px solid #1a3a5c;color:#D8E8F4;padding:5px 10px;border-radius:12px;font-size:11px;cursor:pointer;transition:.2s}
.chip:hover{border-color:#00C2C7;color:#00C2C7}
#query-input{width:100%;background:#112240;border:1px solid #1a3a5c;color:#D8E8F4;padding:10px;border-radius:6px;font-size:13px;resize:none;height:72px}
#query-input:focus{outline:none;border-color:#00C2C7}
#query-btn{background:#00C2C7;color:#000;border:none;padding:9px;border-radius:6px;font-weight:700;cursor:pointer;width:100%;margin-top:8px;font-size:13px}
#query-btn:disabled{background:#1a3a5c;color:#7A9BBB;cursor:not-allowed}
#query-history{flex:1;overflow-y:auto;margin-top:12px}
.qh-item{background:#112240;border-radius:8px;padding:12px;margin-bottom:10px;font-size:12px}
.qh-q{color:#00C2C7;font-weight:600;margin-bottom:6px}
.qh-a{color:#D8E8F4;line-height:1.5;white-space:pre-wrap}
.qh-tools{margin-top:6px;display:flex;gap:4px;flex-wrap:wrap}
.tool-tag{background:#0d1a2a;border:1px solid #1a3a5c;color:#7A9BBB;padding:2px 7px;border-radius:8px;font-size:10px}
.no-patient{text-align:center;color:#7A9BBB;padding:40px;font-style:italic}
</style>
</head>
<body>
<div id="topbar">
  <div class="logo">Clin<span>IQ</span></div>
  <div id="alert-ribbon"></div>
  <div class="model-badge">⚕ MedGemma 27B (Simulated)</div>
</div>
<div id="main">
  <div id="patients">
    <h3>Patients</h3>
    <div id="patient-list"></div>
  </div>
  <div id="centre">
    <div class="no-patient" id="no-pt-msg">← Select a patient to begin</div>
    <div id="pt-content" style="display:none">
      <h2>
        <span id="pt-name"></span>
        <button id="generate-btn" onclick="generateBrief()">Generate 60s Brief</button>
      </h2>
      <div id="brief-output"></div>
    </div>
  </div>
  <div id="query-panel">
    <h3>Physician Query</h3>
    <div class="chip-row" id="chips"></div>
    <textarea id="query-input" placeholder="Ask anything about this patient..."></textarea>
    <button id="query-btn" onclick="submitQuery()">Ask ClinIQ →</button>
    <div id="query-history"></div>
  </div>
</div>

<script>
let activePatient = null;
const CHIPS = ["HbA1c trend","Drug interaction risks","Overdue investigations","Clinical red flags","Brief summary","Creatinine trend","INR trend","BNP trend"];

async function init(){
  const pts = await fetch('/api/patients').then(r=>r.json());
  const list = document.getElementById('patient-list');
  pts.forEach(p=>{
    const d = document.createElement('div');
    d.className='patient-card'; d.id='pc-'+p.id;
    d.innerHTML=`<span class="badge">${p.alert_count}</span><div class="pname">${p.name}</div><div class="pmeta">${p.age}y · ${p.sex} · ${p.id}</div><div class="pdiag">${p.primary_diagnosis}</div>`;
    d.onclick=()=>selectPatient(p);
    list.appendChild(d);
  });
  const cr = document.getElementById('chips');
  CHIPS.forEach(c=>{const ch=document.createElement('div');ch.className='chip';ch.textContent=c;ch.onclick=()=>{document.getElementById('query-input').value=c;};cr.appendChild(ch);});
}

async function selectPatient(p){
  activePatient=p;
  document.querySelectorAll('.patient-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('pc-'+p.id).classList.add('active');
  document.getElementById('no-pt-msg').style.display='none';
  document.getElementById('pt-content').style.display='block';
  document.getElementById('pt-name').textContent=p.name+' · '+p.id;
  document.getElementById('brief-output').innerHTML='';
  document.getElementById('query-history').innerHTML='';
  const flags = await fetch('/api/flags/'+p.id).then(r=>r.json());
  const ribbon = document.getElementById('alert-ribbon');
  ribbon.innerHTML=flags.flags.slice(0,4).map(f=>`<span class="alert-chip ${f.severity}">⚠ ${f.message.substring(0,40)}</span>`).join('');
}

async function generateBrief(){
  if(!activePatient)return;
  const btn=document.getElementById('generate-btn');
  btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Generating...';
  document.getElementById('brief-output').innerHTML='<div style="text-align:center;padding:40px;color:#7A9BBB"><span class="spinner"></span> MedGemma 27B processing case sheet...</div>';
  const data=await fetch('/api/brief/'+activePatient.id,{method:'POST'}).then(r=>r.json());
  btn.disabled=false;btn.textContent='Regenerate Brief';
  renderBrief(data);
}

function renderBrief(d){
  const bd=document.getElementById('brief-output');
  const p=d.data;
  const ts=new Date(d.generated_at).toLocaleTimeString();
  let html='';

  // Flags
  if(p.all_flags&&p.all_flags.length){
    html+=`<div class="section-card"><h4>🚨 Red Flag Findings (${p.flag_count.HIGH} High · ${p.flag_count.MEDIUM} Medium)</h4>`;
    p.all_flags.forEach(f=>{html+=`<div class="flag-item ${f.severity}"><span class="flag-sev">${f.severity}</span>${f.message}<div style="font-size:10px;margin-top:3px;opacity:.7">${(f.evidence||'').substring(0,120)}</div></div>`;});
    html+=`</div>`;
  }

  // Diagnoses
  html+=`<div class="section-card"><h4>Active Diagnoses</h4>`;
  p.diagnoses.forEach(dx=>{html+=`<div class="dx-item"><span class="med-name">${dx.name}</span><span class="med-dose">${dx.code} · since ${dx.since}</span></div>`;});
  html+=`</div>`;

  // Medications
  html+=`<div class="section-card"><h4>Current Medications</h4>`;
  p.medications.forEach(m=>{html+=`<div class="med-item"><span class="med-name">${m.drug}</span><span class="med-dose">${m.dose} ${m.freq}</span></div>`;});
  html+=`</div>`;

  // Lab trends
  html+=`<div class="section-card"><h4>Lab Trend Summary</h4>`;
  Object.entries(p.lab_trends).forEach(([t,v])=>{
    if(!v.latest)return;
    const td=v.trend.includes('↑')?'trend-up':v.trend.includes('↓')?'trend-down':'trend-stable';
    html+=`<div class="lab-row"><span class="lab-name">${t}</span><span class="lab-trend">${v.latest.value} ${v.latest.unit}</span><span class="${td}">${v.trend||'—'}</span></div>`;
  });
  html+=`</div>`;

  // Drug interactions
  if(p.drug_interactions&&p.drug_interactions.length){
    html+=`<div class="section-card"><h4>⚠ Drug Interactions</h4>`;
    p.drug_interactions.forEach(i=>{html+=`<div class="flag-item ${i.severity}"><span class="flag-sev">${i.severity}</span>${i.drug_a} + ${i.drug_b}<div style="font-size:10px;margin-top:3px;opacity:.8">${i.mechanism.substring(0,140)}</div></div>`;});
    html+=`</div>`;
  }

  // Overdue
  if(p.overdue_investigations&&p.overdue_investigations.length){
    html+=`<div class="section-card"><h4>📋 Overdue Investigations</h4>`;
    p.overdue_investigations.forEach(i=>{html+=`<div class="overdue-item"><div class="oi-name">${i.investigation}</div><div class="oi-meta">${i.guideline} · Overdue: ${i.overdue_by} · Priority: ${i.priority}</div></div>`;});
    html+=`</div>`;
  }

  html+=`<div class="watermark">Generated ${ts} · ${d.model_simulated} · All outputs for physician review only</div>`;
  document.getElementById('brief-output').innerHTML=html;
}

async function submitQuery(){
  if(!activePatient)return alert('Select a patient first');
  const q=document.getElementById('query-input').value.trim();
  if(!q)return;
  const btn=document.getElementById('query-btn');
  btn.disabled=true;btn.textContent='Thinking...';
  const res=await fetch('/api/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({patient_id:activePatient.id,query:q})}).then(r=>r.json());
  btn.disabled=false;btn.textContent='Ask ClinIQ →';
  document.getElementById('query-input').value='';
  const hist=document.getElementById('query-history');
  const item=document.createElement('div');item.className='qh-item';
  item.innerHTML=`<div class="qh-q">Q: ${q}</div><div class="qh-a">${res.answer||'No response'}</div><div class="qh-tools">${(res.tools_called||[]).map(t=>`<span class="tool-tag">⚙ ${t.tool}</span>`).join('')}</div>`;
  hist.insertBefore(item,hist.firstChild);
}

document.getElementById('query-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitQuery();}});
init();
</script>
</body>
</html>""")

# ══════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("\n🏥  ClinIQ Demo Starting...")
    print("📡  Dashboard: http://localhost:8000")
    print("📋  API Docs:  http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)