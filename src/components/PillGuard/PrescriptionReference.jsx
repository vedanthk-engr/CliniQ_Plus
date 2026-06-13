import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const PrescriptionReference = ({ patient }) => {
  if (!patient || !patient.medications) return null;

  return (
    <GlassPanel style={{ 
      padding: '24px 20px', 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(115, 65, 234, 0.08)'
    }}>
      
      <div style={{
        fontSize: '10px', fontWeight: '800', color: T.teal, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: '4px', fontFamily: T.fontMono
      }}>
        PRESCRIPTION REFERENCE
      </div>
      <div style={{ fontSize: '9px', fontWeight: '700', color: T.textSecondary, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        MOLECULAR SIGNATURE DATABASE
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {patient.medications.map((med, idx) => {
          const baseColor = med.color.startsWith('#') ? med.color : T.teal; 
          
          return (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              borderBottom: idx < patient.medications.length -1 ? `1px solid rgba(115, 65, 234, 0.1)` : 'none', 
              paddingBottom: idx < patient.medications.length -1 ? '16px' : '0' 
            }}>
              <div style={{
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px', border: `1px solid rgba(115, 65, 234, 0.1)`,
                boxShadow: `0 0 10px ${baseColor}22`
              }}>
                <svg width="24" height="16" viewBox="0 0 24 16">
                  {med.shape === 'Round' ? (
                    <circle cx="12" cy="8" r="6" fill={med.color} filter={`drop-shadow(0 0 3px ${med.color}88)`} />
                  ) : (
                    <ellipse cx="12" cy="8" rx="9" ry="5" fill={med.color} filter={`drop-shadow(0 0 3px ${med.color}88)`} />
                  )}
                </svg>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: T.textPrimary, marginBottom: '2px', letterSpacing: '-0.01em' }}>
                  {med.name} <span style={{ color: T.textSecondary, fontWeight: '500', fontSize: '11px' }}>{med.dose}</span>
                </div>
                <div style={{ fontFamily: T.fontMono, fontSize: '10px', color: T.textMuted, fontWeight: '600' }}>
                  {med.shape} • {med.markings}
                </div>
              </div>
              
              <div style={{
                fontSize: '10px', fontWeight: '800', color: T.teal, background: 'rgba(115, 65, 234, 0.05)',
                padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(115, 65, 234, 0.1)',
                textTransform: 'uppercase'
              }}>
                {med.freq}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '24px', 
        paddingTop: '20px', 
        color: T.textMuted, 
        fontSize: '10px', 
        fontWeight: '500', 
        fontStyle: 'italic', 
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        Vision AI cross-references physical characteristics against verified pharmacy standards.
      </div>
    </GlassPanel>
  );
};

export default PrescriptionReference;
