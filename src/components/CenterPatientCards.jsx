import React from 'react';
import { T } from '../tokens';
import GlassPanel from './GlassPanel';

const CenterPatientCards = ({ setCurrentView, setCurrentPatient, patients }) => {
  const displayPatients = patients && patients.length > 0 ? patients : [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
      height: '100%',
      paddingBottom: '40px'
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '500',
        color: T.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '4px',
        fontFamily: T.fontUi
      }}>
        PRIORITY ANALYSIS
      </div>

      {displayPatients.map((p, idx) => {
        const riskColor = p.riskScore > 60 ? T.red : T.green;

        const handleIntakeClick = (e) => {
          e.stopPropagation();
          setCurrentPatient(p);
          setCurrentView('intake');
        };

        const handleCardClick = () => {
          setCurrentPatient(p);
          setCurrentView('patient');
        };

        const adherenceScore = p.adherenceScore || 0;
        const adherenceColor = adherenceScore > 80 ? T.green : adherenceScore > 50 ? T.amber : T.red;

        return (
          <GlassPanel
            key={p.id}
            interactive
            className="fadeIn"
            onClick={handleCardClick}
            style={{
              padding: '24px',
              animationDelay: `${0.15 + (idx * 0.1)}s`,
              border: `1px solid ${T.borderSubtle}`,
              borderRadius: '8px'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: T.textPrimary, marginBottom: '4px', fontFamily: T.fontDisplay }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', color: T.textSecondary, fontFamily: T.fontBody, letterSpacing: '0.03em' }}>
                  {p.id} • {p.age}y • {p.ward}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                  onClick={handleIntakeClick}
                  style={{
                    backgroundColor: 'transparent',
                    color: T.teal,
                    border: `1px solid ${T.tealBorder}`,
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    transition: 'all 0.3s ease',
                    boxShadow: 'none',
                    fontFamily: T.fontUi
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.boxShadow = `0 0 12px ${T.tealDim}`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Analyze & Intake
                </button>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: T.statValue, lineHeight: 1, textShadow: 'none', fontFamily: T.fontDisplay }}>
                    {p.riskScore}
                  </div>
                  <div style={{ fontSize: '9px', color: T.textSecondary, textTransform: 'uppercase', fontWeight: '500', marginTop: '4px', letterSpacing: '0.08em', fontFamily: T.fontUi }}>
                    Risk Index
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {(p.diagnosis || []).map(d => (
                <span key={d} style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'transparent',
                  border: `1px solid ${T.borderSubtle}`,
                  color: T.textSecondary,
                  fontSize: '11px',
                  fontWeight: '500',
                  fontFamily: T.fontUi,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Trajectory Bars */}
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Risk Bar - Modern Pill Style */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '100%', height: '36px', background: 'var(--bg-nav-pill)', borderRadius: '999px',
                  position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center'
                }}>
                  <div style={{
                    width: `${p.riskScore}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-light), var(--accent-medium))',
                    borderRadius: '999px', position: 'absolute', top: 0, left: 0, zIndex: 0
                  }} />
                  <div style={{
                    position: 'relative', zIndex: 1, width: '100%', padding: '0 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: T.fontBody, fontSize: '12px', fontWeight: '500'
                  }}>
                    <span style={{ color: p.riskScore > 30 ? 'var(--text-heading)' : 'var(--text-body)' }}>Clinical Risk</span>
                    <span style={{ color: 'var(--text-heading)', fontWeight: '700' }}>{p.riskScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Adherence Bar - Modern Pill Style */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '100%', height: '36px', background: 'var(--bg-nav-pill)', borderRadius: '999px',
                  position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center'
                }}>
                  <div style={{
                    width: `${adherenceScore}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-medium), var(--accent-primary))',
                    borderRadius: '999px', position: 'absolute', top: 0, left: 0, zIndex: 0
                  }} />
                  <div style={{
                    position: 'relative', zIndex: 1, width: '100%', padding: '0 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: T.fontBody, fontSize: '12px', fontWeight: '500'
                  }}>
                    <span style={{ color: adherenceScore > 30 ? 'var(--text-on-accent)' : 'var(--text-body)' }}>Adherence</span>
                    <span style={{ color: adherenceScore > 80 ? 'var(--text-on-accent)' : 'var(--text-heading)', fontWeight: '700' }}>{adherenceScore}%</span>
                  </div>
                </div>
              </div>

              <button style={{
                padding: '8px 24px', borderRadius: '999px', background: T.teal, color: 'var(--text-on-accent)',
                border: 'none', fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                boxShadow: `none`,
                display: 'flex', alignItems: 'center', gap: '8px',
                alignSelf: 'flex-end',
                fontFamily: T.fontUi,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                PROFILE <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
};

export default CenterPatientCards;
