import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './views/Overview';
import PatientIntel from './views/PatientIntel';
import PillGuard from './views/PillGuard';
import Analytics from './views/Analytics';
import AlertCentre from './views/AlertCentre';
import Intake from './views/Intake';
import { fetchPatients, deletePatient } from './api';
import { T } from './tokens';
import { useDemoMode } from './hooks/useDemoMode';
import { DemoContext } from './context/DemoContext';

function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSwitchingPatient, setIsSwitchingPatient] = useState(false);

  // Demo Machine
  const demoState = useDemoMode({ patients, setCurrentPatient, setCurrentView });

  useEffect(() => {
    if (!currentPatient) return;
    setIsSwitchingPatient(true);
    const t = setTimeout(() => setIsSwitchingPatient(false), 400);
    return () => clearTimeout(t);
  }, [currentPatient?.id]);

  const refreshPatients = async () => {
    try {
      const data = await fetchPatients();
      setPatients(data);
      return data;
    } catch (err) {
      console.error("Failed to refresh patients:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchPatients().then(data => {
      if (mounted) {
        setPatients(data);
        setCurrentPatient(data[0]);
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        console.error("Backend failed:", err);
        setIsOffline(true);
        setLoading(false);
      }
    });
    return () => mounted = false;
  }, []);

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      if (currentPatient?.id === id) {
        setCurrentPatient(null);
        setCurrentView('patient-registry');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    }
  };

  const renderView = () => {
    if (loading) return <div style={{ color: T.textSecondary, padding: '40px' }}>Initializing Demo Data...</div>;
    switch (currentView) {
      case 'overview': return <Overview setCurrentView={setCurrentView} setCurrentPatient={setCurrentPatient} patients={patients} />;
      case 'intake': return <Intake patient={currentPatient} patients={patients} setCurrentPatient={setCurrentPatient} refreshPatients={refreshPatients} setCurrentView={setCurrentView} />;
      case 'patient-registry': return <PatientIntel key="registry" patients={patients} patient={currentPatient} setCurrentPatient={setCurrentPatient} setCurrentView={setCurrentView} startInRegistry={true} onDeletePatient={handleDeletePatient} />;
      case 'patient': return <PatientIntel key="detail" patients={patients} patient={currentPatient} setCurrentPatient={setCurrentPatient} setCurrentView={setCurrentView} startInRegistry={false} onDeletePatient={handleDeletePatient} />;
      case 'pillguard': return <PillGuard patient={currentPatient} />;
      case 'analytics': return <Analytics patients={patients} />;
      case 'alerts': return <AlertCentre patients={patients} />;
      default: return <Overview setCurrentView={setCurrentView} setCurrentPatient={setCurrentPatient} patients={patients} />;
    }
  };

  return (
    <DemoContext.Provider value={demoState}>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', flexDirection: 'column' }}>

        {/* Offline Banner */}
        {isOffline && !loading && (
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
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentPatient={currentPatient}
            setCurrentPatient={setCurrentPatient}
            patients={patients} // Pass dynamic patients down
          />

          <main style={{ flex: 1, position: 'relative', overflowY: 'auto', height: '100%', background: 'transparent' }}>
            {isSwitchingPatient ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 32px 32px 32px', background: T.bgMain }}>
                <div style={{ padding: '24px 0', marginBottom: '32px' }}>
                  <div className="skeleton" style={{ height: '40px', width: '320px', borderRadius: '12px', marginBottom: '12px', background: 'rgba(115, 65, 234, 0.05)' }} />
                  <div className="skeleton" style={{ height: '14px', width: '200px', borderRadius: '6px', background: 'rgba(157, 0, 255, 0.03)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', flex: 1 }}>
                  <div className="skeleton" style={{ flex: 1, borderRadius: '20px', background: 'rgba(157, 0, 255, 0.02)', border: '1px solid rgba(115, 65, 234, 0.05)' }} />
                  <div className="skeleton" style={{ flex: 1, borderRadius: '20px', background: 'rgba(157, 0, 255, 0.02)', border: '1px solid rgba(115, 65, 234, 0.05)' }} />
                  <div className="skeleton" style={{ flex: 1, borderRadius: '20px', background: 'rgba(157, 0, 255, 0.02)', border: '1px solid rgba(115, 65, 234, 0.05)' }} />
                </div>
              </div>
            ) : (
              renderView()
            )}
          </main>
        </div>
      </div>
    </DemoContext.Provider>
  );
}

export default App;
