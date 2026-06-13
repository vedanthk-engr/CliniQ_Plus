import React, { useState, useRef, useEffect } from 'react';
import { T } from '../tokens';

const TopHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 28px',
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderBottom: `1px solid rgba(138, 43, 226, 0.08)`,
      marginBottom: '20px'
    }}>
      {/* Left side: Page Title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div>
          <h1 style={{
            fontSize: '18px', fontWeight: '700', color: T.textPrimary,
            margin: 0, letterSpacing: '0.02em', fontFamily: T.fontDisplay
          }}>
            Physician Overview
          </h1>
          <div style={{
            fontSize: '11px', color: T.textMuted, marginTop: '2px',
            fontWeight: '500', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            System Status: <span style={{
              color: T.green, fontWeight: '600',
              background: 'rgba(5, 150, 105, 0.1)',
              padding: '1px 8px', borderRadius: '20px',
              fontSize: '10px'
            }}>● Optimal</span>
          </div>
        </div>
      </div>

      {/* Right side: User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }} ref={profileRef}>
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            background: isProfileOpen
              ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(157, 0, 255, 0.05))'
              : 'rgba(255, 255, 255, 0.6)',
            border: `1px solid ${isProfileOpen ? 'rgba(138, 43, 226, 0.3)' : 'rgba(138, 43, 226, 0.12)'}`,
            borderRadius: '50px',
            padding: '6px 16px 6px 6px',
            color: T.textPrimary,
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            boxShadow: isProfileOpen ? '0 4px 20px rgba(138, 43, 226, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={e => {
            if (!isProfileOpen) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138, 43, 226, 0.08), rgba(157, 0, 255, 0.03))';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.25)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(138, 43, 226, 0.1)';
            }
          }}
          onMouseLeave={e => {
            if (!isProfileOpen) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.12)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }
          }}
        >
          {/* Avatar */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8A2BE2, #9D00FF)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: T.fontDisplay,
            letterSpacing: '0.03em',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(138, 43, 226, 0.3)'
          }}>
            DY
          </div>
          {/* Name + Role */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              fontSize: '13px', fontWeight: '600', color: T.textPrimary,
              fontFamily: T.fontDisplay, letterSpacing: '0.02em', lineHeight: 1.3
            }}>
              Dr. Yuthika
            </div>
            <div style={{
              fontSize: '10px', color: T.teal, fontWeight: '500',
              letterSpacing: '0.03em', lineHeight: 1.3
            }}>
              Chief Medical Officer
            </div>
          </div>
          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginLeft: '2px', transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* Dropdown */}
        {isProfileOpen && (
          <div className="fadeIn" style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '260px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid rgba(138, 43, 226, 0.15)`,
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(138, 43, 226, 0.12), 0 4px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            <div style={{
              padding: '18px 20px',
              borderBottom: `1px solid rgba(138, 43, 226, 0.08)`,
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(157, 0, 255, 0.02))'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: T.textPrimary, fontFamily: T.fontDisplay }}>Dr. Yuthika Sharma</div>
              <div style={{ fontSize: '11px', color: T.textSecondary, marginTop: '4px' }}>yuthika.sharma@cliniq.med</div>
              <div style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: `1px solid rgba(5, 150, 105, 0.2)`,
                borderRadius: '20px',
                color: T.green,
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.04em'
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: T.green }} />
                Session Secure
              </div>
            </div>

            <div style={{ padding: '6px' }}>
              <button style={dropdownButtonStyle}>
                <span style={{ fontSize: '14px' }}>⚙️</span> Settings & Preferences
              </button>
              <button style={dropdownButtonStyle}>
                <span style={{ fontSize: '14px' }}>🛡️</span> Audit Logs
              </button>
              <button style={dropdownButtonStyle}>
                <span style={{ fontSize: '14px' }}>🔑</span> API Keys
              </button>
            </div>

            <div style={{ padding: '6px', borderTop: `1px solid rgba(138, 43, 226, 0.08)` }}>
              <button
                onClick={() => {
                  alert("Mock Logout Triggered. To be implemented.");
                  setIsProfileOpen(false);
                }}
                style={{ ...dropdownButtonStyle, color: T.red }}
              >
                <span style={{ fontSize: '14px' }}>🚪</span> Secure Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const dropdownButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 14px',
  background: 'transparent',
  border: 'none',
  borderRadius: '12px',
  color: T.textPrimary,
  fontSize: '12px',
  fontWeight: '500',
  fontFamily: T.fontUi,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.2s',
};

export default TopHeader;

