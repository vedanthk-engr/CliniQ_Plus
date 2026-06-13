import React, { useState, useEffect } from 'react';
import { runQuery } from '../../api';
import { useDemoContext } from '../../context/DemoContext';

const NaturalLanguageQuery = ({ patient }) => {
  const { demoEvent } = useDemoContext() || {};
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  // Clear answer when patient changes
  useEffect(() => {
    setQuery('');
    setAnswer('');
    setIsLoading(false);
  }, [patient]);

  // Demo listener
  useEffect(() => {
    if (!demoEvent) return;
    if (demoEvent.action === 'type_query') {
      const text = demoEvent.payload;
      let i = 0;
      setQuery('');
      const int = setInterval(() => {
        setQuery(prev => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(int);
      }, 60);
    } else if (demoEvent.action === 'submit_query') {
      handleAsk();
    }
  }, [demoEvent]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setAnswer('');
    
    try {
      const res = await runQuery(query, patient.id);
      setAnswer(res);
    } catch (e) {
      setAnswer('AI service currently unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (term) => {
    setQuery(`Show recent ${term} markers and progression details for the last 6 months.`);
  };

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 flex flex-col gap-6 relative overflow-hidden border border-gray-150 animate-fade-in-up w-full">
      <h2 className="font-headline-card text-[24px] text-primary flex items-center gap-4 z-10 tracking-tight font-bold font-sans">
        <div className="bg-[#C2E7FF]/30 p-2.5 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[#7DB4D6] text-[28px]">biotech</span>
        </div>
        Clinical Query
      </h2>

      <div className="relative z-10">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="e.g., Show HbA1c trends for last 12 months alongside recent weight fluctuations..."
          className="w-full h-28 bg-gray-50/50 rounded-2xl border border-gray-100 p-5 font-sans text-sm text-on-surface focus:ring-2 focus:ring-[#C2E7FF] outline-none transition-shadow resize-none placeholder:text-on-surface-variant/40"
        />
      </div>

      <div className="flex justify-between items-center z-10 flex-wrap gap-4">
        <div className="flex gap-2">
          {['HbA1c', 'Lipids', 'Renal'].map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-650 rounded-full font-bold text-xs cursor-pointer hover:bg-gray-50 transition-colors shadow-sm font-sans"
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md cursor-pointer ${
            isLoading || !query.trim()
              ? 'bg-gray-50 text-gray-400 border border-gray-250 cursor-not-allowed shadow-none'
              : 'bg-black text-white hover:bg-black/90 shadow-black/10'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">search_insights</span>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {answer && !isLoading && (
        <div className="fadeIn bg-[#C2E7FF]/10 border border-[#7DB4D6]/20 rounded-2xl p-5 mt-2 text-sm text-black leading-relaxed font-sans">
          <div className="font-black text-[#5287A8] text-xs uppercase tracking-wider mb-2">AI Response</div>
          <p className="font-semibold text-gray-700">{answer}</p>
        </div>
      )}
    </section>
  );
};

export default NaturalLanguageQuery;
