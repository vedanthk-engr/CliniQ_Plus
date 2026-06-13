from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import time
import asyncio
import os
from services.supabase_service import db_service
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["comorbidity"])

class ComorbidityRequest(BaseModel):
    patient_id: str

class SecondOpinionRequest(BaseModel):
    patient_id: str
    hypothesis: str

COMORBIDITY_SCHEMA = """
{
  "nodes": [
    { "id": string, "condition": string, "severity": float, "icd_code": string, "description": string }
  ],
  "edges": [
    { "source": string, "target": string, "strength": float, "direction": "amplifying" | "counteracting", "mechanism": string }
  ]
}
"""

def get_patient_snapshot(patient_id: str) -> str:
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

@router.post("/comorbidity/web")
async def get_comorbidity_web(req: ComorbidityRequest):
    cached = db_service.get_comorbidity_cache(req.patient_id)
    if cached:
        print(f"Serving comorbidity web for {req.patient_id} from SQLite Cache...")
        async def stream_cache():
            cached_json_str = json.dumps(cached)
            chunk_size = 50
            for i in range(0, len(cached_json_str), chunk_size):
                chunk = cached_json_str[i:i+chunk_size]
                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.01)
            yield "data: [DONE]\n\n"
        return StreamingResponse(stream_cache(), media_type="text/event-stream")

    print(f"No cache found for {req.patient_id}. Querying live Gemini comorbidity web engine...")
    patient_snapshot = get_patient_snapshot(req.patient_id)
    
    prompt = (
        "You are a clinical AI comorbidity engine. Construct a condition-link interaction network graph for this patient. "
        "Each condition the patient has should be a node. Each link (edge) represents a pathological correlation, amplification, or counteraction. "
        "Generate nodes and edges in strict JSON matching this schema:\n"
        f"{COMORBIDITY_SCHEMA}\n"
        f"Patient snapshot:\n{patient_snapshot}\n"
        "Explain the physiological mechanism in the mechanism field for each edge. Return only valid JSON, no prose."
    )
    
    async def stream_live_gemini():
        full_text = ""
        for chunk in gemini_service.stream_content(prompt):
            full_text += chunk
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.02)
            
        try:
            clean_text = full_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:-3].strip()
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:-3].strip()
            data = json.loads(clean_text)
            db_service.set_comorbidity_cache(req.patient_id, data)
        except Exception as e:
            print(f"Failed to cache comorbidity web response: {e}")
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_live_gemini(), media_type="text/event-stream")

@router.post("/second-opinion")
async def execute_second_opinion(req: SecondOpinionRequest):
    """
    Stress-test clinical hypothesis against patient profile history and stream verdict.
    Enforces live Gemini call to highlight the 'wow' moment.
    """
    print(f"Executing Second Opinion for patient {req.patient_id} and hypothesis: {req.hypothesis}...")
    patient_snapshot = get_patient_snapshot(req.patient_id)
    
    prompt = (
        "You are a clinical second opinion engine. "
        f"Given this hypothesis about patient: \"{req.hypothesis}\". "
        f"Stress-test this against their complete clinical profile data:\n{patient_snapshot}\n"
        "You must analyze support, contradictions, and insufficient evidence points. "
        "First, return a structured header containing confidence_score (0-100) and verdict (SUPPORTED | CONTRADICTED | INSUFFICIENT EVIDENCE). "
        "Then, stream a detailed, multi-step evidence chain explaining why this verdict was reached, citing specific lab readings, medications, and risk multipliers. "
        "Structure the streaming response as a clean clinical brief. "
        "Format the first line exactly as: [VERDICT: <verdict> | CONFIDENCE: <confidence_score>] "
        "Followed by a blank line, and then the markdown-formatted detailed explanation."
    )
    
    async def stream_second_opinion():
        full_text = ""
        for chunk in gemini_service.stream_content(prompt):
            full_text += chunk
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0.02)
            
        # Parse and save the results in the database log
        try:
            verdict = "INSUFFICIENT EVIDENCE"
            confidence = 50
            
            # Simple extraction from [VERDICT: ... | CONFIDENCE: ...]
            first_line = full_text.split("\n")[0]
            if "VERDICT:" in first_line:
                parts = first_line.replace("[", "").replace("]", "").split("|")
                for p in parts:
                    if "VERDICT:" in p:
                        verdict = p.split(":")[1].strip()
                    if "CONFIDENCE:" in p:
                        try:
                            confidence = int(p.split(":")[1].strip())
                        except:
                            pass
            
            # Save opinion to the database
            db_service.save_second_opinion(
                patient_id=req.patient_id,
                hypothesis=req.hypothesis,
                confidence_score=confidence,
                verdict=verdict,
                evidence_chain=full_text
            )
        except Exception as e:
            print(f"Failed to save second opinion log: {e}")
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_second_opinion(), media_type="text/event-stream")
