import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const GENERAL_NAV = [
  { id: 'overview', label: 'Dashboard', path: '/', icon: 'dashboard', activeColor: 'text-brand-pink bg-brand-pink/10' },
  { id: 'patient-registry', label: 'Patients', path: '/registry', icon: 'group', activeColor: 'text-brand-blue bg-brand-blue/10' },
  { id: 'forecast', label: 'Forecasts', path: '/forecast', icon: 'monitoring', activeColor: 'text-brand-yellow bg-brand-yellow/10' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'analytics', activeColor: 'text-brand-green bg-brand-green/10' },
  { id: 'alerts', label: 'Alerts', path: '/alerts', icon: 'notifications', activeColor: 'text-brand-pink bg-brand-pink/10' },
];

const TOOLS_NAV = [
  { id: 'intake', label: 'AI Intake', path: '/intake', icon: 'file_upload', activeColor: 'text-brand-blue bg-brand-blue/10' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleNewPatientClick = () => {
    navigate('/intake');
  };

  return (
    <nav className="fixed left-6 top-6 bottom-6 w-[220px] bg-brand-sidebar flex flex-col py-8 px-4 z-50 text-white rounded-card shadow-lg flat-look">
      {/* Brand Header */}
      <div className="mb-8 px-4 py-2 flex items-center justify-start border-b border-white/10 pb-4">
        <span className="text-2xl font-black tracking-tight text-white">
          CliniQ
        </span>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-col gap-1 text-sm font-medium flex-1 overflow-y-auto pr-1">
        <span className="px-3 py-1 text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">General</span>
        
        {GENERAL_NAV.map((item) => {
          const isActive = currentPath === item.path || 
            (item.id === 'patient-registry' && currentPath.startsWith('/patient/'));

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? `${item.activeColor} font-bold scale-[1.02]` 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.id === 'alerts' && (
                <span className="ml-auto w-2 h-2 bg-brand-pink rounded-full"></span>
              )}
            </Link>
          );
        })}

        <span className="px-3 py-1 text-white/40 text-[11px] font-bold uppercase tracking-wider mt-4 mb-1">Tools</span>

        {TOOLS_NAV.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? `${item.activeColor} font-bold scale-[1.02]` 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info Footer (No New Patient button, No avatar, role updated to Physician) */}
      <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate leading-none">Dr. Yuthika</span>
            <span className="text-[10px] text-white/50 truncate mt-1">Physician</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
