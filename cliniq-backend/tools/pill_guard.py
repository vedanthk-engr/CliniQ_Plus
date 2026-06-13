import google.generativeai as genai
import base64
from PIL import Image
import io
from mock_data import PATIENTS

def send_medication_reminder(patient_id: str, dose_time: str, medications: list) -> dict:
    # Simulate WhatsApp dispatch — log and return success
    print(f"[WHATSAPP] Reminder sent to {patient_id} at {dose_time}: {medications}")
    return { 'status': 'sent', 'patient_id': patient_id, 'dose_time': dose_time }

def verify_pill_vision(image_base64: str, prescription_id: str) -> dict:
    # Use Gemini Vision to identify the pill
    model = genai.GenerativeModel('gemini-2.5-flash')
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data))
    prompt = '''
    You are a pharmaceutical identification AI. Examine this pill image carefully.
    Identify: shape (round/oval/capsule/other), primary color, any visible markings or imprints,
    approximate size (small/medium/large).
    Return ONLY a JSON object: {"shape": "round", "color": "white", "markings": "XYZ", "size": "small", "confidence_pct": 98}
    '''
    response = model.generate_content([prompt, image])
    return { 'vision_result': response.text, 'prescription_id': prescription_id }

def log_dose_event(patient_id: str, dose_time: str, status: str, notes: str = '') -> dict:
    print(f"[LOG] {patient_id} | {dose_time} | {status} | {notes}")
    return { 'logged': True, 'patient_id': patient_id, 'status': status }

def escalate_to_caregiver(patient_id: str, reason: str, severity: str, evidence: str) -> dict:
    print(f"[ESCALATION] Patient {patient_id} | {severity} | {reason}")
    return { 'escalated': True, 'severity': severity }

def generate_adherence_report(patient_id: str, week_start: str) -> dict:
    patient = next((p for p in PATIENTS if p['id'] == patient_id), None)
    if not patient: return {'error': 'Not found'}
    
    calendar = patient.get('adherenceCalendar', [])
    if not calendar: return {'error': 'No calendar data'}
    
    total = len(calendar) * 3
    # For simulation, just assume the 'boolean' took state maps to all 3 doses per day confirmed.
    confirmed = sum(3 for d in calendar if d is True)
    
    return { 
        'adherence_pct': round(confirmed/total*100) if total > 0 else 0, 
        'total_doses': total,
        'confirmed': confirmed, 
        'week_start': week_start 
    }
