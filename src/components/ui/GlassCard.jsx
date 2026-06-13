import React from 'react';

const GlassCard = ({ children, className = '', style = {}, onClick, interactive = false, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bgCard backdrop-blur-md border border-borderCard rounded-[16px] p-6
        transition-all duration-300 ease-in-out
        ${interactive ? 'cursor-pointer hover:border-accentPrimary/40 hover:shadow-glowPurple hover:-translate-y-0.5' : ''}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
