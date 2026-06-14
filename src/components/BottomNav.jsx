import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { label: 'Overview', icon: 'home', path: '/' },
    { label: 'Registry', icon: 'group', path: '/registry' },
    { label: 'PillGuard', icon: 'document_scanner', path: '/pillguard' },
    { label: 'Alerts', icon: 'notifications', path: '/alerts' },
  ];

  const handleNav = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const extraItems = [
    { label: 'Predictive Forecast', icon: 'trending_up', path: '/forecast' },
    { label: 'Comorbidity Network', icon: 'hub', path: '/comorbidity' },
    { label: 'Clinical Analytics', icon: 'analytics', path: '/analytics' },
    { label: 'AI Intake Engine', icon: 'upload_file', path: '/intake' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-around items-center z-[9999] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-2 font-sans select-none">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNav(item.path)}
            className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
          >
            <span 
              className={`material-symbols-outlined text-[22px] transition-colors duration-250 ${
                isActive(item.path) ? 'text-brand-pink' : 'text-gray-400'
              }`}
            >
              {item.icon}
            </span>
            <span 
              className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors duration-250 ${
                isActive(item.path) ? 'text-brand-pink' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
            {isActive(item.path) && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand-pink shadow-[0_0_6px_rgba(247,168,196,0.8)]"></span>
            )}
          </button>
        ))}

        {/* More Tools Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center justify-center w-12 h-12 relative cursor-pointer"
        >
          <span 
            className={`material-symbols-outlined text-[22px] transition-colors duration-250 ${
              showMenu ? 'text-brand-pink' : 'text-gray-400'
            }`}
          >
            menu
          </span>
          <span 
            className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors duration-250 ${
              showMenu ? 'text-brand-pink' : 'text-gray-400'
            }`}
          >
            Tools
          </span>
          {showMenu && (
            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand-pink shadow-[0_0_6px_rgba(247,168,196,0.8)]"></span>
          )}
        </button>
      </div>

      {/* Slide-Up Extra Tools Menu */}
      {showMenu && (
        <div 
          className="md:hidden fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="absolute bottom-16 left-4 right-4 bg-white rounded-[28px] border border-gray-150 p-6 shadow-2xl animate-fade-in-up font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-brand-pink tracking-wider uppercase font-mono">
                CLINICAL SUITE
              </span>
              <button 
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-black font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {extraItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-pink/10 border border-brand-pink/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-brand-pink text-lg font-bold">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-sidebar leading-tight uppercase">
                      {item.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
