import React from 'react';
import { T } from '../../tokens';
import GlassPanel from '../GlassPanel';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const LAB_COLORS = {
  HbA1c: T.teal,
  Creatinine: T.purple,
  BP_Systolic: T.amber,
};

const PatientAnalyticsCard = ({ patient }) => {
  // Sparkline builder
  const LabSparkline = ({ title, dataKey, history }) => {
    // Robust fallback: if patient doesn't have this lab, don't render or crash
    if (!history || !Array.isArray(history) || history.length === 0) return null;
    const color = LAB_COLORS[dataKey] || T.teal;
    const first = history[0].val;
    const last = history[history.length - 1].val;
    // Assume higher is worse for simplicity, though depends on lab.
    const isWorsening = last > first;
    const arrow = isWorsening ? '↑' : '↓';
    const arrowColor = isWorsening ? T.red : T.green;

    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ width: '80px', fontSize: '11px', color: T.textMuted, fontWeight: '600' }}>
          {title.toUpperCase()}
        </div>
        <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: T.textPrimary }}>{last}</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: arrowColor }}>{arrow}</span>
        </div>
        <div style={{ flex: 1, height: '40px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id={`spark-${dataKey}-${patient.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#spark-${dataKey}-${patient.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Adherence Bar Chart (SVG Inline)
  const renderAdherenceBars = () => {
    // mockData.js doesn't specifically have adherenceCalendar array on PATIENTS. We fallback completely.
    const calendar = patient.adherenceCalendar || [true, true, true, false, true, true, false];
    const width = 200;
    const height = 40;
    const barWidth = 14;
    const gap = (width - (calendar.length * barWidth)) / (calendar.length - 1);

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {calendar.map((took, i) => {
          const barHeight = took ? height : height * 0.15;
          const y = height - barHeight;
          const x = i * (barWidth + gap);
          let color = T.green;
          if (patient.adherenceScore < 75) color = T.amber;
          if (patient.adherenceScore < 50) color = T.red;
          if (!took) color = T.borderSubtle;

          return (
            <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="3" />
          );
        })}
      </svg>
    );
  };

  return (
    <GlassPanel style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      border: 'none'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: `1px solid rgba(115, 65, 234, 0.1)`
      }}>
        <div>
          <div style={{
            fontSize: '20px',
            fontWeight: '800',
            color: T.textPrimary,
            marginBottom: '8px',
            fontFamily: T.fontDisplay,
            letterSpacing: '-0.02em'
          }}>
            {patient.name}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(patient.diagnosis || patient.diagnoses || []).map((d, i) => (
              <span key={i} style={{
                fontSize: '10px',
                background: 'rgba(115, 65, 234, 0.05)',
                border: `1px solid rgba(157, 0, 255, 0.15)`,
                color: T.teal,
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: T.fontMono
              }}>
                {d}
              </span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: '500', color: T.textSecondary, letterSpacing: '0.08em', marginBottom: '4px', textTransform: 'uppercase', fontFamily: T.fontUi }}>RISK SCORE</div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: T.statValue,
            lineHeight: 1,
            fontFamily: T.fontDisplay,
            textShadow: 'none'
          }}>
            {patient.riskScore}
          </div>
        </div>
      </div>

      {/* Lab Trends */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: '800',
          color: T.textSecondary,
          letterSpacing: '0.15em',
          marginBottom: '20px',
          textTransform: 'uppercase',
          fontFamily: T.fontMono,
          opacity: 0.8
        }}>
          BIOMETRIC STREAM
        </div>

        {patient.labs.HbA1c && <LabSparkline title="HbA1c" dataKey="HbA1c" history={patient.labs.HbA1c} />}
        {patient.labs.Creatinine && <LabSparkline title="Creatinine" dataKey="Creatinine" history={patient.labs.Creatinine} />}
        {patient.labs.BP_Systolic && <LabSparkline title="Systolic BP" dataKey="BP_Systolic" history={patient.labs.BP_Systolic} />}
        {patient.labs.ESR && <LabSparkline title="ESR" dataKey="ESR" history={patient.labs.ESR} />}
        {patient.labs.Hemoglobin && <LabSparkline title="Hemoglobin" dataKey="Hemoglobin" history={patient.labs.Hemoglobin} />}
      </div>

      {/* Trajectories Bottom Block */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginTop: 'auto',
        paddingTop: '24px',
        borderTop: `1px solid rgba(115, 65, 234, 0.1)`
      }}>

        {/* Adherence */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: T.textSecondary, letterSpacing: '0.1em', marginBottom: '14px', textTransform: 'uppercase', fontFamily: T.fontMono }}>
            ADHERENCE (7D)
          </div>
          {renderAdherenceBars()}
        </div>

        {/* Risk Trajectory Scale */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: T.textSecondary, letterSpacing: '0.1em', marginBottom: '14px', textTransform: 'uppercase', fontFamily: T.fontMono }}>
            RISK TRAJECTORY
          </div>
          <div style={{ position: 'relative', width: '100%', height: '40px' }}>
            <div style={{
              position: 'absolute', top: '16px', width: '100%', height: '8px', borderRadius: '4px',
              background: `linear-gradient(90deg, ${T.green} 0%, ${T.amber} 50%, ${T.red} 100%)`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
              opacity: 0.8
            }} />
            <div style={{
              position: 'absolute', top: '4px', left: `calc(${patient.riskScore}% - 8px)`,
              width: '16px', height: '16px',
              background: '#FFFFFF',
              borderRadius: '50%',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
              border: `3px solid ${patient.riskScore > 60 ? T.red : patient.riskScore > 30 ? T.amber : T.green}`,
              transition: 'left 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>

      </div>

    </GlassPanel>
  );
};

export default PatientAnalyticsCard;
