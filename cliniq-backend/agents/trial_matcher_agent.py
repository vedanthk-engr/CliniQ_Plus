import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)


def extract_trials_from_studies(studies: list) -> list:
    """Extract relevant fields from raw ClinicalTrials.gov study objects."""
    extracted = []
    for study in studies[:5]:  # cap at 5 for speed
        protocol = study.get("protocolSection", {})
        ident = protocol.get("identificationModule", {})
        eligibility = protocol.get("eligibilityModule", {})
        desc = protocol.get("descriptionModule", {})
        design = protocol.get("designModule", {})

        # Truncate heavy text fields to keep Gemini prompt small & fast
        raw_eligibility = eligibility.get("eligibilityCriteria", "Not specified")
        raw_summary = desc.get("briefSummary", "No summary available.")

        extracted.append({
            "nctId": ident.get("nctId", "Unknown"),
            "briefTitle": ident.get("briefTitle", "Unknown Title"),
            "eligibilityCriteria": raw_eligibility[:600] + ("..." if len(raw_eligibility) > 600 else ""),
            "minimumAge": eligibility.get("minimumAge", "Not specified"),
            "maximumAge": eligibility.get("maximumAge", "Not specified"),
            "sex": eligibility.get("sex", "Not specified"),
            "briefSummary": raw_summary[:300] + ("..." if len(raw_summary) > 300 else ""),
            "phases": design.get("phases", [])
        })
    return extracted


async def screen_trials_with_gemini(patient: dict, studies: list) -> dict:
    """
    Accept raw studies from the frontend (fetched by browser to avoid IP blocks)
    and screen them against the patient using Gemini.
    """
    try:
        diagnoses = patient.get("diagnosis", [])
        age = patient.get("age", 0)
        sex = patient.get("sex", "Unknown")

        if not studies:
            return {"patient_id": patient.get("id"), "matches": [], "total_searched": 0}

        extracted_trials = extract_trials_from_studies(studies)

        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
You are an expert clinical trial matching AI. Your task is to evaluate the following patient against a list of recruiting clinical trials.

Patient Data:
- Diagnoses: {', '.join(diagnoses)}
- Age: {age}
- Sex: {sex}

Trials to evaluate:
{json.dumps(extracted_trials, indent=2)}

For each trial, determine if the patient is eligible based on their demographics and conditions compared to the trial's eligibility criteria.
Assess the following for each trial:
- eligible: one of "likely" | "possible" | "unlikely"
- confidence: float between 0 and 1
- match_reasons: list of strings explaining why the patient qualifies (or might qualify)
- disqualifiers: list of strings flagging potential blockers
- priority_score: integer 1 to 10 (higher means better match)

You MUST return ONLY a valid JSON array of objects. Do not wrap it in markdown backticks. Do not include any preamble or explanation.
Each object must contain the original 'nctId', 'briefTitle', 'phases', and your evaluation fields ('eligible', 'confidence', 'match_reasons', 'disqualifiers', 'priority_score').
"""

        chat = model.start_chat()
        res = chat.send_message(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )

        try:
            evaluated_trials = json.loads(res.text)
        except json.JSONDecodeError as e:
            return {"error": f"Failed to parse AI response: {e}"}

        evaluated_trials.sort(key=lambda x: x.get("priority_score", 0), reverse=True)

        return {
            "patient_id": patient.get("id"),
            "matches": evaluated_trials,
            "total_searched": len(studies)
        }

    except Exception as e:
        return {"error": str(e)}
