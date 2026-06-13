import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  selectedDate: new Date(2026, 5, 13), // June 13, 2026
  events: [
    {
      id: 'evt-1',
      time: '07:00',
      title: 'Emergency visit',
      description: 'West camp, Room 312',
      type: 'emergency',
      date: '2026-06-13'
    },
    {
      id: 'evt-2',
      time: '08:12',
      title: 'Patient Consults',
      description: 'Ward 3, Critical Care',
      type: 'consult',
      date: '2026-06-13'
    },
    {
      id: 'evt-3',
      time: '09:00',
      title: 'Telehealth Block',
      description: 'Follow-up consultations',
      type: 'video',
      date: '2026-06-13'
    }
  ],
  setSelectedDate: (date) => set({ selectedDate: date }),
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: `evt-${Date.now()}` }]
  }))
}));
