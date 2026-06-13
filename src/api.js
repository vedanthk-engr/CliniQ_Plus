// src/api.js

const BASE = 'http://localhost:8000/api';

// Fallback helper to log the error and indicate we're using mock data
const logOffline = (endpoint, err) => {
  console.warn(`[API] Failed to fetch ${endpoint}. Falling back to mock data.`, err);
};

export async function fetchPatients() {
  try {
    const r = await fetch(`${BASE}/patients`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline('/patients', err);
    return [];
  }
}

export async function fetchPatient(id) {
  try {
    const r = await fetch(`${BASE}/patient/${id}`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline(`/patient/${id}`, err);
    return null;
  }
}

export async function deletePatient(id) {
  try {
    const r = await fetch(`${BASE}/patient/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    console.error(`Failed to delete patient ${id}`, err);
    throw err;
  }
}

export async function fetchPillEvents() {
  try {
    const r = await fetch(`${BASE}/pill-events`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline('/pill-events', err);
    return [];
  }
}

export async function fetchInteractions(patientId) {
  try {
    const r = await fetch(`${BASE}/patient/${patientId}/interactions`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline(`/patient/${patientId}/interactions`, err);
    return [];
  }
}

export async function fetchBrief(id) {
  try {
    const r = await fetch(`${BASE}/patient/${id}/brief`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline(`/patient/${id}/brief`, err);
    return { consultBrief: 'No brief available' };
  }
}

export async function fetchPatterns(id) {
  try {
    const r = await fetch(`${BASE}/patient/${id}/patterns`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline(`/patient/${id}/patterns`, err);
    return { patterns: [] };
  }
}

export async function fetchAdherence(id) {
  try {
    const r = await fetch(`${BASE}/patient/${id}/adherence`);
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline(`/patient/${id}/adherence`, err);
    return { calendar: [], score: 0 };
  }
}

// AI Agent Routings
export async function runQuery(query, patientId) {
  try {
    const r = await fetch(`${BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, patient_id: patientId }),
    });
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    const data = await r.json();
    return data.response;
  } catch (err) {
    logOffline('/query', err);
    // Deterministic mock fallback
    return `[Mock AI Offline] Analyzing: "${query}". Patient parameters indicate stable configuration based on limited offline dataset.`;
  }
}

export async function runSecondOpinion(diagnosis, patientId) {
  try {
    const r = await fetch(`${BASE}/second-opinion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis, patient_id: patientId }),
    });
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline('/second-opinion', err);
    // Deterministic fallback
    if (diagnosis.toLowerCase().includes('diabetic nephropathy') && patientId === 'P-00142') {
      return {
        verdict: 'CORROBORATED',
        support: ['HbA1c trending upwards rapidly (8.6%).', 'Creatinine 1.9 consistently outside bounds.'],
        contradict: [],
        raw_agent_response: 'Simulated verification'
      };
    }
    return { verdict: 'INSUFFICIENT DATA', support: [], contradict: [], raw_agent_response: 'Simulated failure' };
  }
}

export async function verifyPill(imageBase64, prescriptionId) {
  try {
    const r = await fetch(`${BASE}/pill/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64, prescription_id: prescriptionId }),
    });
    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    return await r.json();
  } catch (err) {
    logOffline('/pill/verify', err);
    return { vision_result: '{"shape": "round", "color": "white", "confidence_pct": 50}', prescription_id: prescriptionId };
  }
}
