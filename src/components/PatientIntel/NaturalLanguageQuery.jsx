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
    <GlassPanel style={{ 
      padding: '20px', 
      marginTop: '20px', 
      flexShrink: 0,
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(115, 65, 234, 0.08)'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '800',
        color: T.teal,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '12px',
        fontFamily: T.fontMono,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div className="live-dot" style={{ width: '6px', height: '6px' }} /> CLINICAL QUERY INTERFACE
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="QUERY PATIENT LONG-TERM HISTORY..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.5)',
            border: `1px solid rgba(157, 0, 255, 0.15)`,
            borderRadius: '10px',
            color: T.textPrimary,
            padding: '12px 18px',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: T.fontMono,
            fontWeight: '600'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.teal;
            e.target.style.background = 'rgba(157, 0, 255, 0.03)';
            e.target.style.boxShadow = `0 0 15px rgba(115, 65, 234, 0.1)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(157, 0, 255, 0.15)';
            e.target.style.background = 'rgba(255, 255, 255, 0.5)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          style={{
            background: isLoading || !query.trim() ? 'rgba(115, 65, 234, 0.05)' : 'rgba(115, 65, 234, 0.1)',
            color: T.teal,
            border: `1px solid ${isLoading || !query.trim() ? 'rgba(115, 65, 234, 0.1)' : T.teal}`,
            borderRadius: '10px',
            padding: '0 24px',
            fontSize: '11px',
            fontWeight: '800',
            cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            minWidth: '100px',
            fontFamily: T.fontMono,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={e => {
            if (!isLoading && query.trim()) {
              e.currentTarget.style.background = 'rgba(115, 65, 234, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(115, 65, 234, 0.2)';
            }
          }}
          onMouseLeave={e => {
            if (!isLoading && query.trim()) {
              e.currentTarget.style.background = 'rgba(115, 65, 234, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isLoading ? <span style={{ animation: 'blink 1.5s infinite' }}>CONSULTING</span> : 'ASK AI'}
        </button>
      </div>

      {answer && !isLoading && (
        <div className="fadeIn" style={{
          background: 'rgba(157, 0, 255, 0.03)',
          border: '1px solid rgba(115, 65, 234, 0.1)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginTop: '16px',
          fontSize: '13px',
          lineHeight: 1.7,
          boxShadow: 'inset 0 0 20px rgba(157, 0, 255, 0.02)'
        }}>
          <span style={{ fontWeight: '800', color: T.teal, marginRight: '8px', fontFamily: T.fontMono, fontSize: '11px' }}>AI RESPOND:</span>
          <span style={{ color: T.textPrimary, fontWeight: '500' }}>{answer}</span>
        </div>
      )}
    </GlassPanel>
  );
};

export default NaturalLanguageQuery;
