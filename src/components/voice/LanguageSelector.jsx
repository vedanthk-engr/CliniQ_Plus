import React, { useState } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇬🇧', voice: 'en-IN-Neural2-D' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', flag: '🇮🇳', voice: 'hi-IN-Neural2-A' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', flag: '🇮🇳', voice: 'ta-IN-Neural2-A' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', flag: '🇮🇳', voice: 'te-IN-Neural2-A' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳', voice: 'kn-IN-Neural2-A' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളం)', flag: '🇮🇳', voice: 'ml-IN-Neural2-A' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', flag: '🇮🇳', voice: 'bn-IN-Neural2-A' },
  { code: 'mr-IN', name: 'Marathi (मराठी)', flag: '🇮🇳', voice: 'mr-IN-Neural2-A' }
];

const LanguageSelector = ({ selectedLang, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(search.toLowerCase()) || 
    lang.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-[20px] shadow-lg p-4 z-[9999] w-64 animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[12px] font-extrabold text-brand-sidebar uppercase tracking-wider">
          Voice Language
        </h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Search Field */}
      <input 
        type="text"
        placeholder="Search language..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-xs p-2 mb-3 border border-gray-200 rounded-lg outline-none focus:border-brand-yellow"
        style={{ borderRadius: '8px !important' }}
      />

      {/* Language List */}
      <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
        {filtered.map(lang => {
          const isSelected = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                isSelected 
                  ? 'bg-brand-pink-light/30 text-brand-sidebar font-extrabold border border-brand-pink/20' 
                  : 'hover:bg-gray-50 text-gray-700 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {isSelected && (
                <span className="material-symbols-outlined text-[14px] text-brand-pink font-bold">check</span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center py-2">No languages found.</p>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
