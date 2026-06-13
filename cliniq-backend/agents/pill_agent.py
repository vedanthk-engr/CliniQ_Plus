import google.generativeai as genai
import os
import base64
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables from the backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Check for Gemini API key in multiple common environment variables
api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

def run_vision_agent(image_base64: str, prescription_id: str) -> dict:
    print(f"Executing Gemini Vision Agent for prescription {prescription_id}...")
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Remove data string header if present (e.g. data:image/jpeg;base64,...)
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
            
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
        
    except Exception as e:
        print(f"Error executing Pill Vision Agent: {str(e)}")
        return { 'error': str(e), 'prescription_id': prescription_id }
