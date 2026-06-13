import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import { fetchInteractions } from '../../api';

const MedicationsPanel = ({ patient }) => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (patient) {
      fetchInteractions(patient.id).then(setInteractions);
    }
  }, [patient]);

  if (!patient || !patient.medications) return null;

  // Find interactions for this patient
  const medNames = patient.medications.map(m => m.name.toLowerCase());
  const activeInteractions = interactions.filter(int =>
    medNames.includes(int.drug_a.toLowerCase()) && medNames.includes(int.drug_b.toLowerCase()) && int.severity !== 'none'
  );

  return (
    <div className="bg-brand-green rounded-card p-6 h-[268px] flex flex-col relative overflow-hidden transition-shadow duration-300 shadow-sm hover:shadow-md animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-card text-[22px] font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">medication</span>
          Current Regimen
        </h3>
        <button className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-105 transition-all shadow-sm border border-white/20">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Subheader */}
      <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-bold text-on-surface/70 uppercase tracking-wide">
        <span>Medication</span>
        <span>Adherence</span>
      </div>

      {/* Medications Rows */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {patient.medications.map((med, idx) => {
          const hasConflict = activeInteractions.some(int => 
            int.drug_a.toLowerCase() === med.name.toLowerCase() || 
            int.drug_b.toLowerCase() === med.name.toLowerCase()
          );

          return (
            <div key={idx} className={`rounded-xl p-2 flex items-center gap-3 shadow-sm hover:shadow transition-shadow group border ${
              hasConflict ? 'bg-red-500/10 border-red-500/20 text-red-700' : 'bg-white border-transparent hover:border-black/5 text-on-surface'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                hasConflict ? 'bg-red-500/15 text-red-600' : 'bg-surface-container-low text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {med.shape === 'Capsule' ? 'pill' : 'medication'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-[13px] truncate">{med.name}</div>
                <div className={`text-[10px] font-semibold truncate ${hasConflict ? 'text-red-700/80' : 'text-on-surface-variant'}`}>
                  {med.dose} • {med.freq}
                </div>
              </div>
              {/* Adherence block row (using 5 days from adherenceCalendar) */}
              <div className="w-16 h-3.5 flex gap-0.5 opacity-85 shrink-0">
                {(patient.adherenceCalendar || [true, true, true, false, true]).slice(0, 5).map((taken, sIdx) => (
                  <div key={sIdx} className={`flex-1 rounded-sm ${
                    taken ? 'bg-brand-green' : 'bg-red-500'
                  }`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicationsPanel;
