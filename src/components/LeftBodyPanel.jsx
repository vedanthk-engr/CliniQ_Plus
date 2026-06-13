import React from 'react';
import { T } from '../tokens';
import GlassPanel from './GlassPanel';
import BodyFigure from './HumanBodyBack';
import LiveDot from './LiveDot';

const LeftBodyPanel = () => {
  return (
    <GlassPanel className="fadeIn" style={{
      width: '260px',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      animationDelay: '0.1s',
      border: '1px solid rgba(115, 65, 234, 0.05)',
      background: 'rgba(255, 255, 255, 0.5)'
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '800',
        color: T.teal,
        letterSpacing: '0.15em',
        marginBottom: '2rem',
        width: '100%',
        textAlign: 'center',
        borderBottom: `1px solid rgba(115, 65, 234, 0.1)`,
        paddingBottom: '12px',
        fontFamily: T.fontMono
      }}>
        CLINICAL BODY MAP
      </div>

      {/* SVG Container centering */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <BodyFigure
          zones={[{ region: 'chest', color: '#f5a623' }, { region: 'torso', color: '#2ec4b6' }]}
          landmarks={true}
          style={{ width: '90%', height: '90%' }}
        />
      </div>

      {/* Legend Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '2rem',
        paddingTop: '16px',
        borderTop: `1px solid rgba(115, 65, 234, 0.1)`,
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ background: T.red, width: '6px', height: '6px', filter: `drop-shadow(0 0 3px ${T.red})` }} />
          <span style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '800', letterSpacing: '0.05em' }}>HIGH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ background: T.amber, width: '6px', height: '6px', filter: `drop-shadow(0 0 3px ${T.amber})` }} />
          <span style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '800', letterSpacing: '0.05em' }}>MED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ background: T.green, width: '6px', height: '6px', filter: `drop-shadow(0 0 3px ${T.green})` }} />
          <span style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '800', letterSpacing: '0.05em' }}>LOW</span>
        </div>
      </div>
    </GlassPanel>
  );
};

export default LeftBodyPanel;
