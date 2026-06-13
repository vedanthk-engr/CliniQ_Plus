import React from 'react';
import { T } from '../tokens';

const NAV = [
  { id: 'overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg> },
  { id: 'intake', label: 'Intake', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> },
  { id: 'patient', label: 'Patient', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: 'pillguard', label: 'PillGuard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 1.5L8.5 3.5L14.5 9.5L20.5 3.5L18.5 1.5A2.12 2.12 0 0 0 15.5 1.5L14.5 2.5L13.5 1.5A2.12 2.12 0 0 0 10.5 1.5Z" /><path d="M2 14.5A6.5 6.5 0 1 0 14.5 14.5A6.5 6.5 0 0 0 2 14.5" /><path d="M8.5 12.5V16.5" /><path d="M6.5 14.5H10.5" /></svg> },
  { id: 'analytics', label: 'Analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg> },
  { id: 'alerts', label: 'Alerts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
];

const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <div style={{
      width: '210px',
      height: 'calc(100vh - 20px)',
      position: 'sticky',
      top: '10px',
      marginLeft: '10px',
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1.5px solid rgba(138, 43, 226, 0.2)',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      zIndex: 10,
      gap: '28px',
      boxShadow: '0 0 16px rgba(138, 43, 226, 0.12), 0 8px 32px rgba(138, 43, 226, 0.08)'
    }}>
      {/* Brand Header - Medical Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 4px'
      }}>
        <div style={{
          width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #8A2BE2, #9D00FF)',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(138, 43, 226, 0.3)'
        }}>
          {/* Medical Cross + Pulse Logo */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          color: T.textPrimary,
          letterSpacing: '0.08em',
          fontFamily: T.fontDisplay
        }}>ClinIQ</div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
        {NAV.map(item => {
          const isActive = currentView === item.id || (item.id === 'patient' && currentView === 'patient-registry');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'patient') {
                  setCurrentView('patient-registry');
                } else {
                  setCurrentView(item.id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #8A2BE2, #9D00FF)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: isActive ? '0 4px 14px rgba(138, 43, 226, 0.3)' : 'none',
                fontFamily: T.fontBody,
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                justifyContent: 'flex-start',
                letterSpacing: '0.02em'
              }}
              onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(138, 43, 226, 0.08)'; e.currentTarget.style.color = T.textPrimary; } }}
              onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <span>{item.label}</span>

              {item.id === 'alerts' && (
                <div style={{
                  marginLeft: 'auto',
                  width: '7px', height: '7px', borderRadius: '50%', background: T.red,
                  boxShadow: `0 0 8px ${T.red}`
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div style={{ marginTop: 'auto', padding: '0 4px' }}>
        <div style={{
          fontSize: '9px',
          color: T.textMuted,
          letterSpacing: '0.05em',
          lineHeight: 1.6
        }}>
          Clinical Intelligence
          <br />
          Platform v2.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

