import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../tokens';
import TopHeader from '../components/TopHeader';
import BodyMapContext from '../components/PatientIntel/BodyMapContext';
import LabTrendChart from '../components/PatientIntel/LabTrendChart';
import MedicationsPanel from '../components/PatientIntel/MedicationsPanel';
import SecondOpinionPanel from '../components/PatientIntel/SecondOpinionPanel';
import NaturalLanguageQuery from '../components/PatientIntel/NaturalLanguageQuery';
import ClinicalPatternFeed from '../components/PatientIntel/ClinicalPatternFeed';
import TrajectoryPreview from '../components/PatientIntel/TrajectoryPreview';

const PatientIntel = ({ patients = [], patient, setCurrentPatient, setCurrentView, startInRegistry, onDeletePatient }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(!patient || startInRegistry ? 'list' : 'detail');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // If list view, show flat-designed registry list
  if (viewMode === 'list' || !patient) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent">
        <TopHeader />
        <div className="fadeIn px-8 pb-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-brand-sidebar tracking-tight">
              Patient Intelligence Registry
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Select a patient file to initialize their comprehensive somatic and biometric insight dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(p => {
              const isCritical = p.riskScore >= 70;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentPatient(p);
                    setViewMode('detail');
                    setCurrentView('patient');
                  }}
                  className="bg-white border border-gray-200 rounded-card p-6 cursor-pointer hover:border-brand-yellow hover:shadow-md transition-all flex flex-col justify-between h-56"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                        {p.id} • {p.ward.toUpperCase()}
                      </div>
                      <h4 className="text-xl font-extrabold text-brand-sidebar mt-2">
                        {p.name} <span className="text-sm text-gray-500 font-medium">({p.age}Y)</span>
                      </h4>
                      <div className="text-xs text-brand-pink font-bold mt-1">
                        Physician: {p.doctor}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete patient ${p.name}?`)) {
                          onDeletePatient && onDeletePatient(p.id);
                        }
                      }}
                      className="w-8 h-8 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-red-100"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                  </div>

                  <div className="flex gap-6 mt-6 border-t border-gray-100 pt-4">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Risk Score</span>
                      <span className={`text-2xl font-black ${isCritical ? 'text-red-500' : 'text-green-500'}`}>
                        {p.riskScore}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Diagnosis</span>
                      <span className="text-xs text-brand-sidebar font-bold truncate block mt-1">
                        {p.diagnosis && p.diagnosis.length > 0 ? p.diagnosis[0] : 'Review Needed'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const riskColor = patient.riskScore >= 70 ? 'text-red-500 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100';

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopHeader />

      <div className="fadeIn px-8 pb-8 flex-1 flex flex-col">
        
        {/* Back navigation & Page Title Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setViewMode('list');
                setCurrentView('patient-registry');
              }}
              className="bg-white border border-gray-200 w-10 h-10 rounded-full flex items-center justify-center text-brand-sidebar hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <h2 className="text-2xl font-extrabold text-brand-sidebar tracking-tight leading-none">
              {patient.name}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColor} shadow-sm`}>
              Precision Risk: {patient.riskScore}%
            </span>
          </div>

          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Area: 8 Columns */}
          <div className="xl:col-span-9 flex flex-col gap-6">
            
            {/* AI Pre-consultation (Yellow Card) */}
            <div className="bg-brand-yellow rounded-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] flat-look animate-fade-in-up">
              <div className="blob-bg blob-yellow"></div>
              <div className="card-content flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-xl text-brand-sidebar flex items-center gap-2">
                    <span className="material-symbols-outlined fill-icon text-lg">auto_awesome</span>
                    AI Pre-consultation
                  </h3>
                  <span className="text-[10px] font-bold text-brand-sidebar/70 uppercase">Generated 2h ago</span>
                </div>
                <p className="text-sm font-semibold text-brand-sidebar/90 leading-relaxed max-w-4xl">
                  {patient.consultBrief ? (
                    `Patient reports increased fatigue and symptoms: ${patient.consultBrief}. Historical data suggests correlation with recent medication adherence gap. Recommend immediate review of current regimen and localized diagnostics to rule out fluid retention.`
                  ) : (
                    'Patient records show normal parameters. Clinical metrics remain within acceptable bounds. Recommend standard routine check-ups.'
                  )}
                </p>
              </div>
            </div>

            {/* Bottom 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
              
              {/* Column 1: Somatic Map (Blue Card) */}
              <div className="bg-brand-blue rounded-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] flat-look">
                <div className="card-content flex-1 flex flex-col">
                  <h3 className="font-extrabold text-lg text-brand-sidebar mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-md">accessibility_new</span>
                    Somatic Map
                  </h3>
                  <div className="flex-1 bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
                    <BodyMapContext patient={patient} />
                  </div>
                </div>
              </div>

              {/* Column 2: Biometrics (Pink Card) */}
              <div className="bg-brand-pink rounded-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] flat-look">
                <div className="card-content flex-1 flex flex-col">
                  <h3 className="font-extrabold text-lg text-brand-sidebar mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-md">monitoring</span>
                    Biometrics
                  </h3>
                  <div className="flex-1 bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
                    <LabTrendChart patient={patient} />
                  </div>
                </div>
              </div>

              {/* Column 3: Current Regimen (Green Card) */}
              <div className="bg-brand-green rounded-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] flat-look">
                <div className="card-content flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-lg text-brand-sidebar flex items-center gap-2">
                      <span className="material-symbols-outlined text-md">medication</span>
                      Current Regimen
                    </h3>
                    <button className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-brand-sidebar hover:bg-white/60 transition-colors">
                      <span className="material-symbols-outlined text-md">add</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
                    <MedicationsPanel patient={patient} />
                  </div>
                </div>
              </div>

            </div>

            {/* Advanced Clinical Tools Accordion */}
            <div className="bg-white border border-gray-200 rounded-card overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 border-b border-gray-100 hover:bg-gray-100/50 transition-colors cursor-pointer font-bold text-brand-sidebar"
              >
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider">
                  <span className="material-symbols-outlined">settings_suggest</span>
                  Advanced Clinical Co-Pilot Tools
                </span>
                <span className="material-symbols-outlined text-lg">
                  {showAdvanced ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              
              {showAdvanced && (
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white animate-fade-in-up">
                  <div className="flex flex-col gap-6">
                    <NaturalLanguageQuery patient={patient} />
                    <ClinicalPatternFeed patient={patient} />
                  </div>
                  <div className="flex flex-col gap-6">
                    <SecondOpinionPanel patient={patient} />
                    <TrajectoryPreview patient={patient} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: 3 Columns */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            {/* Calendar Card */}
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="material-symbols-outlined cursor-pointer hover:text-gray-500 transition-colors">chevron_left</span>
                <div className="bg-brand-pink-light px-4 py-1.5 rounded-full font-bold text-sm text-gray-800">May 2024</div>
                <span className="material-symbols-outlined cursor-pointer hover:text-gray-500 transition-colors">chevron_right</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-4 uppercase">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-y-3 text-center text-xs font-bold text-gray-700">
                <span className="text-gray-200">29</span><span className="text-gray-200">30</span>
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                <span>13</span><span>14</span>
                <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto font-black cursor-pointer shadow-sm">15</span>
                <span>16</span><span>17</span><span>18</span><span>19</span>
              </div>
            </div>

            {/* Timeline Notes Feed */}
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-extrabold text-lg text-brand-sidebar">Timeline</h4>
                <button className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors border border-gray-200">
                  Add note
                </button>
              </div>

              <div className="relative pl-5 border-l border-gray-200 space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {/* Note 1 */}
                <div className="relative group cursor-pointer">
                  <span className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-white shadow-sm"></span>
                  <div className="text-[10px] font-bold text-gray-400 mb-1">Today, 09:15 AM</div>
                  <div className="bg-gray-50 hover:bg-gray-100/50 p-3 rounded-xl text-xs font-bold text-gray-700 border border-gray-100">
                    Routine Check-up. BP stable. Discussed diet adjustments.
                  </div>
                </div>
                {/* Note 2 */}
                <div className="relative group cursor-pointer">
                  <span className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-yellow border-2 border-white shadow-sm"></span>
                  <div className="text-[10px] font-bold text-gray-400 mb-1">May 10, 2024</div>
                  <div className="bg-gray-50 hover:bg-gray-100/50 p-3 rounded-xl text-xs font-bold text-gray-700 border border-gray-100">
                    Lab results uploaded. Mild elevation in liver enzymes.
                  </div>
                </div>
              </div>

              {/* Schedule Follow-up CTA Button */}
              <button className="w-full bg-black text-white py-3.5 rounded-xl font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs tracking-wider uppercase mt-6 flat-look cursor-pointer">
                Schedule Follow-up
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientIntel;
