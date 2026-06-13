import React from 'react';

const PrescriptionReference = ({ patient }) => {
  if (!patient || !patient.medications) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm flex flex-col">
      <div className="mb-4">
        <span className="text-[10px] font-black text-brand-pink tracking-wider uppercase font-mono block">
          Prescription Reference
        </span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
          Molecular Signature Database
        </span>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {patient.medications.map((med, idx) => {
          const pillColor = med.color || '#F7A8C4'; 
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-4 ${
                idx < patient.medications.length - 1 ? 'border-b border-gray-100 pb-4' : ''
              }`}
            >
              {/* Pill Shape Box */}
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl shrink-0">
                <svg width="24" height="16" viewBox="0 0 24 16">
                  {med.shape === 'Round' ? (
                    <circle cx="12" cy="8" r="6" fill={pillColor} />
                  ) : (
                    <ellipse cx="12" cy="8" rx="9" ry="5" fill={pillColor} />
                  )}
                </svg>
              </div>
              
              {/* Drug details */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-brand-sidebar truncate">
                  {med.name} <span className="text-xs text-gray-500 font-bold ml-1">{med.dose}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">
                  {med.shape} • {med.markings}
                </div>
              </div>
              
              {/* Frequency Badge */}
              <div className="text-[9px] font-black bg-brand-pink-light text-brand-sidebar px-2.5 py-1 rounded-full border border-brand-pink/20 uppercase tracking-wider shrink-0 font-mono">
                {med.freq}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 text-gray-400 text-[10px] font-bold text-center">
        Vision AI cross-references physical characteristics against verified pharmacy standards.
      </div>
    </div>
  );
};

export default PrescriptionReference;
