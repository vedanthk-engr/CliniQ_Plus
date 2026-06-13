import React, { useState, useMemo } from 'react';
import TopHeader from '../components/TopHeader';
import AlertCard from '../components/AlertCentre/AlertCard';

const AlertCentre = ({ patients = [] }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeSort, setActiveSort] = useState('Urgency');
  const [acknowledgedIds, setAcknowledgedIds] = useState(new Set());

  // Aggregate all clinical patterns into a single array of alerts
  const allAlerts = useMemo(() => {
    const arr = [];
    patients.forEach(p => {
      p.clinicalPatterns?.forEach((pattern, i) => {
        arr.push({
          ...pattern,
          id: `${p.id}-alert-${i}`,
          patientName: p.name,
          patientId: p.id,
        });
      });
    });
    return arr;
  }, [patients]);

  const handleAck = (id) => {
    setAcknowledgedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  // Filter and sort
  const processedAlerts = useMemo(() => {
    let filtered = allAlerts;
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.severity === activeFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aAck = acknowledgedIds.has(a.id);
      const bAck = acknowledgedIds.has(b.id);

      // Acknowledged always go to bottom
      if (aAck && !bAck) return 1;
      if (!aAck && bAck) return -1;

      // Within same Ack bucket, apply primary sort
      if (activeSort === 'Urgency') {
        const uA = a.urgency_score || 5;
        const uB = b.urgency_score || 5;
        if (uB !== uA) return uB - uA; // High score first
      }

      if (activeSort === 'Severity') {
        const diff = severityOrder[b.severity] - severityOrder[a.severity];
        if (diff !== 0) return diff;
      }

      return b.time.localeCompare(a.time);
    });

    return sorted;
  }, [allAlerts, activeFilter, activeSort, acknowledgedIds]);

  const allClear = processedAlerts.length > 0 && processedAlerts.every(a => acknowledgedIds.has(a.id));

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-on-surface">
      <TopHeader />

      <div className="flex-grow flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto pb-8 relative">
        
        {/* Left Column (Alerts List) */}
        <div className="flex-grow flex flex-col gap-6 px-8 min-w-0">
          
          {/* Header & Filter Controls */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-sidebar tracking-tight">Alert centre:</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Review urgent clinical notifications, anomalies, and AI pre-consultation reasoning.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={activeFilter}
                  onChange={e => setActiveFilter(e.target.value)}
                  className="appearance-none bg-black text-white font-bold text-xs py-2.5 pl-5 pr-10 rounded-full border-none focus:outline-none focus:ring-0 cursor-pointer shadow-sm"
                >
                  <option value="ALL">Filter: ALL</option>
                  <option value="HIGH">Filter: HIGH</option>
                  <option value="MEDIUM">Filter: MEDIUM</option>
                  <option value="LOW">Filter: LOW</option>
                </select>
                <span className="material-symbols-outlined text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">expand_more</span>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={e => setActiveSort(e.target.value)}
                  className="appearance-none bg-black text-white font-bold text-xs py-2.5 pl-5 pr-10 rounded-full border-none focus:outline-none focus:ring-0 cursor-pointer shadow-sm"
                >
                  <option value="Urgency">Sort: Urgency</option>
                  <option value="Severity">Sort: Severity</option>
                  <option value="Newest">Sort: Newest</option>
                </select>
                <span className="material-symbols-outlined text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">expand_more</span>
              </div>
            </div>
          </div>

          {/* All Clear state */}
          {allClear && (
            <div className="bg-[#10B981]/15 border border-[#10B981]/30 rounded-[24px] p-8 text-center flex flex-col items-center justify-center animate-fade-in-up">
              <span className="material-symbols-outlined text-5xl text-green-600 mb-3 font-black animate-pulse">check_circle</span>
              <h3 className="text-lg font-black text-brand-sidebar">ALL CLEAR</h3>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Every patient anomaly has been reviewed</p>
            </div>
          )}

          {/* Alerts List */}
          <div className="flex flex-col gap-6">
            {processedAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isAcknowledged={acknowledgedIds.has(alert.id)}
                onAck={handleAck}
              />
            ))}
            {processedAlerts.length === 0 && (
              <div className="text-center p-12 bg-white border border-gray-200 rounded-[24px] text-gray-405 font-bold text-sm">
                No active notifications found matching criteria.
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Panel (Calendar & Timeline) */}
        <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-6 sticky top-[140px] h-[calc(100vh-160px)] px-4">
          
          {/* Greeting */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-bold">Good morning,</p>
              <h2 className="text-xl font-extrabold text-brand-sidebar tracking-tight leading-none mt-1">Dr. Yuthika</h2>
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-brand-sidebar">more_vert</span>
            </button>
          </div>

          {/* Calendar Widget */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-gray-650">chevron_left</span>
              <span className="bg-brand-pink-light text-brand-sidebar px-3.5 py-1 rounded-full font-bold text-xs">
                May 2024
              </span>
              <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-gray-650">chevron_right</span>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-black text-gray-450 uppercase mb-2">
              <div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div><div>SU</div>
            </div>

            <div className="grid grid-cols-7 gap-y-2.5 text-center text-xs font-bold text-gray-700">
              <div className="text-gray-200">29</div><div className="text-gray-200">30</div>
              <span>1</span><span>2</span><span>3</span><span>4</span><span className="text-gray-400">5</span>
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span className="text-gray-400">12</span>
              <span>13</span><span>14</span>
              <span className="bg-brand-pink text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto font-black shadow-sm shadow-brand-pink/40">15</span>
              <span>16</span><span>17</span><span>18</span><span className="text-gray-400">19</span>
            </div>

            <button className="w-full bg-black text-white font-bold text-xs py-3 rounded-full hover:bg-gray-800 transition-colors mt-5 shadow-sm flat-look cursor-pointer">
              Add event
            </button>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-5 flex-1 flex flex-col shadow-sm overflow-hidden">
            <div className="flex justify-between items-end mb-4 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-brand-sidebar">May 15</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Today's timeline</p>
              </div>
              <span className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer">
                All <span className="material-symbols-outlined text-xs">expand_more</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gray-100">
              
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-gray-400 font-mono bg-gray-100 border border-gray-200/50 px-1.5 py-0.5 rounded">07:00</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150 shadow-sm opacity-60">
                  <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink shrink-0">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Emergency visit</h4>
                    <p className="text-[9px] text-gray-450 font-bold mt-0.5">West camp, Room 312</p>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-gray-400 font-mono bg-gray-100 border border-gray-200/50 px-1.5 py-0.5 rounded">08:00</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150 shadow-sm opacity-60">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0">
                    <span className="material-symbols-outlined text-[16px]">science</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Diagnostic test</h4>
                    <p className="text-[9px] text-gray-450 font-bold mt-0.5">East camp, Laboratory</p>
                  </div>
                </div>
              </div>

              {/* Event 3 (Active) */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-brand-sidebar font-mono bg-brand-pink-light px-1.5 py-0.5 rounded">08:12</span>
                <div className="absolute -left-[28px] top-3 w-3.5 h-3.5 rounded-full bg-[#715800] border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-brand-yellow/15 p-3 rounded-xl border border-brand-yellow/30 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-sidebar shrink-0">
                    <span className="material-symbols-outlined text-[16px] fill-icon">groups</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Team meeting</h4>
                    <p className="text-[9px] text-gray-600 font-bold mt-0.5">East camp, Room 408</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default AlertCentre;
