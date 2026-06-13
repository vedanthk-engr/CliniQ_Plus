import React, { useState, useEffect } from 'react';
import { runSecondOpinion } from '../../api';
import { useDemoContext } from '../../context/DemoContext';

const SecondOpinionPanel = ({ patient }) => {
  const { demoEvent } = useDemoContext() || {};
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isTestingCustom, setIsTestingCustom] = useState(false);

  useEffect(() => {
    setDiagnosis('');
    setResponse(null);
    setIsLoading(false);
    setIsTestingCustom(false);
  }, [patient]);

  // Demo listener
  useEffect(() => {
    if (!demoEvent) return;
    if (demoEvent.action === 'type_opinion') {
      setIsTestingCustom(true);
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

  const handleBackToDefault = () => {
    setIsTestingCustom(false);
    setDiagnosis('');
    setResponse(null);
  };

  // Check if we should render default opinion for Arjun Mehta (P-00142)
  const showDefaultOpinion = patient.id === 'P-00142' && !isTestingCustom && !response;

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 flex flex-col justify-between relative overflow-hidden border border-gray-150 animate-fade-in-up h-full min-h-[480px]">
      <div className="flex flex-col gap-6 w-full z-10 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-headline-card text-[24px] text-primary flex items-center gap-4 tracking-tight font-bold font-sans">
            <div className="bg-[#FFDE59]/30 p-2.5 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[#F5C324] text-[28px]">neurology</span>
            </div>
            AI Opinion
          </h2>
          <span className="px-3 py-1 bg-[#FFDE59] text-black rounded-full font-label-bold text-[11px] uppercase tracking-wider font-bold shadow-sm font-sans">Beta</span>
        </div>

        {showDefaultOpinion ? (
          /* Default Opinion matches mockup */
          <div className="flex flex-col gap-5 flex-1 justify-between">
            <div className="flex flex-col gap-5">
              {/* Quote block */}
              <div className="border-l-4 border-[#F5C324] pl-4 py-1.5 italic text-[17px] text-[#1B1C1A] font-semibold leading-relaxed font-sans">
                "Stress-testing primary hypothesis: Diabetic Nephropathy."
              </div>

              {/* Alternative considerations */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black text-[#858A8A] uppercase tracking-widest font-sans">
                  Alternative Considerations
                </h4>
                <ul className="flex flex-col gap-2">
                  <li className="flex items-start gap-2.5 text-xs text-gray-700 font-semibold leading-relaxed font-sans">
                    <span className="text-[#F5C324] text-base shrink-0 leading-none select-none">•</span>
                    <span>Hypertensive nephrosclerosis (high probability given recent BP variability).</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-gray-700 font-semibold leading-relaxed font-sans">
                    <span className="text-[#F5C324] text-base shrink-0 leading-none select-none">•</span>
                    <span>Drug-induced renal impairment (review recent NSAID use).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* View Full Analysis button & Custom toggle */}
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => alert("Loading full diagnostic trace...")}
                className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-250 text-black font-extrabold text-sm rounded-full transition-all duration-205 uppercase tracking-wider shadow-sm cursor-pointer"
              >
                View Full Analysis
              </button>
              <button
                onClick={() => setIsTestingCustom(true)}
                className="text-center text-xs font-bold text-gray-500 hover:text-black transition-colors"
              >
                Test Custom Hypothesis
              </button>
            </div>
          </div>
        ) : (
          /* Custom hypothesis form / results */
          <div className="flex flex-col gap-4 flex-1 justify-between">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500 font-semibold font-sans leading-relaxed">
                Stress-test diagnostic hypotheses against patient profile and historical databases.
              </p>

              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter clinical hypothesis (e.g., Diabetic Nephropathy)..."
                rows={3}
                className="w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4 font-sans text-sm text-on-surface focus:ring-2 focus:ring-[#FFDE59]/30 focus:border-[#F5C324] outline-none transition-shadow resize-none placeholder:text-on-surface-variant/40"
              />

              <button
                onClick={handleRun}
                disabled={isLoading || !diagnosis.trim()}
                className={`w-full py-4 rounded-full font-bold text-sm transition-all uppercase tracking-wider cursor-pointer border shadow-sm ${
                  isLoading || !diagnosis.trim()
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black/90'
                }`}
              >
                {isLoading ? 'Cross-referencing archive...' : 'Execute Validation'}
              </button>
            </div>

            {response && !isLoading && (
              <div className="fadeIn border-t border-gray-100 pt-4 mt-2">
                <div className="text-center mb-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider border uppercase font-sans ${
                    response.verdict === 'CORROBORATED' ? 'bg-[#EAF0AD] border-[#CFD96C] text-[#566118]' : 
                    response.verdict === 'CONTRADICTED' ? 'bg-[#ffdad6] border-[#ffdad6] text-[#ba1a1a]' : 
                    'bg-[#FFECA1] border-[#F8D664] text-[#8C6D14]'
                  }`}>
                    {response.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-black text-brand-green mb-2.5 tracking-wider font-sans">SUPPORTING EVIDENCE</div>
                    <div className="flex flex-col gap-2">
                      {response.support.map((s, i) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-700 font-semibold leading-relaxed font-sans">
                          <span className="text-brand-green font-bold">✓</span><span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-[#ba1a1a] mb-2.5 tracking-wider font-sans">GAPS / CONFLICTS</div>
                    <div className="flex flex-col gap-2">
                      {response.contradict.map((c, i) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-700 font-semibold leading-relaxed font-sans">
                          <span className="text-[#ba1a1a] font-bold">⚑</span><span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Link back to default analysis if custom view is active */}
            {patient.id === 'P-00142' && (
              <button
                onClick={handleBackToDefault}
                className="text-center text-xs font-bold text-gray-400 hover:text-black mt-4 transition-colors"
              >
                Back to Default Opinion
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SecondOpinionPanel;
