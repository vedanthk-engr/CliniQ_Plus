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
  
  const trendLabel = isImproving ? `↓ IMPROVING` : `↑ WORSENING`;

  return (
    <GlassPanel style={{ padding: '24px', marginBottom: '16px', border: '1px solid rgba(115, 65, 234, 0.1)' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {labKeys.map(k => {
          const isActive = activeTab === k;
          const kColor = LAB_COLORS[k] || T.teal;
          return (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: isActive ? `1px solid ${kColor}` : `1px solid rgba(255, 255, 255, 0.5)`,
                background: isActive ? `${kColor}11` : 'rgba(255, 255, 255, 0.5)',
                color: isActive ? kColor : T.textSecondary,
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: isActive ? `0 0 15px ${kColor}22` : 'none'
              }}
              onMouseOver={e => { if(!isActive) e.target.style.background = 'rgba(255, 255, 255, 0.5)'; }}
              onMouseOut={e => { if(!isActive) e.target.style.background = 'rgba(255, 255, 255, 0.5)'; }}
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* Main Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.1em' }}>
            Latest {activeTab}
          </div>
          <div style={{ fontSize: '44px', fontWeight: '800', color: color, lineHeight: 1, fontFamily: T.fontDisplay, textShadow: `0 0 20px ${color}44` }}>
            {currentVal}
          </div>
        </div>
        <div style={{ textAlign: 'right', paddingBottom: '4px' }}>
          <div style={{ 
            fontSize: '11px', 
            color: isImproving ? T.green : T.amber, 
            fontWeight: '800',
            letterSpacing: '0.05em',
            padding: '4px 8px',
            background: isImproving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderRadius: '6px',
            border: `1px solid ${isImproving ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
          }}>
            {diff !== 0 ? trendLabel : 'STEADY'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '130px' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: T.textSecondary, fontSize: 10, fontWeight: '500' }} dy={10} />
            <Tooltip content={<CustomTooltip color={color} />} cursor={{ stroke: 'rgba(255, 255, 255, 0.5)', strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="val"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#color${activeTab})`}
              activeDot={{ r: 5, fill: color, stroke: T.bgDeep, strokeWidth: 3, boxShadow: `0 0 15px ${color}` }}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </GlassPanel>
  );
};

export default LabTrendChart;
