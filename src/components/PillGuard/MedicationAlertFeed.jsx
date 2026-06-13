import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const MedicationAlertFeed = ({ events }) => {
  return (
    <GlassPanel style={{ 
      flex: 1, 
      padding: '24px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(115, 65, 234, 0.08)'
    }}>
      
      <div style={{
        fontSize: '10px', fontWeight: '800', color: T.textSecondary, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: '16px', borderBottom: `1px solid rgba(115, 65, 234, 0.1)`, 
        paddingBottom: '12px', fontFamily: T.fontMono
      }}>
        LIVE ALERT FEED
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '6px' }}>
        {events.map((evt) => {
          let borderColor = 'rgba(115, 65, 234, 0.08)';
          let statusColor = 'teal';
          let badgeText = 'CONFIRMED';
          let bg = 'rgba(255, 255, 255, 0.5)';

          if (evt.status === 'wrong') {
            borderColor = 'rgba(239, 68, 68, 0.2)';
            statusColor = 'red';
            badgeText = 'WRONG PILL';
            bg = 'rgba(239, 68, 68, 0.05)';
          } else if (evt.status === 'unconfirmed') {
            borderColor = 'rgba(245, 158, 11, 0.15)';
            statusColor = 'amber';
            badgeText = 'UNCONFIRMED';
          }

          return (
            <div key={evt.id} className="fadeIn" style={{
              background: bg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay }}>
                  {evt.patientName || 'Anonymous'} <span style={{ color: T.textSecondary, fontWeight: '500', fontSize: '10px', opacity: 0.7 }}>• {evt.patientId || 'ID-?'}</span>
                </div>
                <Badge variant={statusColor}>{badgeText}</Badge>
              </div>

              <div style={{ fontSize: '14px', color: T.textPrimary, fontWeight: '700', letterSpacing: '-0.01em' }}>
                <span style={{ color: T.textSecondary, marginRight: '8px', fontSize: '11px', fontWeight: '500', fontFamily: T.fontMono }}>{evt.time}</span> 
                {evt.expected ? evt.expected : evt.drug}
              </div>

              {evt.status === 'wrong' && (
                <div style={{ 
                  fontSize: '11px', 
                  color: T.red, 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.02em',
                  background: 'rgba(239, 68, 68, 0.05)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.1)'
                }}>
                  Detected as: {evt.drug} — Caregiver notified
                </div>
              )}

            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

export default MedicationAlertFeed;
