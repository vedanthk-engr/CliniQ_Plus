import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { usePatientStore } from '../stores/patientStore';
import { useForecastStore } from '../stores/forecastStore';
import useSSEStream from '../hooks/useSSEStream';
import TopHeader from '../components/TopHeader';

const Forecast = () => {
  const { patients, currentPatient, setCurrentPatient } = usePatientStore();
  const { 
    forecastData, 
    setForecastData, 
    activeInterventions, 
    toggleIntervention, 
    resetInterventions 
  } = useForecastStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [simulatedData, setSimulatedData] = useState(null);
  const [activeTab, setActiveTab] = useState('Cardio'); // Cardio, Endo, Resp

  // SSE hooks
  const baseSSE = useSSEStream();
  const simSSE = useSSEStream();

  const svgRef = useRef(null);

  // Filter patients by search
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load baseline forecast
  const loadBaseline = async (patientId) => {
    resetInterventions();
    setSimulatedData(null);
    try {
      baseSSE.setData('');
      await baseSSE.startStream('http://localhost:8000/api/forecast/trajectory', { patient_id: patientId });
    } catch (err) {
      console.error("Failed to stream forecast:", err);
    }
  };

  // Triggered on active patient change
  useEffect(() => {
    if (currentPatient) {
      setSearchTerm(currentPatient.name);
      loadBaseline(currentPatient.id);
    }
  }, [currentPatient?.id]);

  // Parse baseline SSE content when finished or updating
  useEffect(() => {
    if (baseSSE.data && !baseSSE.loading) {
      try {
        let cleanText = baseSSE.data.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        const parsed = JSON.parse(cleanText.trim());
        setForecastData(parsed);
      } catch (e) {
        // Wait for complete stream
      }
    }
  }, [baseSSE.data, baseSSE.loading]);

  // Run simulation on intervention toggle
  const handleToggleIntervention = (interventionName) => {
    toggleIntervention(interventionName);
  };

  // Run simulation whenever activeInterventions changes
  useEffect(() => {
    if (!currentPatient) return;
    const activeList = Object.keys(activeInterventions).filter(k => activeInterventions[k]);
    if (activeList.length === 0) {
      setSimulatedData(null);
      return;
    }

    const runSimulation = async () => {
      try {
        simSSE.setData('');
        await simSSE.startStream('http://localhost:8000/api/forecast/simulate', {
          patient_id: currentPatient.id,
          interventions: activeList
        });
      } catch (err) {
        console.error("Failed to run simulation:", err);
      }
    };

    runSimulation();
  }, [activeInterventions, currentPatient?.id]);

  // Parse simulated SSE content
  useEffect(() => {
    if (simSSE.data && !simSSE.loading) {
      try {
        let cleanText = simSSE.data.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        const parsed = JSON.parse(cleanText.trim());
        setSimulatedData(parsed);
      } catch (e) {
        // Wait for complete stream
      }
    }
  }, [simSSE.data, simSSE.loading]);

  // D3 Chart Rendering (Updated to Light Theme style)
  useEffect(() => {
    if (!forecastData || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const conditions = forecastData.conditions || forecastData.trajectory || [];
    if (conditions.length === 0) return;

    const width = 640;
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 12])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.top - margin.bottom, 0]);

    // Color theme matching mockups (deep colors for lines)
    const colors = ['#39071f', '#715800', '#584400', '#6e334b'];

    // Light grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(12).tickSize(-height + margin.top + margin.bottom).tickFormat(''))
      .style('stroke', 'rgba(0, 0, 0, 0.05)')
      .style('stroke-dasharray', '3,3');

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(''))
      .style('stroke', 'rgba(0, 0, 0, 0.05)')
      .style('stroke-dasharray', '3,3');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(12).tickFormat(d => `Q${d}`))
      .style('color', '#747878')
      .style('font-family', 'DM Sans')
      .style('font-size', '10px');

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .style('color', '#747878')
      .style('font-family', 'DM Sans')
      .style('font-size', '10px');

    conditions.forEach((cond, idx) => {
      const color = colors[idx % colors.length];
      const trajectory = cond.trajectory || [];
      if (trajectory.length === 0) return;

      // 1. Confidence Band
      const areaGenerator = d3.area()
        .x(d => xScale(d.month))
        .y0(d => yScale(d.confidence_low * 100))
        .y1(d => yScale(d.confidence_high * 100))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(trajectory)
        .attr('fill', '#F8BDEB') // Pink shading
        .attr('opacity', 0.15)
        .attr('d', areaGenerator);

      // 2. Baseline Line
      const lineGenerator = d3.line()
        .x(d => xScale(d.month))
        .y(d => yScale(d.risk * 100))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(trajectory)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);

      // 3. Simulated dotted overlay
      const simConditions = simulatedData?.conditions || simulatedData?.trajectory || [];
      const matchingSim = simConditions.find(c => c.condition === cond.condition);
      if (matchingSim && matchingSim.trajectory) {
        const simTrajectory = matchingSim.trajectory;
        
        svg.append('path')
          .datum(simTrajectory)
          .attr('fill', 'none')
          .attr('stroke', '#747878')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,4')
          .attr('d', lineGenerator);
      }
    });

  }, [forecastData, simulatedData]);

  const mockInterventions = [
    { name: "Increase Telehealth by 20%", key: "Add Metformin" },
    { name: "Weekly SMS Check-ins", key: "Increase Lisinopril" },
    { name: "Dietary Plan Rx", key: "Patient Adherence Support Plan" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-on-surface">
      <TopHeader />
      
      <main className="px-8 pb-8 flex-grow flex gap-6 w-full max-w-[1500px] mx-auto relative">
        {/* Left Column (Main content) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Header & Patient Selector */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-3xl font-extrabold text-brand-sidebar tracking-tight">Predictive forecast:</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Multi-cohort projection and risk analysis based on current patient data.</p>
            </div>
            
            {/* Dropdown Selector */}
            <div className="relative w-72">
              <div 
                className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-full cursor-pointer shadow-sm hover:border-gray-300"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="text-xs font-bold text-gray-700">Patient: {searchTerm || 'Select Patient'}</span>
                <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
              </div>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[12px] shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setCurrentPatient(p);
                        setSearchTerm(p.name);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs font-bold text-gray-700 flex justify-between items-center"
                    >
                      <span>{p.name} ({p.id})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {baseSSE.loading ? (
            <div className="flex items-center justify-center p-20 bg-white border border-gray-200 rounded-card shadow-sm">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-brand-pink font-extrabold tracking-wider">STREAMING FORECAST VECTORS...</div>
              </div>
            </div>
          ) : (
            <>
              {/* 4 Colored Stat Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
                
                {/* Yellow Card */}
                <div className="bg-[#FBE46A] rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] flat-look">
                  <div className="blob-bg blob-yellow"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <h3 className="font-extrabold text-sm text-brand-sidebar">12-month peak risk:</h3>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-3xl font-black text-brand-sidebar">Cardio</span>
                      <span className="text-xs font-bold text-brand-sidebar/70 mb-1">+14%</span>
                    </div>
                  </div>
                </div>

                {/* Pink Card */}
                <div className="bg-[#F8BDEB] rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] flat-look">
                  <div className="blob-bg blob-pink"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <h3 className="font-extrabold text-sm text-brand-sidebar">Highest risk condition:</h3>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-brand-sidebar">Type II Dia.</span>
                      <div className="text-[10px] font-bold text-brand-sidebar/70 mt-1">85 patients tracked</div>
                    </div>
                  </div>
                </div>

                {/* Olive Card */}
                <div className="bg-[#A8CC78] rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] flat-look">
                  <div className="blob-bg blob-olive"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <h3 className="font-extrabold text-sm text-brand-sidebar">Top driver:</h3>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-brand-sidebar">Med. Adherence</span>
                      <div className="text-[10px] font-bold text-brand-sidebar/70 mt-1">Declined by 5% QoQ</div>
                    </div>
                  </div>
                </div>

                {/* Blue Card */}
                <div className="bg-[#A3DEFE] rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] flat-look">
                  <div className="blob-bg blob-blue"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <h3 className="font-extrabold text-sm text-brand-sidebar">Best intervention:</h3>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-brand-sidebar">Telehealth Follow-up</span>
                      <div className="text-[10px] font-bold text-brand-sidebar/70 mt-1">High efficacy rate</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Large Trajectory Chart */}
              <div className="bg-white border border-gray-200/80 rounded-card p-6 flex flex-col h-[350px] shadow-sm animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold text-lg text-brand-sidebar">Trajectory Analysis</h2>
                  <div className="flex gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200/50">
                    {['Cardio', 'Endo', 'Resp'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          activeTab === tab ? 'bg-white text-brand-sidebar shadow-sm' : 'text-gray-500 hover:text-brand-sidebar'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* SVG Chart area */}
                <div className="flex-1 w-full h-full relative overflow-hidden flex justify-center">
                  <svg ref={svgRef}></svg>
                </div>
              </div>

              {/* Bottom Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                
                {/* Intervention Simulator */}
                <div className="bg-white border border-gray-200/80 rounded-[24px] p-6 shadow-sm">
                  <h3 className="font-extrabold text-lg text-brand-sidebar mb-4">Intervention simulator:</h3>
                  <div className="flex flex-col gap-3">
                    {mockInterventions.map((item, idx) => {
                      const isChecked = activeInterventions[item.key] || false;
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleToggleIntervention(item.key)}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-brand-sidebar">{item.name}</span>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isChecked ? 'bg-[#A8CC78]' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Milestones */}
                <div className="bg-white border border-gray-200/80 rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col">
                  <h3 className="font-extrabold text-lg text-brand-sidebar mb-4">Clinical milestones:</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar flex-1 items-center">
                    {(forecastData?.milestones || [
                      { month: 3, probability: 0.68, condition: 'HbA1c reduction', event: 'Goal of reducing HbA1c below 7.0%' },
                      { month: 6, probability: 0.85, condition: 'Renal check', event: 'Comprehensive metabolic panel requested' }
                    ]).map((milestone, idx) => (
                      <div key={idx} className="min-w-[200px] border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shrink-0 bg-gray-55 hover:bg-gray-50/50 transition-colors h-[120px] justify-between">
                        <span className="text-[10px] font-extrabold text-[#39071f] bg-brand-pink-light px-2.5 py-1 rounded w-fit uppercase font-mono">
                          M{milestone.month} target
                        </span>
                        <p className="font-bold text-xs text-brand-sidebar leading-normal truncate">{milestone.condition}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{milestone.event}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Right Side Panel (Calendar/Events) */}
        <aside className="w-80 shrink-0 flex flex-col gap-6 sticky top-[140px] h-[calc(100vh-160px)]">
          {/* Calendar Widget */}
          <div className="bg-white border border-gray-200/85 rounded-[24px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="material-symbols-outlined cursor-pointer hover:text-gray-500">arrow_back</span>
              <span className="bg-brand-pink-light text-brand-sidebar px-4 py-1 rounded-full font-bold text-xs">May 2024</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-gray-500">arrow_forward</span>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase">
              <div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div><div>SU</div>
            </div>
            <div className="grid grid-cols-7 gap-y-3.5 text-center text-xs font-bold text-gray-750">
              <div className="text-gray-200">29</div><div className="text-gray-200">30</div>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
              <span>13</span><span>14</span>
              <span className="bg-brand-pink text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto font-black shadow-sm shadow-brand-pink/50">15</span>
              <span>16</span><span>17</span><span>18</span><span>19</span>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-full font-bold text-xs hover:bg-gray-800 transition-colors mt-6 flat-look">
              Add event
            </button>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white border border-gray-200/85 rounded-[24px] p-6 flex-1 flex flex-col shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="font-extrabold text-lg text-brand-sidebar leading-none">May 15</h2>
                <span className="text-[10px] font-bold text-gray-400">Today's timeline</span>
              </div>
              <button className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flat-look">
                All <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
            
            <div className="relative flex-1 flex flex-col gap-6 pl-10 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gray-200 overflow-y-auto pr-1 custom-scrollbar">
              
              {/* Event 1 */}
              <div className="relative opacity-50 hover:opacity-80 transition-opacity">
                <span className="absolute -left-[42px] top-1 text-[10px] font-bold text-gray-400 font-mono">07:00</span>
                <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-gray-300 border border-white"></div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink shrink-0">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-brand-sidebar">Emergency visit</h4>
                    <p className="text-[9px] text-gray-500 font-medium">West camp, Room 312</p>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-brand-sidebar font-mono bg-brand-pink-light px-1 rounded">08:12</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-[#39071f] border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-brand-yellow/15 p-3 rounded-xl border border-brand-yellow/30 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-sidebar shrink-0">
                    <span className="material-symbols-outlined text-[16px] fill-icon">groups</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Team meeting</h4>
                    <p className="text-[9px] text-gray-650 font-bold">East camp, Room 408</p>
                    <div className="flex -space-x-1.5 mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#A8D4F5] text-[8px] font-bold flex items-center justify-center border border-white text-brand-sidebar">TY</div>
                      <div className="w-5 h-5 rounded-full bg-[#B5C43A] text-[8px] font-bold flex items-center justify-center border border-white text-brand-sidebar">AB</div>
                      <div className="w-5 h-5 rounded-full bg-black text-[8px] font-bold flex items-center justify-center border border-white text-white">NR</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Forecast;
