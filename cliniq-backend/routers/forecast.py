from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import time
import asyncio
from services.supabase_service import db_service
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/forecast", tags=["forecast"])

class ForecastRequest(BaseModel):
    patient_id: str

class SimulationRequest(BaseModel):
    patient_id: str
    interventions: list[str]

# Enforce the required schema string in the prompt
TRAJECTORY_SCHEMA = """
{
  "patient_id": string,
  "generated_at": ISO timestamp,
  "conditions": [
    {
      "condition": string,
      "icd_code": string,
      "trajectory": [
        { "month": 0, "risk": float, "confidence_low": float, "confidence_high": float, "key_driver": string }
        // months 0 through 12
      ]
    }
  ],
  "forecast_drivers": [
    { "biomarker": string, "contribution_pct": float, "direction": "worsening" | "stable" | "improving" }
  ],
  "milestones": [
    { "month": int, "condition": string, "event": string, "probability": float }
  ],
  "intervention_impacts": [
    { "intervention": string, "risk_delta": float, "affected_conditions": string[] }
  ]
}
"""

def get_patient_snapshot(patient_id: str) -> str:
    # Read from database.json
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.json")
    try:
        with open(db_path, 'r') as f:
            db = json.load(f)
            patients = db.get("patients", [])
            patient = next((p for p in patients if p["id"] == patient_id), None)
            if patient:
                return json.dumps({
                    "id": patient["id"],
                    "name": patient["name"],
                    "age": patient["age"],
                    "sex": patient["sex"],
                    "diagnosis": patient["diagnosis"],
                    "medications": patient["medications"],
                    "adherenceScore": patient["adherenceScore"],
                    "labs_latest": {k: v[-1] if v else None for k, v in patient.get("labs", {}).items()}
                })
    except Exception as e:
        print(f"Error loading patient snapshot: {e}")
    return f"{{'patient_id': '{patient_id}'}}"

import os

@router.post("/trajectory")
async def get_trajectory(req: ForecastRequest):
    # Try fetching from cache first
    cached = db_service.get_forecast_cache(req.patient_id)
    
    if cached:
        print(f"Serving trajectory for {req.patient_id} from SQLite Cache...")
        
        async def stream_cache():
            cached_json_str = json.dumps(cached)
            # Yield in small chunks to simulate real-time generation smoothly
            chunk_size = 50
            for i in range(0, len(cached_json_str), chunk_size):
                chunk = cached_json_str[i:i+chunk_size]
                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.01)
            yield "data: [DONE]\n\n"
            
        return StreamingResponse(stream_cache(), media_type="text/event-stream")

    print(f"No cache found for {req.patient_id}. Querying live Gemini forecasting engine...")
    patient_snapshot = get_patient_snapshot(req.patient_id)
    
    prompt = (
        "You are a clinical AI forecasting engine. Given the following patient data, generate a 12-month disease progression forecast in strict JSON format matching this schema:\n"
        f"{TRAJECTORY_SCHEMA}\n"
        f"Patient data:\n{patient_snapshot}\n"
        "For each active condition, project monthly risk scores from 0.0 to 1.0 with confidence intervals. Identify the top 5 biomarker drivers with percentage contributions. Predict clinical milestones with probabilities. Calculate risk delta for each intervention. Be scientifically grounded. Return only valid JSON, no prose."
    )
    
    async def stream_live_gemini():
        full_text = ""
        # Read from generator
        for chunk in gemini_service.stream_content(prompt):
            full_text += chunk
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.02)
        
        # Save to cache if valid JSON
        try:
            # Clean formatting characters if present
            clean_text = full_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:-3].strip()
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:-3].strip()
            
            data = json.loads(clean_text)
            # Reformat to match expected cache schema
            db_service.set_forecast_cache(req.patient_id, data)
        except Exception as e:
            print(f"Failed to cache live forecast response: {e}")
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_live_gemini(), media_type="text/event-stream")

@router.post("/simulate")
async def simulate_trajectory(req: SimulationRequest):
    """
    Simulate trajectory based on active interventions. Enforces live Gemini call to highlight the 'wow' moment.
    """
    print(f"Simulating interventions {req.interventions} for patient {req.patient_id} via live Gemini...")
    patient_snapshot = get_patient_snapshot(req.patient_id)
    
    prompt = (
        "You are a clinical AI forecasting engine. Given the following patient data, generate a 12-month disease progression forecast in strict JSON format matching this schema:\n"
        f"{TRAJECTORY_SCHEMA}\n"
        f"Patient data:\n{patient_snapshot}\n"
        f"SIMULATION INTERVENTIONS TO APPLY: {', '.join(req.interventions)}.\n"
        "Rigorously adjust the risk trajectory scores downward for conditions affected by these interventions. "
        "For example, adding Metformin should drop Type 2 Diabetes progression risk by ~20-30% over 12 months. "
        "Return the full JSON structure including the updated trajectories. Return only valid JSON, no prose."
    )
    
    async def stream_simulation():
        for chunk in gemini_service.stream_content(prompt):
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.02)
        yield "data: [DONE]\n\n"
        
    return StreamingResponse(stream_simulation(), media_type="text/event-stream")
