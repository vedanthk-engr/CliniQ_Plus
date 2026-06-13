import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

class GeminiService:
    def __init__(self, model_name="gemini-2.5-flash"):
        self.model_name = model_name

    def generate_content(self, prompt: str) -> str:
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error in Gemini generate_content: {e}")
            raise e

    def generate_json(self, prompt: str) -> dict:
        """
        Sends a prompt to Gemini and enforces JSON extraction from the markdown wrapper.
        """
        try:
            response_text = self.generate_content(prompt)
            # Find JSON block
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            
            # Try raw parsing if no braces search
            return json.loads(response_text)
        except Exception as e:
            print(f"Error parsing Gemini JSON: {e}")
            # Fallback to an empty dictionary or a structured error format
            return {"error": "Failed to parse JSON", "raw": response_text}

    def stream_content(self, prompt: str):
        """
        Streams response token by token. Yields text chunks.
        """
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            print(f"Error in Gemini stream_content: {e}")
            yield f"\n[AI Stream Error: {str(e)}]"

gemini_service = GeminiService()
