import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const PdfViewer = ({ fileData }) => {
  if (!fileData) return null;

  const isPDF = fileData.type === 'application/pdf';
  const url = fileData.base64;

  return (
    <GlassPanel style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '12px 20px', 
        borderBottom: '1px solid rgba(115, 65, 234, 0.1)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.5)'
      }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '800', 
          color: T.teal, 
          letterSpacing: '0.15em',
          fontFamily: T.fontMono,
          textTransform: 'uppercase'
        }}>
          DOCUMENT PERSPECTIVE: {fileData.name.toUpperCase()}
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: T.bgMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPDF ? (
          <iframe 
            src={url} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            title="PDF Preview"
          />
        ) : (
          <img 
            src={url} 
            alt="Uploaded document" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        )}
      </div>
    </GlassPanel>
  );
};

export default PdfViewer;
