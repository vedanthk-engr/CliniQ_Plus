import React from 'react';
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
  return 'ClinIQ+ Portal';
};

const TopHeader = () => {
  const location = useLocation();
  const title = getHeaderTitle(location.pathname);

  return (
    <header className="flex justify-between items-center px-8 py-4 shrink-0 z-40 relative border-b border-gray-200/50 mb-6">
      {/* Left side: Page Title */}
      <div className="flex flex-col">
        <h1 className="text-xl font-extrabold text-brand-sidebar tracking-tight font-sans">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          System Status: 
          <span className="bg-brand-green/10 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-brand-green/20">
            ● Optimal
          </span>
        </div>
      </div>

      {/* Center: Search input with Capsule Tags */}
      <div className="flex-1 flex justify-center max-w-xl mx-8">
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
            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-bold border border-gray-200/50">Education</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors relative">
          <span className="material-symbols-outlined text-sm">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-pink rounded-full border border-black"></span>
        </button>
        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-sm">settings</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-sm">help</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
