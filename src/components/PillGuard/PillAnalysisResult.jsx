import React from 'react';

const getDrugCategory = (drugName = "") => {
  const name = drugName.toLowerCase();
  if (name.includes("tylenol") || name.includes("acetaminophen")) return "Analgesic";
  if (name.includes("apixaban") || name.includes("eliquis") || name.includes("warfarin")) return "Anticoagulant";
  if (name.includes("aspirin")) return "Antiplatelet";
  if (name.includes("metoprolol")) return "Beta Blocker";
  if (name.includes("amlodipine")) return "Calcium Channel Blocker";
  if (name.includes("atorvastatin") || name.includes("statin")) return "Lipid Regulator";
  if (name.includes("lisinopril")) return "ACE Inhibitor";
  if (name.includes("metformin")) return "Antidiabetic";
  if (name.includes("methotrexate")) return "DMARD";
  return "Therapeutic";
};

const getDosageGuidelines = (drugName = "", resultDosage = "") => {
  const name = drugName.toLowerCase();
  if (name.includes("tylenol") || name.includes("acetaminophen")) {
    return {
      row1Label: "Adults & Children 12+",
      row1Val: "2 caplets / 6 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "3,000 mg"
    };
  }
  if (name.includes("apixaban") || name.includes("eliquis")) {
    return {
      row1Label: "Adult AFib Dosing",
      row1Val: "5 mg / 12 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "10 mg"
    };
  }
  if (name.includes("aspirin")) {
    return {
      row1Label: "Prophylaxis Dosing",
      row1Val: "81 mg / 24 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "325 mg"
    };
  }
  if (name.includes("metoprolol")) {
    return {
      row1Label: "Hypertension / AFib Dosing",
      row1Val: "100 mg / 24 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "400 mg"
    };
  }
  if (name.includes("amlodipine")) {
    return {
      row1Label: "Standard Dosing",
      row1Val: "5 mg / 24 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "10 mg"
    };
  }
  if (name.includes("atorvastatin")) {
    return {
      row1Label: "Hypercholesterolemia Dosing",
      row1Val: "80 mg / 24 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "80 mg"
    };
  }
  if (name.includes("lisinopril")) {
    return {
      row1Label: "Antihypertensive Dosing",
      row1Val: "10 mg / 24 hrs",
      row2Label: "Max Daily Limit",
      row2Val: "40 mg"
    };
  }
  return {
    row1Label: "Recommended Dose",
    row1Val: resultDosage || "As Directed",
    row2Label: "Daily Frequency",
    row2Val: "Once Daily"
  };
};

const getPrecautionBadges = (drugName = "") => {
  const name = drugName.toLowerCase();
  if (name.includes("tylenol") || name.includes("acetaminophen")) {
    return ["No Alcohol", "Liver Check"];
  }
  if (name.includes("apixaban") || name.includes("eliquis")) {
    return ["No NSAIDs", "Bleeding Risk"];
  }
  if (name.includes("aspirin")) {
    return ["GI Shield", "No Alcohol"];
  }
  if (name.includes("metoprolol")) {
    return ["HR Monitor", "No Alcohol"];
  }
  if (name.includes("amlodipine")) {
    return ["BP Monitor", "Fluid Check"];
  }
  if (name.includes("atorvastatin")) {
    return ["Liver Check", "No Grapefruit"];
  }
  if (name.includes("lisinopril")) {
    return ["BP Monitor", "Renal Check"];
  }
  return ["Take with Water", "Monitor Vitals"];
};

const PillAnalysisResult = ({ result, onDismiss }) => {
  if (!result) return null;

  const drugName = result.name || result.pill_name || "Unknown Medication";
  const category = getDrugCategory(drugName);
  const dosageInfo = getDosageGuidelines(drugName, result.dosage);
  const precautionBadges = getPrecautionBadges(drugName);

  // Parse expiry/mfg date strings to display format
  const formatValue = (val) => {
    if (!val || val === "Not clearly visible") return "Not available";
    if (val.includes("-")) {
      const parts = val.split("-");
      if (parts.length >= 2) return `${parts[1]} / ${parts[0]}`;
    }
    return val;
  };

  const expiryVal = formatValue(result.expiry_date);
  const mfgVal = formatValue(result.manufacturing_date);

  // Parse side effects into bullets
  const sideEffects = (result.side_effects || "")
    .split(/[.,]/)
    .map(x => x.trim())
    .filter(x => x && x.toLowerCase() !== "liver damage (if overused)");

  return (
    <div className="font-sans text-on-surface">
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl font-bold">close</span>
      </button>

      {/* Top Banner Tag */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-yellow flex items-center justify-center">
          <span className="material-symbols-outlined text-xs font-bold text-black">link</span>
        </div>
        <span className="text-[10px] font-black text-gray-500 tracking-wider uppercase font-mono">
          AI PILL GUARD ANALYSIS
        </span>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-extrabold text-on-surface mb-6">
        {drugName}
      </h2>

      {/* Date Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Expiry Date Card */}
        <div className="bg-[#FAF9F5] rounded-2xl p-4 flex items-center gap-3 border border-black/5">
          <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-gray-500">calendar_today</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block leading-none mb-1">
              EXPIRY DATE
            </span>
            <span className="text-sm font-extrabold text-on-surface block leading-tight">
              {expiryVal}
            </span>
          </div>
        </div>

        {/* Mfg Date Card */}
        <div className="bg-[#FAF9F5] rounded-2xl p-4 flex items-center gap-3 border border-black/5">
          <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-gray-500">science</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block leading-none mb-1">
              MFG DATE
            </span>
            <span className="text-sm font-extrabold text-on-surface block leading-tight">
              {mfgVal}
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Disease / Condition (Grey) */}
        <div className="bg-[#EBEBEB] rounded-2xl p-5 relative overflow-hidden flex flex-col h-[200px]">
          {/* Decorative Circle */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-black/5 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base font-bold text-on-surface">spa</span>
            <span className="text-xs font-bold text-on-surface">Disease / Condition</span>
          </div>
          <p className="relative z-10 text-[11px] text-gray-650 font-semibold leading-relaxed flex-grow line-clamp-4">
            {result.disease_used_for || "Indicated for the treatment and management of primary conditions."}
          </p>
          <span className="relative z-10 text-2xl font-black text-on-surface leading-none mt-auto">
            {category}
          </span>
        </div>

        {/* Card 2: Dosage Guidelines (White with border) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col h-[200px] justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-base font-bold text-on-surface">medical_information</span>
              <span className="text-xs font-bold text-on-surface">Dosage Guidelines</span>
            </div>
            
            {/* Rows */}
            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2 mt-4">
              <span className="text-gray-400 font-bold">{dosageInfo.row1Label}</span>
              <span className="font-extrabold text-on-surface">{dosageInfo.row1Val}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-gray-400 font-bold">{dosageInfo.row2Label}</span>
              <span className="font-extrabold text-red-600">{dosageInfo.row2Val}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Side Effects (Yellow) */}
        <div className="bg-[#FDF3D0] rounded-2xl p-5 relative overflow-hidden flex flex-col h-[200px]">
          {/* Decorative Square */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-yellow-400/10 rotate-45 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base font-bold text-on-surface">warning</span>
            <span className="text-xs font-bold text-on-surface">Side Effects</span>
          </div>
          
          <ul className="relative z-10 text-[11px] text-gray-650 font-semibold space-y-1 mt-2">
            {sideEffects.slice(0, 3).map((effect, idx) => (
              <li key={idx} className="truncate">• {effect}</li>
            ))}
            {sideEffects.length === 0 && (
              <>
                <li>• Nausea or vomiting</li>
                <li>• Allergic skin reactions (rare)</li>
                <li>• Headache or dizziness</li>
              </>
            )}
          </ul>
        </div>

        {/* Card 4: Precautions (Pink) */}
        <div className="bg-[#FCE5EB] rounded-2xl p-5 relative overflow-hidden flex flex-col h-[200px] justify-between">
          {/* Decorative Hexagon */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-pink-400/10 rounded-xl rotate-12 pointer-events-none" />
          
          <div>
            <div className="relative z-10 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-base font-bold text-on-surface">security</span>
              <span className="text-xs font-bold text-on-surface">Precautions</span>
            </div>
            <p className="relative z-10 text-[10px] text-gray-650 font-semibold leading-normal line-clamp-3">
              {result.precautions || "Administer according to established standards. Monitor closely."}
            </p>
          </div>

          {/* Badges */}
          <div className="relative z-10 flex gap-2 mt-auto">
            {precautionBadges.map((badge, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-black bg-white/60 text-gray-700 px-2.5 py-0.5 rounded-full border border-black/5"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillAnalysisResult;
