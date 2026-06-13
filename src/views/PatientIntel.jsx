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
        <div className="fadeIn px-8 pb-8 max-w-[1400px] mx-auto w-full">
          {/* Page Header */}
          <div className="mb-10 animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-3">
              <h2 className="font-sans text-[36px] text-brand-sidebar font-extrabold tracking-tight">
                Patient Intelligence Registry
              </h2>
              <div className="flex items-center space-x-2 bg-[#E8EDC8] text-[#5A631D] px-4 py-1.5 rounded-full border border-[#CFD96C]/30 shadow-sm">
                <span className="w-2 h-2 bg-brand-green rounded-full"></span>
                <span className="text-[11px] uppercase tracking-wider font-extrabold">System Status: Optimal</span>
              </div>
            </div>
            <p className="text-lg text-gray-500 max-w-3xl">
              Select a patient file to initialize their comprehensive somatic and biometric insight dashboard.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {patients.map((p, idx) => {
              const cardThemes = [
                {
                  bg: 'bg-[#FFECA1] border-[#F8D664]',
                  textDoctor: 'text-[#8C6D14]',
                  blobColor: 'bg-brand-yellow',
                },
                {
                  bg: 'bg-[#EAF0AD] border-[#CFD96C]',
                  textDoctor: 'text-[#566118]',
                  blobColor: 'bg-brand-green',
                },
                {
                  bg: 'bg-[#FFCFE1] border-[#F8A1C4]',
                  textDoctor: 'text-[#912D55]',
                  blobColor: 'bg-brand-pink',
                },
                {
                  bg: 'bg-[#D1E8FA] border-[#A3D1F5]',
                  textDoctor: 'text-[#31648C]',
                  blobColor: 'bg-brand-blue',
                },
              ];
              const theme = cardThemes[idx % cardThemes.length];
              const isCritical = p.riskScore >= 70;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentPatient(p);
                    setViewMode('detail');
                    setCurrentView('patient');
                  }}
                  className={`${theme.bg} rounded-[24px] p-8 relative overflow-hidden cursor-pointer transition-all duration-350 hover:-translate-y-1 hover:shadow-md border flex flex-col justify-between h-64`}
                >
                  <div className={`absolute bottom-[-10%] right-[-10%] w-[180px] h-[180px] rounded-full blur-2xl opacity-20 pointer-events-none ${theme.blobColor}`} />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1.5 font-extrabold font-mono">
                          {p.id} • {p.ward ? p.ward.toUpperCase() : 'GENERAL'}
                        </p>
                        <h3 className="text-[26px] font-extrabold text-black tracking-tight leading-snug">
                          {p.name} <span className="text-lg text-gray-600 font-normal">({p.age}Y)</span>
                        </h3>
                        <p className={`text-xs font-bold mt-1 ${theme.textDoctor}`}>
                          Physician: {p.doctor}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete patient ${p.name}?`)) {
                            onDeletePatient && onDeletePatient(p.id);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer z-20 border border-gray-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/80 rounded-[16px] p-4 backdrop-blur-md border border-white/40 shadow-sm">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5 font-extrabold">Risk Score</p>
                        <p className={`text-[32px] font-black leading-none ${isCritical ? 'text-[#D93025]' : 'text-[#1E8E3E]'}`}>
                          {p.riskScore}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5 font-extrabold">Diagnosis</p>
                        <p className="text-xs font-bold text-black leading-snug mt-1 line-clamp-2">
                          {p.diagnosis && p.diagnosis.length > 0 ? p.diagnosis[0] : 'Review Needed'}
                        </p>
                      </div>
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
        <div className="flex justify-between items-center mb-2">
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
            <h2 className="text-[28px] font-extrabold text-brand-sidebar tracking-tight leading-none">
              {patient.name}
            </h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${riskColor} shadow-sm tracking-wide`}>
              Precision Risk: {patient.riskScore}
            </span>
          </div>

          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
        </div>

        {/* Demographics Bar */}
        <div className="flex items-center gap-3 mb-6 ml-14">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">cake</span>
            <span>{patient.age} Years</span>
          </div>
          <span className="text-gray-300 text-sm">•</span>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">badge</span>
            <span>ID: {patient.id}</span>
          </div>
          <span className="text-gray-300 text-sm">•</span>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
            <span>{patient.sex || 'Male'}</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Area: 9 Columns */}
          <div className="xl:col-span-9 flex flex-col gap-6">
            
            {/* AI Pre-consultation (Yellow Card) */}
            <div className="bg-brand-yellow rounded-card p-6 relative overflow-hidden flat-look animate-fade-in-up">
              <div className="blob-bg blob-yellow"></div>
              <div className="card-content">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-extrabold text-lg text-brand-sidebar flex items-center gap-2">
                    <span className="material-symbols-outlined fill-icon text-lg">auto_awesome</span>
                    AI Pre-consultation
                  </h3>
                  <span className="text-[10px] font-extrabold text-brand-sidebar/60 bg-brand-sidebar/5 px-3 py-1 rounded-full uppercase tracking-wider">Generated 2h ago</span>
                </div>
                <p className="text-sm font-semibold text-brand-sidebar/85 leading-relaxed">
                  {patient.consultBrief ? (
                    `Patient reports increased fatigue and symptoms: ${patient.consultBrief}. Historical data suggests correlation with recent medication adherence gap. Recommend immediate review of current Apixaban dosage and a localized echocardiogram to rule out fluid retention.`
                  ) : (
                    'Patient records show normal parameters. Clinical metrics remain within acceptable bounds. Recommend standard routine check-ups.'
                  )}
                </p>
              </div>
            </div>

            {/* 3-Column Grid: Somatic Map + Biometrics + Current Regimen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
              
              {/* Column 1: Somatic Map (Blue Card) */}
              <div className="bg-brand-blue rounded-card p-6 relative overflow-hidden flex flex-col min-h-[380px] flat-look">
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
              <div className="bg-brand-pink rounded-card p-6 relative overflow-hidden flex flex-col min-h-[380px] flat-look">
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
              <div className="bg-brand-green rounded-card p-6 relative overflow-hidden flex flex-col min-h-[380px] flat-look">
                <div className="card-content flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-lg text-brand-sidebar flex items-center gap-2">
                      <span className="material-symbols-outlined text-md">medication</span>
                      Current Regimen
                    </h3>
                    <button className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-brand-sidebar hover:bg-white/60 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-md">add</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
                    <MedicationsPanel patient={patient} />
                  </div>
                </div>
              </div>

            </div>

            {/* Risk Assessment + Dr. Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              
              {/* Risk Assessment Card (Pink) */}
              <div className="bg-brand-pink rounded-card p-6 relative overflow-hidden flat-look">
                <div className="card-content">
                  <h3 className="font-extrabold text-lg text-brand-sidebar mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-md">shield</span>
                    Risk Assessment
                  </h3>
                  <div className="flex items-center justify-around">
                    {/* Stroke Risk */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-[100px] h-[100px]">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#D93025" strokeWidth="7"
                            strokeDasharray={`${(patient.riskScore >= 70 ? 65 : 35) * 2.64} 264`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[26px] font-black text-brand-sidebar">{patient.riskScore >= 70 ? '65' : '35'}%</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-brand-sidebar/70 uppercase tracking-wider">Stroke Risk</span>
                    </div>
                    {/* Renal Failure */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-[100px] h-[100px]">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#D93025" strokeWidth="7"
                            strokeDasharray={`${(patient.riskScore >= 70 ? 32 : 12) * 2.64} 264`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[26px] font-black text-brand-sidebar">{patient.riskScore >= 70 ? '32' : '12'}%</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-brand-sidebar/70 uppercase tracking-wider">Renal Failure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dr. Insights Card (White) */}
              <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-lg text-brand-sidebar">stethoscope</span>
                  <h3 className="font-extrabold text-lg text-brand-sidebar">Dr. Insights</h3>
                </div>
                <div className="space-y-4">
                  {patient.riskScore >= 70 ? (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D93025] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Schedule echocardiogram to evaluate recent shortness of breath.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D93025] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Discuss strategies for improving {patient.medications?.[0]?.name || 'Metoprolol'} adherence.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D93025] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Monitor HbA1c closely.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Continue current treatment plan. Patient responding well.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Schedule routine follow-up in 3 months.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] mt-1.5 shrink-0"></span>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                          Monitor inflammatory markers at next visit.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Clinical Tools Accordion */}
            <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50/50 transition-colors cursor-pointer font-extrabold text-black"
              >
                <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xl text-black">engineering</span>
                  Advanced Clinical Co-Pilot Tools
                </span>
                <span className="material-symbols-outlined text-lg">
                  {showAdvanced ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              
              {showAdvanced && (
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border-t border-gray-100 animate-fade-in-up">
                  <div className="flex flex-col gap-8">
                    <NaturalLanguageQuery patient={patient} />
                    <ClinicalPatternFeed patient={patient} />
                  </div>
                  <div className="flex flex-col gap-8">
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
                <button className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 transition-colors border border-gray-200 cursor-pointer">
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
