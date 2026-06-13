import React from 'react';

const StreamingText = ({ text = '', className = '', active = true }) => {
  return (
    <span className={`inline font-sans text-textPrimary leading-relaxed ${className}`}>
      {text}
      {active && (
        <span 
          className="inline-block w-2.5 h-4 ml-1 bg-accentPrimary align-middle animate-pulse" 
          style={{ animationDuration: '0.8s' }}
        />
      )}
    </span>
  );
};

export default StreamingText;
