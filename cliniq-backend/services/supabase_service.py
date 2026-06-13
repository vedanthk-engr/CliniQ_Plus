import os
import sqlite3
import json
from datetime import datetime

# Path to the database files
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cliniq.db")
JSON_DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.json")

class SupabaseService:
    def __init__(self):
        # We will use SQLite locally to mock all Supabase operations.
        # This keeps the environment completely self-contained and failsafe.
        self.db_path = DB_FILE
        self._init_sqlite_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite_db(self):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # Create forecast_cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS forecast_cache (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                generated_at TEXT,
                trajectory_json TEXT,
                drivers_json TEXT,
                milestones_json TEXT,
                interventions_json TEXT,
                expires_at TEXT
            )
        """)
        
        # Create comorbidity_web_cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comorbidity_web_cache (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                generated_at TEXT,
                nodes_json TEXT,
                edges_json TEXT,
                expires_at TEXT
            )
        """)
        
        # Create alert_explanations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alert_explanations (
                id TEXT PRIMARY KEY,
                alert_id TEXT,
                explanation_text TEXT,
                generated_at TEXT
            )
        """)
        
        # Create organ_assessments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS organ_assessments (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                organ TEXT,
                risk_score INTEGER,
                summary_text TEXT,
                biomarkers_json TEXT,
                generated_at TEXT
            )
        """)
        
        # Create second_opinions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS second_opinions (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                hypothesis TEXT,
                confidence_score INTEGER,
                verdict TEXT,
                evidence_chain TEXT,
                generated_at TEXT
            )
        """)
        
        conn.commit()
        conn.close()

    # --- Forecast Cache Methods ---
    def get_forecast_cache(self, patient_id: str):
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM forecast_cache WHERE patient_id = ? ORDER BY generated_at DESC LIMIT 1",
            (patient_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            # Check if expired
            expires_at = datetime.fromisoformat(row["expires_at"])
            if expires_at > datetime.utcnow():
                return {
                    "patient_id": row["patient_id"],
                    "generated_at": row["generated_at"],
                    "trajectory": json.loads(row["trajectory_json"]),
                    "forecast_drivers": json.loads(row["drivers_json"]),
                    "milestones": json.loads(row["milestones_json"]),
                    "intervention_impacts": json.loads(row["interventions_json"])
                }
        return None

    def set_forecast_cache(self, patient_id: str, data: dict, expires_in_seconds: int = 3600):
        import uuid
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.utcnow()
        expires_at = now.timestamp() + expires_in_seconds
        expires_at_str = datetime.utcfromtimestamp(expires_at).isoformat()
        generated_at = now.isoformat()
        
        # Delete old cache
        cursor.execute("DELETE FROM forecast_cache WHERE patient_id = ?", (patient_id,))
        
        cursor.execute("""
            INSERT INTO forecast_cache (id, patient_id, generated_at, trajectory_json, drivers_json, milestones_json, interventions_json, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            patient_id,
            generated_at,
            json.dumps(data.get("trajectory", data.get("conditions", []))),
            json.dumps(data.get("forecast_drivers", [])),
            json.dumps(data.get("milestones", [])),
            json.dumps(data.get("intervention_impacts", [])),
            expires_at_str
        ))
        conn.commit()
        conn.close()

    # --- Comorbidity Web Cache ---
    def get_comorbidity_cache(self, patient_id: str):
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM comorbidity_web_cache WHERE patient_id = ? ORDER BY generated_at DESC LIMIT 1",
            (patient_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            expires_at = datetime.fromisoformat(row["expires_at"])
            if expires_at > datetime.utcnow():
                return {
                    "nodes": json.loads(row["nodes_json"]),
                    "edges": json.loads(row["edges_json"])
                }
        return None

    def set_comorbidity_cache(self, patient_id: str, data: dict, expires_in_seconds: int = 3600):
        import uuid
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.utcnow()
        expires_at = now.timestamp() + expires_in_seconds
        expires_at_str = datetime.utcfromtimestamp(expires_at).isoformat()
        generated_at = now.isoformat()
        
        cursor.execute("DELETE FROM comorbidity_web_cache WHERE patient_id = ?", (patient_id,))
        
        cursor.execute("""
            INSERT INTO comorbidity_web_cache (id, patient_id, generated_at, nodes_json, edges_json, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            patient_id,
            generated_at,
            json.dumps(data.get("nodes", [])),
            json.dumps(data.get("edges", [])),
            expires_at_str
        ))
        conn.commit()
        conn.close()

    # --- Organ Assessment ---
    def get_organ_assessment(self, patient_id: str, organ: str):
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM organ_assessments WHERE patient_id = ? AND organ = ? ORDER BY generated_at DESC LIMIT 1",
            (patient_id, organ.lower())
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "patient_id": row["patient_id"],
                "organ": row["organ"],
                "risk_score": row["risk_score"],
                "summary_text": row["summary_text"],
                "biomarkers": json.loads(row["biomarkers_json"]),
                "generated_at": row["generated_at"]
            }
        return None

    def save_organ_assessment(self, patient_id: str, organ: str, risk_score: int, summary_text: str, biomarkers: list):
        import uuid
        conn = self._get_conn()
        cursor = conn.cursor()
        generated_at = datetime.utcnow().isoformat()
        
        # Delete old assessment for this patient/organ to avoid duplication
        cursor.execute("DELETE FROM organ_assessments WHERE patient_id = ? AND organ = ?", (patient_id, organ.lower()))
        
        cursor.execute("""
            INSERT INTO organ_assessments (id, patient_id, organ, risk_score, summary_text, biomarkers_json, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            patient_id,
            organ.lower(),
            risk_score,
            summary_text,
            json.dumps(biomarkers),
            generated_at
        ))
        conn.commit()
        conn.close()

    # --- Second Opinion Engine ---
    def save_second_opinion(self, patient_id: str, hypothesis: str, confidence_score: int, verdict: str, evidence_chain: str):
        import uuid
        conn = self._get_conn()
        cursor = conn.cursor()
        generated_at = datetime.utcnow().isoformat()
        
        cursor.execute("""
            INSERT INTO second_opinions (id, patient_id, hypothesis, confidence_score, verdict, evidence_chain, generated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            patient_id,
            hypothesis,
            confidence_score,
            verdict,
            evidence_chain,
            generated_at
        ))
        conn.commit()
        conn.close()

    # --- Alert Explanations ---
    def get_alert_explanation(self, alert_id: str):
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alert_explanations WHERE alert_id = ?", (alert_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return row["explanation_text"]
        return None

    def save_alert_explanation(self, alert_id: str, explanation_text: str):
        import uuid
        conn = self._get_conn()
        cursor = conn.cursor()
        generated_at = datetime.utcnow().isoformat()
        
        cursor.execute("DELETE FROM alert_explanations WHERE alert_id = ?", (alert_id,))
        cursor.execute("""
            INSERT INTO alert_explanations (id, alert_id, explanation_text, generated_at)
            VALUES (?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            alert_id,
            explanation_text,
            generated_at
        ))
        conn.commit()
        conn.close()

# Export a single global instance
db_service = SupabaseService()
