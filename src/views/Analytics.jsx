import React, { useState, useMemo } from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import PatientAnalyticsCard from '../components/Analytics/PatientAnalyticsCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

// Heatmap mock matrix data
const HEATMAP_ROWS = ["Type 2 Diabetes", "Hypertension", "CKD Stage 3", "Rheumatoid Arthritis", "CHF"];
const HEATMAP_COLS = ["HbA1c", "Creatinine", "BP_Systolic", "ESR", "Potassium", "BNP"];

const HEATMAP_DATA = {
  "Type 2 Diabetes-HbA1c": { val: 0.95, text: "Glycemic load control metric. Direct correlation." },
  "Type 2 Diabetes-Creatinine": { val: 0.48, text: "Microvascular damage leading to glomerular filtration decay." },
  "Type 2 Diabetes-BP_Systolic": { val: 0.35, text: "Synergistic arterial stiffness link." },
  "Hypertension-BP_Systolic": { val: 0.92, text: "Direct systemic arterial pressure correlate." },
  "Hypertension-Creatinine": { val: 0.52, text: "Renovascular nephrosclerosis risk multiplier." },
  "CKD Stage 3-Creatinine": { val: 0.88, text: "Direct renal clearance filtration capacity indicator." },
  "CKD Stage 3-Potassium": { val: 0.65, text: "Reduced distal tubule potassium excretion capability." },
  "Rheumatoid Arthritis-ESR": { val: 0.85, text: "Systemic acute-phase reactant index. High correlation." },
  "CHF-BNP": { val: 0.94, text: "Myocardial stretch biomarker. Highly specific for volume overload." },
  "CHF-BP_Systolic": { val: 0.58, text: "Afterload mismatch indicator." },
  "CHF-Potassium": { val: 0.40, text: "Diuretic-induced hypokalemia risk factor." },
};

const getHeatmapCell = (row, col) => {
  const key = `${row}-${col}`;
  return HEATMAP_DATA[key] || { val: 0.12, text: "Baseline physiological noise / negligible correlation." };
};

// 24 Months anomaly timeline
const ANOMALY_TIMELINE = [
  { month: "Jul 24", score: 20, desc: "Normal baseline" },
  { month: "Sep 24", score: 25, desc: "Normal baseline" },
  { month: "Nov 24", score: 30, desc: "Normal baseline" },
  { month: "Jan 25", score: 78, desc: "BP spike (148 mmHg) & Creatinine increase (1.4 mg/dL). Initiated ACE inhibitor titration." },
  { month: "Mar 25", score: 35, desc: "Recovery curve" },
  { month: "May 25", score: 40, desc: "Normal baseline" },
  { month: "Jul 25", score: 85, desc: "HbA1c surge (9.2%). Identified medication non-adherence event." },
  { month: "Sep 25", score: 42, desc: "Recovery curve" },
  { month: "Nov 25", score: 35, desc: "Normal baseline" },
  { month: "Jan 26", score: 38, desc: "Normal baseline" },
  { month: "Mar 26", score: 92, desc: "BNP elevation (950 pg/mL) & Creatinine escalation (2.8 mg/dL). High risk of fluid overload." },
  { month: "May 26", score: 50, desc: "Partial stabilization after diuretics adjustment" }
];

const Analytics = ({ patients = [] }) => {
  const [cohortMode, setCohortMode] = useState(false); // false = Personal Baseline, true = Age/Gender/BMI Cohort
  const [activeCell, setActiveCell] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Benchmarking percentiles
  const cohortData = useMemo(() => {
    return {
      HbA1c: { median: 5.8, p90: 7.2 },
      Creatinine: { median: 1.0, p90: 1.4 },
      BP_Systolic: { median: 125, p90: 138 },
      ESR: { median: 12, p90: 22 },
      Hemoglobin: { median: 13.8, p90: 15.5 },
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-on-surface">
      <TopHeader />

      <div className="flex-grow flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto pb-8 relative">
        
        {/* Left Column (Main content) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Page Header & Benchmarking Toggle */}
          <div className="flex justify-between items-center flex-wrap gap-4 px-8 mb-2">
            <div>
              <h1 className="text-3xl font-extrabold text-brand-sidebar tracking-tight">Clinical analytics:</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Detailed biometric tracking and correlative analysis across your active patient cohort.</p>
            </div>

            {/* Benchmarking Toggle */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${!cohortMode ? 'text-brand-pink' : 'text-gray-400'}`}>
                Personal Baseline
              </span>
              <div 
                onClick={() => setCohortMode(!cohortMode)}
                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${cohortMode ? 'bg-brand-pink' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cohortMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${cohortMode ? 'text-brand-pink' : 'text-gray-400'}`}>
                Cohort Benchmarks
              </span>
            </div>
          </div>

          {/* Cohort active info banner */}
          {cohortMode && (
            <div className="mx-8 p-4 bg-brand-pink/10 border border-brand-pink/35 rounded-xl text-xs font-bold text-[#39071f] leading-normal animate-fade-in-up">
              Cohort Mode Active: Reference values show the 50th percentile (Median) and 90th percentile benchmarking lines based on matching Age, Gender, and BMI patient groups.
            </div>
          )}

          {/* Dynamic Patient Cards */}
          <div className="flex flex-col gap-6 px-8">
            {patients.map((p, idx) => (
              <div key={p.id} className="flex flex-col">
                <PatientAnalyticsCard patient={p} index={idx} />
                
                {/* Cohort Stats Display under each card when active */}
                {cohortMode && (
                  <div className="mt-3 bg-white border border-gray-200/80 rounded-[20px] p-4 flex flex-col gap-3 shadow-sm animate-fade-in-up">
                    <span className="text-[10px] font-black text-brand-pink tracking-wider uppercase font-mono">
                      Cohort Percentile Benchmarks
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.keys(p.labs).map(lab => {
                        const ref = cohortData[lab];
                        if (!ref) return null;
                        const readings = p.labs[lab];
                        const latest = readings[readings.length - 1].val;
                        const isHigh = latest > ref.p90;
                        const pctStr = isHigh ? '>90th (High)' : latest > ref.median ? '50th-90th' : '<50th (Low)';
                        return (
                          <div key={lab} className="bg-brand-bg border border-gray-200 rounded-xl p-3 flex flex-col justify-between h-[80px]">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">{lab}</span>
                            <div className="flex justify-between items-baseline mt-1">
                              <span className={`text-base font-black ${isHigh ? 'text-red-650 font-black' : 'text-brand-sidebar'}`}>{latest}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${isHigh ? 'text-red-500' : 'text-gray-400'}`}>{pctStr}</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 block">Ref: Median {ref.median} | P90 {ref.p90}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Heatmap & Anomaly score timeline side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 mt-2">
            
            {/* 1. Biometric Interaction Heatmap (Olive Card) */}
            <div className="bg-brand-green rounded-[32px] p-6 relative overflow-hidden flex flex-col h-[400px] shadow-sm">
              {/* Decorative DOTS Pattern Background */}
              <div className="absolute inset-0 text-brand-sidebar/5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
              
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-extrabold text-lg text-brand-sidebar">Biomarker correlations:</h3>
                  <p className="text-[10px] text-brand-sidebar/70 font-bold mt-0.5">Correlation coefficient mapping conditions to biological markers. Hover for interpretation.</p>
                </div>

                {/* Heatmap Grid */}
                <div className="flex-1 flex flex-col gap-1.5 justify-center py-2">
                  {/* Header row */}
                  <div className="flex items-center">
                    <div className="w-[100px] text-[8px] font-black text-brand-sidebar/65 uppercase tracking-wider font-mono">Diagnosis</div>
                    <div className="flex-1 flex gap-1.5">
                      {HEATMAP_COLS.map(col => (
                        <div key={col} className="flex-1 text-center text-[8px] font-black text-brand-sidebar/65 uppercase tracking-wider font-mono">{col}</div>
                      ))}
                    </div>
                  </div>

                  {/* Rows */}
                  {HEATMAP_ROWS.map(row => (
                    <div key={row} className="flex items-center">
                      <div className="w-[100px] text-xs font-black text-brand-sidebar truncate pr-2">{row}</div>
                      <div className="flex-1 flex gap-1.5">
                        {HEATMAP_COLS.map(col => {
                          const cell = getHeatmapCell(row, col);
                          const opacity = cell.val;
                          // Map strength (0 to 1) to opacity of purple/black
                          const cellBg = `rgba(27, 28, 26, ${opacity})`;
                          
                          return (
                            <div
                              key={col}
                              onMouseEnter={() => setActiveCell({ row, col, val: cell.val, text: cell.text })}
                              onMouseLeave={() => setActiveCell(null)}
                              className="flex-1 h-7 rounded flex items-center justify-center cursor-pointer text-[9px] font-black transition-all hover:scale-105"
                              style={{
                                background: cellBg,
                                color: opacity > 0.55 ? '#FFFFFF' : '#1B1C1A',
                                border: '1px solid rgba(27, 28, 26, 0.1)'
                              }}
                            >
                              {cell.val.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tooltip feedback box */}
                <div className="mt-3 bg-white/40 rounded-xl p-3 border border-brand-sidebar/10 min-h-[56px] flex flex-col justify-center">
                  {activeCell ? (
                    <div>
                      <div className="text-[10px] font-black text-brand-sidebar uppercase tracking-wider font-mono">
                        {activeCell.row} × {activeCell.col} (Coef: {activeCell.val.toFixed(2)})
                      </div>
                      <div className="text-[11px] text-brand-sidebar/85 font-medium mt-0.5 leading-tight">
                        {activeCell.text}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-brand-sidebar/60 font-bold text-center">
                      Hover over matrix cells to query clinical feedback and coefficient interpretations.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Anomaly Score Timeline (Pink Card) */}
            <div className="bg-brand-pink rounded-[32px] p-6 relative overflow-hidden flex flex-col h-[400px] shadow-sm">
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-extrabold text-lg text-[#39071f]">Anomaly history:</h3>
                  <p className="text-[10px] text-[#b56f89] font-bold mt-0.5">Longitudinal deviation score over 24 months. Click highlighted red spike points for details.</p>
                </div>

                {/* Anomaly Timeline Line Chart */}
                <div className="w-full h-44 relative mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANOMALY_TIMELINE} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#b56f89" fontSize={9} tickLine={false} />
                      <YAxis stroke="#b56f89" fontSize={9} domain={[0, 100]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#FAF9F5', border: '1px solid #C4C7C7', borderRadius: '12px' }}
                        labelStyle={{ color: '#1B1C1A', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: '10px', color: '#444748' }}
                      />
                      <ReferenceLine y={70} stroke="rgba(186, 26, 26, 0.4)" strokeDasharray="3 3" />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#39071f" 
                        strokeWidth={2}
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          const isSpike = payload.score > 70;
                          if (isSpike) {
                            return (
                              <circle
                                key={payload.month}
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill="#ba1a1a"
                                stroke="#ffffff"
                                strokeWidth={1.5}
                                style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 4px rgba(186, 26, 26, 0.5))' }}
                                onClick={() => setSelectedAnomaly(payload)}
                              />
                            );
                          }
                          return (
                            <circle
                              key={payload.month}
                              cx={cx}
                              cy={cy}
                              r={3}
                              fill="#39071f"
                              stroke="none"
                            />
                          );
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Anomaly diagnostics drawer */}
                <div className="mt-3 min-h-[70px] flex flex-col justify-center">
                  {selectedAnomaly ? (
                    <div className="bg-[#ba1a1a]/15 border border-[#ba1a1a]/30 rounded-xl p-3 flex flex-col relative animate-fade-in-up">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-red-750 font-mono tracking-wider uppercase">
                          Anomalous Deviation ({selectedAnomaly.score}%)
                        </span>
                        <button 
                          onClick={() => setSelectedAnomaly(null)}
                          className="text-[#39071f] hover:opacity-75 text-[11px] font-black cursor-pointer"
                        >
                          Close ✕
                        </button>
                      </div>
                      <div className="text-[11px] font-black text-[#39071f] mt-1">
                        Date: {selectedAnomaly.month}
                      </div>
                      <p className="text-[10px] text-[#39071f]/85 mt-0.5 leading-normal font-medium">
                        {selectedAnomaly.desc}
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#39071f]/20 rounded-xl p-3 flex items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-[#b56f89]">Click on a red spike point above to read the anomaly diagnostics brief.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Panel: Calendar & Timeline */}
        <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-6 sticky top-[140px] h-[calc(100vh-160px)] px-4">
          
          {/* User Greeting */}
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

          {/* Today's Timeline */}
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
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-gray-400 font-mono bg-gray-100 border border-gray-200/50 px-1.5 py-0.5 rounded">08:00</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150 shadow-sm opacity-60">
                  <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink shrink-0">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Diagnostic Test</h4>
                    <p className="text-[9px] text-gray-450 font-bold mt-0.5">Lab floor 5 • Eleanor R.</p>
                  </div>
                </div>
              </div>

              {/* Event 2 (Active) */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-brand-sidebar font-mono bg-brand-pink-light px-1.5 py-0.5 rounded">08:30</span>
                <div className="absolute -left-[28px] top-3 w-3.5 h-3.5 rounded-full bg-[#715800] border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-brand-yellow/15 p-3 rounded-xl border border-brand-yellow/30 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-sidebar shrink-0">
                    <span className="material-symbols-outlined text-[16px] fill-icon">groups</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Team sync</h4>
                    <p className="text-[9px] text-gray-600 font-bold mt-0.5">East wing • 4 Participants</p>
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

export default Analytics;
