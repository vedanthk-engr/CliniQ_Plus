import React from 'react';

// Helper to reliably generate a pseudo-random looking calendar based on the patient's ID and adherence score
const generateGridData = (patient) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const score = patient.adherenceScore || 92;
  
  let seed = patient.id ? patient.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 123;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const grid = [];
  
  days.forEach((day, dayIdx) => {
    const targetRate = score / 100;
    const row = { day, doses: [] };
    for (let i = 0; i < 3; i++) {
      let status = 'missed';
      const r = random();
      
      // Seed specific missed doses for visual match
      if (day === 'Thu' && i === 0) {
        status = 'missed'; // Thursday Morning missed dose
      } else if (day === 'Wed' && i === 2) {
        status = 'missed'; // Wednesday Evening missed dose
      } else {
        if (r < 0.85) status = 'confirmed';
        else status = 'missed';
      }
      
      row.doses.push(status);
    }
    grid.push(row);
  });
  
  return grid;
};

const AdherenceCalendar = ({ patient, onSelectMissedCell }) => {
  if (!patient) return null;

  const gridData = generateGridData(patient);

  const handleCellClick = (dayName, timeIndex) => {
    const times = ['morning', 'afternoon', 'evening'];
    const drugName = patient.medications?.[0]?.name || 'Lisinopril';
    if (onSelectMissedCell) {
      onSelectMissedCell(drugName);
    }
  };

  const renderCell = (status, dayName, timeIndex, key) => {
    let content = null;
    let cellStyle = "bg-white/30 border border-on-surface/20 rounded-md aspect-square flex items-center justify-center transition-all";

    if (status === 'confirmed') {
      cellStyle = "bg-white rounded-md aspect-square flex items-center justify-center shadow-sm text-pink";
      content = <span className="material-symbols-outlined text-[16px] font-bold">check</span>;
    } else {
      // Missed / dashed cell style
      cellStyle = "bg-white/50 border border-on-surface/20 rounded-md aspect-square flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer border-dashed border-2";
    }

    return (
      <div 
        key={key} 
        onClick={() => handleCellClick(dayName, timeIndex)}
        className={cellStyle}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="bg-pink rounded-2xl p-6 relative overflow-hidden h-[450px] flex flex-col justify-between shadow-sm font-sans">
      {/* Decorative Blob */}
      <svg className="absolute -right-10 -bottom-10 w-48 h-48 fill-white opacity-20 pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.9,-75.4C66,-66.4,75.2,-50.2,81.1,-33.1C87,-16,89.6,2,85.2,18.4C80.8,34.8,69.4,49.6,55.5,60.8C41.6,72,25.2,79.6,7.6,83.1C-10,86.6,-28.8,86,-44.6,78.2C-60.4,70.4,-73.2,55.4,-81.4,38.6C-89.6,21.8,-93.2,3.2,-89.6,-13.7C-86,-30.6,-75.2,-45.8,-61.4,-55.1C-47.6,-64.4,-30.8,-67.8,-15.1,-72C0.6,-76.2,16.2,-81.2,37.8,-84.4Z" transform="translate(100 100)" />
      </svg>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        
        {/* Header with Adherence Metric */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-headline-card text-headline-card text-on-surface flex items-center gap-2 font-bold text-xl">
            <span className="material-symbols-outlined">calendar_today</span>
            7-day adherence
          </h3>
          <div className="text-right">
            <span className="font-display-metric text-3xl font-extrabold text-on-surface block leading-none">
              {patient.adherenceScore || 92}%
            </span>
            <span className="font-label-bold text-[10px] font-bold text-on-surface/70 uppercase tracking-wider block mt-0.5">
              Overall Score
            </span>
          </div>
        </div>

        {/* Adherence grid container */}
        <div className="flex-grow bg-white/30 rounded-xl p-4 backdrop-blur-sm border border-white/20 flex flex-col justify-center">
          <div className="grid grid-cols-8 gap-2.5 h-full">
            {/* Y Axis Labels */}
            <div className="col-span-1 flex flex-col justify-around text-xs font-bold text-on-surface/70 h-[80%] mt-auto pr-1">
              <span>Morn</span>
              <span>Aft</span>
              <span>Eve</span>
            </div>
            
            {/* Days Grid */}
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center font-bold text-xs text-on-surface/70 mb-2">{d}</div>
              ))}
              {/* morning cells */}
              {gridData.map((row) => renderCell(row.doses[0], row.day, 0, `m-${row.day}`))}
              {/* afternoon cells */}
              {gridData.map((row) => renderCell(row.doses[1], row.day, 1, `a-${row.day}`))}
              {/* evening cells */}
              {gridData.map((row) => renderCell(row.doses[2], row.day, 2, `e-${row.day}`))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdherenceCalendar;
