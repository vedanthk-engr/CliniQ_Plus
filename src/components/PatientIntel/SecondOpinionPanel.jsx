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
    <div style={{
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '20px',
      padding: '24px',
      marginTop: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '800',
        color: T.purple,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '6px',
        fontFamily: T.fontMono,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.purple, boxShadow: `0 0 8px ${T.purple}` }} /> SECOND OPINION ENGINE
      </div>
      <div style={{ fontSize: '11px', color: T.textSecondary, marginBottom: '16px', lineHeight: 1.5, fontWeight: '500' }}>
        AI STRESS-TESTS HYPOTHESIS AGAINST COMPLETE CLINICAL ARCHIVE
      </div>

      <textarea
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        placeholder="ENTER HYPOTHESIS (e.g. DIABETIC NEPHROPATHY)..."
        rows={2}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.5)',
          border: `1px solid rgba(139, 92, 246, 0.2)`,
          borderRadius: '10px',
          color: T.textPrimary,
          padding: '12px 16px',
          fontSize: '13px',
          outline: 'none',
          resize: 'none',
          marginBottom: '16px',
          fontFamily: T.fontMono,
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = T.purple;
          e.target.style.background = 'rgba(139, 92, 246, 0.05)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
          e.target.style.background = 'rgba(255, 255, 255, 0.5)';
        }}
      />

      <button
        onClick={handleRun}
        disabled={isLoading || !diagnosis.trim()}
        style={{
          width: '100%',
          padding: '12px',
          background: isLoading || !diagnosis.trim() ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.15)',
          border: `1px solid ${isLoading || !diagnosis.trim() ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.3)'}`,
          color: T.purple,
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: '800',
          cursor: isLoading || !diagnosis.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          fontFamily: T.fontMono,
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}
        onMouseEnter={e => {
          if (!isLoading && diagnosis.trim()) {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.2)';
          }
        }}
        onMouseLeave={e => {
          if (!isLoading && diagnosis.trim()) {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isLoading ? <span style={{ animation: 'blink 1.5s infinite' }}>CROSS-REFERENCING ARCHIVE...</span> : 'EXECUTE VALIDATION'}
      </button>

      {response && !isLoading && (
        <div className="fadeIn" style={{ marginTop: '20px', borderTop: `1px solid rgba(139, 92, 246, 0.1)`, paddingTop: '20px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              background: 
                response.verdict === 'CORROBORATED' ? 'rgba(16, 185, 129, 0.1)' : 
                response.verdict === 'CONTRADICTED' ? 'rgba(239, 68, 68, 0.1)' : 
                'rgba(245, 158, 11, 0.1)',
              color: 
                response.verdict === 'CORROBORATED' ? T.green : 
                response.verdict === 'CONTRADICTED' ? T.red : 
                T.amber,
              border: `1px solid ${
                response.verdict === 'CORROBORATED' ? 'rgba(16, 185, 129, 0.3)' : 
                response.verdict === 'CONTRADICTED' ? 'rgba(239, 68, 68, 0.3)' : 
                'rgba(245, 158, 11, 0.3)'
              }`,
              fontFamily: T.fontMono,
              textTransform: 'uppercase'
            }}>
              {response.verdict}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            {/* LEFT / SUPPORT */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: '800', color: T.green, marginBottom: '10px', fontFamily: T.fontMono, opacity: 0.8 }}>SUPPORTING EVIDENCE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {response.support.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#1E1E2D', lineHeight: 1.5, fontWeight: '500' }}>
                    <span style={{ color: T.green }}>✓</span><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DIVIDER */}
            <div style={{ width: '1px', background: 'rgba(138, 43, 226, 0.15)' }}></div>

            {/* RIGHT / CONTRADICT */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: '800', color: T.red, marginBottom: '10px', fontFamily: T.fontMono, opacity: 0.8 }}>GAPS / CONFLICTS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {response.contradict.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#1E1E2D', lineHeight: 1.5, fontWeight: '500' }}>
                    <span style={{ color: T.red }}>⚑</span><span>{c}</span>
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
