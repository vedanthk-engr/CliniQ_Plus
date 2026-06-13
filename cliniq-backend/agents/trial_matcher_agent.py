import os
import httpx
import json
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

async def match_clinical_trials(patient: dict) -> dict:
    try:
        # Extract patient information
        diagnoses = patient.get("diagnosis", [])
        age = patient.get("age", 0)
        sex = patient.get("sex", "Unknown")
        
        if not diagnoses:
            return {"error": "Patient has no diagnoses to match."}

        # Query ClinicalTrials.gov v2 API
        query_cond = " OR ".join(diagnoses)
        url = "https://clinicaltrials.gov/api/v2/studies"
        params = {
            "query.cond": query_cond,
            "filter.overallStatus": "RECRUITING",
            "pageSize": 15,
            "format": "json"
        }

        headers = {"User-Agent": "CliniQ/1.0 (https://github.com/vedanthk-engr/CliniQ_Plus)"}
        async with httpx.AsyncClient(headers=headers) as client:
            response = await client.get(url, params=params, timeout=15.0)
            response.raise_for_status()
            data = response.json()

        studies = data.get("studies", [])
        if not studies:
            return {"patient_id": patient.get("id"), "matches": [], "total_searched": 0}

        # Extract relevant fields
        extracted_trials = []
        for study in studies:
            protocol = study.get("protocolSection", {})
            ident = protocol.get("identificationModule", {})
            eligibility = protocol.get("eligibilityModule", {})
            desc = protocol.get("descriptionModule", {})
            design = protocol.get("designModule", {})

            extracted_trials.append({
                "nctId": ident.get("nctId", "Unknown"),
                "briefTitle": ident.get("briefTitle", "Unknown Title"),
                "eligibilityCriteria": eligibility.get("eligibilityCriteria", "Not specified"),
                "minimumAge": eligibility.get("minimumAge", "Not specified"),
                "maximumAge": eligibility.get("maximumAge", "Not specified"),
                "sex": eligibility.get("sex", "Not specified"),
                "briefSummary": desc.get("briefSummary", "No summary available."),
                "phases": design.get("phases", [])
            })

        # Ask Gemini to screen the trials
        model = genai.GenerativeModel('gemini-2.5-flash')
        
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
        
        # Enforce JSON via generation config
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

        # Sort by priority_score descending
        evaluated_trials.sort(key=lambda x: x.get("priority_score", 0), reverse=True)

        return {
            "patient_id": patient.get("id"),
            "matches": evaluated_trials,
            "total_searched": len(studies)
        }

    except httpx.HTTPStatusError as e:
        return {"error": f"ClinicalTrials.gov API returned {e.response.status_code}"}
    except httpx.RequestError as e:
        return {"error": f"Failed to connect to ClinicalTrials.gov: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}
