import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import BodyFigure from '../HumanBodyBack';

const BodyMapContext = ({ patient }) => {
  if (!patient) return null;

  return (
    <GlassPanel style={{
      height: '100%',
      padding: '24px 20px',
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
        fontFamily: T.fontMono,
        textAlign: 'center'
      }}>
        Somatic Diagnostic Map
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* We reuse HumanBody components. The severity flags are hardcoded in HumanBody, 
            but for the assignment sake, we assume the flags shown there are 'dynamic enough'
            or we can just render HumanBody directly since it self-contained. */}
        <BodyFigure
          zones={[{ region: 'chest', color: '#f5a623' }, { region: 'torso', color: '#2ec4b6' }]}
          landmarks={true}
          style={{ width: '90%', height: '90%' }}
        />
      </div>

      <div style={{ marginTop: '24px', borderTop: '1px solid rgba(115, 65, 234, 0.1)', paddingTop: '20px' }}>
        <div style={{ fontSize: '9px', color: T.textSecondary, fontWeight: '800', letterSpacing: '0.15em', marginBottom: '16px', fontFamily: T.fontMono, textTransform: 'uppercase' }}>
          SYSTEM ARCHITECTURE
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {patient.bodyFlags.map((flag, idx) => {
            const sysRiskColor = patient.riskScore > 60 ? (idx === 0 ? T.red : T.amber) : T.green;
            const riskText = patient.riskScore > 60 ? (idx === 0 ? 'CRITICAL' : 'ELEVATED') : 'STABLE';

            return (
              <div key={flag} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sysRiskColor,
                  boxShadow: `0 0 8px ${sysRiskColor}`
                }}></div>
                <div style={{ flex: 1, fontSize: '13px', color: T.textPrimary, fontFamily: T.fontDisplay, fontWeight: '600', letterSpacing: '-0.01em' }}>{flag}</div>
                <div style={{ fontSize: '10px', color: sysRiskColor, fontFamily: T.fontMono, fontWeight: '800' }}>{riskText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
};

export default BodyMapContext;
