import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      doctorName: 'Dr. Yuthika',
      setDoctorName: (name) => set({ doctorName: name }),
    }),
    { name: 'cliniq-user-store' }
  )
);
