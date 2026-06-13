import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';

const LAB_COLORS = {
  HbA1c: T.red,
  Creatinine: T.amber,
  BP_Systolic: '#FB923C',
  Hemoglobin: T.green,
  CRP: T.red,
  ESR: T.purple,
  default: T.teal
};

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${color}`,
        padding: '10px 14px',
        borderRadius: '10px',
        color: T.textPrimary,
        fontSize: '11px',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 0 15px ${color}33`
      }}>
        <div style={{ color: T.textSecondary, marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontWeight: '800', color: color, fontSize: '14px', textShadow: `0 0 10px ${color}66` }}>
          {payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

const LabTrendChart = ({ patient }) => {
  if (!patient || !patient.labs) return null;

  const labKeys = Object.keys(patient.labs);
  const [activeTab, setActiveTab] = useState(labKeys[0]);

  React.useEffect(() => {
    if (patient && patient.labs && !patient.labs[activeTab]) {
      setActiveTab(Object.keys(patient.labs)[0]);
    }
  }, [patient, activeTab]);

  if (!labKeys.length || !patient.labs[activeTab]) return null;

  const data = patient.labs[activeTab];
  const color = LAB_COLORS[activeTab] || T.teal;
  
  const currentVal = data[data.length - 1].val;
  const firstVal = data[0].val;
  const diff = currentVal - firstVal;
  
  let isImproving = diff < 0;
  if (activeTab === 'Hemoglobin') isImproving = diff > 0;
  if (diff === 0) isImproving = null;
  
  const trendLabel = isImproving ? `↓ IMPROVING` : `↑ WORSENING`;  return (
    <div className="bg-brand-pink rounded-card p-6 h-[268px] flex flex-col relative overflow-hidden transition-shadow duration-300 shadow-sm hover:shadow-md animate-fade-in-up">
      {/* Header and Switcher Tabs */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-headline-card text-[22px] font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">monitoring</span>
          Biometrics
        </h3>
        <div className="flex bg-white/50 backdrop-blur-sm rounded-full p-1 border border-white/20">
          {labKeys.slice(0, 3).map(k => {
            const isActive = activeTab === k;
            return (
              <button
                key={k}
                onClick={() => setActiveTab(k)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-on-surface shadow-sm' 
                    : 'text-on-surface/70 hover:bg-white/40 hover:text-on-surface'
                }`}
              >
                {k === 'BP_Systolic' ? 'BP' : k}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Display */}
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-[44px] font-black text-on-surface leading-none tracking-tight font-sans">
            {currentVal}
          </span>
          <span className="text-sm font-bold text-on-surface/70">
            {activeTab === 'HbA1c' ? '%' : activeTab === 'BP_Systolic' ? 'mmHg' : ''}
          </span>
        </div>
        <div>
          {diff !== 0 && (
            <div className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isImproving 
                ? 'bg-brand-green/20 text-[#5A631D]' 
                : 'bg-red-500/10 text-red-700'
            }`}>
              <span className="material-symbols-outlined text-[12px]">
                {isImproving ? 'trending_down' : 'trending_up'}
              </span>
              <span>{diff > 0 ? `+${diff}` : diff} since last visit</span>
            </div>
          )}
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="flex-grow min-h-0 relative flex flex-col justify-end">
        <div className="w-full h-16">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 5, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(0, 0, 0, 0.2)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgba(0, 0, 0, 0.2)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip color="#000000" />} cursor={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="val"
                stroke="rgba(0, 0, 0, 0.85)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#color${activeTab})`}
                activeDot={{ r: 4, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[9px] text-on-surface/60 font-extrabold uppercase mt-2 tracking-wider font-mono">
          {data.slice(-5).map((d, i) => (
            <span key={i} className={i === 4 ? 'text-on-surface font-black' : ''}>{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabTrendChart;
