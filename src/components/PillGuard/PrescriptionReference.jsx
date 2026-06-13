import React from 'react';

const PrescriptionReference = ({ patient }) => {
  if (!patient || !patient.medications) {
    return (
      <aside className="w-[320px] bg-white border border-gray-150 rounded-[24px] p-6 shadow-sm flex flex-col min-h-[450px] h-fit shrink-0 justify-center items-center text-center font-sans">
        <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">medication</span>
        <p className="text-xs text-gray-400 font-medium">No patient selected</p>
      </aside>
    );
  }

  return (
    <aside className="w-[320px] bg-white border border-gray-150 rounded-[24px] p-6 shadow-sm flex flex-col min-h-[450px] h-fit shrink-0 font-sans">
      <div className="mb-6">
        <span className="text-[11px] font-black text-brand-pink tracking-wider uppercase font-mono block">
          PRESCRIPTION REFERENCE
        </span>
        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-0.5">
          MOLECULAR SIGNATURE DATABASE
        </span>
      </div>

      <div className="flex flex-col gap-4 flex-grow overflow-y-auto pr-1 custom-scrollbar">
        {patient.medications.map((med, idx) => {
          return (
            <div 
              key={idx} 
              className={`flex items-center justify-between gap-4 ${
                idx < patient.medications.length - 1 ? 'border-b border-gray-100 pb-4' : ''
              }`}
            >
              {/* Pill Shape Box with Blue Dot matching screenshot */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50/40 border border-blue-100/50 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                </div>
                
                {/* Drug details */}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-brand-sidebar truncate">
                    {idx + 1}. {med.name} <span className="text-[10px] text-gray-400 font-medium ml-0.5">{med.dose}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-bold font-mono mt-0.5 uppercase tracking-wide">
                    {med.shape || 'Round'} • {med.markings || '-'}
                  </div>
                </div>
              </div>
              
              {/* Frequency Badge */}
              <div className="text-[8px] font-extrabold bg-[#FFDCE6] text-brand-pink px-2.5 py-1 rounded border border-brand-pink/20 uppercase tracking-wider shrink-0 font-mono">
                AS DIRECTED
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 text-gray-400 text-[9px] font-bold text-center leading-relaxed">
        Vision AI cross-references physical characteristics against verified pharmacy standards.
      </div>
    </aside>
  );
};

export default PrescriptionReference;
