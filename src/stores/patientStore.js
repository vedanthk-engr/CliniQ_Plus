import { create } from 'zustand';
import { fetchPatients } from '../api';

export const usePatientStore = create((set, get) => ({
  patients: [],
  currentPatient: null,
  loading: true,
  isOffline: false,
  cachedTrials: {},

  setPatients: (patients) => set({ patients }),
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  setLoading: (loading) => set({ loading }),
  setIsOffline: (isOffline) => set({ isOffline }),
  setCachedTrials: (cachedTrials) => set((state) => {
    const nextTrials = typeof cachedTrials === 'function' ? cachedTrials(state.cachedTrials) : cachedTrials;
    return { cachedTrials: nextTrials };
  }),

  loadPatients: async () => {
    set({ loading: true });
    try {
      const data = await fetchPatients();
      set({ patients: data, currentPatient: data[0] || null, loading: false, isOffline: false });
      return data;
    } catch (err) {
      console.error("Failed to fetch patients in store:", err);
      set({ loading: false, isOffline: true });
      return [];
    }
  },

  refreshPatients: async () => {
    try {
      const data = await fetchPatients();
      const current = get().currentPatient;
      const updatedCurrent = current ? data.find(p => p.id === current.id) : null;
      set({ 
        patients: data, 
        currentPatient: updatedCurrent || current || data[0] || null,
        isOffline: false 
      });
      return data;
    } catch (err) {
      console.error("Failed to refresh patients:", err);
      return [];
    }
  }
}));
