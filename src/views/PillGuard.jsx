import React, { useState } from 'react';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import VisionScanner from '../components/PillGuard/VisionScanner';
import PillAnalysisResult from '../components/PillGuard/PillAnalysisResult';
import AdherenceCalendar from '../components/PillGuard/AdherenceCalendar';
import PrescriptionReference from '../components/PillGuard/PrescriptionReference';
import DrugInteractionGraph from '../components/charts/DrugInteractionGraph';
import useSSEStream from '../hooks/useSSEStream';

const PillGuard = ({ patient }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [missedCellInfo, setMissedCellInfo] = useState(null);
  const missedSSE = useSSEStream();

  if (!patient) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent text-on-surface">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="text-center p-8 bg-white border border-gray-200 rounded-[24px] max-w-sm shadow-sm">
            <span className="material-symbols-outlined text-4xl text-brand-pink mb-4 animate-pulse">medication</span>
            <h3 className="text-lg font-extrabold text-brand-sidebar">PillGuard Scanner</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Select a patient from the registry or dashboard to initialize their medication verification and adherence log.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNewScanResult = (result) => {
    setAnalysisResult(result);
  };

  const handleSelectMissedCell = async (drugName) => {
    setMissedCellInfo({ drugName });
    missedSSE.setData('');
    try {
      await missedSSE.startStream('http://localhost:8000/api/pillguard/missed-dose-impact', {
        patient_id: patient.id,
        drug_name: drugName
      });
    } catch (err) {
      console.error("Failed to run missed dose forecast:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-on-surface">
      <TopHeader />
      
      <div className="flex-grow flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto pb-8 relative">
        
        {/* Left & Center Content (Bento Grid) */}
        <div className="flex-grow flex flex-col gap-6 px-8 min-w-0">
          
          {/* Header */}
          <div className="mb-2">
            <h2 className="text-3xl font-extrabold text-brand-sidebar tracking-tight">PillGuard Analysis</h2>
            <p className="text-sm text-gray-500 font-medium mt-1 max-w-3xl leading-relaxed">
              Intelligent medication verification and adherence tracking for Dr. Yuthika's current patient load. Real-time scanning ensures accurate dosage and prevents interaction risks.
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Bento Column */}
            <div className="flex flex-col gap-6">
              {/* PillGuard Scanner Card */}
              <VisionScanner patient={patient} onScanResult={handleNewScanResult} />
              
              {/* Drug Interactions Card (Blue) */}
              <div className="bg-brand-blue rounded-[24px] p-6 relative overflow-hidden h-[300px] flex flex-col shadow-sm">
                {/* Decorative Blob */}
                <svg className="absolute -right-8 -bottom-8 w-44 h-44 text-[#205072] opacity-10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
                  <path d="M45.7,-76.3C58.9,-69.3,68.8,-55.5,77.5,-41.2C86.2,-26.9,93.7,-12.1,91.8,1.9C89.9,15.9,78.6,29.1,68.2,41.4C57.8,53.7,48.3,65.1,35.6,72.4C22.9,79.7,7,82.9,-7.5,82.2C-22,81.5,-35.1,76.9,-48.3,70C-61.5,63.1,-74.8,53.9,-82.7,41.2C-90.6,28.5,-93.1,12.3,-91.2,-3.1C-89.3,-18.5,-83.1,-33,-73.4,-44.6C-63.7,-56.2,-50.5,-64.9,-37.2,-71.9C-23.9,-78.9,-10.5,-84.2,2.8,-87.4C16.1,-90.6,32.5,-83.3,45.7,-76.3Z" transform="translate(100 100)"></path>
                </svg>

                <div className="relative z-10 flex-grow flex flex-col justify-between">
                  <h3 className="font-extrabold text-lg text-[#0a314d] flex items-center gap-2">
                    <span className="material-symbols-outlined">hub</span>
                    Drug interactions
                  </h3>
                  
                  {/* Graph Area */}
                  <div className="flex-grow min-h-0 py-2">
                    <DrugInteractionGraph patient={patient} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bento Column */}
            <div className="flex flex-col gap-6">
              {/* Adherence Calendar Card (Pink) */}
              <AdherenceCalendar patient={patient} onSelectMissedCell={handleSelectMissedCell} />
              
              {/* Missed Dose Impact Card (Yellow) */}
              <div className="bg-brand-yellow rounded-[24px] p-6 relative overflow-hidden h-[250px] flex flex-col shadow-sm">
                {/* Decorative Blob */}
                <svg className="absolute -right-8 -bottom-8 w-44 h-44 text-[#715800] opacity-10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
                  <path d="M42.7,-73.4C56.6,-66.9,70.1,-57.4,78.8,-44.5C87.5,-31.6,91.4,-15.8,90.2,-0.7C89,14.4,82.7,28.8,73.4,41.2C64.1,53.6,51.8,64,37.8,71.4C23.8,78.8,8.1,83.2,-6.6,81.4C-21.3,79.6,-35,-71.6,-48.2,-62.4C-61.4,-53.2,-74.1,-42.8,-82.2,-29.3C-90.3,-15.8,-93.8,-0.8,-90.6,13.2C-87.4,27.2,-77.5,40.2,-65.4,50.4C-53.3,60.6,-39,68,-24.5,72.6C-10,77.2,4.7,79,18.1,75.4Z" transform="translate(100 100)"></path>
                </svg>

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <h3 className="font-extrabold text-lg text-[#584400] flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Missed dose impact
                  </h3>
                  
                  {/* Forecast Text Grid */}
                  <div className="bg-white/40 border border-brand-sidebar/10 rounded-xl p-4 flex flex-col justify-center min-h-[120px] mt-3 flex-grow">
                    {missedCellInfo ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-2 h-2 rounded-full bg-brand-sidebar animate-pulse" />
                          <span className="text-[10px] font-black text-brand-sidebar tracking-wider uppercase font-mono">
                            AI Pharmacology Forecast: {missedCellInfo.drugName}
                          </span>
                        </div>
                        <p className="text-xs text-brand-sidebar leading-relaxed font-bold">
                          {missedSSE.data || (missedSSE.loading ? 'Generating simulation...' : 'Select a cell to trigger projection.')}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#584400]/75 font-bold text-center">
                        Select a missed (dashed border) dose in the adherence calendar above to trigger the AI streaming pharmacological impact forecast.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prescription Reference Card */}
              <PrescriptionReference patient={patient} />
            </div>

          </div>

        </div>

        {/* Right Sidebar Panel (Calendar & Timeline) */}
        <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-6 sticky top-[140px] h-[calc(100vh-160px)] px-4">
          
          {/* Calendar Header */}
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

          {/* Timeline */}
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
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-gray-400 font-mono bg-gray-100 border border-gray-200/50 px-1.5 py-0.5 rounded">07:00</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150 shadow-sm opacity-60">
                  <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink shrink-0">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Emergency visit</h4>
                    <p className="text-[9px] text-gray-450 font-bold mt-0.5">West camp, Room 312</p>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-gray-400 font-mono bg-gray-100 border border-gray-200/50 px-1.5 py-0.5 rounded">07:30</span>
                <div className="absolute -left-[27px] top-3 w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150 shadow-sm opacity-60">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0">
                    <span className="material-symbols-outlined text-[16px]">vaccines</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Diagnostic test</h4>
                    <p className="text-[9px] text-gray-450 font-bold mt-0.5">East camp, Laboratory</p>
                  </div>
                </div>
              </div>

              {/* Event 3 (Active) */}
              <div className="relative">
                <span className="absolute -left-[45px] top-2 text-[10px] font-bold text-brand-sidebar font-mono bg-brand-pink-light px-1.5 py-0.5 rounded">08:12</span>
                <div className="absolute -left-[28px] top-3 w-3.5 h-3.5 rounded-full bg-[#715800] border-2 border-white z-10 shadow-sm"></div>
                <div className="flex gap-3 bg-brand-yellow/15 p-3 rounded-xl border border-brand-yellow/30 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-brand-sidebar shrink-0">
                    <span className="material-symbols-outlined text-[16px] fill-icon">groups</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-brand-sidebar">Team meeting</h4>
                    <p className="text-[9px] text-gray-600 font-bold mt-0.5">East camp, Room 408</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </aside>

      </div>

      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in-up">
          <div className="max-w-[700px] w-full bg-white border border-gray-200 rounded-[32px] p-6 shadow-2xl relative">
            <PillAnalysisResult result={analysisResult} onDismiss={() => setAnalysisResult(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PillGuard;
