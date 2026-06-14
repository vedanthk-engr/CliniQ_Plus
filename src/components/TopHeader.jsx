import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useLocation } from 'react-router-dom';

const getHeaderTitle = (pathname) => {
  if (pathname === '/') return 'Physician Overview';
  if (pathname === '/intake') return 'AI Intake Engine';
  if (pathname === '/registry') return 'Patient Intelligence Registry';
  if (pathname.startsWith('/patient/')) return 'Patient Profile';
  if (pathname === '/forecast') return 'Predictive Forecast';
  if (pathname === '/comorbidity') return 'Comorbidity Network';
  if (pathname === '/pillguard') return 'PillGuard Scanner';
  if (pathname === '/analytics') return 'Clinical Analytics';
  if (pathname === '/alerts') return 'Alert Centre';
  if (pathname === '/trials') return 'Clinical Trial Matcher';
  return 'ClinIQ+ Portal';
};

const TopHeader = () => {
  const location = useLocation();
  const title = getHeaderTitle(location.pathname);
  const { doctorName } = useUserStore();

  // Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Settings states (mock)
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header 
      className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shrink-0 z-40 relative border-b border-gray-200/50 mb-4 md:mb-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      {/* Left side: Page Title */}
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-extrabold text-brand-sidebar tracking-tight font-sans">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          System Status: 
          <span className="bg-brand-green/10 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-brand-green/20">
            ● Optimal
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 hidden md:flex justify-center max-w-xl mx-8">
        <div className="relative bg-white rounded-full flex items-center px-4 py-2.5 w-full border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
          <span className="material-symbols-outlined text-brand-pink text-xl mr-2">search</span>
          <input 
            type="text" 
            placeholder="Search patients, conditions, meds..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 focus:ring-0 p-0"
          />
          <div className="flex gap-1.5 ml-2 items-center text-[10px] shrink-0">
            <span className="text-gray-400">In:</span>
            <span className="bg-black text-white px-2.5 py-0.5 rounded-full font-bold">Patients</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowNotifications(true)}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-pink rounded-full border border-black"></span>
        </button>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
        </button>
        
        <button 
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">help</span>
        </button>
      </div>

      {/* 1. Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full border border-gray-200 shadow-2xl animate-fade-in-up text-black relative">
            <button 
              onClick={() => setShowNotifications(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black font-black text-lg cursor-pointer"
            >
              ×
            </button>
            <h3 className="text-lg font-black text-brand-sidebar mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-pink">notifications</span>
              Clinical Alerts & Notifications
            </h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <h4 className="text-xs font-extrabold text-red-700 uppercase">BNP Spike High Alert</h4>
                <p className="text-xs text-gray-700 mt-1 font-semibold">Mrs. Sarasu (P-00399) BNP spike suggests impending CHF decompensation.</p>
              </div>
              
              <div className="p-3 bg-brand-yellow/20 border border-brand-yellow/30 rounded-xl">
                <h4 className="text-xs font-extrabold text-brand-yellow-dark uppercase font-sans">Lab Trend Alert</h4>
                <p className="text-xs text-gray-700 mt-1 font-semibold">Arjun Mehta (P-00142) HbA1c increased significantly to 9.5%.</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase">Intake Stream Loaded</h4>
                <p className="text-xs text-gray-700 mt-1 font-semibold">Patient clinical report parsed successfully by Intake Engine.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowNotifications(false)}
              className="w-full mt-6 bg-black text-white font-bold text-xs py-3 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 2. Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full border border-gray-200 shadow-2xl animate-fade-in-up text-black relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black font-black text-lg cursor-pointer"
            >
              ×
            </button>
            <h3 className="text-lg font-black text-brand-sidebar mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-pink">settings</span>
              Physician System Settings
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <h4 className="text-xs font-black text-brand-sidebar uppercase font-sans">Audio Alerts</h4>
                  <p className="text-[10px] text-gray-500 font-bold">Speak speech recommendations automatically</p>
                </div>
                <button 
                  onClick={() => setAudioAlerts(!audioAlerts)}
                  className={`w-10 h-6 rounded-full relative transition-colors duration-250 cursor-pointer ${audioAlerts ? 'bg-brand-pink' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-250 ${audioAlerts ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <h4 className="text-xs font-black text-brand-sidebar uppercase font-sans">System Theme</h4>
                  <p className="text-[10px] text-gray-500 font-bold">Use system high contrast theme</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-6 rounded-full relative transition-colors duration-250 cursor-pointer ${darkMode ? 'bg-brand-pink' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-250 ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-black text-white font-bold text-xs py-3 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* 3. About/Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full border border-gray-200 shadow-2xl animate-fade-in-up text-black relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black font-black text-lg cursor-pointer"
            >
              ×
            </button>
            <h3 className="text-lg font-black text-brand-sidebar mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-pink">help</span>
              About ClinIQ+ Portal
            </h3>
            
            <div className="space-y-3 font-semibold text-xs text-gray-700 leading-relaxed font-sans">
              <p>
                <span className="font-extrabold text-black">ClinIQ+</span> is a state-of-the-art Clinical Intelligence Co-pilot platform designed for physicians.
              </p>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-[11px]">
                <p>• <span className="font-bold text-black">Version:</span> 1.2.0 (Build 2026.06.13)</p>
                <p>• <span className="font-bold text-black">Developer:</span> Google DeepMind Advanced Coding Team</p>
                <p>• <span className="font-bold text-black">Client ID:</span> {doctorName} (Physician)</p>
              </div>
            </div>

            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-black text-white font-bold text-xs py-3 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopHeader;
