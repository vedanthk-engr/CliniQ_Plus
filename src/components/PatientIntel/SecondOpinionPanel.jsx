import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import { runSecondOpinion } from '../../api';
import { useDemoContext } from '../../context/DemoContext';

const SecondOpinionPanel = ({ patient }) => {
  const { demoEvent } = useDemoContext() || {};
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    setDiagnosis('');
    setResponse(null);
    setIsLoading(false);
  }, [patient]);

  // Demo listener
  useEffect(() => {
    if (!demoEvent) return;
    if (demoEvent.action === 'type_opinion') {
      const text = demoEvent.payload;
      let i = 0;
      setDiagnosis('');
      const int = setInterval(() => {
        setDiagnosis(prev => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(int);
      }, 50);
    } else if (demoEvent.action === 'submit_opinion') {
      handleRun();
    }
  }, [demoEvent]);

  const handleRun = async () => {
    if (!diagnosis.trim()) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await runSecondOpinion(diagnosis, patient.id);
      setResponse(res);
    } catch (e) {
      setResponse({ verdict: 'INSUFFICIENT DATA', support: ['AI service unreachable'], contradict: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
      <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#F278A1] tracking-wider mb-1 font-mono uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-pink"></span>
        Second Opinion Engine
      </div>
      <div className="text-[10px] text-gray-500 font-extrabold mb-4 tracking-wider font-mono">
        AI STRESS-TESTS HYPOTHESIS AGAINST COMPLETE CLINICAL ARCHIVE
      </div>

      <textarea
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        placeholder="ENTER HYPOTHESIS (e.g. DIABETIC NEPHROPATHY)..."
        rows={2}
        className="w-full bg-white border border-[#FFDCE6] rounded-xl text-black py-3 px-4 text-xs font-bold font-mono placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all resize-none mb-4 uppercase"
      />

      <button
        onClick={handleRun}
        disabled={isLoading || !diagnosis.trim()}
        className={`w-full py-3.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
          isLoading || !diagnosis.trim()
            ? 'bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#FFDCE6]/50 border border-[#F8A1C4]/30 text-[#912D55] hover:bg-[#FFDCE6]/70 cursor-pointer shadow-sm'
        }`}
      >
        {isLoading ? 'Cross-referencing archive...' : 'Execute Validation'}
      </button>

      {response && !isLoading && (
        <div className="fadeIn mt-5 border-t border-gray-100 pt-5">
          
          <div className="text-center mb-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider border uppercase font-mono ${
              response.verdict === 'CORROBORATED' ? 'bg-[#EAF0AD] border-[#CFD96C] text-[#566118]' : 
              response.verdict === 'CONTRADICTED' ? 'bg-[#ffdad6] border-[#ffdad6] text-[#ba1a1a]' : 
              'bg-[#FFECA1] border-[#F8D664] text-[#8C6D14]'
            }`}>
              {response.verdict}
            </span>
          </div>

          <div className="flex gap-4">
            {/* LEFT / SUPPORT */}
            <div className="flex-1">
              <div className="text-[9px] font-extrabold text-brand-green mb-2.5 font-mono tracking-wider">SUPPORTING EVIDENCE</div>
              <div className="flex flex-col gap-2">
                {response.support.map((s, i) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-700 font-semibold leading-relaxed">
                    <span className="text-brand-green font-bold">✓</span><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px bg-gray-200 shrink-0"></div>

            {/* RIGHT / CONTRADICT */}
            <div className="flex-grow flex-1">
              <div className="text-[9px] font-extrabold text-[#ba1a1a] mb-2.5 font-mono tracking-wider">GAPS / CONFLICTS</div>
              <div className="flex flex-col gap-2">
                {response.contradict.map((c, i) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-700 font-semibold leading-relaxed">
                    <span className="text-[#ba1a1a] font-bold">⚑</span><span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondOpinionPanel;
