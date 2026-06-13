import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const ClinicalPatternFeed = ({ patient }) => {
  if (!patient || !patient.clinicalPatterns || !patient.clinicalPatterns.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col shadow-sm flex-1 overflow-y-auto">
      <div className="text-[11px] font-extrabold text-[#F278A1] tracking-wider mb-5 font-mono uppercase">
        Anomaly Detection Feed
      </div>

      <div className="flex flex-col gap-4">
        {patient.clinicalPatterns.map((pattern, idx) => {
          let badgeStyles = 'border-[#ffe08f] bg-[#ffe08f]/10 text-[#755b00]';
          let dotColor = 'bg-[#755b00]';

          if (pattern.severity === 'HIGH') {
            badgeStyles = 'border-[#ffdad6] bg-[#ffdad6]/10 text-[#ba1a1a]';
            dotColor = 'bg-[#ba1a1a]';
          }

          return (
            <div 
              key={idx} 
              className={`fadeIn border rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 ${badgeStyles}`}
              style={{ animationDelay: `${0.12 * idx}s` }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">
                    {pattern.type}
                  </span>
                </div>
                <div className="text-[10px] opacity-75 font-bold font-mono">{pattern.time}</div>
              </div>

              <div className="text-xs font-semibold leading-relaxed opacity-90">
                {pattern.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClinicalPatternFeed;
