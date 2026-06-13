import os
import json
import sqlite3
from datetime import datetime, timedelta

# Paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(ROOT_DIR, "cliniq.db")
JSON_DB_FILE = os.path.join(ROOT_DIR, "database.json")

# 36 months of dates
def generate_dates(months_count=36):
    dates = []
    base_date = datetime(2026, 6, 1)
    for i in range(months_count):
        date_val = base_date - timedelta(days=30 * (months_count - i - 1))
        dates.append(date_val.strftime("%b %y"))
    return dates

DATES_36 = generate_dates()

# 1. Arjun Mehta (P-00142)
arjun_labs = {
    "HbA1c": [{"date": d, "val": round(6.5 + (i * 0.086), 2)} for i, d in enumerate(DATES_36)],
    "Creatinine": [{"date": d, "val": round(0.9 + (i * 0.034), 2)} for i, d in enumerate(DATES_36)],
    "BP_Systolic": [{"date": d, "val": int(125 + (i * 0.77))} for i, d in enumerate(DATES_36)],
    "LDL": [{"date": d, "val": int(110 + (i * 1.5))} for i, d in enumerate(DATES_36)]
}
# Adjust latest values slightly for realism
arjun_labs["HbA1c"][-1]["val"] = 9.5
arjun_labs["Creatinine"][-1]["val"] = 2.1
arjun_labs["BP_Systolic"][-1]["val"] = 143

# 2. Kavitha Rajan (P-00284)
kavitha_labs = {
    "ESR": [{"date": d, "val": int(45 - (i * 0.85))} for i, d in enumerate(DATES_36)],
    "Hemoglobin": [{"date": d, "val": round(9.0 + (i * 0.1), 2)} for i, d in enumerate(DATES_36)],
    "FEV1": [{"date": d, "val": int(78 + (i * 0.15))} for i, d in enumerate(DATES_36)]
}
kavitha_labs["ESR"][-1]["val"] = 15
kavitha_labs["Hemoglobin"][-1]["val"] = 12.8

# 3. Mrs. Sarasu (P-00399)
sarasu_labs = {
    "BNP": [{"date": d, "val": int(250 + (i * 19.5))} for i, d in enumerate(DATES_36)],
    "Creatinine": [{"date": d, "val": round(1.3 + (i * 0.042), 2)} for i, d in enumerate(DATES_36)],
    "BP_Systolic": [{"date": d, "val": int(135 + (20 if i % 4 == 0 else -10))} for i, d in enumerate(DATES_36)],
    "Potassium": [{"date": d, "val": round(4.1 + (i * 0.036), 2)} for i, d in enumerate(DATES_36)],
    "HbA1c": [{"date": d, "val": round(7.2 + (i * 0.04), 2)} for i, d in enumerate(DATES_36)]
}
sarasu_labs["BNP"][-1]["val"] = 950
sarasu_labs["Creatinine"][-1]["val"] = 2.8
sarasu_labs["Potassium"][-1]["val"] = 5.4

# Create complete patient objects for database.json
PATIENTS = [
    {
        "id": "P-00142",
        "name": "Arjun Mehta",
        "age": 58,
        "sex": "Male",
        "dob": "12 Mar 1967",
        "diagnosis": [
            "Type 2 Diabetes",
            "Hypertension",
            "CKD Stage 2",
            "Dyslipidemia"
        ],
        "doctor": "Dr. Priya Nair",
        "ward": "Endocrinology",
        "riskScore": 78,
        "adherenceScore": 61,
        "medications": [
            {"name": "Metformin", "dose": "500mg", "freq": "Twice daily", "color": "#7C3AED", "shape": "Round", "markings": "MF500"},
            {"name": "Amlodipine", "dose": "5mg", "freq": "Once daily", "color": "#FBBF24", "shape": "Oval", "markings": "AML5"},
            {"name": "Lisinopril", "dose": "10mg", "freq": "Once daily", "color": "#F87171", "shape": "Round", "markings": "LIS10"}
        ],
        "labs": arjun_labs,
        "bodyFlags": ["Kidney", "Heart"],
        "clinicalPatterns": [
            {"type": "Lab Alert", "time": "2h ago", "description": "HbA1c increased significantly to 9.5% over 12 months.", "severity": "HIGH", "urgency_score": 8, "urgency_computed_at": "2026-06-13T10:00:00Z"},
            {"type": "Vitals", "time": "5h ago", "description": "Blood pressure remains elevated despite dual-therapy.", "severity": "MEDIUM", "urgency_score": 6, "urgency_computed_at": "2026-06-13T07:00:00Z"},
            {"type": "Adherence", "time": "1d ago", "description": "Missed 3 doses of Lisinopril this week.", "severity": "MEDIUM", "urgency_score": 7, "urgency_computed_at": "2026-06-12T12:00:00Z"},
            {"type": "Renal", "time": "2d ago", "description": "Creatinine trend suggests progressive Stage 3 CKD.", "severity": "HIGH", "urgency_score": 9, "urgency_computed_at": "2026-06-11T12:00:00Z"}
        ],
        "adherenceCalendar": [False, True, False, False, True, True, False],
        "consultBrief": "T2DM uncontrolled. Advise titration of insulin or SGLT2i. Monitor renal function closely."
    },
    {
        "id": "P-00284",
        "name": "Kavitha Rajan",
        "age": 45,
        "sex": "Female",
        "dob": "05 Aug 1980",
        "diagnosis": [
            "Rheumatoid Arthritis",
            "Anaemia",
            "Asthma"
        ],
        "doctor": "Dr. Ananya Sharma",
        "ward": "Rheumatology",
        "riskScore": 45,
        "adherenceScore": 92,
        "medications": [
            {"name": "Methotrexate", "dose": "15mg", "freq": "Once weekly", "color": "#818CF8", "shape": "Capsule", "markings": "MTX15"},
            {"name": "Folic Acid", "dose": "5mg", "freq": "Once daily", "color": "#34D399", "shape": "Round", "markings": "FA5"},
            {"name": "Salbutamol", "dose": "100mcg", "freq": "PRN", "color": "#60A5FA", "shape": "Inhaler", "markings": "VENT"}
        ],
        "labs": kavitha_labs,
        "bodyFlags": ["Joints", "Lungs"],
        "clinicalPatterns": [
            {"type": "Lab Good", "time": "12h ago", "description": "ESR normalized under DMARD therapy.", "severity": "LOW", "urgency_score": 2, "urgency_computed_at": "2026-06-13T00:00:00Z"},
            {"type": "Lab Good", "time": "1d ago", "description": "Anemia resolved (Hgb > 12.5).", "severity": "LOW", "urgency_score": 2, "urgency_computed_at": "2026-06-12T12:00:00Z"}
        ],
        "adherenceCalendar": [True, True, True, False, True, True, True],
        "consultBrief": "RA stable. Mild asthma symptoms reported. Bone density scan recommended."
    },
    {
        "id": "P-00399",
        "name": "Mrs. Sarasu",
        "age": 78,
        "sex": "Female",
        "dob": "22 Nov 1947",
        "diagnosis": [
            "Coronary Artery Disease",
            "Congestive Heart Failure",
            "Type 2 Diabetes",
            "Stage 3 CKD",
            "Osteoarthritis",
            "Gout",
            "Atrial Fibrillation"
        ],
        "doctor": "Dr. Ramesh Kumar",
        "ward": "Cardiology",
        "riskScore": 92,
        "adherenceScore": 48,
        "medications": [
            {"name": "Metoprolol", "dose": "25mg", "freq": "Twice daily", "color": "#A855F7", "shape": "Round", "markings": "M25"},
            {"name": "Spironolactone", "dose": "25mg", "freq": "Once daily", "color": "#FBBF24", "shape": "Round", "markings": "SP25"},
            {"name": "Amiodarone", "dose": "200mg", "freq": "Once daily", "color": "#EF4444", "shape": "Oval", "markings": "A200"},
            {"name": "Metformin", "dose": "500mg", "freq": "Once daily", "color": "#7C3AED", "shape": "Round", "markings": "MF500"},
            {"name": "Allopurinol", "dose": "100mg", "freq": "Once daily", "color": "#3b82f6", "shape": "Round", "markings": "AP100"}
        ],
        "labs": sarasu_labs,
        "bodyFlags": ["Heart", "Kidney", "Joints"],
        "clinicalPatterns": [
            {"type": "Lab Alert", "time": "1h ago", "description": "BNP spike (950 pg/mL) suggests impending CHF decompensation.", "severity": "HIGH", "urgency_score": 10, "urgency_computed_at": "2026-06-13T11:00:00Z"},
            {"type": "Renal", "time": "3h ago", "description": "Creatinine of 2.8 mg/dL indicates stage 4 CKD transition.", "severity": "HIGH", "urgency_score": 9, "urgency_computed_at": "2026-06-13T09:00:00Z"},
            {"type": "Adherence", "time": "5h ago", "description": "Critical non-adherence: missed 5 doses of Spironolactone.", "severity": "HIGH", "urgency_score": 8, "urgency_computed_at": "2026-06-13T07:00:00Z"},
            {"type": "Vitals", "time": "1d ago", "description": "Orthostatic BP drops recorded.", "severity": "MEDIUM", "urgency_score": 7, "urgency_computed_at": "2026-06-12T12:00:00Z"},
            {"type": "Drug Conflict", "time": "2d ago", "description": "High interaction risk: Metoprolol and Amiodarone.", "severity": "HIGH", "urgency_score": 9, "urgency_computed_at": "2026-06-11T12:00:00Z"}
        ],
        "adherenceCalendar": [False, False, True, False, True, False, False],
        "consultBrief": "Advanced CHF and renal decline. High risk of hyperkalemia. Strict adherence counseling required."
    }
]

# Write database.json
def seed_json_database():
    try:
        with open(JSON_DB_FILE, 'r') as f:
            existing_db = json.load(f)
    except:
        existing_db = {}
        
    existing_db["patients"] = PATIENTS
    with open(JSON_DB_FILE, 'w') as f:
        json.dump(existing_db, f, indent=2)
    print("Seeded database.json successfully!")

# Seed SQL Caches for instant wow demo pages
def seed_sql_caches():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Clear existing cache
    cursor.execute("DROP TABLE IF EXISTS forecast_cache")
    cursor.execute("DROP TABLE IF EXISTS comorbidity_web_cache")
    
    # Recreate
    cursor.execute("""
        CREATE TABLE forecast_cache (
            id TEXT PRIMARY KEY,
            patient_id TEXT,
            generated_at TEXT,
            trajectory_json TEXT,
            drivers_json TEXT,
            milestones_json TEXT,
            interventions_json TEXT,
            expires_at TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE comorbidity_web_cache (
            id TEXT PRIMARY KEY,
            patient_id TEXT,
            generated_at TEXT,
            nodes_json TEXT,
            edges_json TEXT,
            expires_at TEXT
        )
    """)
    
    now = datetime.utcnow()
    expires = now + timedelta(days=365) # Far future expire
    
    # --- ARJUN MEHTA FORECAST DATA ---
    arjun_trajectory = [
        {
            "condition": "Type 2 Diabetes",
            "icd_code": "E11.9",
            "trajectory": [{"month": m, "risk": round(0.70 + (m * 0.02), 2), "confidence_low": round(0.60 + (m * 0.01), 2), "confidence_high": round(0.80 + (m * 0.015), 2), "key_driver": "HbA1c"} for m in range(13)]
        },
        {
            "condition": "Hypertension",
            "icd_code": "I10",
            "trajectory": [{"month": m, "risk": round(0.65 + (m * 0.015), 2), "confidence_low": round(0.55 + (m * 0.01), 2), "confidence_high": round(0.75 + (m * 0.015), 2), "key_driver": "BP_Systolic"} for m in range(13)]
        },
        {
            "condition": "CKD Stage 2",
            "icd_code": "N18.2",
            "trajectory": [{"month": m, "risk": round(0.50 + (m * 0.03), 2), "confidence_low": round(0.40 + (m * 0.015), 2), "confidence_high": round(0.60 + (m * 0.025), 2), "key_driver": "Creatinine"} for m in range(13)]
        }
    ]
    arjun_drivers = [
        {"biomarker": "HbA1c", "contribution_pct": 42.5, "direction": "worsening"},
        {"biomarker": "Creatinine", "contribution_pct": 28.0, "direction": "worsening"},
        {"biomarker": "BP_Systolic", "contribution_pct": 19.5, "direction": "worsening"},
        {"biomarker": "Adherence Score", "contribution_pct": 10.0, "direction": "worsening"}
    ]
    arjun_milestones = [
        {"month": 3, "condition": "CKD Stage 2", "event": "Transition to Stage 3 CKD (eGFR < 60 mL/min)", "probability": 0.75},
        {"month": 6, "condition": "Type 2 Diabetes", "event": "Severe Retinopathy Onset Risk", "probability": 0.60},
        {"month": 10, "condition": "Hypertension", "event": "Hypertensive Crisis (BP > 180 mmHg)", "probability": 0.45}
    ]
    arjun_interventions = [
        {"intervention": "Add Metformin", "risk_delta": -0.25, "affected_conditions": ["Type 2 Diabetes", "CKD Stage 2"]},
        {"intervention": "Increase Lisinopril", "risk_delta": -0.15, "affected_conditions": ["Hypertension", "CKD Stage 2"]},
        {"intervention": "Patient Adherence Support Plan", "risk_delta": -0.20, "affected_conditions": ["Type 2 Diabetes", "Hypertension"]}
    ]
    
    cursor.execute("""
        INSERT INTO forecast_cache VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "arjun-forecast", "P-00142", now.isoformat(),
        json.dumps(arjun_trajectory), json.dumps(arjun_drivers), json.dumps(arjun_milestones), json.dumps(arjun_interventions),
        expires.isoformat()
    ))

    # --- ARJUN MEHTA COMORBIDITY DATA ---
    arjun_nodes = [
        {"id": "E11.9", "condition": "Type 2 Diabetes", "severity": 0.85, "icd_code": "E11.9", "description": "Uncontrolled hyperglycemia leading to peripheral neuro-vascular damage."},
        {"id": "I10", "condition": "Hypertension", "severity": 0.70, "icd_code": "I10", "description": "Elevated arterial blood pressure placing stress on cardiac and renal systems."},
        {"id": "N18.2", "condition": "CKD Stage 2", "severity": 0.75, "icd_code": "N18.2", "description": "Mild renal filtration impairment, susceptible to diabetic nephropathy progression."}
    ]
    arjun_edges = [
        {"source": "E11.9", "target": "N18.2", "strength": 0.85, "direction": "amplifying", "mechanism": "Glomerular hyperfiltration and advanced glycation end-products (AGEs) damage renal basement membranes."},
        {"source": "I10", "target": "N18.2", "strength": 0.80, "direction": "amplifying", "mechanism": "Intraglomerular hypertension leads to hyaline arteriolosclerosis, accelerating nephron death."},
        {"source": "E11.9", "target": "I10", "strength": 0.55, "direction": "amplifying", "mechanism": "Insulin resistance promotes renal sodium retention and sympathetic nervous system activation, driving BP upwards."}
    ]
    
    cursor.execute("""
        INSERT INTO comorbidity_web_cache VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "arjun-comorbidity", "P-00142", now.isoformat(),
        json.dumps(arjun_nodes), json.dumps(arjun_edges),
        expires.isoformat()
    ))

    # --- MRS SARASU FORECAST DATA ---
    sarasu_trajectory = [
        {
            "condition": "Congestive Heart Failure",
            "icd_code": "I50.9",
            "trajectory": [{"month": m, "risk": round(0.80 + (m * 0.015), 2), "confidence_low": round(0.70 + (m * 0.01), 2), "confidence_high": round(0.90 + (m * 0.008), 2), "key_driver": "BNP"} for m in range(13)]
        },
        {
            "condition": "Stage 3 CKD",
            "icd_code": "N18.3",
            "trajectory": [{"month": m, "risk": round(0.70 + (m * 0.02), 2), "confidence_low": round(0.60 + (m * 0.015), 2), "confidence_high": round(0.80 + (m * 0.02), 2), "key_driver": "Creatinine"} for m in range(13)]
        },
        {
            "condition": "Atrial Fibrillation",
            "icd_code": "I48.91",
            "trajectory": [{"month": m, "risk": round(0.75 + (m * 0.01), 2), "confidence_low": round(0.65 + (m * 0.01), 2), "confidence_high": round(0.85 + (m * 0.015), 2), "key_driver": "Potassium"} for m in range(13)]
        }
    ]
    sarasu_drivers = [
        {"biomarker": "BNP", "contribution_pct": 38.0, "direction": "worsening"},
        {"biomarker": "Creatinine", "contribution_pct": 27.5, "direction": "worsening"},
        {"biomarker": "Potassium", "contribution_pct": 22.0, "direction": "worsening"},
        {"biomarker": "Adherence Score", "contribution_pct": 12.5, "direction": "worsening"}
    ]
    sarasu_milestones = [
        {"month": 2, "condition": "Congestive Heart Failure", "event": "Acute decompensation (Requires emergency hospitalization)", "probability": 0.82},
        {"month": 5, "condition": "Stage 3 CKD", "event": "Uremic symptom onset / Stage 4 transition", "probability": 0.70},
        {"month": 9, "condition": "Atrial Fibrillation", "event": "Thromboembolic stroke event", "probability": 0.55}
    ]
    sarasu_interventions = [
        {"intervention": "Titrate Beta Blocker", "risk_delta": -0.20, "affected_conditions": ["Congestive Heart Failure", "Atrial Fibrillation"]},
        {"intervention": "Restructure Polypharmacy Regime", "risk_delta": -0.30, "affected_conditions": ["Stage 3 CKD", "Atrial Fibrillation", "Congestive Heart Failure"]},
        {"intervention": "Strict Low-Sodium Diet Support", "risk_delta": -0.15, "affected_conditions": ["Congestive Heart Failure"]}
    ]
    
    cursor.execute("""
        INSERT INTO forecast_cache VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "sarasu-forecast", "P-00399", now.isoformat(),
        json.dumps(sarasu_trajectory), json.dumps(sarasu_drivers), json.dumps(sarasu_milestones), json.dumps(sarasu_interventions),
        expires.isoformat()
    ))

    # --- MRS SARASU COMORBIDITY DATA ---
    sarasu_nodes = [
        {"id": "I50.9", "condition": "Congestive Heart Failure", "severity": 0.90, "icd_code": "I50.9", "description": "Failure of ventricular output leading to systemic congestion and tissue hypoperfusion."},
        {"id": "N18.3", "condition": "Stage 3 CKD", "severity": 0.85, "icd_code": "N18.3", "description": "Moderate renal filtration decline, vulnerable to fluid overload."},
        {"id": "I48.91", "condition": "Atrial Fibrillation", "severity": 0.80, "icd_code": "I48.91", "description": "Irregular cardiac electrical activity causing risk of stroke and ventricular overload."}
    ]
    sarasu_edges = [
        {"source": "I50.9", "target": "N18.3", "strength": 0.92, "direction": "amplifying", "mechanism": "Cardiorenal Syndrome Type 1: Low cardiac output triggers renal hypoperfusion and renal-angiotensin-aldosterone axis activation, worsening renal clearance."},
        {"source": "N18.3", "target": "I50.9", "strength": 0.88, "direction": "amplifying", "mechanism": "Fluid retention and uremic toxins place excessive preload on the failing left ventricle, accelerating cardiac dilation."},
        {"source": "I48.91", "target": "I50.9", "strength": 0.85, "direction": "amplifying", "mechanism": "Loss of atrial kick and rapid ventricular rate compromise diastolic filling, precipitating acute decompensated heart failure."}
    ]
    
    cursor.execute("""
        INSERT INTO comorbidity_web_cache VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "sarasu-comorbidity", "P-00399", now.isoformat(),
        json.dumps(sarasu_nodes), json.dumps(sarasu_edges),
        expires.isoformat()
    ))
    
    # --- KAVITHA RAJAN FORECAST DATA (STABLE) ---
    kavitha_trajectory = [
        {
            "condition": "Rheumatoid Arthritis",
            "icd_code": "M06.9",
            "trajectory": [{"month": m, "risk": round(0.40 - (m * 0.015), 2), "confidence_low": round(0.30 - (m * 0.01), 2), "confidence_high": round(0.50 - (m * 0.02), 2), "key_driver": "ESR"} for m in range(13)]
        },
        {
            "condition": "Anaemia",
            "icd_code": "D64.9",
            "trajectory": [{"month": m, "risk": round(0.35 - (m * 0.02), 2), "confidence_low": round(0.25 - (m * 0.015), 2), "confidence_high": round(0.45 - (m * 0.025), 2), "key_driver": "Hemoglobin"} for m in range(13)]
        }
    ]
    kavitha_drivers = [
        {"biomarker": "ESR", "contribution_pct": 50.0, "direction": "improving"},
        {"biomarker": "Hemoglobin", "contribution_pct": 30.0, "direction": "improving"},
        {"biomarker": "FEV1", "contribution_pct": 20.0, "direction": "stable"}
    ]
    kavitha_milestones = [
        {"month": 3, "condition": "Rheumatoid Arthritis", "event": "Clinical Remission achieved under DMARD regime", "probability": 0.85},
        {"month": 6, "condition": "Anaemia", "event": "Complete hematological recovery (Hgb > 13.0)", "probability": 0.90}
    ]
    kavitha_interventions = [
        {"intervention": "Decrease Methotrexate Dose", "risk_delta": 0.05, "affected_conditions": ["Rheumatoid Arthritis"]},
        {"intervention": "Add Iron Supplementation", "risk_delta": -0.08, "affected_conditions": ["Anaemia"]}
    ]
    
    cursor.execute("""
        INSERT INTO forecast_cache VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "kavitha-forecast", "P-00284", now.isoformat(),
        json.dumps(kavitha_trajectory), json.dumps(kavitha_drivers), json.dumps(kavitha_milestones), json.dumps(kavitha_interventions),
        expires.isoformat()
    ))

    # --- KAVITHA RAJAN COMORBIDITY DATA ---
    kavitha_nodes = [
        {"id": "M06.9", "condition": "Rheumatoid Arthritis", "severity": 0.40, "icd_code": "M06.9", "description": "Autoimmune disease causing joint synovitis and systemic inflammation."},
        {"id": "D64.9", "condition": "Anaemia", "severity": 0.30, "icd_code": "D64.9", "description": "Anaemia of chronic disease secondary to systemic inflammatory cytokines."}
    ]
    kavitha_edges = [
        {"source": "M06.9", "target": "D64.9", "strength": 0.70, "direction": "amplifying", "mechanism": "IL-6 and TNF-alpha inflammatory cascades increase hepcidin synthesis, blocking intestinal iron absorption and macrophage iron egress."}
    ]
    
    cursor.execute("""
        INSERT INTO comorbidity_web_cache VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "kavitha-comorbidity", "P-00284", now.isoformat(),
        json.dumps(kavitha_nodes), json.dumps(kavitha_edges),
        expires.isoformat()
    ))

    conn.commit()
    conn.close()
    print("Seeded SQLite database cache successfully!")

if __name__ == "__main__":
    seed_json_database()
    seed_sql_caches()
