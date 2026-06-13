import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const TrajectoryPreview = ({ patient }) => {
  const navigate = useNavigate();
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [primaryCondition, setPrimaryCondition] = useState('');

  // Setup interventions based on patient
  const getInterventions = () => {
    if (patient.id === 'P-00142') {
      return [
        { label: 'Add Metformin', delta: -0.25, cond: 'Type 2 Diabetes' },
        { label: 'Increase Lisinopril', delta: -0.15, cond: 'Hypertension' }
      ];
    }
    if (patient.id === 'P-00399') {
      return [
        { label: 'Titrate Beta Blocker', delta: -0.20, cond: 'Congestive Heart Failure' },
        { label: 'Restructure Polypharmacy', delta: -0.30, cond: 'Stage 3 CKD' }
      ];
    }
    return [
      { label: 'Add Iron Supplement', delta: -0.18, cond: 'Anaemia' }
    ];
  };

  useEffect(() => {
    if (!patient) return;

    // Set primary condition
    const cond = patient.diagnosis?.[0] || 'General Risk';
    setPrimaryCondition(cond);

    // Build 6-month baseline trajectory
    // We project a steady worsening baseline for Arjun / Sarasu, and improving for Kavitha
    const isStable = patient.riskScore < 50;
    const baseRisk = patient.riskScore;

    const data = [];
    for (let m = 0; m <= 6; m++) {
      let riskVal = isStable 
        ? baseRisk - (m * 2.5) 
        : baseRisk + (m * 2.8);
      
      // Keep within bounds
      riskVal = Math.max(10, Math.min(98, riskVal));

      data.push({
        month: `M${m}`,
        risk: Math.round(riskVal),
        simulatedRisk: Math.round(riskVal) // Default same as baseline
      });
    }
    setChartData(data);
    setActiveIntervention(null);
  }, [patient?.id]);

  const handleToggle = (item) => {
    if (activeIntervention?.label === item.label) {
      // Deactivate
      setActiveIntervention(null);
      setChartData(prev => prev.map(d => ({ ...d, simulatedRisk: d.risk })));
    } else {
      // Activate and apply delta
      setActiveIntervention(item);
      setChartData(prev => prev.map(d => {
        // Calculate simulated risk with linear impact progression over 6 months
        const m = parseInt(d.month.replace('M', ''));
        const factor = m / 6.0; // Gradually apply delta
        const deltaAmt = (item.delta * 100) * factor;
        const simVal = Math.max(10, Math.min(98, d.risk + deltaAmt));
        return {
          ...d,
          simulatedRisk: Math.round(simVal)
        };
      }));
    }
  };

  const interventions = getInterventions();

  return (
    <GlassPanel 
      style={{ 
        padding: '20px', 
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '800', letterSpacing: '0.1em', fontFamily: T.fontMono, textTransform: 'uppercase' }}>
            6-Month Trajectory Forecast Preview
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: T.textPrimary, marginTop: '2px' }}>
            Condition: {primaryCondition}
          </div>
        </div>
        <button 
          onClick={() => navigate('/forecast')}
          style={{ 
            background: 'rgba(124, 58, 237, 0.1)', 
            border: '1px solid rgba(124, 58, 237, 0.3)', 
            color: '#A855F7', 
            fontSize: '10px', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          EXPAND FORECAST →
        </button>
      </div>

      {/* Recharts compact chart */}
      <div style={{ width: '100%', height: '140px', marginBottom: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: -5 }}>
            <XAxis dataKey="month" stroke="#64748B" fontSize={9} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={9} domain={[0, 100]} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#0D1224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#F1F5F9', fontSize: '10px' }}
              itemStyle={{ fontSize: '10px' }}
            />
            <Line 
              name="Baseline" 
              type="monotone" 
              dataKey="risk" 
              stroke="#7C3AED" 
              strokeWidth={2} 
              dot={{ r: 2 }} 
              activeDot={{ r: 4 }}
            />
            {activeIntervention && (
              <Line 
                name="Simulated" 
                type="monotone" 
                dataKey="simulatedRisk" 
                stroke="#A855F7" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={{ r: 2 }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Intervention Switches */}
      <div>
        <div style={{ fontSize: '9px', color: T.textSecondary, fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px', fontFamily: T.fontMono, textTransform: 'uppercase' }}>
          Intervention Simulator Toggles
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {interventions.map((item, idx) => {
            const isSelected = activeIntervention?.label === item.label;
            return (
              <button
                key={idx}
                onClick={() => handleToggle(item)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#A855F7' : T.textSecondary,
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: isSelected ? '#A855F7' : 'transparent',
                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.3)',
                  display: 'inline-block' 
                }} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
};

export default TrajectoryPreview;
