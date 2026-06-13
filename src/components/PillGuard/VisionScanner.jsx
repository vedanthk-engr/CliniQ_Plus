import React, { useState } from 'react';
import { T } from '../../tokens';

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
    <div className="bg-brand-green rounded-[24px] p-6 relative overflow-hidden h-[400px] flex flex-col shadow-sm">
      {/* Decorative Blob */}
      <svg className="absolute -right-10 -bottom-10 w-48 h-48 text-brand-sidebar opacity-10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
        <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.2,-2.3C97.6,13.4,92.4,29.3,82.8,42.5C73.2,55.7,59.2,66.2,44.1,73.5C29,80.8,12.8,84.9,-2.4,89.1C-17.6,93.3,-35.2,97.6,-50.2,91.2C-65.2,84.8,-77.6,67.7,-84.8,50.1C-92,32.5,-94,14.4,-92.4,-3C-90.8,-20.4,-85.6,-37.1,-75.7,-50.5C-65.8,-63.9,-51.2,-74,-36.5,-79.8C-21.8,-85.6,-7,-87.1,7.2,-84.6C21.4,-82.1,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-lg text-brand-sidebar flex items-center gap-2">
            <span className="material-symbols-outlined">document_scanner</span>
            PillGuard scanner
          </h3>
          {(frontImage || backImage) && !isScanning && (
            <button 
              onClick={resetScanner} 
              className="text-[10px] font-black text-brand-sidebar/70 hover:text-brand-sidebar tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full border border-brand-sidebar/20"
            >
              Reset
            </button>
          )}
        </div>

        {/* Upload boxes */}
        <div className="flex gap-4 mb-4">
          <ImageUploadBox
            label="Upload Front"
            file={frontImage}
            onChange={(e) => handleFileChange(e, setFrontImage)}
          />
          <ImageUploadBox
            label="Upload Back"
            file={backImage}
            onChange={(e) => handleFileChange(e, setBackImage)}
          />
        </div>

        {/* Scan lines when active */}
        {isScanning && (
          <div className="w-full h-1 bg-brand-sidebar/20 rounded-full overflow-hidden mb-4 relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-brand-sidebar rounded-full animate-[scanLine_1.5s_linear_infinite]" style={{ animationDuration: '1.5s' }} />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 text-[11px] font-bold text-red-750 mb-4 font-mono">
            ERR_CODE: {error}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isScanning || !frontImage || !backImage}
            className={`w-full py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-sm flat-look cursor-pointer flex items-center justify-center gap-2 ${
              (frontImage && backImage) 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-white/30 text-brand-sidebar/55 border border-brand-sidebar/20 cursor-not-allowed'
            }`}
          >
            {isScanning ? 'Analyzing Molecular Signature...' : (frontImage && backImage) ? 'Initiate Vision Scan' : 'Awaiting Optical Input'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageUploadBox = ({ label, file, onChange }) => {
  return (
    <div className={`flex-1 border-2 border-dashed rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
      file 
        ? 'border-brand-sidebar bg-white/40' 
        : 'border-brand-sidebar/30 bg-white/10 hover:bg-white/20'
    }`}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
      />
      {file ? (
        <div className="flex flex-col items-center p-2 text-center">
          <span className="material-symbols-outlined text-brand-sidebar text-2xl mb-1">check_circle</span>
          <span className="text-[11px] font-bold text-brand-sidebar truncate max-w-full">Photo Attached</span>
          <span className="text-[9px] text-brand-sidebar/70 truncate max-w-[120px] font-mono mt-0.5">{file.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center p-2 text-center text-brand-sidebar">
          <span className="material-symbols-outlined text-brand-sidebar text-2xl mb-1">upload_file</span>
          <span className="text-[11px] font-bold tracking-tight">{label}</span>
        </div>
      )}
    </div>
  );
};

export default VisionScanner;
