import React, { useState, useEffect } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import { useDemoContext } from '../../context/DemoContext';

const VisionScanner = ({ patient, onScanResult }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  if (!patient) return null;

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!frontImage || !backImage) {
      setError("Please upload both front and back images.");
      return;
    }

    setIsScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append("front_image", frontImage);
    formData.append("back_image", backImage);

    try {
      const response = await fetch('http://localhost:8000/api/analyze-pill', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Send the detailed Result to the parent component
        if (onScanResult) {
          onScanResult(data);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the analysis server.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setFrontImage(null);
    setBackImage(null);
    setError(null);
  };

  return (
    <div className="glass-tier-2" style={{ 
      padding: '24px', 
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <div style={{
        fontSize: '10px', fontWeight: '800', color: T.teal, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: '20px', fontFamily: T.fontMono,
        display: 'flex', justifyContent: 'space-between'
      }}>
        <span>VISION AI PILL SCANNER · {patient.name.split(' ')[0]}</span>
        {(frontImage || backImage) && !isScanning && (
          <button onClick={resetScanner} style={{ background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            [ RESET SYSTEM ]
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <ImageUploadBox
          label="FRONT ASPECT"
          subtext="MOLECULAR FACET A"
          file={frontImage}
          onChange={(e) => handleFileChange(e, setFrontImage)}
        />
        <ImageUploadBox
          label="REAR ASPECT"
          subtext="MOLECULAR FACET B"
          file={backImage}
          onChange={(e) => handleFileChange(e, setBackImage)}
        />
      </div>

      {isScanning && (
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #8A56E2, transparent)',
          boxShadow: '0 0 15px rgba(138, 86, 226, 0.8)',
          animation: 'scanLine 1.6s linear infinite',
          marginBottom: '16px'
        }} />
      )}

      {error && (
        <div className="glass-tier-3" style={{ color: T.red, fontSize: '11px', marginBottom: '16px', padding: '12px', borderRadius: '8px', border: `1px solid rgba(239, 68, 68, 0.3)`, fontFamily: T.fontMono }}>
          ERR_CODE: {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isScanning || (!frontImage || !backImage)}
        className={isScanning || (!frontImage || !backImage) ? "glass-tier-1" : "glass-tier-3"}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          color: (frontImage && backImage) ? T.teal : T.textSecondary,
          fontSize: '12px', fontWeight: '800', 
          cursor: (isScanning || (!frontImage || !backImage)) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s', letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: T.fontDisplay
        }}
      >
        {isScanning ? (
          <span style={{ animation: 'blink 1.5s infinite' }}>ANALYZING MOLECULAR SIGNATURE...</span>
        ) : (frontImage && backImage) ? 'INITIATE VISION SCAN' : 'AWAITING OPTICAL INPUT'}
      </button>

    </div>
  );
};

const ImageUploadBox = ({ label, subtext, file, onChange }) => {
  return (
    <div className={file ? "glass-tier-3" : "glass-tier-1"} style={{
      border: `2px ${file ? 'solid' : 'dashed'} ${file ? T.tealBorder : 'rgba(255, 255, 255, 0.5)'}`,
      borderRadius: '16px', padding: '20px', textAlign: 'center',
      position: 'relative', overflow: 'hidden', height: '140px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        style={{
          position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%'
        }}
      />
      {file ? (
        <>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✔️</div>
          <div style={{ fontSize: '13px', color: T.teal, fontWeight: '600' }}>Photo Attached</div>
          <div style={{ fontSize: '11px', color: T.textMuted, marginTop: '4px', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {file.name}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '28px', color: 'rgba(30,30,45,0.15)', marginBottom: '8px' }}>📷</div>
          <div style={{ fontSize: '13px', color: T.textSecondary, fontWeight: '600', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: '11px', color: T.textMuted, marginTop: '4px', letterSpacing: '0.05em' }}>{subtext}</div>
        </>
      )}
    </div>
  );
};

export default VisionScanner;
