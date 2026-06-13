import React, { useState, useMemo } from 'react';
import TopHeader from '../components/TopHeader';
import AlertCard from '../components/AlertCentre/AlertCard';
import CalendarSidebar from '../components/CalendarSidebar';

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

      <div className="flex-grow flex flex-col xl:flex-row gap-6 w-full max-w-[1400px] mx-auto pb-8 relative">
        
        {/* Left Column (Alerts List) */}
        <div className="flex-grow flex flex-col gap-6 px-8 min-w-0">
          
          {/* Header & Filter Controls */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-2 animate-fade-in-up">
            <div>
              <h2 className="text-[32px] font-extrabold text-brand-sidebar tracking-tight leading-none mb-2">Alert Centre</h2>
              <p className="text-sm text-gray-500 font-medium">Review urgent clinical notifications, anomalies, and AI pre-consultation reasoning.</p>
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
            {processedAlerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isAcknowledged={acknowledgedIds.has(alert.id)}
                onAck={handleAck}
                colorIndex={index}
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
        <CalendarSidebar />

      </div>
    </div>
  );
};

export default AlertCentre;
