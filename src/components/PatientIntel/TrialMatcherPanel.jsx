import React, { useState, useEffect } from 'react';

const TrialMatcherPanel = ({ patient }) => {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (hasFetched || !patient?.id) return;

    const fetchTrials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/trials/match/${patient.id}`, {
          method: 'POST'
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch trials');
        }

        const data = await res.json();
        setTrials(data.matches || []);
        setHasFetched(true);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, [patient?.id, hasFetched]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border border-gray-150 animate-fade-in-up">
        <span className="material-symbols-outlined text-4xl text-brand-blue animate-spin">sync</span>
        <h3 className="mt-4 text-lg font-bold text-gray-700">Scanning ClinicalTrials.gov...</h3>
        <p className="text-sm text-gray-500">AI is screening eligibility criteria against patient profile</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 text-center text-red-600 animate-fade-in-up">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <h3 className="text-lg font-bold">Error matching trials</h3>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (!trials || trials.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-[32px] p-12 text-center text-gray-500 animate-fade-in-up">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">science</span>
        <h3 className="text-lg font-bold text-gray-700">No Trials Found</h3>
        <p className="text-sm">No active recruiting trials found for this patient's conditions.</p>
      </div>
    );
  }

  const getBadgeStyle = (eligible) => {
    switch (eligible?.toLowerCase()) {
      case 'likely':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Likely Eligible', icon: 'check_circle' };
      case 'possible':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Review Needed', icon: 'info' };
      case 'unlikely':
      default:
        return { bg: 'bg-red-50', text: 'text-red-500', label: 'Low Match', icon: 'cancel' };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center justify-between bg-white rounded-[24px] p-6 border border-gray-150 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Recruiting Trials</h2>
          <p className="text-sm text-gray-500">Global matched active clinical trials</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-brand-sidebar">{trials.length}</span>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Matches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {trials.map((trial, idx) => {
          const badge = getBadgeStyle(trial.eligible);
          return (
            <div key={idx} className="bg-white border border-gray-150 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-black text-gray-400 font-mono">{trial.nctId}</span>
                    <div className="flex gap-1">
                      {(trial.phases || []).map((p, i) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                          {p.replace('PHASE', 'Phase ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-brand-sidebar pr-4 leading-tight">{trial.briefTitle}</h3>
                </div>
                
                <div className="shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg} ${badge.text}`}>
                    <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Match Reasons</h4>
                  <ul className="flex flex-col gap-2">
                    {(trial.match_reasons || []).map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-green-500 text-[18px] shrink-0">check</span>
                        <span className="leading-snug">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {trial.disqualifiers && trial.disqualifiers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Potential Disqualifiers</h4>
                    <ul className="flex flex-col gap-2">
                      {trial.disqualifiers.map((disq, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="material-symbols-outlined text-yellow-500 text-[18px] shrink-0">warning</span>
                          <span className="leading-snug">{disq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                <a 
                  href={`https://clinicaltrials.gov/study/${trial.nctId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors"
                >
                  View on ClinicalTrials.gov
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrialMatcherPanel;
