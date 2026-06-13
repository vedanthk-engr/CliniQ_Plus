import React from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import PatientAnalyticsCard from '../components/Analytics/PatientAnalyticsCard';
import DrugInteractionMap from '../components/DrugInteractionMap';
import GlassPanel from '../components/GlassPanel';

const Analytics = ({ patients = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopHeader />

      <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: T.textPrimary,
            letterSpacing: '-0.02em',
            fontFamily: T.fontDisplay,
            textShadow: '0 0 15px rgba(115, 65, 234, 0.2)'
          }}>
            Clinical Analytics
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.5)', color: T.textPrimary, border: `1px solid rgba(115, 65, 234, 0.2)`,
            padding: '10px 18px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', fontFamily: T.fontMono,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            Range: Last 12 Months
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', flex: 1, alignItems: 'start' }}>
          {patients.map(p => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
              <PatientAnalyticsCard patient={p} />

              <GlassPanel style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(115, 65, 234, 0.08)'
              }}>
                <div style={{
                  width: '100%',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: T.teal,
                  letterSpacing: '0.15em',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  fontFamily: T.fontMono,
                  borderBottom: '1px solid rgba(115, 65, 234, 0.1)',
                  paddingBottom: '12px'
                }}>
                  Biometric Interaction Map
                </div>
                <DrugInteractionMap patient={p} />
              </GlassPanel>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
