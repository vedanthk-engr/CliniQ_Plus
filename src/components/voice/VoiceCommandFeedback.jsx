import React from 'react';

const ACTION_ICONS = {
  navigate_page: 'navigation',
  show_patient: 'person',
  show_biomarker: 'monitoring',
  run_forecast: 'trending_up',
  toggle_intervention: 'check_box',
  explain_alert: 'warning',
  read_summary: 'description',
  search_patient: 'search',
  open_pillguard: 'pill',
  show_comorbidity: 'lan',
  export_report: 'download',
  call_patient: 'phone',
  unknown: 'help'
};

const ACTION_LABELS = {
  navigate_page: 'Navigating to page',
  show_patient: 'Opening patient file',
  show_biomarker: 'Displaying biomarker metric',
  run_forecast: 'Running AI risk forecast',
  toggle_intervention: 'Simulating intervention',
  explain_alert: 'Explaining clinical alert',
  read_summary: 'Reading clinical summary briefing',
  search_patient: 'Searching patient database',
  open_pillguard: 'Opening PillGuard scanner',
  show_comorbidity: 'Opening comorbidity network',
  export_report: 'Exporting patient health report',
  call_patient: 'Initiating call',
  unknown: 'Processing command...'
};

const VoiceCommandFeedback = ({ transcript, action, onClose }) => {
  const isClarification = action.clarification_needed;
  const actionName = action.action || 'unknown';
  const icon = ACTION_ICONS[actionName] || 'help';
  const label = ACTION_LABELS[actionName] || 'Processing...';

  return (
    <div className="bg-white border border-gray-200 rounded-[20px] shadow-xl p-4 w-72 max-w-sm z-[9999] animate-fade-in-up border-l-4 border-l-brand-blue">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 text-brand-blue">
          <span className="material-symbols-outlined text-[16px]">smart_toy</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">ClinIQ Co-Pilot</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* Transcript quotes */}
      <p className="text-[13px] italic font-semibold text-gray-700 leading-snug mb-3 pl-1 border-l-2 border-gray-200">
        "{transcript || '...'}"
      </p>

      {/* Interpreted Action Status */}
      {isClarification ? (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-xs text-amber-800 font-semibold flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-amber-500 mt-0.5">question_mark</span>
          <span>{action.clarification_prompt || "I couldn't hear that clearly. Could you repeat?"}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
            <span className="material-symbols-outlined text-[18px] text-brand-blue shrink-0">
              {icon}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">
                Action Intercepted
              </p>
              <p className="text-xs font-black text-on-surface truncate">
                {label} {action.target ? `"${action.target}"` : ''}
              </p>
            </div>
          </div>
          
          {/* Confidence bar */}
          <div className="flex items-center gap-2 text-[9px] font-mono text-gray-400 font-extrabold uppercase mt-1">
            <span>Confidence:</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-green transition-all duration-300"
                style={{ width: `${Math.round((action.confidence || 0.95) * 100)}%` }}
              />
            </div>
            <span>{Math.round((action.confidence || 0.95) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCommandFeedback;
