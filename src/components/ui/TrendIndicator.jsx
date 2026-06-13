import React from 'react';

const TrendIndicator = ({ value, direction = 'up', type = 'stable', className = '' }) => {
  const isUp = direction === 'up';
  
  const colors = {
    worsening: 'text-statusCritical bg-statusCritical/10 border-statusCritical/20 shadow-glowCritical',
    improving: 'text-statusGood bg-statusGood/10 border-statusGood/20 shadow-none',
    stable: 'text-textSecondary bg-white/5 border-white/10 shadow-none'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold tracking-wide ${colors[type]} ${className}`}
      style={type === 'worsening' ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}}
    >
      <span>
        {isUp ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        )}
      </span>
      <span>{value}</span>
    </div>
  );
};

export default TrendIndicator;
