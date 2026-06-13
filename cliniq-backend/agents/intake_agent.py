import google.generativeai as genai
import os
import base64
import json
from dotenv import load_dotenv

# Load environment variables from the backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Check for Gemini API key in multiple common environment variables
api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

def run_intake_extraction(file_base64: str, file_type: str = "application/pdf", expected_patient_name: str = None, is_new_patient: bool = False, document_type: str = "discharge_summary") -> dict:
    """
    Extracts structured medical data from a document and validates it against the expected patient.
    """
    print(f"Executing Gemini Intake Agent. New Patient: {is_new_patient}, Expected: {expected_patient_name}...")
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Strip data string header if present
        if "," in file_base64:
            file_base64 = file_base64.split(",")[1]
            
        file_data = base64.b64decode(file_base64)
        
        validation_logic = ""
        if is_new_patient:
            validation_logic = """
        NEW PATIENT PROFILE MODE:
        - The user is intent on creating a NEW patient profile from this document.
        - Your goal is to extract the patient's name reliably from the document.
        - Set 'patient_match' to 'match' because this document IS the source of truth for the new profile.
        - Set 'extracted_name' to the name found in the document.
            """
        else:
            validation_logic = f"""
        PATIENT VALIDATION:
        The current patient in the system is: "{expected_patient_name if expected_patient_name else 'Unknown'}".
        1. Search for the patient's name across ALL pages of the document. 
        2. If a name is found on ANY page, use it for validation.
        3. Compare the found name with "{expected_patient_name if expected_patient_name else 'Unknown'}".
        4. Set 'patient_match' to:
           - "match" (exact or clearly the same person)
           - "partial" (similar name or nickname found)
           - "mismatch" (a clearly different name found)
           - "not_found" (no name found on any page)
            """

        type_logic = ""
        if "imaging" in document_type.lower():
            type_logic = """
        DOCUMENT TYPE: IMAGING (X-Ray / MRI / CT)
        - Since this is an imaging scan, DO NOT attempt to hallucinate medications, detailed vitals, or dietary restrictions.
        - Prioritize extracting the "Diagnosis" and "Imaging Analysis".
        - For fields like medications, vitals, etc., naturally return "Not mentioned" or omit values.
        - Ensure "document_type" is returned literally as "imaging".
            """
        else:
            type_logic = """
        DOCUMENT TYPE: PRESCRIPTION / DISCHARGE SUMMARY
        - Prioritize extracting all biometric vitals, medications, diagnoses, and regimens.
        - Ensure "document_type" is returned literally as "discharge_summary".
            """

        prompt = f'''
        You are a highly accurate medical data extraction AI. 
        Your task is to parse the attached medical document and extract clinical information.
        
        {validation_logic}
        
        {type_logic}
        
        Fields to extract:
        1. Document Type: Identify all types present in the document.
        2. Diagnosis: Primary and secondary diagnoses.
        3. Medications: List of prescribed medications with dosage and frequency.
        4. Vitals: Extract specific numeric values for Blood Pressure (sys/dia), Heart Rate (bpm), and Blood Glucose/Sugar if available.
        5. Vital Thresholds: Any mentioned thresholds for vitals that require attention.
        6. Dietary Restrictions: Specific food items or diets to follow or avoid.
        7. Activity Limitations: Physical activity restrictions or recommendations.
        8. Follow-up Date: The date for the next medical appointment.
        9. Imaging Analysis: Provide a detailed "Radiological Impression" for any imaging.
        
        IMPORTANT:
        - Extract ALL relevant clinical data found across ALL pages.
        - For 'vitals', provide a structured object: {{"bp": "120/80", "hr": "72", "glucose": "95", "raw": "..."}}
        
        Return ONLY a JSON object:
        {{
          "patient_match": "match" | "partial" | "mismatch" | "not_found",
          "extracted_name": "...",
          "document_type": "string",
          "diagnosis": {{"value": "...", "confidence": 95}},
          "medications": {{"value": "...", "confidence": 98}},
          "vitals": {{"value": {{"bp": "...", "hr": "...", "glucose": "...", "raw": "..."}}, "confidence": 90}},
          "vital_thresholds": {{"value": "...", "confidence": 90}},
          "dietary_restrictions": {{"value": "...", "confidence": 85}},
          "activity_limitations": {{"value": "...", "confidence": 92}},
          "follow_up_date": {{"value": "...", "confidence": 99}},
          "imaging_analysis": {{"value": "...", "confidence": 85}}
        }}
        '''
        
        response = model.generate_content([
            prompt,
            {
                "mime_type": file_type,
                "data": file_data
            }
        ])
        
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        return json.loads(content)
        
    except Exception as e:
        print(f"Error executing Intake Agent: {str(e)}")
        return { 'error': str(e) }
