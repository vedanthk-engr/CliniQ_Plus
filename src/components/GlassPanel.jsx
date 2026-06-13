import React from 'react';

const GlassPanel = ({ children, className = '', interactive = false, onClick, style = {} }) => {
  return (
    <div
      onClick={onClick}
      className={`glassPanel ${interactive ? 'glassPanelInteractive' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
