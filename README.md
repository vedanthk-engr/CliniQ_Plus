# ClinIQ Agent Setup & Architecture

## Setup Instructions

### Backend (FastAPI + Python Agents)
1. **Environment Variables**: Create a `.env` file in the `cliniq-backend` directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
2. **Install Dependencies**: Ensure you have Python 3.10+ installed.
   ```bash
   cd cliniq-backend
   pip install fastapi uvicorn pydantic python-dotenv google-generativeai pillow
   ```
3. **Run Backend Service**:
   ```bash
   python main.py
   ```
   *Runs on http://localhost:8000*

### Frontend (React + Vite)
1. **Install Dependencies**: Ensure Node.js is installed.
   ```bash
   npm install
   ```
2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   *Runs on http://localhost:5173*

## Agent Architecture Overview
The Agent system is built around Gemini Function Calling (using `gemini-2.5-flash`), with multiple simulated internal and external mock-hospital APIs to gather context, check safety, and make autonomous decisions.

### Multi-Step Reasoning Example
When a user asks: *"Check patient P-00142's HbA1c trends over the last 6 months and ensure their current medication has no adverse drug reactions."*

- **Step 1 (Perception)**: Agent understands the intent, identifies the patient ID.
- **Step 2 (Action - Tool Call)**: Calls `extract_lab_trends` for `HbA1c` and receives the upward (worsening) trend data.
- **Step 3 (Action - Tool Call)**: Calls `get_patient_case_sheet` to fetch active medications.
- **Step 4 (Action - Tool Call)**: Calls `check_drug_interactions` with the medication list to find pharmacological conflicts.
- **Step 5 (Synthesis)**: Summarizes the findings gracefully and presents the results.

### Edge Case Handling
- **Missing Patient Records**: The `get_patient_case_sheet` function handles invalid IDs and returns a specific `{'error': 'Patient not found'}` JSON object, which Gemini parses to politely notify the user.
- **Empty Labs Data**: If an expected lab trend (e.g., HbA1c) isn't present in the mock data, the tool returns `{'error': 'No HbA1c data for P-XXXX'}` and avoids throwing a fatal exception.

---
*For the architecture diagram, check `architecture.md` (or the rendered Mermaid graph).*
