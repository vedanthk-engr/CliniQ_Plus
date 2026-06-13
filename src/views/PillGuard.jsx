import React, { useState } from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import VisionScanner from '../components/PillGuard/VisionScanner';
import PillAnalysisResult from '../components/PillGuard/PillAnalysisResult';
import AdherenceCalendar from '../components/PillGuard/AdherenceCalendar';
import PrescriptionReference from '../components/PillGuard/PrescriptionReference';

const PillGuard = ({ patient }) => {
  const [analysisResult, setAnalysisResult] = useState(null);

  if (!patient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bgMain }}>
        <TopHeader />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: T.textSecondary }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', filter: 'drop-shadow(0 0 8px rgba(157, 0, 255, 0.4))' }}>◈</div>
            <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: T.fontMono }}>
              Select a patient to initialize Pill Guard
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNewScanResult = (result) => {
    // result comes from our AI model now, which is a big JSON object!
    setAnalysisResult(result);
    
    // Also add to the feed for persistence
    const newEvent = {
      id: Date.now(),
      status: result.outcome,
      drug: result.detectedAs || 'Unknown',
      expected: result.outcome === 'wrong' ? result.medication : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientName: patient.name,
      patientId: patient.id
    };

    // If we have a feed in the context or state, we'd update it here.
    // For now, let's just show the result modal.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bgMain }}>
      <TopHeader />
      
      <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', gap: '20px', overflowY: 'auto' }}>
        
        {/* Left Column (flex 1) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <VisionScanner patient={patient} onScanResult={handleNewScanResult} />
          {/* We'll need to define feedEvents or get it from context if it exists */}
          {/* <MedicationAlertFeed events={feedEvents} /> */}
        </div>
        
        {/* Right Column (flex 1) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AdherenceCalendar patient={patient} />
          <PrescriptionReference patient={patient} />
        </div>

        {analysisResult && (
          <div className="fadeIn" style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            zIndex: 100, 
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
              <PillAnalysisResult result={analysisResult} onDismiss={() => setAnalysisResult(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PillGuard;
