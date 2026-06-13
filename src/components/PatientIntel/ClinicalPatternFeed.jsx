import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const ClinicalPatternFeed = ({ patient }) => {
  if (!patient || !patient.clinicalPatterns || !patient.clinicalPatterns.length) return null;

  return (
    <GlassPanel style={{ 
      padding: '24px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      overflowY: 'auto',
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(115, 65, 234, 0.08)'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '800',
        color: T.teal,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(115, 65, 234, 0.1)',
        paddingBottom: '12px',
        fontFamily: T.fontMono
      }}>
        ANOMALY DETECTION FEED
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {patient.clinicalPatterns.map((pattern, idx) => {
          let color = T.green;
          let borderColor = 'rgba(16, 185, 129, 0.2)';

          if (pattern.severity === 'HIGH') {
            color = T.red;
            borderColor = 'rgba(239, 68, 68, 0.2)';
          } else if (pattern.severity === 'MEDIUM') {
            color = T.amber;
            borderColor = 'rgba(245, 158, 11, 0.2)';
          }

          return (
            <div key={idx} className="fadeIn" style={{
              borderRadius: '12px',
              padding: '16px',
              borderLeft: `4px solid ${color}`,
              background: 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${borderColor}`,
              borderLeftWidth: '4px',
              animationDelay: `${0.15 * idx}s`,
              boxShadow: pattern.severity === 'HIGH' ? `0 0 15px ${T.red}11` : 'none'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="live-dot" style={{
                    width: '6px', height: '6px', backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`
                  }}></div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: T.fontMono }}>
                    {pattern.type}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: T.textSecondary, fontFamily: T.fontMono, fontWeight: '700' }}>{pattern.time}</div>
              </div>

              <div style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.6, fontWeight: '500' }}>
                {pattern.description}
              </div>

            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

export default ClinicalPatternFeed;
