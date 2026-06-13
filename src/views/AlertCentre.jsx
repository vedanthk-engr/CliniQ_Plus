import React, { useState, useMemo } from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import AlertCard from '../components/AlertCentre/AlertCard';

const AlertCentre = ({ patients = [] }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeSort, setActiveSort] = useState('Severity');
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

    // Sort definition (Newest vs Severity) and Ack'd shifting
    const sorted = [...filtered].sort((a, b) => {
      const aAck = acknowledgedIds.has(a.id);
      const bAck = acknowledgedIds.has(b.id);

      // Acknowledged always go to bottom
      if (aAck && !bAck) return 1;
      if (!aAck && bAck) return -1;

      // Within same Ack bucket, apply primary sort
      if (activeSort === 'Severity') {
        const diff = severityOrder[b.severity] - severityOrder[a.severity];
        if (diff !== 0) return diff;
      }

      // If tied (or if Newest sort active), sort by time roughly
      return b.time.localeCompare(a.time);
    });

    return sorted;
  }, [allAlerts, activeFilter, activeSort, acknowledgedIds]);

  const allClear = processedAlerts.length > 0 && processedAlerts.every(a => acknowledgedIds.has(a.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopHeader />

      <div className="fadeIn" style={{ padding: '0 32px 32px 32px', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: T.textPrimary,
            letterSpacing: '-0.02em',
            fontFamily: T.fontDisplay,
            textShadow: '0 0 15px rgba(115, 65, 234, 0.2)'
          }}>
            Alert Centre
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.5)', color: T.textPrimary, border: `1px solid rgba(115, 65, 234, 0.2)`,
                padding: '8px 16px', borderRadius: '8px', fontSize: '11px', outline: 'none', cursor: 'pointer',
                fontFamily: T.fontMono, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              <option value="ALL">Filter: ALL</option>
              <option value="HIGH">Filter: HIGH</option>
              <option value="MEDIUM">Filter: MEDIUM</option>
              <option value="LOW">Filter: LOW</option>
            </select>

            <select
              value={activeSort}
              onChange={e => setActiveSort(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.5)', color: T.textPrimary, border: `1px solid rgba(115, 65, 234, 0.2)`,
                padding: '8px 16px', borderRadius: '8px', fontSize: '11px', outline: 'none', cursor: 'pointer',
                fontFamily: T.fontMono, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              <option value="Severity">Sort by: Severity</option>
              <option value="Newest">Sort by: Newest</option>
            </select>
          </div>
        </div>

        {/* Empty State / All Clear */}
        {allClear && (
          <div className="fadeIn" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '48px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: `1px solid rgba(16, 185, 129, 0.2)`,
            color: T.green, marginBottom: '32px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: T.fontDisplay }}>ALL CLEAR</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', fontWeight: '500', letterSpacing: '0.05em' }}>EVERY PATIENT ANOMALY HAS BEEN REVIEWED</div>
          </div>
        )}

        {/* Alert List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {processedAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isAcknowledged={acknowledgedIds.has(alert.id)}
              onAck={handleAck}
            />
          ))}
          {processedAlerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: T.textMuted, fontSize: '14px' }}>
              No alerts match the selected filter.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AlertCentre;
