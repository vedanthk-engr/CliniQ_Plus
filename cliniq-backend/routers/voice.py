import os
import json
import base64
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from services.supabase_service import db_service
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

router = APIRouter(prefix="/api/voice", tags=["voice"])

class CommandRequest(BaseModel):
    transcribed_text: str
    current_page: str
    patient_id: str = None
    physician_id: str = "doc-1"

class SynthesizeRequest(BaseModel):
    text: str
    language_code: str = "en-US"
    voice_name: str = "en-IN-Neural2-D"
    speed: float = 1.0

class TranslateRequest(BaseModel):
    text: str
    source_language: str = "auto"
    target_language: str = "en"

# Helper: Clean JSON from Gemini markdown block
def clean_gemini_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error decoding JSON from Gemini output: {e}\nRaw output: {text}")
        return {"error": "Failed to parse JSON", "raw": text}

# 1. /api/voice/transcribe
@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language_code: str = Form("en-US"),
    context: str = Form("command")
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    try:
        # Attempt to use Google Speech-to-Text if credentials exist
        # If not, or if it fails, fall back to Gemini multimodal audio transcription
        try:
            from google.cloud import speech
            client = speech.SpeechClient()
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                model="medical_dictation" if context in ["clinical_note", "consultation"] else "default"
            )
            audio_obj = speech.RecognitionAudio(content=audio_bytes)
            response = client.recognize(config=config, audio=audio_obj)
            
            transcript_parts = []
            for result in response.results:
                transcript_parts.append(result.alternatives[0].transcript)
            
            transcribed_text = " ".join(transcript_parts)
            confidence = response.results[0].alternatives[0].confidence if response.results else 0.9
            
            return {
                "transcribed_text": transcribed_text,
                "detected_language": language_code,
                "confidence": confidence,
                "engine": "google_stt"
            }
        except Exception as e_stt:
            print(f"Google Cloud STT failed/not configured ({e_stt}), falling back to Gemini...")
            
            # Gemini Multimodal Audio Transcription fallback
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            # webm or wav depending on file
            mime_type = audio.content_type or "audio/webm"
            
            prompt = (
                f"Transcribe this audio file into text. The spoken language is {language_code}. "
                "Ensure medical terms and drug names are spelled correctly. "
                "Output ONLY the plain transcription text. Do not include any prefix, quotes, or conversational explanations."
            )
            
            response = model.generate_content([
                {"mime_type": mime_type, "data": audio_bytes},
                prompt
            ])
            
            transcribed_text = response.text.strip()
            return {
                "transcribed_text": transcribed_text,
                "detected_language": language_code,
                "confidence": 0.88,
                "engine": "gemini_multimodal"
            }
    except Exception as e:
        print(f"Transcription failure: {e}")
        return {"error": str(e), "transcribed_text": ""}

# 2. /api/voice/synthesize
@router.post("/synthesize")
def synthesize(req: SynthesizeRequest):
    try:
        # Cache lookup locally using SQLite
        # If cache hit, return immediately
        # We will attempt Google Cloud Text-to-Speech API
        try:
            from google.cloud import texttospeech
            client = texttospeech.TextToSpeechClient()
            s_input = texttospeech.SynthesisInput(text=req.text)
            voice = texttospeech.VoiceSelectionParams(
                language_code=req.language_code,
                name=req.voice_name
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=req.speed
            )
            response = client.synthesize_speech(
                input=s_input, voice=voice, audio_config=audio_config
            )
            
            encoded_audio = base64.b64encode(response.audio_content).decode("utf-8")
            return {
                "audio_base64": encoded_audio,
                "format": "mp3",
                "engine": "google_tts"
            }
        except Exception as e_tts:
            print(f"Google Cloud TTS failed/not configured ({e_tts}), client-side fallback recommended.")
            # Return empty base64 with engine = browser fallback flag
            return {
                "audio_base64": "",
                "format": "mp3",
                "engine": "browser_fallback",
                "text_to_speak": req.text,
                "language_code": req.language_code
            }
    except Exception as e:
        return {"error": str(e)}

# 3. /api/voice/translate
@router.post("/translate")
def translate(req: TranslateRequest):
    try:
        # Google Translation API v3 fallback via Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            f"Translate the following text to '{req.target_language}'. "
            f"If source language is '{req.source_language}', auto-detect it. "
            "Return only the translated text, with no extra formatting, quotes, or introductory text.\n\n"
            f"Text: {req.text}"
        )
        response = model.generate_content(prompt)
        translated_text = response.text.strip()
        
        return {
            "translated_text": translated_text,
            "source_language": req.source_language,
            "target_language": req.target_language
        }
    except Exception as e:
        return {"error": str(e), "translated_text": req.text}

# 4. /api/voice/command
@router.post("/command")
def command(req: CommandRequest):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "You are a clinical voice command interpreter for a physician dashboard called ClinIQ+. "
            f"The physician said: \"{req.transcribed_text}\". They are currently on the \"{req.current_page}\" page "
            f"viewing patient \"{req.patient_id or 'none'}\". "
            "Interpret this as a structured command and return only valid JSON in this exact format: "
            "{\n"
            "  \"action\": \"string\",\n"
            "  \"target\": \"string\",\n"
            "  \"parameters\": {},\n"
            "  \"confidence\": 0.95,\n"
            "  \"clarification_needed\": false,\n"
            "  \"clarification_prompt\": \"\"\n"
            "}\n\n"
            "Possible actions:\n"
            "- navigate_page (target: dashboard, patients, forecasts, analytics, alerts, pillguard, intake, settings)\n"
            "- show_patient (target: patient_id or patient name)\n"
            "- show_biomarker (target: e.g. HbA1c, BP, Creatinine)\n"
            "- run_forecast (target: patient_id)\n"
            "- toggle_intervention (target: metformin, diet, exercise)\n"
            "- explain_alert (target: alert_id)\n"
            "- read_summary (target: dashboard briefing)\n"
            "- search_patient (target: name string)\n"
            "- open_pillguard\n"
            "- show_comorbidity\n"
            "- set_date_range (target: e.g. last 6 months)\n"
            "- export_report\n"
            "- call_patient\n\n"
            "If confidence is below 0.7 set clarification_needed to true and provide a clarification_prompt question to ask the physician. "
            "Return ONLY the JSON block, no markdown formatting."
        )
        
        response = model.generate_content(prompt)
        parsed_action = clean_gemini_json(response.text)
        
        # Log to voice_commands_log
        db_service.log_voice_command(
            physician_id=req.physician_id,
            patient_id=req.patient_id,
            command_text=req.transcribed_text,
            interpreted_action=parsed_action.get("action", "unknown"),
            confidence=parsed_action.get("confidence", 0.0),
            page_context=req.current_page,
            success=1 if not parsed_action.get("clarification_needed", False) else 0
        )
        
        return parsed_action
    except Exception as e:
        print(f"Command processing error: {e}")
        return {
            "action": "unknown",
            "target": "",
            "parameters": {},
            "confidence": 0.0,
            "clarification_needed": True,
            "clarification_prompt": "I experienced a system error. Could you repeat that command?"
        }

# 5. /api/voice/consultation-record
@router.post("/consultation-record")
async def consultation_record(
    audio: UploadFile = File(...),
    patient_id: str = Form(...),
    physician_id: str = Form("doc-1")
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty recording")

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        mime_type = audio.content_type or "audio/webm"
        
        prompt = (
            "You are a clinical scribe. Process this consultation dialog audio between a physician and patient. "
            "First, generate a transcript of the conversation, trying to distinguish the speaker (Physician vs Patient). "
            "Second, extract the following structured clinical notes:\n"
            "- chief_complaint: The primary symptom or reason for visit.\n"
            "- symptoms_mentioned: A list of symptoms (e.g. fatigue, chest pain).\n"
            "- physician_observations: Key observations discussed.\n"
            "- medications_discussed: List of objects, each with 'name', 'dose', and 'frequency'.\n"
            "- follow_up_instructions: Next steps or return advice.\n"
            "- diagnostic_orders: Labs or tests ordered (e.g., echocardiogram, blood test).\n\n"
            "Return a valid JSON object in this exact schema, with no markdown tags or explanations:\n"
            "{\n"
            "  \"raw_transcript\": \"...\",\n"
            "  \"structured_note\": {\n"
            "     \"chief_complaint\": \"...\",\n"
            "     \"symptoms_mentioned\": [...],\n"
            "     \"physician_observations\": \"...\",\n"
            "     \"medications_discussed\": [\n"
            "        {\"name\": \"...\", \"dose\": \"...\", \"frequency\": \"...\"}\n"
            "     ],\n"
            "     \"follow_up_instructions\": \"...\",\n"
            "     \"diagnostic_orders\": [...]\n"
            "  }\n"
            "}"
        )
        
        response = model.generate_content([
            {"mime_type": mime_type, "data": audio_bytes},
            prompt
        ])
        
        parsed_result = clean_gemini_json(response.text)
        
        raw_transcript = parsed_result.get("raw_transcript", "Transcript unavailable.")
        structured_note = parsed_result.get("structured_note", {})
        
        # Save note to local SQLite
        note_id = db_service.save_consultation_note(
            patient_id=patient_id,
            physician_id=physician_id,
            raw_transcript=raw_transcript,
            structured_note_json=structured_note,
            duration_seconds=120, # estimated
            language_code="en-US"
        )
        
        return {
            "id": note_id,
            "raw_transcript": raw_transcript,
            "structured_note": structured_note
        }
    except Exception as e:
        print(f"Scribe endpoint error: {e}")
        return {
            "error": str(e),
            "raw_transcript": "Error during processing.",
            "structured_note": {
                "chief_complaint": "Processing failed",
                "symptoms_mentioned": [],
                "physician_observations": str(e),
                "medications_discussed": [],
                "follow_up_instructions": "Review manually",
                "diagnostic_orders": []
            }
        }

# 6. /api/voice/patient-symptom
@router.post("/patient-symptom")
async def patient_symptom(
    audio: UploadFile = File(...),
    language_code: str = Form("en-US"),
    patient_id: str = Form(...)
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty symptom audio")

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        mime_type = audio.content_type or "audio/webm"
        
        # Transcribe and translate to English
        transcript_prompt = (
            f"The audio is a patient describing symptoms. The spoken language is {language_code}. "
            "First, transcribe this text accurately in the native spoken language. "
            "Second, translate the transcription into English. "
            "Return only a JSON object in this format:\n"
            "{\n"
            "  \"native_transcript\": \"...\",\n"
            "  \"english_translation\": \"...\"\n"
            "}"
        )
        
        t_res = model.generate_content([
            {"mime_type": mime_type, "data": audio_bytes},
            transcript_prompt
        ])
        parsed_trans = clean_gemini_json(t_res.text)
        
        native_text = parsed_trans.get("native_transcript", "")
        english_text = parsed_trans.get("english_translation", "")
        
        # Extract structured data
        extraction_prompt = (
            "A patient described their symptoms in natural language. "
            f"Transcript (English): \"{english_text}\". "
            "Extract: primary complaint, symptom duration, severity (1-10), associated symptoms, relevant history mentions. "
            "Also generate a patient-friendly, reassuring clinical advice response. "
            "Return only a JSON object in this format:\n"
            "{\n"
            "  \"primary_complaint\": \"...\",\n"
            "  \"duration\": \"...\",\n"
            "  \"severity\": 5,\n"
            "  \"associated_symptoms\": [...],\n"
            "  \"history_mentions\": [...],\n"
            "  \"reassuring_advice_english\": \"...\"\n"
            "}"
        )
        
        e_res = model.generate_content(extraction_prompt)
        extracted_data = clean_gemini_json(e_res.text)
        
        # Translate the reassuring advice back to the patient's language
        advice_en = extracted_data.get("reassuring_advice_english", "Thank you, I have logged your symptoms. The doctor will review them shortly.")
        
        trans_back_prompt = (
            f"Translate the following patient reassurance text into the patient's native language code: {language_code}. "
            "Ensure the tone is warm, empathetic, and culturally appropriate. "
            "Return ONLY the translated text, no quotes or additional information.\n\n"
            f"Text: {advice_en}"
        )
        
        tb_res = model.generate_content(trans_back_prompt)
        advice_native = tb_res.text.strip()
        
        # Save interaction log
        db_service.save_patient_interaction(
            patient_id=patient_id,
            physician_id="doc-1",
            spoken_input=native_text,
            detected_language=language_code,
            structured_output_json=extracted_data,
            physician_alerted=1 if extracted_data.get("severity", 0) >= 7 else 0
        )
        
        return {
            "native_transcript": native_text,
            "english_translation": english_text,
            "structured_data": extracted_data,
            "patient_reassurance_native": advice_native
        }
        
    except Exception as e:
        print(f"Patient symptom endpoint error: {e}")
        return {
            "error": str(e),
            "native_transcript": "",
            "english_translation": "",
            "structured_data": {},
            "patient_reassurance_native": "Error processing your request. Please tell your doctor directly."
        }
