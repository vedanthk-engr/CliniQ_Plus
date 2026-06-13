import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import { fetchInteractions } from '../../api';

const MedicationsPanel = ({ patient }) => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (patient) {
      fetchInteractions(patient.id).then(setInteractions);
    }
  }, [patient]);

  if (!patient || !patient.medications) return null;

  // Find interactions for this patient
  const medNames = patient.medications.map(m => m.name.toLowerCase());
  const activeInteractions = interactions.filter(int =>
    medNames.includes(int.drug_a.toLowerCase()) && medNames.includes(int.drug_b.toLowerCase()) && int.severity !== 'none'
  );

  return (
    <GlassPanel style={{
      padding: '24px 20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
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
        CURRENT REGIMEN
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {patient.medications.map((med, idx) => {

          let shadowColor = med.color;
          // Convert hex to rgba for shadow if we assume standard 6-char hex, otherwise just use color
          const baseColor = med.color.startsWith('#') ? med.color : T.teal;

          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderBottom: idx < patient.medications.length - 1 ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
              paddingBottom: idx < patient.medications.length - 1 ? '16px' : '0'
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay }}>{med.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: T.textSecondary, fontFamily: T.fontMono }}>{med.dose}</span>
                </div>
                <div style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{med.freq}</div>
              </div>
              <div style={{
                fontFamily: T.fontMono,
                fontSize: '10px',
                color: T.textMuted,
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontWeight: '600'
              }}>
                {med.markings}
              </div>
            </div>
          );
        })}
      </div>

      {activeInteractions.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.5)' }}>
          {activeInteractions.map((int, i) => (
            <div key={i} style={{
              background: 'rgba(245, 158, 11, 0.03)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderLeft: `4px solid ${T.amber}`,
              borderRadius: '10px',
              padding: '16px',
              marginTop: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ color: T.amber, fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: T.fontMono, textTransform: 'uppercase' }}>
                ⚠ PHARMACOLOGICAL CONFLICT
              </div>
              <div style={{ fontSize: '11px', color: T.textSecondary, lineHeight: 1.6, fontWeight: '500' }}>
                <strong style={{ color: T.textPrimary, fontWeight: '800' }}>{int.drug_a.toUpperCase()} + {int.drug_b.toUpperCase()}</strong>: {int.desc}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
};

export default MedicationsPanel;
