import React from 'react';

const GlowButton = ({ children, onClick, className = '', disabled = false, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-[14px] font-sans font-semibold text-sm transition-all duration-300 ease-in-out outline-none flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-accentPrimary hover:bg-accentPrimary/90 text-white shadow-glowPurple border border-accentPrimary/20 hover:scale-[1.02]",
    secondary: "bg-white/5 hover:bg-white/10 text-textPrimary border border-borderCard hover:scale-[1.02]",
    danger: "bg-statusCritical/20 hover:bg-statusCritical/30 text-statusCritical border border-statusCritical/30 shadow-glowCritical",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed scale-100 hover:scale-100 shadow-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlowButton;
