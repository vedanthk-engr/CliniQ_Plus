import { create } from 'zustand';

export const useForecastStore = create((set) => ({
  forecastData: null,
  isStreaming: false,
  activeInterventions: {}, // e.g. { metformin: false, SGLT2i: false }
  
  setForecastData: (data) => set({ forecastData: data }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  toggleIntervention: (name) => set((state) => {
    const active = !state.activeInterventions[name];
    return {
      activeInterventions: {
        ...state.activeInterventions,
        [name]: active
      }
    };
  }),
  
  resetInterventions: () => set({ activeInterventions: {} })
}));
