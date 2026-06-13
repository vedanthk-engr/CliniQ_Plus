import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import Badge from '../Badge';
import VitalCard from './VitalCard';

const ExtractionResults = ({ data, onApprove, onEdit }) => {
  const [editedData, setEditedData] = useState(data);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleChange = (key, value) => {
    const newData = { ...editedData, [key]: { ...editedData[key], value } };
    setEditedData(newData);
    onEdit(newData);
  };

  const fields = [
    { id: 'diagnosis', label: 'Diagnosis', icon: '🩺' },
    { id: 'medications', label: 'Medications', icon: '💊' },
    { id: 'vital_thresholds', label: 'Vital Thresholds', icon: '📊' },
    { id: 'dietary_restrictions', label: 'Dietary Restrictions', icon: '🍎' },
    { id: 'activity_limitations', label: 'Activity Limitations', icon: '🏃' },
    { id: 'follow_up_date', label: 'Follow-up Date', icon: '📅' },
    { id: 'imaging_analysis', label: 'Imaging Analysis', icon: '☢️' },
  ];

  const getConfidenceLevel = (score) => {
    if (score > 90) return { color: T.teal, label: 'High' };
    if (score > 70) return { color: T.amber, label: 'Medium' };
    return { color: T.red, label: 'Low' };
  };

  // Generate mock trend data for the charts
  const getMockTrend = (base, variance, count = 20) => {
    return Array.from({ length: count }, (_, i) => ({
      name: i,
      val: base + (Math.random() - 0.5) * variance
    }));
  };

  const vitals = editedData.vitals?.value || {};
  const vitalsConfidence = editedData.vitals?.confidence || 0;
  const docType = (editedData.document_type || 'discharge_summary').toLowerCase();
  const isImaging = docType.includes('imaging');

  // Check if vitals have any real data
  const hasVitals = vitals.bp && vitals.bp !== 'Not mentioned' || 
                   vitals.hr && vitals.hr !== 'Not mentioned' || 
                   vitals.glucose && vitals.glucose !== 'Not mentioned';

  const matchStatus = editedData.patient_match || 'not_found';
  const extractedName = editedData.extracted_name || 'Unknown';
  
  const getMatchUI = () => {
    switch(matchStatus) {
      case 'match': return { color: T.green, label: 'Verified Match', icon: '✅' };
      case 'partial': return { color: T.amber, label: 'Potential Match (Nickname/Similar)', icon: '⚠️' };
      case 'mismatch': return { color: T.red, label: 'PATIENT MISMATCH', icon: '🚨' };
      default: return { color: T.textSecondary, label: 'Patient not identified', icon: '❓' };
    }
  };
  
  const matchUI = getMatchUI();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: T.teal, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: T.fontMono }}>
            AI Engine: {docType.replace(/_/g, ' ')}
          </div>
          {isImaging && <Badge color={T.indigo} label="VISUAL MODALITY" />}
        </div>
        <button 
          onClick={() => onApprove(editedData)}
          style={{ 
            backgroundColor: 'rgba(115, 65, 234, 0.1)', 
            color: T.teal, 
            border: `1px solid ${T.teal}`, 
            padding: '10px 20px', 
            borderRadius: '8px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 0 15px rgba(115, 65, 234, 0.1)'
          }}
          onMouseOver={e => { 
            e.target.style.backgroundColor = T.teal; 
            e.target.style.color = '#000';
            e.target.style.boxShadow = '0 0 25px rgba(157, 0, 255, 0.4)';
          }}
          onMouseOut={e => { 
            e.target.style.backgroundColor = 'rgba(115, 65, 234, 0.1)'; 
            e.target.style.color = T.teal;
            e.target.style.boxShadow = '0 0 15px rgba(115, 65, 234, 0.1)';
          }}
        >
          Finalize Intake
        </button>
      </div>

      {/* Patient Validation Banner */}
      <GlassPanel style={{ 
        padding: '16px 20px', 
        borderLeft: `4px solid ${matchUI.color}`,
        background: `rgba(255, 255, 255, 0.5)`,
        boxShadow: `inset 10px 0 20px -10px ${matchUI.color}22`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '20px', filter: `drop-shadow(0 0 5px ${matchUI.color}66)` }}>{matchUI.icon}</span>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: matchUI.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                INTEGRITY CROSS-CHECK
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: T.textPrimary, fontFamily: T.fontDisplay }}>
                {matchUI.label}: <span style={{ color: matchUI.color }}>{extractedName}</span>
              </div>
            </div>
          </div>
          {matchStatus === 'mismatch' && (
             <div style={{ fontSize: '10px', fontWeight: '800', color: T.red, backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '6px 10px', borderRadius: '4px', border: `1px solid rgba(239, 68, 68, 0.3)`, letterSpacing: '0.05em' }}>
                ACTION REQUIRED
             </div>
          )}
        </div>
      </GlassPanel>

      {/* Premium Vitals Dashboard Section - Only show if has data or not imaging */}
      {(!isImaging || hasVitals) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px', filter: 'drop-shadow(0 0 5px rgba(157, 0, 255, 0.4))' }}>📉</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: T.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biometric Stream</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '600' }}>AI CONFIDENCE:</div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: getConfidenceLevel(vitalsConfidence).color, fontFamily: T.fontMono }}>
                {vitalsConfidence}%
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {(!isImaging || (vitals.bp && vitals.bp !== 'Not mentioned')) && (
              <VitalCard 
                type="bp"
                title="Arterial Pressure"
                value={vitals.bp || '116/70'}
                unit="mmHg"
                icon="🩸"
                color={T.red}
                trendData={getMockTrend(120, 20)}
              />
            )}
            {(!isImaging || (vitals.hr && vitals.hr !== 'Not mentioned')) && (
              <VitalCard 
                type="hr"
                title="Cardiac Rate"
                value={vitals.hr || '175'}
                unit="BPM"
                icon="❤️"
                color={T.amber}
                trendData={getMockTrend(75, 15)}
              />
            )}
            {(!isImaging || (vitals.glucose && vitals.glucose !== 'Not mentioned')) && (
              <VitalCard 
                type="glucose"
                title="Serum Glucose"
                value={vitals.glucose || '230'}
                unit="mg/dL"
                icon="🧪"
                color={T.teal}
                trendData={getMockTrend(100, 30)}
              />
            )}
            {!isImaging && (
              <VitalCard 
                type="raw"
                title="Hematology"
                value="80-90"
                unit="g/L"
                icon="💉"
                color={T.indigo}
                trendData={getMockTrend(85, 5)}
              />
            )}
          </div>
        </div>
      )}

      {fields.map(field => {
        const fieldData = editedData[field.id] || { value: 'Not mentioned', confidence: 0 };
        const confidence = getConfidenceLevel(fieldData.confidence);

        if (isImaging) {
          const alwaysVisible = ['diagnosis', 'imaging_analysis'];
          if (!alwaysVisible.includes(field.id) && (fieldData.value === 'Not mentioned' || !fieldData.value)) {
            return null;
          }
        }

        return (
          <GlassPanel key={field.id} style={{ padding: '20px', border: '1px solid rgba(115, 65, 234, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', filter: `drop-shadow(0 0 5px ${T.teal}44)` }}>{field.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: T.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '600' }}>CONFIDENCE:</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: confidence.color, fontFamily: T.fontMono }}>
                  {fieldData.confidence}%
                </div>
              </div>
            </div>
            <textarea 
              value={fieldData.value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              style={{ 
                width: '100%', 
                backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                border: '1px solid rgba(115, 65, 234, 0.1)', 
                borderRadius: '8px', 
                color: T.textPrimary, 
                fontSize: '13px', 
                padding: '12px',
                minHeight: '80px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.6',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={e => e.target.style.borderColor = T.teal}
              onBlur={e => e.target.style.borderColor = 'rgba(115, 65, 234, 0.1)'}
            />
          </GlassPanel>
        );
      })}
    </div>
  );
};

export default ExtractionResults;
