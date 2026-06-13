import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const TrajectoryPreview = ({ patient }) => {
  const navigate = useNavigate();
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [primaryCondition, setPrimaryCondition] = useState('');

  // Setup interventions based on patient
  const getInterventions = () => {
    if (patient.id === 'P-00142') {
      return [
        { label: 'Add Metformin', delta: -0.25, cond: 'Type 2 Diabetes', details: '500mg daily' },
        { label: 'Increase Lisinopril', delta: -0.15, cond: 'Hypertension', details: 'To 20mg daily' }
      ];
    }
    if (patient.id === 'P-00399') {
      return [
        { label: 'Titrate Beta Blocker', delta: -0.20, cond: 'Congestive Heart Failure', details: 'Coreg 25mg bid' },
        { label: 'Restructure Polypharmacy', delta: -0.30, cond: 'Stage 3 CKD', details: 'Avoid NSAIDs' }
      ];
    }
    return [
      { label: 'Add Iron Supplement', delta: -0.18, cond: 'Anaemia', details: 'Fersolate 300mg' }
    ];
  };

  useEffect(() => {
    if (!patient) return;

    const cond = patient.diagnosis?.[0] || 'General Risk';
    setPrimaryCondition(cond);

    const isStable = patient.riskScore < 50;
    const baseRisk = patient.riskScore;

    const data = [];
    for (let m = 0; m <= 6; m++) {
      let riskVal = isStable 
        ? baseRisk - (m * 2.5) 
        : baseRisk + (m * 2.8);
      
      riskVal = Math.max(10, Math.min(98, riskVal));

      data.push({
        month: `Month ${m}`,
        risk: Math.round(riskVal),
        simulatedRisk: Math.round(riskVal)
      });
    }
    setChartData(data);
    setActiveIntervention(null);
  }, [patient?.id]);

  const handleToggle = (item) => {
    if (activeIntervention?.label === item.label) {
      setActiveIntervention(null);
      setChartData(prev => prev.map(d => ({ ...d, simulatedRisk: d.risk })));
    } else {
      setActiveIntervention(item);
      setChartData(prev => prev.map(d => {
        const m = parseInt(d.month.replace('Month ', ''));
        const factor = m / 6.0;
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
    <div className="flex flex-col w-full text-black">
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <span className="text-[10px] font-black text-black/55 uppercase tracking-widest font-sans">Condition Target</span>
          <div className="text-[16px] font-bold text-black leading-tight mt-0.5">
            {primaryCondition}
          </div>
        </div>
        <button 
          onClick={() => navigate('/forecast')}
          className="bg-black/10 border border-black/10 text-black hover:bg-black/20 text-[10px] py-1.5 px-4 rounded-full cursor-pointer font-bold transition-all tracking-wider uppercase font-sans shadow-sm"
        >
          Expand Forecast →
        </button>
      </div>

      {/* Recharts chart */}
      <div className="w-full h-[160px] mb-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: -5 }}>
            <XAxis dataKey="month" stroke="rgba(0,0,0,0.5)" fontSize={10} tickLine={false} />
            <YAxis stroke="rgba(0,0,0,0.5)" fontSize={10} domain={[0, 100]} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
              labelStyle={{ color: '#000000', fontWeight: 'bold', fontSize: '11px', fontFamily: 'sans-serif' }}
              itemStyle={{ fontSize: '11px', color: '#000000', fontFamily: 'sans-serif' }}
            />
            <Line 
              name="Baseline Forecast" 
              type="monotone" 
              dataKey="risk" 
              stroke="#000000" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#000000' }} 
              activeDot={{ r: 5 }}
            />
            {activeIntervention && (
              <Line 
                name="Simulated Outcome" 
                type="monotone" 
                dataKey="simulatedRisk" 
                stroke="#FF6B9E" 
                strokeWidth={3} 
                strokeDasharray="6 4" 
                dot={{ r: 3, fill: '#FF6B9E' }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Intervention Switches (Stitch layout style) */}
      <div className="border-t border-black/10 pt-4 z-10">
        <div className="text-[10px] text-black/55 font-black tracking-widest mb-3 uppercase font-sans">
          Intervention Simulator Toggles
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interventions.map((item, idx) => {
            const isSelected = activeIntervention?.label === item.label;
            return (
              <div
                key={idx}
                onClick={() => handleToggle(item)}
                className={`rounded-2xl p-5 border flex justify-between items-center cursor-pointer transition-all duration-300 shadow-sm ${
                  isSelected 
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#065F46]' 
                    : 'bg-white/70 border-white/50 text-black hover:bg-white'
                }`}
              >
                <div>
                  <h4 className="font-bold text-[14px] leading-tight font-sans">{item.label}</h4>
                  <p className={`text-[12px] mt-0.5 font-medium ${isSelected ? 'text-[#065F46]/75' : 'text-gray-500'}`}>{item.details}</p>
                </div>
                
                {/* Switch Track */}
                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
                  isSelected ? 'bg-[#10B981]' : 'bg-gray-200/80 border border-gray-300/40'
                }`}>
                  {/* Knob */}
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow ${
                    isSelected ? 'translate-x-[22px]' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {activeIntervention && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 mt-4 animate-fade-in">
            <span className="text-[10px] text-black/55 uppercase tracking-wider font-black font-sans">Simulated Outcome</span>
            <p className="text-[15px] font-bold text-black mt-1 leading-snug">
              Projected <span className="text-[#FF6B9E] font-black">{Math.abs(Math.round(activeIntervention.delta * 100))}% reduction</span> in progression risk over 6 months.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrajectoryPreview;
