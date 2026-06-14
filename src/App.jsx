import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Overview from './views/Overview';
import PatientIntel from './views/PatientIntel';
import PillGuard from './views/PillGuard';
import Analytics from './views/Analytics';
import AlertCentre from './views/AlertCentre';
import Intake from './views/Intake';
import Forecast from './pages/Forecast';
import ComorbidityWeb from './pages/ComorbidityWeb';
import { usePatientStore } from './stores/patientStore';
import { T } from './tokens';
import ShaderBackground from './components/ShaderBackground';

function AppContent() {
  const navigate = useNavigate();
  const { 
    patients, 
    currentPatient, 
    loading, 
    isOffline, 
    loadPatients, 
    setCurrentPatient,
    refreshPatients 
  } = usePatientStore();

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const setCurrentView = (view) => {
    switch (view) {
      case 'overview': navigate('/'); break;
      case 'intake': navigate('/intake'); break;
      case 'patient-registry': navigate('/registry'); break;
      case 'patient': 
        if (currentPatient) {
          navigate(`/patient/${currentPatient.id}`);
        } else {
          navigate('/registry');
        }
        break;
      case 'pillguard': navigate('/pillguard'); break;
      case 'analytics': navigate('/analytics'); break;
      case 'alerts': navigate('/alerts'); break;
      case 'forecast': navigate('/forecast'); break;
      case 'comorbidity': navigate('/comorbidity'); break;
      default: navigate('/');
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await fetch(`https://cliniq-copilot-dev.loca.lt/api/patient/${id}`, { method: 'DELETE' });
      await refreshPatients();
      navigate('/registry');
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bgPrimary text-textSecondary font-sans">
        <div className="text-2xl font-bold mb-4 animate-pulse text-accentPrimary">ClinIQ+</div>
        <div>Initializing Clinical Data Cache...</div>
      </div>
    );
  }

  const handleVoiceAction = (actionObj) => {
    console.log("Global Voice Action Intercepted:", actionObj);
    
    if (actionObj.action === 'navigate_page') {
      const page = actionObj.target.toLowerCase();
      if (page.includes('dashboard') || page.includes('overview') || page.includes('home')) {
        setCurrentView('overview');
      } else if (page.includes('forecast')) {
        setCurrentView('forecast');
      } else if (page.includes('comorbidity') || page.includes('network')) {
        setCurrentView('comorbidity');
      } else if (page.includes('alert')) {
        setCurrentView('alerts');
      } else if (page.includes('analytics') || page.includes('chart')) {
        setCurrentView('analytics');
      } else if (page.includes('pillguard') || page.includes('scanner') || page.includes('pill')) {
        setCurrentView('pillguard');
      } else if (page.includes('patient') || page.includes('registry')) {
        setCurrentView('patient-registry');
      } else if (page.includes('intake')) {
        setCurrentView('intake');
      }
    } else if (actionObj.action === 'show_patient') {
      const name = actionObj.target.toLowerCase();
      const p = patients.find(pat => pat.name.toLowerCase().includes(name) || pat.id.toLowerCase() === name);
      if (p) {
        setCurrentPatient(p);
        navigate(`/patient/${p.id}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', flexDirection: 'column', backgroundColor: 'transparent' }}>
      <ShaderBackground />
      
      {/* Offline Banner */}
      {isOffline && (
        <div style={{
          width: '100%',
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(245, 158, 11, 0.05) 100%)',
          color: T.amber,
          fontSize: '10px',
          fontWeight: '800',
          padding: '8px 16px',
          textAlign: 'center',
          borderBottom: `1px solid rgba(245, 158, 11, 0.2)`,
          letterSpacing: '0.15em',
          zIndex: 100,
          fontFamily: T.fontMono,
          textTransform: 'uppercase'
        }}>
          <span style={{ marginRight: '8px' }}>⚠</span> SYSTEM ARCHIVE UNAVAILABLE — INITIALIZING LOCAL NEURAL CACHE (DEMO MODE)
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main className="pl-0 md:pl-[268px] pb-16 md:pb-0" style={{ flex: 1, position: 'relative', overflowY: 'auto', height: '100vh', background: 'transparent' }}>
          <Routes>
            <Route path="/" element={<Overview setCurrentView={setCurrentView} setCurrentPatient={setCurrentPatient} patients={patients} />} />
            <Route path="/intake" element={<Intake patient={currentPatient} patients={patients} setCurrentPatient={setCurrentPatient} refreshPatients={refreshPatients} setCurrentView={setCurrentView} />} />
            <Route path="/registry" element={<PatientIntel patients={patients} patient={currentPatient} setCurrentPatient={setCurrentPatient} setCurrentView={setCurrentView} startInRegistry={true} onDeletePatient={handleDeletePatient} />} />
            <Route path="/patient/:id" element={<PatientIntel patients={patients} patient={currentPatient} setCurrentPatient={setCurrentPatient} setCurrentView={setCurrentView} startInRegistry={false} onDeletePatient={handleDeletePatient} />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/comorbidity" element={<ComorbidityWeb />} />
            <Route path="/pillguard" element={<PillGuard patient={currentPatient} />} />
            <Route path="/analytics" element={<Analytics patients={patients} />} />
            <Route path="/alerts" element={<AlertCentre patients={patients} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
