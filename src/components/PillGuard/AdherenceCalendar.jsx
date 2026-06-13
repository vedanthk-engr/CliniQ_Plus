import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

// Helper to reliably generate a pseudo-random looking calendar based on the patient's ID and adherence score
const generateGridData = (patient) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Provide a base template. For each day, 3 doses (Morning, Afternoon, Evening)
  const score = patient.adherenceScore;
  
  // Create a seeded random function based on patient ID to keep it consistent
  let seed = patient.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const grid = [];
  
  days.forEach((day, dayIdx) => {
    // If patient adherence is low, force more misses
    // If adherence is high, force more confirmed
    const targetRate = score / 100;
    
    // We also use patient.adherenceCalendar array (which has 7 bools) as a primary hint for that day's main mood
    const dayHint = patient.adherenceCalendar[dayIdx];
    
    const row = { day, doses: [] };
    for (let i = 0; i < 3; i++) {
      let status = 'missed';
      const r = random();
      
      // If it's the future (say Sunday evening), maybe leave it unconfirmed or missed
      
      if (dayHint) {
        // Good day
        if (r < 0.8) status = 'confirmed';
        else if (r < 0.9) status = 'unconfirmed';
        else status = 'missed';
      } else {
        // Bad day
        if (r < targetRate) status = 'confirmed';
        else if (r < targetRate + 0.1) status = 'wrong';
        else status = 'missed';
      }
      
      row.doses.push(status);
    }
    grid.push(row);
  });
  
  return grid;
};

const AdherenceCalendar = ({ patient }) => {
  if (!patient) return null;

  const gridData = generateGridData(patient);
  
  let scoreColor = T.green;
  if (patient.adherenceScore < 75) scoreColor = T.amber;
  if (patient.adherenceScore < 50) scoreColor = T.red;

  const renderCell = (status, idx) => {
    let bg = 'rgba(255, 255, 255, 0.5)';
    let border = 'rgba(115, 65, 234, 0.05)';
    let text = '—';
    let color = T.textMuted;

    if (status === 'confirmed') {
      bg = 'rgba(16, 185, 129, 0.1)';
      border = 'rgba(16, 185, 129, 0.3)';
      text = '✓';
      color = T.green;
    } else if (status === 'wrong') {
      bg = 'rgba(239, 68, 68, 0.1)';
      border = 'rgba(239, 68, 68, 0.3)';
      text = '⚠';
      color = T.red;
    } else if (status === 'unconfirmed') {
      bg = 'rgba(245, 158, 11, 0.08)';
      border = 'rgba(245, 158, 11, 0.2)';
      text = '?';
      color = T.amber;
    }

    return (
      <div key={idx} style={{
        height: '34px', borderRadius: '8px', background: bg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color, fontSize: '13px', fontWeight: '800', fontFamily: T.fontMono,
        boxShadow: status === 'confirmed' ? `0 0 8px ${T.green}11` : 'none'
      }}>
        {text}
      </div>
    );
  };

  return (
    <GlassPanel style={{ padding: '24px 20px', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(115, 65, 234, 0.08)' }}>
      
      <div style={{
        fontSize: '10px', fontWeight: '800', color: T.teal, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: '20px', fontFamily: T.fontMono
      }}>
        7-DAY ADHERENCE LOG
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
        <div />
        <div style={{ fontSize: '9px', color: T.textSecondary, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Morning</div>
        <div style={{ fontSize: '9px', color: T.textSecondary, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Afternoon</div>
        <div style={{ fontSize: '9px', color: T.textSecondary, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evening</div>

        {gridData.map((row, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>
              {row.day}
            </div>
            {row.doses.map((status, idx) => renderCell(status, idx))}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid rgba(115, 65, 234, 0.1)`, paddingTop: '20px' }}>
        <div style={{ flex: 1, marginRight: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: T.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase' }}>WEEKLY SCORE</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: scoreColor, lineHeight: 1, fontFamily: T.fontDisplay, textShadow: `0 0 10px ${scoreColor}33` }}>{patient.adherenceScore}%</div>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
             <div style={{ width: `${patient.adherenceScore}%`, height: '100%', background: scoreColor, borderRadius: '3px', boxShadow: `0 0 8px ${scoreColor}` }} />
          </div>
        </div>

        <button 
          onClick={() => console.log('Generating PDF...')}
          style={{
            padding: '10px 16px', background: 'rgba(115, 65, 234, 0.05)', border: `1px solid rgba(115, 65, 234, 0.2)`,
            color: T.teal, borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
            transition: 'all 0.3s', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(115, 65, 234, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(115, 65, 234, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(115, 65, 234, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Export Report
        </button>
      </div>

    </GlassPanel>
  );
};

export default AdherenceCalendar;
