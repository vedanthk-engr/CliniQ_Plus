import React from 'react';
import { T } from '../tokens';
import GlassPanel from './GlassPanel';

const StatsStrip = ({ patients = [] }) => {
  const totalPatients = patients.length;

  // Calculate average risk score
  const avgRisk = totalPatients > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.riskScore || 0), 0) / totalPatients)
    : 0;

  // Calculate high risk alerts (patients with score > 65)
  const criticalCount = patients.filter(p => p.riskScore > 65).length;

  // Calculate average adherence
  const avgAdherence = totalPatients > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.adherenceScore || 0), 0) / totalPatients)
    : 0;

  const STATS = [
    { id: 'active_patients', label: 'Active Patients', value: totalPatients.toString(), status: 'Optimized', color: T.teal, icon: '👥', delay: '0s' },
    { id: 'critical_alerts', label: "Critical Alerts", value: criticalCount.toString(), status: criticalCount > 0 ? 'Review' : 'Clear', color: criticalCount > 0 ? T.red : T.indigo, icon: '⚠️', delay: '0.07s' },
    { id: 'avg_risk', label: 'Avg Risk Index', value: `${avgRisk}%`, status: avgRisk > 60 ? 'Elevated' : 'Stable', color: avgRisk > 60 ? T.amber : T.teal, icon: '📉', delay: '0.14s' },
    { id: 'avg_adherence', label: 'Global Adherence', value: `${avgAdherence}%`, status: avgAdherence < 80 ? 'Intervene' : 'Standard', color: avgAdherence < 80 ? T.amber : T.indigo, icon: '🎯', delay: '0.21s' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
    }}>
      {STATS.map(stat => (
        <GlassPanel key={stat.id} className="fadeIn glassPanel" style={{
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          animationDelay: stat.delay,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Subtle colored glow bubble in the background */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: stat.color, filter: 'blur(50px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: T.textSecondary,
                fontFamily: T.fontUi
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>
                {stat.icon}
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: '400',
              color: T.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: T.fontBody,
              marginBottom: '2px'
            }}>
              Status: <span style={{ color: T.textPrimary, fontWeight: '500' }}>{stat.status}</span>
            </div>

            <div style={{
              fontSize: '48px',
              fontWeight: '300',
              color: T.statValue,
              lineHeight: 1,
              fontFamily: T.fontDisplay,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'baseline'
            }}>
              {stat.value}
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
};

export default StatsStrip;
