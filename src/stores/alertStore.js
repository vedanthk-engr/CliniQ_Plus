import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  alerts: [],
  explanations: {}, // alertId -> explanation text
  explainingIds: {}, // alertId -> boolean
  
  setAlerts: (alerts) => set({ alerts }),
  setExplanation: (alertId, text) => set((state) => ({
    explanations: { ...state.explanations, [alertId]: text }
  })),
  setExplaining: (alertId, isExplaining) => set((state) => ({
    explainingIds: { ...state.explainingIds, [alertId]: isExplaining }
  }))
}));
