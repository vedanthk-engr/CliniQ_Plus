import React from 'react';
import { T } from '../../tokens';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area, BarChart, Bar } from 'recharts';

const VitalCard = ({ type, title, value, unit, icon, trendData, color = T.teal }) => {
  const isHR = type === 'hr';
  const isBP = type === 'bp';
  const isGlucose = type === 'glucose';

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.5)',
      border: `1px solid rgba(115, 65, 234, 0.1)`,
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.border = `1px solid ${color}66`;
      e.currentTarget.style.boxShadow = `0 0 25px ${color}15`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = `1px solid rgba(115, 65, 234, 0.1)`;
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '10px', color: T.textSecondary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: T.textPrimary, fontFamily: T.fontDisplay, textShadow: `0 0 10px ${color}33` }}>{value}</span>
            {unit && <span style={{ fontSize: '11px', color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>{unit}</span>}
          </div>
        </div>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: `${color}11`, 
          border: `1px solid ${color}22`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '16px',
          boxShadow: `0 0 10px ${color}11`
        }}>
          {icon}
        </div>
      </div>

      <div style={{ height: '50px', width: '100%', marginTop: '4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {isBP ? (
            <BarChart data={trendData}>
              <Bar dataKey="val" fill={color} radius={[2, 2, 0, 0]} barSize={4} />
            </BarChart>
          ) : isHR ? (
            <LineChart data={trendData}>
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke={color} 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={true} 
                filter={`drop-shadow(0 0 5px ${color})`} 
              />
            </LineChart>
          ) : (
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#color${type})`} 
                strokeWidth={3} 
                filter={`drop-shadow(0 0 5px ${color}88)`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VitalCard;
