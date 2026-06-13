import React, { useState } from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const FileUpload = ({ onUpload, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpload({
        name: file.name,
        type: file.type,
        base64: e.target.result,
        file: file // Keep reference for preview
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <GlassPanel 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px',
        border: dragActive ? `2px dashed ${T.teal}` : `1px dashed rgba(115, 65, 234, 0.2)`,
        background: dragActive ? 'rgba(115, 65, 234, 0.05)' : 'rgba(255, 255, 255, 0.5)',
        boxShadow: dragActive ? '0 0 30px rgba(115, 65, 234, 0.1)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: loading ? 'wait' : 'pointer'
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="input-file-upload" 
        multiple={false} 
        onChange={handleChange} 
        style={{ display: 'none' }}
        accept="application/pdf,image/*"
        disabled={loading}
      />
      <label htmlFor="input-file-upload" style={{ textAlign: 'center', cursor: 'pointer', width: '100%' }}>
        <div style={{ 
          fontSize: '56px', 
          marginBottom: '24px', 
          color: T.teal,
          filter: `drop-shadow(0 0 10px ${T.teal}44)`
        }}>
          {loading ? (
            <div className="live-dot" style={{ width: '20px', height: '20px', margin: '0 auto' }} />
          ) : (
            <span style={{ opacity: 0.8 }}>↑</span>
          )}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '800', color: T.textPrimary, marginBottom: '12px', fontFamily: T.fontDisplay }}>
          {loading ? 'AI IS ANALYZING...' : 'Upload Clinical Record'}
        </div>
        <div style={{ fontSize: '14px', color: T.textSecondary, fontWeight: '500' }}>
          {loading ? 'Performing multimodal extraction & cross-validation' : 'Drag and drop PDF, X-ray, or CT scan'}
        </div>
        
        {loading && (
          <div style={{ 
            marginTop: '32px', 
            width: '240px', 
            height: '2px', 
            backgroundColor: 'rgba(255, 255, 255, 0.5)', 
            borderRadius: '1px', 
            overflow: 'hidden', 
            margin: '32px auto 0 auto' 
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: T.teal,
              boxShadow: `0 0 15px ${T.teal}`,
              animation: 'shimmer 2s infinite linear' 
            }} />
          </div>
        )}
      </label>
    </GlassPanel>
  );
};

export default FileUpload;
