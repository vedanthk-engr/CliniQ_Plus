from fastapi import FastAPI, File, UploadFile
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Load environment variables from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from mock_data import PATIENTS, PILL_SCAN_EVENTS, DRUG_INTERACTIONS
from agents.query_agent import run_nl_query
from agents.pill_agent import run_vision_agent
from agents.pill_analyzer_agent import analyze_pill_images
from agents.intake_agent import run_intake_extraction
from agents.trial_matcher_agent import match_clinical_trials

import random
import uuid

DB_FILE = "database.json"

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    # Default to mock
    db = {"patients": PATIENTS, "pill_events": PILL_SCAN_EVENTS, "interactions": DRUG_INTERACTIONS}
    save_db(db)
    return db

def save_db(db):
    with open(DB_FILE, 'w') as f:
        json.dump(db, f, indent=2)

db = load_db()

app = FastAPI(title='ClinIQ Backend')
app.add_middleware(CORSMiddleware,
    allow_origins=['http://localhost:5173'],  # Vite dev server
    allow_methods=['*'], allow_headers=['*'])

from routers import forecast, comorbidity, alerts, pillguard, patients, export, voice

class QueryRequest(BaseModel):
    query: str
    patient_id: str

class SecondOpinionRequest(BaseModel):
    diagnosis: str
    patient_id: str

class PillVerifyRequest(BaseModel):
    image_base64: str
    prescription_id: str

class IntakeRequest(BaseModel):
    file_base64: str
    file_type: str = "application/pdf"
    expected_patient_name: str = None
    is_new_patient: bool = False
    document_type: str = "discharge_summary"

@app.get('/api/patients')
def get_patients():
    return db["patients"]

@app.get('/api/patient/{id}')
def get_patient(id: str):
    return next((p for p in db["patients"] if p['id'] == id), {"error": "Not found"})

@app.delete('/api/patient/{id}')
def delete_patient(id: str):
    patient_idx = next((i for i, p in enumerate(db["patients"]) if p['id'] == id), None)
    if patient_idx is not None:
        deleted = db["patients"].pop(patient_idx)
        save_db(db)
        return {"status": "success", "message": f"Deleted {id}"}
    return {"error": "Not found"}

@app.get('/api/patient/{id}/brief')
def get_brief(id: str):
    patient = next((p for p in db["patients"] if p['id'] == id), None)
    return {"consultBrief": patient['consultBrief']} if patient else {"error": "Not found"}

@app.get('/api/patient/{id}/labs/{test}')
def get_labs(id: str, test: str):
    patient = next((p for p in db["patients"] if p['id'] == id), None)
    if not patient: return {"error": "Patient not found"}
    labs = patient.get("labs", {}).get(test, [])
    return {"data": labs}

@app.get('/api/patient/{id}/patterns')
def get_patterns(id: str):
    patient = next((p for p in db["patients"] if p['id'] == id), None)
    return {"patterns": patient.get("clinicalPatterns", [])} if patient else {"error": "Not found"}

@app.get('/api/patient/{id}/adherence')
def get_adherence(id: str):
    patient = next((p for p in db["patients"] if p['id'] == id), None)
    if not patient: return {"error": "Not found"}
    return {
        "calendar": patient.get("adherenceCalendar", []),
        "score": patient.get("adherenceScore", 0)
    }

@app.get('/api/patient/{id}/interactions')
def get_interactions(id: str):
    return db["interactions"]

@app.get('/api/pill-events')
def get_pill_events():
    return db["pill_events"]

@app.post('/api/query')
def query_agent(req: QueryRequest):
    response = run_nl_query(req.query, req.patient_id)
    return {"response": response}

# Mount new routers
app.include_router(forecast.router)
app.include_router(comorbidity.router)
app.include_router(alerts.router)
app.include_router(pillguard.router)
app.include_router(patients.router)
app.include_router(export.router)
app.include_router(voice.router)


@app.post('/api/pill/verify')
def pill_verify(req: PillVerifyRequest):
    result = run_vision_agent(req.image_base64, req.prescription_id)
    return result

@app.post('/api/analyze-pill')
async def analyze_pill_endpoint(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...)
):
    # Read the file contents
    front_bytes = await front_image.read()
    back_bytes = await back_image.read()
    
    # Call our agent
    result_str = analyze_pill_images(front_bytes, back_bytes)
    
    # The agent returns a JSON string, so we parse it to return actual JSON instead of an escaped string
    try:
        return json.loads(result_str)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": result_str}

@app.post('/api/intake/extract')
def intake_extract(req: IntakeRequest):
    result = run_intake_extraction(req.file_base64, req.file_type, req.expected_patient_name, req.is_new_patient, req.document_type)
    return result

@app.post('/api/intake/save')
def intake_save(data: dict):
    print(f"Saving approved intake data: {data}")
    patient_id = data.get("patient_id")
    extracted_name = data.get("extracted_name", "Unknown Patient")
    
    existing_patient = None
    if patient_id:
        existing_patient = next((p for p in db["patients"] if p["id"] == patient_id), None)
    if not existing_patient:
        existing_patient = next((p for p in db["patients"] if p["name"].lower() == extracted_name.lower()), None)
    
    import re
    # Simple parse of meds - split by line or comma
    meds_str = data.get("medications", {}).get("value", "")
    meds_raw = re.split(r'\n', meds_str) if "\n" in meds_str else re.split(r',', meds_str)
    meds_list = []
    for m in meds_raw:
        if m.strip() and m.strip().lower() != "not mentioned":
            full_str = m.strip()
            meds_list.append({
                "name": full_str[:25], 
                "dose": full_str[25:] if len(full_str) > 25 else "Standard", 
                "freq": "As Directed", 
                "color": "#1a6bff", 
                "shape": "Round", 
                "markings": "-"
            })
        
    diags_str = data.get("diagnosis", {}).get("value", "")
    diags_raw = re.split(r'[,\\n]+', diags_str)
    diags_list = [d.strip() for d in diags_raw if d.strip() and d.strip().lower() != "not mentioned"]
    
    # Parse vitals
    vitals_data = data.get("vitals", {}).get("value", {})
    bp = vitals_data.get("bp", "")
    bp_sys = 120
    if isinstance(bp, str) and "/" in bp:
        try: bp_sys = int(bp.split("/")[0])
        except: pass
    
    hr = vitals_data.get("hr", "")
    try: hr = int(hr)
    except: hr = 72
    
    glucose = vitals_data.get("glucose", "")
    try: glucose = int(float(glucose))
    except: glucose = 100
    
    vital_time = "Just Now"
    labs = {
        "BP_Systolic": [{"time": vital_time, "val": bp_sys}],
        "HeartRate": [{"time": vital_time, "val": hr}],
        "Glucose": [{"time": vital_time, "val": glucose}]
    }

    if existing_patient:
        # Update existing
        if diags_list: existing_patient["diagnosis"] = diags_list
        if meds_list: existing_patient["medications"] = meds_list
        if "labs" not in existing_patient: existing_patient["labs"] = {}
        existing_patient["labs"].update(labs)
        new_id = existing_patient["id"]
        # Also log to clinical patterns
        if "clinicalPatterns" not in existing_patient: existing_patient["clinicalPatterns"] = []
        existing_patient["clinicalPatterns"].insert(0, {
            "type": "Data Ingest", "time": vital_time, "description": "New clinical report ingested by AI.", "severity": "LOW"
        })
    else:
        # Construct a new patient
        new_id = f"P-{random.randint(10000, 99999)}"
        new_patient = {
          "id": new_id,
          "name": extracted_name,
          "age": random.randint(30, 80),
          "sex": "Unknown",
          "dob": "01 Jan 1980",
          "diagnosis": diags_list,
          "doctor": "Dr. AI Agent",
          "ward": "General",
          "riskScore": random.randint(40, 80),
          "adherenceScore": random.randint(50, 100),
          "medications": meds_list,
          "labs": labs,
          "bodyFlags": ["Heart"] if "heart" in doc_str(data) else [],
          "clinicalPatterns": [
              {"type": "Intake Note", "time": vital_time, "description": "Patient file initialized via AI.", "severity": "LOW"}
          ],
          "adherenceCalendar": [True, True, True, True, True, True, True],
          "consultBrief": f"Intake completed. Primary focus: {diags_list[0] if diags_list else 'Review needed'}."
        }
        db["patients"].append(new_patient)
        
    save_db(db)
    return {"status": "success", "message": "Patient verified and saved successfully", "patient_id": new_id}

def doc_str(data):
    return str(data).lower()

from fastapi import HTTPException
@app.post('/api/trials/match/{patient_id}')
async def match_trials(patient_id: str):
    patient = next((p for p in db["patients"] if p['id'] == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if not patient.get("diagnosis"):
        raise HTTPException(status_code=400, detail="Patient has no conditions for trial matching")

    result = await match_clinical_trials(patient)
    if "error" in result:
        # If it's a connection issue or timeout
        if "Failed to connect" in result["error"] or "Timeout" in result["error"]:
            raise HTTPException(status_code=503, detail=result["error"])
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
