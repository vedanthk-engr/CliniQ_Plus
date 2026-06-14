import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { usePatientStore } from '../stores/patientStore';

const GENERAL_NAV = [
  { id: 'overview', label: 'Dashboard', path: '/', icon: 'dashboard', activeColor: 'text-brand-pink bg-brand-pink/10' },
  { id: 'patient-registry', label: 'Patients', path: '/registry', icon: 'group', activeColor: 'text-brand-blue bg-brand-blue/10' },
  { id: 'forecast', label: 'Forecasts', path: '/forecast', icon: 'monitoring', activeColor: 'text-brand-yellow bg-brand-yellow/10' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'analytics', activeColor: 'text-brand-green bg-brand-green/10' },
  { id: 'alerts', label: 'Alerts', path: '/alerts', icon: 'notifications', activeColor: 'text-brand-pink bg-brand-pink/10' },
];

const TOOLS_NAV = [
  { id: 'intake', label: 'AI Intake', path: '/intake', icon: 'file_upload', activeColor: 'text-brand-blue bg-brand-blue/10' },
  { id: 'pillguard', label: 'PillGuard', path: '/pillguard', icon: 'medication', activeColor: 'text-brand-green bg-brand-green/10' },
  { id: 'trials', label: 'Trial Matches', path: '/trials', icon: 'science', activeColor: 'text-brand-blue bg-brand-blue/10' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { doctorName, setDoctorName } = useUserStore();
  const { currentPatient } = usePatientStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef(null);

  const handleNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleNameBlur = (val) => {
    setIsEditingName(false);
    if (!val.trim()) setDoctorName('Dr. Keerthi');
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    const parts = name.replace(/Dr\.?/i, '').trim().split(' ').filter(Boolean);
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  };

  return (
    <nav className="hidden md:flex fixed left-6 top-6 bottom-6 w-[220px] bg-brand-sidebar flex-col py-8 px-4 z-50 text-white rounded-card shadow-lg flat-look">
      {/* Brand Header */}
      <div className="mb-8 px-4 flex items-center justify-start border-b border-white/10 pb-5">
        <span className="text-[28px] font-black tracking-tight text-white leading-none">
          CliniQ<span className="text-brand-pink">+</span>
        </span>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-col gap-1 text-sm font-medium flex-1 overflow-y-auto pr-1">
        <span className="px-3 py-1 text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">General</span>

        {GENERAL_NAV.map((item) => {
          const isActive = currentPath === item.path ||
            (item.id === 'patient-registry' && currentPath.startsWith('/patient/') && location.state?.tab !== 'trials');

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
          const isActive = currentPath === item.path ||
            (item.id === 'trials' && currentPath.startsWith('/patient/') && location.state?.tab === 'trials');

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

      {/* Account Footer */}
      <div className="mt-auto pt-3 border-t border-white/10">
        <div className="rounded-2xl px-2 py-2.5 flex items-center gap-2.5 hover:bg-white/8 transition-colors cursor-default">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-pink to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[10px] font-black text-white tracking-wide">
              {getInitials(doctorName)}
            </span>
          </div>

          {/* Name + role */}
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            {isEditingName ? (
              <input
                ref={inputRef}
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                onBlur={(e) => handleNameBlur(e.target.value)}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="text-[11px] font-bold text-white bg-white/15 rounded px-1.5 py-0.5 outline-none border border-white/30 w-full"
                style={{ fontFamily: 'inherit' }}
              />
            ) : (
              <button
                onClick={handleNameClick}
                className="text-[11px] font-bold text-white truncate leading-none text-left flex items-center gap-1 group/name w-full"
                title="Click to edit name"
              >
                <span className="truncate">{doctorName}</span>
                <span className="material-symbols-outlined text-white/30 group-hover/name:text-white/60 transition-colors shrink-0" style={{fontSize:'10px'}}>edit</span>
              </button>
            )}
            <span className="text-[9px] text-white/40 mt-0.5 font-medium leading-none">Physician</span>
          </div>

          {/* Settings icon */}
          <button
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/15 transition-all ml-auto"
            title="Account settings"
          >
            <span className="material-symbols-outlined" style={{fontSize:'14px'}}>more_vert</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
