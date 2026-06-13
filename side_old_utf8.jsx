import React from 'react';
import { T } from '../tokens';
import Badge from './Badge';

const NAV = [
  { id: 'overview', icon: 'ε¬¥', label: 'Overview' },
  { id: 'patient', icon: 'ε¬ö', label: 'Patient Intel' },
  { id: 'pillguard', icon: 'ε½Ö', label: 'Pill Guard' },
  { id: 'analytics', icon: 'ε⌐╗', label: 'Analytics' },
  { id: 'alerts', icon: 'ε⌐¼', label: 'Alert Centre' },
];

const Sidebar = ({ currentView, setCurrentView, currentPatient, setCurrentPatient, patients }) => {
  return (
    <div style={{
      width: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: '#FFFFFF',
      borderRight: `1px solid ${T.borderSubtle}`,
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      padding: '2rem 1.25rem',
      zIndex: 10,
      gap: '2rem'
    }}>
      {/* Brand */}
      <div style={{ padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <span style={{ color: '#fff', fontSize: '20px' }}>ε¬¥</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: T.textPrimary }}>
              CLINIQ
            </h1>
            <div style={{ fontSize: '10px', color: T.teal, fontWeight: '600', letterSpacing: '0.1em' }}>PRECISION AI</div>
          </div>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#111827', letterSpacing: '-0.02em' }}>
          <span style={{ color: T.primary }}>Clin</span>IQ
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {NAV.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: isActive ? T.teal : T.textSecondary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 1 : 0.8 }}>
                {item.icon}
              </div>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'alerts' && <Badge variant="critical">2</Badge>}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '25%', bottom: '25%',
                  width: '4px', background: T.teal, borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Patient Context */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: T.textMuted, letterSpacing: '0.05em', padding: '0 0.5rem' }}>
          PATIENT REGISTRY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(patients || []).map(p => {
            const isSelected = currentPatient?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setCurrentPatient(p);
                  if (currentView !== 'pillguard' && currentView !== 'patient') setCurrentView('patient');
                }}
                className="glassPanel glassPanelInteractive"
                style={{
                  padding: '16px',
                  borderColor: isSelected ? T.tealBorder : 'transparent',
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ color: T.textPrimary, fontWeight: '600', fontSize: '14px' }}>{p.name}</div>
                  <div style={{
                    color: p.riskScore > 60 ? T.red : T.green,
                    fontSize: '11px', fontWeight: '800',
                    padding: '2px 8px', borderRadius: '6px',
                    background: p.riskScore > 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                  }}>
                    {p.riskScore}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: T.textSecondary }}>
                  ID: {p.id} ΓÇó {p.age}yrs
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </div>
  );
};

export default Sidebar;
