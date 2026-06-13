import React, { useState } from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import FileUpload from '../components/IntakeEngine/FileUpload';
import ExtractionResults from '../components/IntakeEngine/ExtractionResults';
import PdfViewer from '../components/IntakeEngine/PdfViewer';

const Intake = ({ patient, patients = [], setCurrentPatient, refreshPatients, setCurrentView }) => {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extraction, setExtraction] = useState(null);
  const [error, setError] = useState(null);
  const [documentType, setDocumentType] = useState('discharge_summary');

  const handleUpload = async (fileInfo) => {
    setFileData(fileInfo);
    setLoading(true);
    setError(null);
    setExtraction(null);

    try {
      const response = await fetch('http://localhost:8000/api/intake/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_base64: fileInfo.base64,
          file_type: fileInfo.type,
          expected_patient_name: patient?.name,
          is_new_patient: !patient,
          document_type: documentType
        })
      });

      if (!response.ok) throw new Error('Failed to extract data');

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setExtraction(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isSaved, setIsSaved] = useState(false);

  const handleApprove = async (finalData) => {
    setLoading(true);
    try {
      const payload = { ...finalData, patient_id: patient?.id };
      const response = await fetch('http://localhost:8000/api/intake/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save data');
      const result = await response.json();

      const updatedPatients = await refreshPatients();
      if (result.patient_id) {
        const newPatient = updatedPatients.find(p => p.id === result.patient_id);
        if (newPatient) {
          setCurrentPatient(newPatient);
          setCurrentView('patient'); // Navigate to the new patient's profile
        }
      }

      setIsSaved(true);
      setExtraction(null);
      setFileData(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (updatedData) => {
    setExtraction(updatedData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopHeader />

      <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Patient Target Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(34, 211, 238, 0.05)',
          border: `1px solid ${T.tealBorder}`,
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '20px' }}>{patient ? '👤' : '✨'}</div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: T.teal, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intake Target
            </div>
            {fileData || extraction ? (
              <div style={{ fontSize: '14px', fontWeight: '600', color: T.textPrimary, marginTop: '4px' }}>
                {patient ? `${patient.name} (${patient.id})` : 'New Patient Profile'}
              </div>
            ) : (
                <select
                  value={patient ? patient.id : 'NEW'}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setCurrentPatient(null);
                    } else {
                      const selected = patients.find(p => p.id === e.target.value);
                      setCurrentPatient(selected);
                    }
                  }}
                  className="glass-tier-2"
                  style={{
                    color: T.textPrimary,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: T.fontBody,
                    outline: 'none',
                    cursor: 'pointer',
                    marginTop: '8px',
                    transition: 'all 0.3s'
                  }}
                >
                  <option value="NEW" style={{background: '#FAFAFF'}}>✨ Create New Patient Profile</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} style={{background: '#FAFAFF'}}>{p.name} ({p.id})</option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: T.textSecondary, textAlign: 'right', maxWidth: '300px' }}>
              {patient ? 'Records will be mapped and validated against this existing patient.' : 'A new medical profile will be generated upon extraction across all modules.'}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: T.textPrimary, marginBottom: '4px' }}>
              Multimodal AI Intake Engine
            </h1>
            <p style={{ fontSize: '14px', color: T.textSecondary }}>
              Upload discharge summaries or imaging scans to automatically extract structured clinical data.
            </p>
          </div>

          {!fileData && !extraction && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Document Type:
                </div>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="glass-tier-2"
                  style={{
                    color: T.textPrimary,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: T.fontBody,
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '250px',
                    transition: 'all 0.3s'
                  }}
                >
                  <option value="discharge_summary" style={{background: '#FAFAFF'}}>📄 Prescription / Discharge Summary</option>
                  <option value="imaging" style={{background: '#FAFAFF'}}>☢️ Imaging (X-Ray / MRI / CT)</option>
              </select>
            </div>

            <FileUpload onUpload={handleUpload} loading={loading} />
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${T.red}`,
            borderRadius: '8px',
            color: T.red,
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            Error: {error}
            <button
              onClick={() => { setFileData(null); setError(null); }}
              style={{ marginLeft: '16px', background: 'none', border: 'none', color: T.red, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Try Again
            </button>
          </div>
        )}

        {loading && fileData && (
          <div style={{ flex: 1, display: 'flex', gap: '24px' }}>
            <PdfViewer fileData={fileData} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '16px' }}>◈</div>
                <div style={{ color: T.teal, fontWeight: '600' }}>AI ANALYZING DOCUMENT...</div>
              </div>
            </div>
          </div>
        )}

        {extraction && (
          <div style={{ flex: 1, display: 'flex', gap: '24px', overflow: 'hidden' }}>
            <div style={{ flex: 1.2, display: 'flex' }}>
              <PdfViewer fileData={fileData} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ExtractionResults
                data={extraction}
                onApprove={handleApprove}
                onEdit={handleEdit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Intake;
