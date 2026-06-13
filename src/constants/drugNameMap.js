export const drugNameMap = {
  // Diabetes
  "glycomet": "Metformin",
  "glyciphage": "Metformin",
  "januvia": "Sitagliptin",
  "galvus": "Vildagliptin",
  "diamicron": "Gliclazide",
  "amaryl": "Glimepiride",
  "jardiance": "Empagliflozin",
  "forxiga": "Dapagliflozin",

  // Cardiovascular & Hypertension
  "ecosprin": "Aspirin",
  "clopilet": "Clopidogrel",
  "cardivas": "Carvedilol",
  "concor": "Bisoprolol",
  "cilacar": "Cilnidipine",
  "amdepin": "Amlodipine",
  "stamlo": "Amlodipine",
  "telma": "Telmisartan",
  "telvas": "Telmisartan",
  "olmezest": "Olmesartan",
  "repace": "Losartan",
  "lnbloc": "Cilnidipine",
  "lasix": "Furosemide",
  "dytor": "Torsemide",
  "aldactone": "Spironolactone",
  "arkamin": "Clonidine",

  // Pain / NSAIDs / Anti-pyretic
  "crocin": "Paracetamol",
  "calpol": "Paracetamol",
  "dolo": "Paracetamol",
  "combiflam": "Ibuprofen and Paracetamol",
  "voveran": "Diclofenac",
  "ultracet": "Tramadol and Paracetamol",
  "zerodol": "Aceclofenac",
  "nurokind": "Methylcobalamin",

  // Gastrointestinal
  "pantocid": "Pantoprazole",
  "pan": "Pantoprazole",
  "pantodac": "Pantoprazole",
  "pan-d": "Pantoprazole and Domperidone",
  "pantocid-d": "Pantoprazole and Domperidone",
  "ocid": "Omeprazole",
  "omez": "Omeprazole",
  "ranitin": "Ranitidine",
  "zantac": "Ranitidine",
  "cremaffin": "Liquid Paraffin",
  "ganaton": "Itopride",

  // Statins / Cholesterol
  "atorva": "Atorvastatin",
  "lipvas": "Atorvastatin",
  "rosuvas": "Rosuvastatin",
  "razel": "Rosuvastatin",

  // Thyroid
  "thyronorm": "Levothyroxine",
  "eltroxin": "Levothyroxine",

  // Respiratory / Asthma
  "asthalin": "Salbutamol",
  "aerocort": "Levosalbutamol and Beclometasone",
  "duolin": "Levosalbutamol and Ipratropium",
  "foracort": "Formoterol and Budesonide",
  "montek-lc": "Montelukast and Levocetirizine",
  "telekast-l": "Montelukast and Levocetirizine",

  // Antibiotics
  "augumentin": "Amoxicillin and Clavulanic Acid",
  "moximac": "Moxifloxacin",
  "taxim-o": "Cefixime",
  "ceftum": "Cefuroxime Axetil",
  "azithral": "Azithromycin",
  "ciplox": "Ciprofloxacin",

  // Anticoagulant
  "eliquis": "Apixaban",
  "xarelto": "Rivaroxaban",
  "pradaxa": "Dabigatran",
  "clexane": "Enoxaparin",
  "heparin": "Heparin"
};

export const normalizeDrugName = (input) => {
  if (!input) return "";
  const cleaned = input.trim().toLowerCase();
  return drugNameMap[cleaned] || input;
};
