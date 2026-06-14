import json
import os
import google.generativeai as genai

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
            (
                p
                for p in patients
                if p.get("id") == patient_id
            ),
            None
        )

        return patient or {}

    except Exception as e:

        print("Patient fetch error:", e)

        return {}


async def run_voice_query(
    query: str,
    patient_id: str
):

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

    try:

        return json.loads(response.text)

    except Exception:

        return {
            "response_type": "patient_summary",
            "intent_detected": query,
            "summary": response.text,
            "data": {},
            "confidence": "low"
        }
