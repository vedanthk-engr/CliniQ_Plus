import React from 'react';

const ClinicalPatternFeed = ({ patient }) => {
  if (!patient || !patient.clinicalPatterns || !patient.clinicalPatterns.length) return null;

  return (
    <section className="bg-[#FFADD2] rounded-[32px] p-8 flex flex-col gap-6 relative overflow-hidden text-black shadow-xl shadow-[#FFADD2]/20 border border-[#FFADD2]/30 animate-fade-in-up">
      <h2 className="font-headline-card text-[24px] flex items-center gap-4 z-10 tracking-tight font-bold text-black font-sans">
        <span className="material-symbols-outlined text-black text-[28px]">warning</span>
        Alert Feed
      </h2>
      <div className="flex flex-col gap-4 z-10">
        {patient.clinicalPatterns.map((pattern, idx) => {
          let dotColor = 'bg-[#FFDE59]'; // default warning

          if (pattern.severity === 'HIGH') {
            dotColor = 'bg-red-500';
          } else if (pattern.severity === 'INFO' || pattern.severity === 'LOW') {
            dotColor = 'bg-[#C2E7FF]';
          }

          return (
            <div 
              key={idx} 
              className="bg-white/95 backdrop-blur-md rounded-2xl p-5 flex gap-4 items-start shadow-sm border border-white/50 text-black fadeIn"
              style={{ animationDelay: `${0.12 * idx}s` }}
            >
              <span className={`w-3 h-3 rounded-full ${dotColor} mt-1 flex-shrink-0 shadow-sm animate-pulse`} />
              <div>
                <p className="font-bold text-[16px] mb-1 text-black font-sans leading-tight">{pattern.type}</p>
                <p className="text-sm text-black/75 leading-relaxed font-sans">{pattern.description}</p>
                {pattern.time && (
                  <p className="text-[10px] text-black/40 font-bold font-mono mt-1.5 uppercase tracking-wider">{pattern.time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ClinicalPatternFeed;
