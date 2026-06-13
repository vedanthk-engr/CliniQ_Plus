import React from 'react';

// Helper to reliably generate a pseudo-random looking calendar based on the patient's ID and adherence score
const generateGridData = (patient) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const score = patient.adherenceScore || 85;
  
  let seed = patient.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const grid = [];
  
  days.forEach((day, dayIdx) => {
    const targetRate = score / 100;
    const dayHint = patient.adherenceCalendar?.[dayIdx] ?? true;
    
    const row = { day, doses: [] };
    for (let i = 0; i < 3; i++) {
      let status = 'missed';
      const r = random();
      
      if (dayHint) {
        if (r < 0.8) status = 'confirmed';
        else if (r < 0.9) status = 'unconfirmed';
        else status = 'missed';
      } else {
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

const AdherenceCalendar = ({ patient, onSelectMissedCell }) => {
  if (!patient) return null;

  const gridData = generateGridData(patient);

  const handleCellClick = (status) => {
    // Select the first active medication to simulate missed dose impact
    const primaryDrug = patient.medications?.[0]?.name || 'Lisinopril';
    if (onSelectMissedCell) {
      onSelectMissedCell(primaryDrug);
    }
  };

  const renderCell = (status, idx) => {
    let content = null;
    let cellStyle = "bg-white/30 border border-brand-sidebar/10 rounded-lg aspect-square flex items-center justify-center transition-all";

    if (status === 'confirmed') {
      cellStyle = "bg-white rounded-lg aspect-square flex items-center justify-center shadow-sm text-brand-pink";
      content = <span className="material-symbols-outlined text-[18px] font-black fill-icon">check</span>;
    } else if (status === 'wrong') {
      cellStyle = "bg-white rounded-lg aspect-square flex items-center justify-center shadow-sm text-red-500 cursor-pointer hover:scale-105";
      content = <span className="material-symbols-outlined text-[18px] font-bold">warning</span>;
    } else if (status === 'unconfirmed') {
      cellStyle = "bg-white/60 rounded-lg aspect-square flex items-center justify-center text-brand-pink font-extrabold";
      content = "?";
    }

    const isClickable = status === 'missed' || status === 'wrong';
    if (isClickable) {
      cellStyle = "border-2 border-dashed border-brand-sidebar/20 hover:border-brand-sidebar hover:bg-white/20 rounded-lg aspect-square flex items-center justify-center transition-all cursor-pointer";
    }

    return (
      <div 
        key={idx} 
        onClick={() => isClickable && handleCellClick(status)}
        className={cellStyle}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="bg-brand-pink rounded-[24px] p-6 relative overflow-hidden h-[450px] flex flex-col justify-between shadow-sm">
      {/* Decorative Blob */}
      <svg className="absolute -right-10 -bottom-10 w-48 h-48 text-brand-sidebar opacity-10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
        <path d="M51.9,-75.4C66,-66.4,75.2,-50.2,81.1,-33.1C87,-16,89.6,2,85.2,18.4C80.8,34.8,69.4,49.6,55.5,60.8C41.6,72,25.2,79.6,7.6,83.1C-10,86.6,-28.8,86,-44.6,78.2C-60.4,70.4,-73.2,55.4,-81.4,38.6C-89.6,21.8,-93.2,3.2,-89.6,-13.7C-86,-30.6,-75.2,-45.8,-61.4,-55.1C-47.6,-64.4,-30.8,-67.8,-15.1,-72C0.6,-76.2,16.2,-81.2,37.8,-84.4Z" transform="translate(100 100)" />
      </svg>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        
        {/* Header with Adherence Metric */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-extrabold text-lg text-brand-sidebar flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_today</span>
            7-day adherence
          </h3>
          <div className="text-right">
            <span className="text-3xl font-black text-brand-sidebar block leading-none">
              {patient.adherenceScore || 85}%
            </span>
            <span className="text-[9px] font-black text-brand-sidebar/70 uppercase tracking-wider">
              Overall Score
            </span>
          </div>
        </div>

        {/* Adherence grid container */}
        <div className="flex-grow bg-white/20 rounded-xl p-3 border border-brand-sidebar/10 flex flex-col justify-center">
          <div className="grid grid-cols-8 gap-2.5">
            {/* Y Axis Labels */}
            <div className="col-span-1 flex flex-col justify-around text-[10px] font-black text-brand-sidebar/70 h-[80%] mt-auto pr-1">
              <span>Morn</span>
              <span>Aft</span>
              <span>Eve</span>
            </div>
            
            {/* Days Grid */}
            <div className="col-span-7 grid grid-cols-7 gap-2.5">
              {/* Day Headers */}
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center font-black text-[10px] text-brand-sidebar/70 mb-1">{d}</div>
              ))}
              {/* morning cells */}
              {gridData.map((row) => renderCell(row.doses[0], `m-${row.day}`))}
              {/* afternoon cells */}
              {gridData.map((row) => renderCell(row.doses[1], `a-${row.day}`))}
              {/* evening cells */}
              {gridData.map((row) => renderCell(row.doses[2], `e-${row.day}`))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-3 border-t border-brand-sidebar/15 flex items-center justify-between">
          <span className="text-[9px] font-black text-brand-sidebar/60 uppercase tracking-wider max-w-[150px]">
            Click missed cell to stream forecast
          </span>
          <button 
            onClick={() => {
              fetch('http://localhost:8000/api/export/comprehensive-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patient.id })
              })
              .then(res => {
                if (res.ok) return res.blob();
                throw new Error('Export failed');
              })
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ClinIQ_Report_${patient.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              })
              .catch(err => alert("Report export failed. Check server log."));
            }}
            className="px-4 py-2 bg-brand-sidebar text-white font-bold text-[10px] uppercase rounded-full hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            Export Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdherenceCalendar;
