import React, { useState } from 'react';
import useSSEStream from '../../hooks/useSSEStream';
import StreamingText from '../ui/StreamingText';

const AlertCard = ({ alert, isAcknowledged, onAck }) => {
  const { data, loading, startStream } = useSSEStream();
  const [showExplain, setShowExplain] = useState(false);

  const handleExplain = async () => {
    setShowExplain(true);
    if (data) return;
    
    try {
      await startStream('http://localhost:8000/api/alerts/explain', {
        alert_id: alert.id,
        patient_id: alert.patientId,
        description: alert.description
      });
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
    }
  };

  let severityColor = 'bg-[#B5C43A]'; 
  let badgeStyle = 'bg-gray-100 text-gray-600 border-gray-200';
  let borderStyle = 'border-gray-200/60';
  let urgencyStyle = 'bg-gray-100 text-gray-700';
  let textLight = 'text-gray-500';
  let dotStyle = 'bg-gray-300';
  let descBgStyle = 'bg-gray-50/50 border-gray-100';

  if (alert.severity === 'HIGH') {
    severityColor = 'bg-[#ba1a1a]';
    badgeStyle = 'bg-red-50 text-red-650 border-red-100';
    borderStyle = 'border-red-200/60';
    urgencyStyle = 'bg-red-500 text-white shadow-sm';
    textLight = 'text-red-500';
    dotStyle = 'bg-red-500 shadow-[0_0_8px_rgba(186,26,26,0.4)]';
    descBgStyle = 'bg-red-500/5 border-red-100/30';
  } else if (alert.severity === 'MEDIUM') {
    severityColor = 'bg-[#F5C842]';
    badgeStyle = 'bg-yellow-50 text-yellow-750 border-yellow-100';
    borderStyle = 'border-yellow-250/60';
    urgencyStyle = 'bg-brand-yellow text-brand-sidebar font-extrabold shadow-sm';
    textLight = 'text-brand-yellow';
    dotStyle = 'bg-brand-yellow shadow-[0_0_8px_rgba(253,207,73,0.5)]';
    descBgStyle = 'bg-brand-yellow/10 border-brand-yellow/20';
  }

  const urgency = alert.urgency_score || 5;

  return (
    <div 
      className={`transition-all duration-300 ${
        isAcknowledged ? 'opacity-40 scale-[0.99]' : 'scale-100'
      }`}
    >
      <div 
        className={`bg-white/95 border rounded-[32px] p-6 relative overflow-hidden flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow ${borderStyle}`}
      >
        {/* Decorative Blob */}
        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${severityColor} opacity-5 pointer-events-none`} />

        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-4">
          
          {/* Left info */}
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${dotStyle}`} />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-extrabold text-brand-sidebar">{alert.patientName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider font-mono ${badgeStyle}`}>
                  {alert.type || 'Clinical'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-1">
                ID: {alert.patientId} • Outpatient
              </p>
            </div>
          </div>

          {/* Right urgency score */}
          <div className="flex flex-col items-end">
            <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${urgencyStyle}`}>
              {urgency}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${textLight}`}>
              Urgency
            </span>
          </div>

        </div>

        {/* Description Box */}
        <div className={`rounded-2xl p-4 border text-xs leading-relaxed font-bold text-brand-sidebar ${descBgStyle}`}>
          {alert.description}
        </div>

        {/* Action Buttons */}
        {!isAcknowledged && (
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => onAck(alert.id)}
              className="px-6 py-2.5 bg-black text-white font-bold text-xs rounded-full hover:bg-gray-800 transition-colors flex-1 shadow-sm flat-look cursor-pointer"
            >
              Acknowledge
            </button>
            <button
              onClick={handleExplain}
              className="px-6 py-2.5 bg-gray-100 text-brand-sidebar border border-gray-200/50 font-bold text-xs rounded-full hover:bg-gray-200 transition-colors flex-1 shadow-sm cursor-pointer"
            >
              {loading ? 'Analyzing...' : 'Explain AI Reasoning'}
            </button>
          </div>
        )}

        {isAcknowledged && (
          <div className="text-[10px] font-black text-brand-green tracking-wider uppercase font-mono mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            Archived Clinical Event
          </div>
        )}

        {/* Explain text drawer */}
        {showExplain && (
          <div className="bg-brand-pink-light/35 border border-brand-pink/20 rounded-2xl p-4 text-xs text-brand-sidebar leading-relaxed animate-fade-in-up mt-1">
            <div className="text-[9px] font-black text-brand-pink tracking-wider uppercase font-mono mb-1.5">
              ClinIQ+ Diagnostic Inference
            </div>
            {data ? (
              <StreamingText text={data} active={loading} />
            ) : (
              <span className="text-brand-pink animate-pulse font-bold">Querying clinical decision model...</span>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AlertCard;
