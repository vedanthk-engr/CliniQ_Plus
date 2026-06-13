import React from 'react';

const GlowBadge = ({ label, variant = 'neutral', className = '' }) => {
  const styles = {
    critical: 'text-statusCritical bg-statusCritical/10 border-statusCritical/20 shadow-glowCritical',
    warning: 'text-statusWarning bg-statusWarning/10 border-statusWarning/20 shadow-glowWarning',
    good: 'text-statusGood bg-statusGood/10 border-statusGood/20 shadow-glowGood',
    info: 'text-accentSecondary bg-accentSecondary/10 border-accentSecondary/20 shadow-glowPurple',
    neutral: 'text-textSecondary bg-white/5 border-white/10 shadow-none'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans border tracking-wide uppercase ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
};

export default GlowBadge;
