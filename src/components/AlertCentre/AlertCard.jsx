import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const AlertCard = ({ alert, isAcknowledged, onAck }) => {
  let severityColor = T.green;
  let bgTint = 'rgba(52,211,153,0.06)';
  if (alert.severity === 'HIGH') {
    severityColor = T.red;
    bgTint = 'rgba(248,113,113,0.06)';
  } else if (alert.severity === 'MEDIUM') {
    severityColor = T.amber;
    bgTint = 'rgba(251,191,36,0.06)';
  }

  return (
    <div style={{
      opacity: isAcknowledged ? 0.4 : 1,
      transform: isAcknowledged ? 'scale(0.99)' : 'scale(1)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      marginBottom: '16px'
    }}>
      <GlassPanel style={{
        padding: '20px 24px',
        borderLeft: `4px solid ${severityColor}`,
        background: isAcknowledged ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${isAcknowledged ? 'rgba(255, 255, 255, 0.5)' : 'rgba(115, 65, 234, 0.08)'}`,
        borderLeftWidth: '4px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        boxShadow: !isAcknowledged && alert.severity === 'HIGH' ? `0 0 20px ${T.red}11` : 'none'
      }}>
        
        {/* Left Zone */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isAcknowledged && alert.severity === 'HIGH' && (
                <div className="live-dot" style={{
                  width: '8px', height: '8px', background: T.red,
                  boxShadow: `0 0 10px ${T.red}`
                }} />
              )}
              <span style={{ fontSize: '15px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay, letterSpacing: '-0.01em' }}>{alert.patientName}</span>
              <span style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '700', fontFamily: T.fontMono, opacity: 0.6 }}>• {alert.patientId}</span>
            </div>
            <div style={{ fontSize: '11px', color: T.textSecondary, fontWeight: '600', fontFamily: T.fontMono }}>{alert.time}</div>
          </div>
          
          <div style={{
            fontSize: '10px', fontWeight: '800', color: severityColor, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '8px', fontFamily: T.fontMono
          }}>
            {alert.type}
          </div>
          
          <div style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.6, fontWeight: '500' }}>
            {alert.description}
          </div>
        </div>

        {/* Right Zone */}
        <div style={{ width: '120px', flexShrink: 0, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', alignSelf: 'center' }}>
          {isAcknowledged ? (
            <div style={{ fontSize: '10px', fontWeight: '800', color: T.green, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: T.fontMono }}>
              ✓ ARCHIVED
            </div>
          ) : (
            <button
              onClick={() => onAck(alert.id)}
              style={{
                background: 'rgba(157, 0, 255, 0.03)',
                border: `1px solid rgba(115, 65, 234, 0.2)`,
                color: T.teal,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(115, 65, 234, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(157, 0, 255, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(157, 0, 255, 0.03)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ACKNOWLEDGE
            </button>
          )}
        </div>

      </GlassPanel>
    </div>
  );
};

export default AlertCard;
