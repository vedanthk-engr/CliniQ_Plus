export const clinicalTermMap = {
  // English common slang
  "sugar": "glucose",
  "blood sugar": "glucose",
  "bp": "blood pressure",
  "blood pressure": "blood pressure",
  "pressure": "blood pressure",
  "tension": "blood pressure",
  "thyroid": "TSH levels",
  "lipid": "cholesterol",
  "kidney filter": "creatinine",

  // Hindi (Transliterated & common)
  "cheeni": "glucose",
  "shakkar": "glucose",
  "rakta chaap": "blood pressure",
  "khoon ka daab": "blood pressure",
  "saans phoolna": "shortness of breath",
  "saans ki takleef": "dyspnea",
  "thakan": "fatigue",
  "kamzori": "fatigue",
  "dard": "pain",
  "sar dard": "headache",
  "chakkarr": "dizziness",
  "pet dard": "abdominal pain",

  // Tamil (Transliterated & common)
  "sakkarai": "glucose",
  "raththa azhuththam": "blood pressure",
  "moochu thinaral": "shortness of breath",
  "sanam": "fatigue",
  "sathippu": "fatigue",
  "vali": "pain",
  "nenju vali": "chest pain",
  "thalai vali": "headache",
  "thalaisuttru": "dizziness",

  // Telugu (Transliterated & common)
  "panchadara": "glucose",
  "rakta potu": "blood pressure",
  "aayasam": "shortness of breath",
  "alasata": "fatigue",
  "noppi": "pain",
  "chati noppi": "chest pain",
  "thala noppi": "headache",
  "kallu thiruguta": "dizziness",
  "thirugudu": "dizziness"
};

export const normalizeClinicalTerm = (text) => {
  if (!text) return "";
  let normalized = text.toLowerCase();
  
  // Replace simple mappings
  Object.keys(clinicalTermMap).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    normalized = normalized.replace(regex, clinicalTermMap[key]);
  });
  
  return normalized;
};
