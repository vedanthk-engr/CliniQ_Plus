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
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-[11px] font-extrabold text-[#7C3AED] tracking-wider mb-1 font-mono uppercase">
            6-Month Trajectory Forecast Preview
          </div>
          <div className="text-[13px] font-extrabold text-black mt-0.5">
            Condition: {primaryCondition}
          </div>
        </div>
        <button 
          onClick={() => navigate('/forecast')}
          className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/20 text-[10px] py-1 px-3 rounded-lg cursor-pointer font-extrabold transition-all tracking-wider uppercase font-mono shadow-sm"
        >
          EXPAND FORECAST →
        </button>
      </div>

      {/* Recharts compact chart */}
      <div className="w-full h-[140px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: -5 }}>
            <XAxis dataKey="month" stroke="#64748B" fontSize={9} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={9} domain={[0, 100]} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '10px' }}
              itemStyle={{ fontSize: '10px', color: '#0f172a' }}
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
        <div className="text-[9px] text-gray-500 font-extrabold tracking-wider mb-2 font-mono uppercase">
          Intervention Simulator Toggles
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {interventions.map((item, idx) => {
            const isSelected = activeIntervention?.label === item.label;
            return (
              <button
                key={idx}
                onClick={() => handleToggle(item)}
                className={`px-4 py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider font-mono flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-sm ${
                  isSelected 
                    ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-[#7C3AED]' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isSelected 
                    ? 'bg-[#7C3AED]' 
                    : 'border border-gray-300 bg-transparent'
                }`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrajectoryPreview;
