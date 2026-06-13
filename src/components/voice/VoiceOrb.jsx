import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../hooks/useVoice';
import VoiceWaveform from './VoiceWaveform';
import LanguageSelector from './LanguageSelector';
import VoiceCommandFeedback from './VoiceCommandFeedback';

const VoiceOrb = ({ onActionExecuted }) => {
  const [lang, setLang] = useState('en-US');
  const [langName, setLangName] = useState('English');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const longPressTimerRef = useRef(null);

  const handleAction = (actionObject) => {
    // Show feedback card
    setShowFeedback(true);
    // Execute action locally
    if (onActionExecuted) {
      onActionExecuted(actionObject);
    }
  };

  const {
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    lastAction,
    error,
    setError
  } = useVoice(handleAction);

  // Auto-hide feedback after 5 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  // Handle click on VoiceOrb
  const handleOrbClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (isListening) {
      stopListening('command', lang);
    } else {
      startListening('command', lang);
    }
  };

  // Handle long-press for Language Selector
  const handleMouseDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowLangSelector(true);
    }, 700); // 700ms long press threshold
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Determine current orb state color & icon
  let orbClass = "bg-[#7C3AED] text-white"; // default IDLE
  let iconName = "mic";
  let rippleEffect = false;
  let isRotating = false;

  if (isListening) {
    orbClass = "bg-[#7C3AED] text-white scale-110";
    iconName = "mic";
    rippleEffect = true;
  } else if (isProcessing) {
    orbClass = "bg-[#F5C842] text-[#1B1C1A]";
    iconName = "smart_toy";
    isRotating = true;
  } else if (isSpeaking) {
    orbClass = "bg-[#B5C43A] text-white";
    iconName = "volume_up";
    rippleEffect = true;
  } else if (error) {
    orbClass = "bg-red-500 text-white animate-bounce";
    iconName = "error";
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-auto">
      {/* Toast Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 animate-fade-in-up">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2 font-black cursor-pointer hover:opacity-75">×</button>
        </div>
      )}

      {/* Floating Command Feedback Card */}
      {showFeedback && lastAction && (
        <VoiceCommandFeedback 
          transcript={transcript} 
          action={lastAction} 
          onClose={() => setShowFeedback(false)} 
        />
      )}

      {/* Language Selector Overlay */}
      {showLangSelector && (
        <LanguageSelector 
          selectedLang={lang}
          onSelect={(selected) => {
            setLang(selected.code);
            setLangName(selected.name);
          }}
          onClose={() => setShowLangSelector(false)}
        />
      )}

      {/* Language Indicator Pill */}
      {!isListening && !isSpeaking && !isProcessing && (
        <div className="bg-black/80 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm select-none mb-1 backdrop-blur-md flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse"></span>
          <span>Voice: {langName}</span>
        </div>
      )}

      {/* Primary Voice Orb Button */}
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        
        {/* Ripple/Wave effects */}
        {rippleEffect && (
          <div className="absolute inset-0 rounded-full bg-current opacity-25 animate-ping pointer-events-none" />
        )}

        <button
          onClick={handleOrbClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 ${orbClass} focus:outline-none z-10 border border-white/20`}
        >
          {isRotating ? (
            <span className="material-symbols-outlined text-[26px] animate-spin">
              {iconName}
            </span>
          ) : (
            <span className="material-symbols-outlined text-[26px]">
              {iconName}
            </span>
          )}
        </button>

        {/* Real-time Web Audio waveform overlaid behind the icon */}
        {isListening && (
          <div className="absolute inset-2 w-10 h-10 rounded-full pointer-events-none opacity-40 z-0">
            {/* The canvas visualizer draws amplitude waves */}
            <VoiceWaveform isListening={isListening} analyser={null} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOrb;
