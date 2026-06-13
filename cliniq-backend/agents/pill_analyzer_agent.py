import google.generativeai as genai
import os
import json
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables from the backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Ensure API key is configured
api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

# Use a highly capable vision model for accurate medical identification
MODEL_NAME = "gemini-2.5-flash"

def analyze_pill_images(front_image_bytes, back_image_bytes):
    """
    Takes the bytes of two pill images (front and back), sends them to Gemini 1.5 Flash, 
    and returns a structured JSON string with the requested pill details.
    """
    
    # Check if we have an API key. If not, return a mock response for now
    if not os.environ.get("GEMINI_API_KEY"):
        print("WARNING: GEMINI_API_KEY not found in environment. Returning mock data.")
        return json.dumps({
            "name": "Mock Tylenol (Acetaminophen)",
            "expiry_date": "2026-10-01",
            "manufacturing_date": "2024-05-15",
            "disease_used_for": "Fever, Mild to moderate pain",
            "dosage": "500mg, typically 1-2 tablets every 4-6 hours.",
            "side_effects": "Liver damage (if overused), nausea, allergic reactions.",
            "precautions": "Do not exceed 4000mg per day. Avoid alcohol."
        })
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Load images
        front_img = Image.open(io.BytesIO(front_image_bytes))
        back_img = Image.open(io.BytesIO(back_image_bytes))
        
        prompt = """
        You are an expert pharmacist and medical AI assistant with absolute precision.
        I have provided two images of a tablet/pill: one of the front side and one of the back side.
        
        CRITICAL GOAL: Correctly identify the EXACT medication based solely on its visual features.

        STEP 1. CHAIN OF THOUGHT (Internal Reasoning):
        Examine the images closely and internally answer the following questions:
        - What is the exact color?
        - What is the exact shape (e.g., round, oval, oblong, capsule)?
        - Is there a score mark (indentation line)?
        - Are there ANY letters, numbers, or symbols imprinted on EITHER side? (This is the most critical feature).
        
        STEP 2. IDENTIFY:
        Based on the features found in Step 1, identify the medication. 
        If the images are very blurry, or if no distinguishing marks are visible making positive identification impossible, you MUST fail gracefully and set the "name" to "Unidentified". Do not guess if you are unsure.
        
        STEP 3. OUTPUT:
        Once identified, extract and provide the following information formatted strictly as a JSON object, with no markdown code blocks around it.

        Required JSON structure:
        {
            "name": "<Exact Name of the tablet/medication (e.g., Acetaminophen 500mg) or 'Unidentified'>",
            "expiry_date": "<Estimated expiry date if visible anywhere in the image, else 'Not clearly visible'>",
            "manufacturing_date": "<Estimated manufacturing date if visible anywhere in the image, else 'Not clearly visible'>",
            "disease_used_for": "<Brief description of what disease/condition it is used to treat>",
            "dosage": "<Common dosage instructions for this form>",
            "side_effects": "<Key specific side effects, not generic ones>",
            "precautions": "<Key rigorous precautions or contraindications>"
        }
        """
        
        # Lowering temperature significantly to ensure deterministic, highly accurate factual output
        generation_config = genai.types.GenerationConfig(temperature=0.1)
        
        response = model.generate_content(
            [prompt, front_img, back_img],
            generation_config=generation_config
        )
        
        text_response = response.text.strip()
        
        # Strip potential markdown code blocks like ```json ... ```
        if text_response.startswith('```'):
            lines = text_response.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines[-1].startswith('```'):
                lines = lines[:-1]
            text_response = '\n'.join(lines).strip()
            
        return text_response
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return json.dumps({
            "error": "Failed to analyze pill images.",
            "details": str(e)
        })
