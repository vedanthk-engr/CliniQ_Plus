import json
import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

DB_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "database.json"
)

VOICE_SYSTEM_PROMPT = """
You are CliniQ Clinical AI.

You answer doctor voice queries.

Supported intents:

1. lab_trend
2. patient_summary
3. drug_check
4. alert_review
5. adherence_check

Return ONLY valid JSON.

Schema:

{
  "response_type":"",
  "intent_detected":"",
  "summary":"",
  "data":{},
  "confidence":"high"
}
"""


def get_patient_context(patient_id):
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            db = json.load(f)

        patients = db.get("patients", [])
        patient = next(
            (p for p in patients if p.get("id") == patient_id),
            None
        )
        return patient or {}
    except Exception as e:
        print("Patient fetch error:", e)
        return {}


def _run_gemini_query(query: str, patient_id: str):
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Add it to cliniq-backend/.env"
        )

    patient = get_patient_context(patient_id)

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=VOICE_SYSTEM_PROMPT
    )

    prompt = f"""
PATIENT DATA:

{json.dumps(patient, indent=2)}

DOCTOR QUERY:

{query}

Return JSON only.
"""

    response = model.generate_content(
        prompt,
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    )

    if not response.text:
        block_reason = getattr(response, "prompt_feedback", None)
        raise RuntimeError(f"Empty Gemini response. Feedback: {block_reason}")

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "response_type": "patient_summary",
            "intent_detected": query,
            "summary": response.text,
            "data": {},
            "confidence": "low"
        }


async def run_voice_query(query: str, patient_id: str):
    return await asyncio.to_thread(_run_gemini_query, query, patient_id)
