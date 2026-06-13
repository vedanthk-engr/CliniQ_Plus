import React from 'react';
import TopHeader from '../components/TopHeader';
import StatsStrip from '../components/StatsStrip';
import BodyFigure from '../components/HumanBodyBack';
import CenterPatientCards from '../components/CenterPatientCards';
import RightPillPanel from '../components/RightPillPanel';
import { T } from '../tokens';

const Overview = ({ setCurrentView, setCurrentPatient, patients }) => {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bgDeep }}>
      <TopHeader />

      <div className="fadeIn" style={{ padding: '0 24px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Hero Greeting Section */}
        <div className="fadeIn" style={{ animationDelay: '0.05s', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '300', color: T.textMuted, margin: 0, fontFamily: T.fontDisplay, letterSpacing: '-0.03em', lineHeight: '1.2' }}>
            Hello, <span style={{ color: T.textPrimary, fontWeight: '500' }}>Dr. Yuthika</span>
            <span style={{ display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%', margin: '0 8px' }}>👋</span>
            How are <br />
            <span style={{ color: T.textPrimary, fontWeight: '600' }}>your patients</span> doing today?
          </h1>
        </div>

        {/* Original Content: StatsStrip */}
        <StatsStrip patients={patients} />
        <div style={{ display: 'flex', gap: '20px', flex: 1, alignItems: 'stretch', minHeight: '0' }}>

          {/* Zone 2 Left: Human Body Panel */}
          <div className="glassPanel fadeIn" style={{
            flex: '1 1 200px',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            position: 'relative',
            animationDelay: '0.1s'
          }}>
            <div style={{ zIndex: 2 }}>
              <div style={{ fontSize: '10px', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', fontFamily: T.fontUi }}>SYSTEM_INTEL // BIOMETRIC_VIEW</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: T.textPrimary, margin: '8px 0 0 0', fontFamily: T.fontDisplay, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Somatic Analysis</h3>
            </div>

            <div style={{ flex: 1, marginTop: '24px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <BodyFigure
                zones={[{ region: 'chest', color: '#f5a623' }, { region: 'torso', color: '#2ec4b6' }]}
                landmarks={true}
                style={{ width: '100%', height: '100%', maxHeight: '400px' }}
              />
            </div>

            {/* Health Index Score Overlay */}
            <div style={{ zIndex: 2, background: T.bgTertiary, border: `1px solid ${T.borderSubtle}`, borderRadius: '8px', padding: '16px', marginTop: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '500', marginBottom: '12px', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: T.fontUi }}>
                <span>Health Index Coefficient</span>
                <span style={{ color: T.teal }}>0.824 η</span>
              </div>
              <div style={{ position: 'relative', height: '4px', background: T.bgPanelHover, borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '82%', background: `linear-gradient(90deg, transparent, ${T.teal})`, borderRadius: '999px', boxShadow: `0 0 10px ${T.tealDim}` }} />
              </div>
            </div>
          </div>

          <div style={{ flex: '1.4 1 350px', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '0' }}>

            {/* System Modules Quick Access */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>

              {/* AI Intake Module */}
              <div
                className="glassPanelInteractive fadeIn"
                onClick={() => setCurrentView('intake')}
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '140px',
                  animationDelay: '0.2s',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1.5px solid rgba(138, 43, 226, 0.25)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.25), 0 8px 32px rgba(138, 43, 226, 0.15)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'; }}
              >
                {/* Background Glow */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: T.teal, filter: 'blur(50px)', opacity: 0.05, borderRadius: '50%' }} />

                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--bg-nav-pill)', border: `1px solid ${T.borderSubtle}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.teal, marginBottom: '16px', zIndex: 2
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>

                <div style={{ zIndex: 2, textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay, letterSpacing: '0.05em', lineHeight: '1.4' }}>AI INTAKE ENGINE</div>
                </div>
              </div>

              {/* PillGuard Telemetry */}
              <div
                className="glassPanelInteractive fadeIn"
                onClick={() => setCurrentView('pillguard')}
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '140px',
                  animationDelay: '0.25s',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1.5px solid rgba(138, 43, 226, 0.25)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.25), 0 8px 32px rgba(138, 43, 226, 0.15)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'; }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: T.indigo, filter: 'blur(50px)', opacity: 0.05, borderRadius: '50%' }} />

                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--bg-nav-pill)', border: `1px solid ${T.borderSubtle}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.indigo, marginBottom: '16px', zIndex: 2
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h3l3 -9l5 18l3 -9h5" /></svg>
                </div>

                <div style={{ zIndex: 2, textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay, letterSpacing: '0.05em', lineHeight: '1.4' }}>PILLGUARD SYNC</div>
                </div>
              </div>

              {/* Patient Registry */}
              <div
                className="glassPanelInteractive fadeIn"
                onClick={() => setCurrentView('patient-registry')}
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '140px',
                  animationDelay: '0.3s',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1.5px solid rgba(138, 43, 226, 0.25)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.25), 0 8px 32px rgba(138, 43, 226, 0.15)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(138, 43, 226, 0.12), 0 4px 20px rgba(138, 43, 226, 0.08)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'; }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: T.accentElectric, filter: 'blur(50px)', opacity: 0.05, borderRadius: '50%' }} />

                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--bg-nav-pill)', border: `1px solid ${T.borderSubtle}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.accentElectric, marginBottom: '16px', zIndex: 2
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>

                <div style={{ zIndex: 2, textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay, letterSpacing: '0.05em', lineHeight: '1.4' }}>GLOBAL REGISTRY</div>
                </div>
              </div>
            </div>

            {/* Original Center Content */}
            <CenterPatientCards setCurrentView={setCurrentView} setCurrentPatient={setCurrentPatient} patients={patients} />

          </div>

          {/* Right Area: Original Pill Scan Events */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <RightPillPanel />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overview;
