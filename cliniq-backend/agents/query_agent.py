import os
import google.generativeai as genai
from dotenv import load_dotenv
from tools.case_sheet import *
from tools.pill_guard import *

# Load environment variables from the backend root (.env is in the parent of the agents directory)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Check for Gemini API key in multiple common environment variables
api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

TOOL_DEFINITIONS = [{ 'function_declarations': [
  { 'name': 'get_patient_case_sheet',
    'description': 'Get the full clinical history for a patient by ID',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string', 'description': 'Patient ID e.g. P-00142' }
    }, 'required': ['patient_id'] } },
  { 'name': 'extract_lab_trends',
    'description': 'Get time-series trend for a specific lab test for a patient',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'test_name':  { 'type': 'string', 'description': 'e.g. HbA1c, Creatinine, BP_Systolic' },
      'date_range': { 'type': 'string', 'description': 'e.g. last 6 months' }
    }, 'required': ['patient_id', 'test_name'] } },
  { 'name': 'check_drug_interactions',
    'description': 'Check for drug interaction alerts given a medication list',
    'parameters': { 'type': 'object', 'properties': {
      'medication_list': { 'type': 'array', 'items': { 'type': 'string' } }
    }, 'required': ['medication_list'] } },
  { 'name': 'generate_consultation_brief',
    'description': 'Generate the pre-consultation brief for a patient',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' }
    }, 'required': ['patient_id'] } },
  { 'name': 'get_clinical_guideline',
    'description': 'Get standard clinical guidelines for a diagnosis code like T2DM, HTN',
    'parameters': { 'type': 'object', 'properties': {
      'diagnosis_code': { 'type': 'string' },
      'query_type': { 'type': 'string' }
    }, 'required': ['diagnosis_code'] } },
  { 'name': 'flag_clinical_pattern',
    'description': 'Find clinical patterns (e.g. Lab Good, Vitals, Renal) for a patient',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'pattern_type': { 'type': 'string' }
    }, 'required': ['patient_id', 'pattern_type'] } },
    
  # Pill Guard Tools
  { 'name': 'send_medication_reminder',
    'description': 'Trigger a reminder ping to patient phone',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'dose_time': { 'type': 'string' },
      'medications': { 'type': 'array', 'items': {'type': 'string'} }
    }, 'required': ['patient_id', 'dose_time', 'medications'] } },
  { 'name': 'log_dose_event',
    'description': 'Log an adherence or missed dose event into patient history',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'dose_time': { 'type': 'string' },
      'status': { 'type': 'string', 'description': 'confirmed, missed, wrong' },
      'notes': { 'type': 'string' }
    }, 'required': ['patient_id', 'dose_time', 'status'] } },
  { 'name': 'escalate_to_caregiver',
    'description': 'Alert a family member or nurse regarding extreme non-compliance or wrong pills',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'reason': { 'type': 'string' },
      'severity': { 'type': 'string' },
      'evidence': { 'type': 'string' }
    }, 'required': ['patient_id', 'reason', 'severity', 'evidence'] } },
  { 'name': 'generate_adherence_report',
    'description': 'Pull total adherence percentage for a week',
    'parameters': { 'type': 'object', 'properties': {
      'patient_id': { 'type': 'string' },
      'week_start': { 'type': 'string' }
    }, 'required': ['patient_id', 'week_start'] } },
]}]

TOOL_MAP = {
  'get_patient_case_sheet': get_patient_case_sheet,
  'extract_lab_trends': extract_lab_trends,
  'check_drug_interactions': check_drug_interactions,
  'generate_consultation_brief': generate_consultation_brief,
  'flag_clinical_pattern': flag_clinical_pattern,
  'get_clinical_guideline': get_clinical_guideline,
  'send_medication_reminder': send_medication_reminder,
  'log_dose_event': log_dose_event,
  'escalate_to_caregiver': escalate_to_caregiver,
  'generate_adherence_report': generate_adherence_report,
}

def run_nl_query(query: str, patient_id: str) -> str:
    print(f"Executing Gemini Query Agent for {patient_id}... Query: {query}")
    try:
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            tools=TOOL_DEFINITIONS
        )
        system = (
            f"You are ClinIQ, a physician AI co-pilot. Patient context ID: {patient_id}. "
            "Your goal is to extract, summarize, and surface relevant clinical insights from the patient case sheet. "
            "Use the available tools to answer clinical questions, detect patterns, or provide a 'Second Opinion'. "
            "When providing a Second Opinion, rigorously scan for corroborating evidence (supporting the physician's hypothesis) "
            "and contradicting findings (flags or trends that suggest an alternative). "
            "Be extremely specific, cited (mention values/dates), and concise. Assume the user is an expert doctor. "
            "Frame all outputs as insights for physician review, never as final clinical decisions."
        )
        chat = model.start_chat()
        response = chat.send_message(f"{system} Query: {query}")

        # Multi-step Function Call Loop
        loop_counter = 0
        while loop_counter < 10:
            loop_counter += 1
            
            # Check if current response has a function call
            if not response.candidates or not response.candidates[0].content.parts:
                break
                
            fn_call = None
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'function_call') and part.function_call.name:
                    fn_call = part.function_call
                    break
            
            if not fn_call:
                break

            args_dict = dict(fn_call.args) if fn_call.args else {}
            
            if fn_call.name in TOOL_MAP:
                try:
                    fn_result = TOOL_MAP[fn_call.name](**args_dict)
                except Exception as ef:
                    fn_result = {'error': str(ef)}
            else:
                fn_result = {'error': f'Function {fn_call.name} not available'}

            # Send the tool output back to the model
            response = chat.send_message(
                genai.protos.Content(
                parts=[genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=fn_call.name,
                        response={'result': str(fn_result)}
                    ))])
            )
            
        return response.text
    except Exception as e:
        print(f"Error executing Query Agent: {str(e)}")
        return f"AI Agent encountered a system failure: {str(e)}"
