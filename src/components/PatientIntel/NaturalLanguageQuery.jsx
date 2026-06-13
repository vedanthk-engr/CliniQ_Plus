import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
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

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#F278A1] tracking-wider mb-4 font-mono uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
        Clinical Query Interface
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="QUERY PATIENT LONG-TERM HISTORY..."
          className="flex-1 bg-white border border-[#FFDCE6] rounded-xl text-black py-3 px-4 text-xs font-bold font-mono placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all"
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className={`border rounded-xl px-6 py-3 text-xs font-extrabold transition-all uppercase tracking-wider ${
            isLoading || !query.trim()
              ? 'bg-gray-50 border-gray-250 text-gray-400 cursor-not-allowed'
              : 'bg-white border-[#F8A1C4] text-[#912D55] hover:bg-[#FFDCE6]/25 cursor-pointer shadow-sm'
          }`}
        >
          {isLoading ? 'Consulting' : 'Ask AI'}
        </button>
      </div>

      {answer && !isLoading && (
        <div className="fadeIn bg-[#FFDCE6]/10 border border-[#F8A1C4]/20 rounded-xl p-4 mt-4 text-xs font-medium text-black leading-relaxed">
          <span className="font-extrabold text-[#912D55] mr-2 tracking-wider font-mono">AI RESPOND:</span>
          <span>{answer}</span>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageQuery;
