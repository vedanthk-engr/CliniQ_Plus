import React, { useState } from 'react';
import { T } from '../tokens';
import PreConsultBanner from '../components/PatientIntel/PreConsultBanner';
import BodyMapContext from '../components/PatientIntel/BodyMapContext';
import LabTrendChart from '../components/PatientIntel/LabTrendChart';
import ClinicalPatternFeed from '../components/PatientIntel/ClinicalPatternFeed';
import MedicationsPanel from '../components/PatientIntel/MedicationsPanel';
import NaturalLanguageQuery from '../components/PatientIntel/NaturalLanguageQuery';
import SecondOpinionPanel from '../components/PatientIntel/SecondOpinionPanel';
import DrugInteractionMap from '../components/DrugInteractionMap';
import GlassPanel from '../components/GlassPanel';
import TopHeader from '../components/TopHeader';

const PatientIntel = ({ patients = [], patient, setCurrentPatient, setCurrentView, startInRegistry, onDeletePatient }) => {
  const [viewMode, setViewMode] = useState(!patient || startInRegistry ? 'list' : 'detail');

  // List View / Registry
  if (viewMode === 'list' || !patient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bgMain }}>
        <TopHeader />
        <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: T.textPrimary, marginBottom: '8px', fontFamily: T.fontDisplay }}>
            Patient Intelligence Registry
          </div>
          <div style={{ fontSize: '14px', color: T.textSecondary, marginBottom: '32px' }}>
            Select a patient file to initialize their comprehensive somatic and biometric insight dashboard.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {patients.map(p => (
              <GlassPanel
                key={p.id}
                interactive
                onClick={() => {
                  setCurrentPatient(p);
                  setViewMode('detail');
                  setCurrentView('patient');
                }}
                style={{ padding: '24px', cursor: 'pointer', border: `1px solid ${T.borderSubtle}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: T.textSecondary, fontWeight: '700', fontFamily: T.fontMono, letterSpacing: '0.05em', marginBottom: '8px' }}>
                      {p.id} • {p.ward.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: T.textPrimary, fontFamily: T.fontDisplay, marginBottom: '4px' }}>
                      {p.name} <span style={{ fontSize: '14px', color: T.textSecondary, fontWeight: '500' }}>({p.age}Y)</span>
                    </div>
                    <div style={{ fontSize: '12px', color: T.teal, marginBottom: '16px', fontWeight: '500' }}>
                      Physician: {p.doctor}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete patient ${p.name}?`)) {
                        onDeletePatient && onDeletePatient(p.id);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid rgba(239, 68, 68, 0.3)`,
                      color: T.red,
                      cursor: 'pointer',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = T.red;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = T.red;
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', borderTop: `1px solid ${T.borderSubtle}`, paddingTop: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: T.textSecondary, fontFamily: T.fontUi, textTransform: 'uppercase' }}>Risk Score</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: p.riskScore > 60 ? T.red : T.green }}>{p.riskScore}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: T.textSecondary, fontFamily: T.fontUi, textTransform: 'uppercase' }}>Primary</div>
                    <div style={{ fontSize: '13px', color: T.textPrimary, fontWeight: '500', marginTop: '4px' }}>
                      {p.diagnosis && p.diagnosis.length > 0 ? p.diagnosis[0] : 'Review Needed'}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bgMain }}>
      <TopHeader />

      <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Back navigation */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setCurrentView('patient-registry')}
            style={{
              background: 'transparent', border: 'none', color: T.teal, fontSize: '11px', fontWeight: '800',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: T.fontMono, letterSpacing: '0.05em'
            }}
          >
            ← BACK TO REGISTRY
          </button>
        </div>

        {/* Component 1: Banner */}
        <PreConsultBanner patient={patient} setCurrentView={setCurrentView} />

        {/* 3-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 320px',
          gap: '20px',
          flex: 1,
          alignItems: 'stretch'
        }}>

          {/* Column A */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <BodyMapContext patient={patient} />
            <GlassPanel style={{
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(115, 65, 234, 0.08)'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '800',
                color: T.teal,
                letterSpacing: '0.15em',
                marginBottom: '20px',
                width: '100%',
                textTransform: 'uppercase',
                fontFamily: T.fontMono,
                borderBottom: '1px solid rgba(115, 65, 234, 0.1)',
                paddingBottom: '12px'
              }}>
                Interactive Conflicts
              </div>
              <DrugInteractionMap patient={patient} />
            </GlassPanel>
          </div>

          {/* Column B */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LabTrendChart patient={patient} />
            <ClinicalPatternFeed patient={patient} />
            <NaturalLanguageQuery patient={patient} />
          </div>

          {/* Column C */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <MedicationsPanel patient={patient} />
            </div>
            <SecondOpinionPanel patient={patient} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientIntel;
