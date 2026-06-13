import React, { useState } from 'react';

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
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`upload-zone rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center p-12 text-center cursor-pointer relative group transition-all duration-300 ${
        dragActive 
          ? 'border-[#b56f89] bg-[#FFDCE6]/20' 
          : 'border-[#ffb0cc] hover:border-[#b56f89] hover:bg-[#FFDCE6]/10'
      }`}
      style={{ flex: 1, minHeight: '300px' }}
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
      <label htmlFor="input-file-upload" className="w-full flex flex-col items-center justify-center cursor-pointer">
        <div className={`w-20 h-20 bg-[#FFDCE6] rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${
          loading ? 'animate-pulse' : ''
        }`}>
          {loading ? (
            <div className="w-4 h-4 rounded-full bg-[#b56f89] animate-ping" />
          ) : (
            <span className="material-symbols-outlined text-4xl text-[#b56f89]">cloud_upload</span>
          )}
        </div>
        
        <h4 className="text-lg font-bold mb-2 text-black">
          {loading ? 'AI IS ANALYZING DOCUMENT...' : 'Drag & drop files here'}
        </h4>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          {loading ? 'Performing multimodal extraction & cross-validation' : 'Supports PDF, DOCX, JPG, PNG (Max 50MB)'}
        </p>
        
        {!loading && (
          <span className="bg-black text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-gray-800 transition-colors shadow-sm">
            Browse Files
          </span>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
