import React, { useState } from 'react';
import { T } from '../tokens';

const BODY_FLAGS = [
  { id: 'heart', x: 44, y: 26, label: 'BP: 143/91', severity: 'medium' },
  { id: 'kidney', x: 55, y: 43, label: 'Creatinine: 1.9 ↑', severity: 'high' },
  { id: 'pancreas', x: 45, y: 41, label: 'HbA1c: 8.6%', severity: 'high' },
  { id: 'liver', x: 38, y: 38, label: 'eGFR: 58 — Watch', severity: 'low' },
];

const SeverityNode = ({ flag, onHover, onLeave }) => {
  let color = T.green;
  if (flag.severity === 'high') color = T.red;
  if (flag.severity === 'medium') color = T.amber;

  return (
    <div
      onMouseEnter={() => onHover(flag)}
      onMouseLeave={onLeave}
      style={{
        position: 'absolute',
        top: `${flag.y}%`,
        left: `${flag.x}%`,
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 12px ${color}`,
        animation: 'pulseGlow 2s infinite',
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        border: '2px solid rgba(255, 255, 255, 0.5)'
      }}
    />
  );
};

const NodeTooltip = ({ flag }) => {
  if (!flag) return null;

  const isRight = flag.x < 50; // If x < 50, tooltip goes to the right

  return (
    <div className="glassPanel fadeIn" style={{
      position: 'absolute',
      top: `${flag.y}%`,
      left: isRight ? `calc(${flag.x}% + 16px)` : 'auto',
      right: !isRight ? `calc(${100 - flag.x}% + 16px)` : 'auto',
      transform: 'translateY(-50%)',
      padding: '12px 16px',
      zIndex: 10,
      width: '200px',
      pointerEvents: 'none',
      border: `1px solid ${flag.severity === 'high' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(157, 0, 255, 0.3)'}`
    }}>
      <div style={{
        fontSize: '9px',
        fontWeight: '800',
        color: flag.severity === 'high' ? T.red : T.textSecondary,
        textTransform: 'uppercase',
        marginBottom: '6px',
        fontFamily: T.fontMono,
        letterSpacing: '0.1em'
      }}>
        {flag.severity} RISK SCAN
      </div>
      <div style={{
        fontSize: '13px',
        color: T.textPrimary,
        fontWeight: '700',
        fontFamily: T.fontDisplay,
        letterSpacing: '-0.01em'
      }}>
        {flag.label}
      </div>
    </div>
  );
};

const HumanBody = () => {
  const [hoveredFlag, setHoveredFlag] = useState(null);

  // SVG internal detail lines (Spine rects and rib curves)
  const spineY = [74, 84, 94, 104, 114, 124, 134];
  const ribY = [82, 90, 98, 106, 114, 122];

  return (
    <div style={{ position: 'relative', width: '180px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
      {/* SVG Container */}
      <svg
        viewBox="0 0 140 380"
        width="100%"
        height="380"
        style={{ filter: 'drop-shadow(0 0 30px rgba(124, 92, 191, 0.05))', overflow: 'visible' }}
      >
        <g fill="rgba(255, 255, 255, 0.5)" stroke="rgba(157, 0, 255, 0.15)" strokeWidth="1.2">
          {/* Head */}
          <ellipse cx="70" cy="30" rx="20" ry="24" />
          {/* Neck */}
          <rect x="62" y="52" width="16" height="14" rx="4" />
          {/* Torso */}
          <path d="M 36 68 Q 24 88 26 136 L 114 136 Q 116 88 104 68 Q 88 60 70 58 Q 52 60 36 68 Z" />
          {/* Pelvis */}
          <path d="M 26 136 Q 22 168 36 178 L 104 178 Q 118 168 114 136 Z" />
          {/* Arms */}
          <path d="M 26 72 Q 10 96 12 158 L 26 158 Q 30 108 36 74 Z" />
          <path d="M 114 74 Q 130 96 128 158 L 114 158 Q 110 108 104 74 Z" />
          {/* Legs */}
          <path d="M 36 178 Q 32 228 34 304 L 54 304 Q 56 252 58 178 Z" />
          <path d="M 82 178 Q 84 252 86 304 L 106 304 Q 108 228 104 178 Z" />
        </g>

        <g stroke="rgba(157, 0, 255, 0.3)" strokeWidth="0.8" fill="transparent">
          {/* Spine */}
          {spineY.map((y, i) => (
            <rect key={`spine-${i}`} x="66" y={y} width="8" height="6" rx="1" stroke="rgba(157, 0, 255, 0.5)" />
          ))}
          {/* Ribs */}
          {ribY.map((y, i) => (
            <g key={`ribs-${i}`}>
              <path d={`M 66 ${y} Q 50 ${y + 2} 40 ${y - 4}`} />
              <path d={`M 74 ${y} Q 90 ${y + 2} 100 ${y - 4}`} />
            </g>
          ))}
          {/* Collarbone */}
          <path d="M 70 72 L 40 66" />
          <path d="M 70 72 L 100 66" />
          {/* Sternum */}
          <path d="M 70 72 L 70 122" />
        </g>
      </svg>

      {/* Overlay Severity Nodes */}
      {BODY_FLAGS.map(flag => (
        <SeverityNode
          key={flag.id}
          flag={flag}
          onHover={setHoveredFlag}
          onLeave={() => setHoveredFlag(null)}
        />
      ))}

      {/* Hover Tooltip */}
      <NodeTooltip flag={hoveredFlag} />
    </div>
  );
};

export default HumanBody;
