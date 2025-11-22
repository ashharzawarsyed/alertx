import { create } from 'zustand';
import { Emergency } from '../services/emergencyService';

interface EmergencyState {
  activeEmergency: Emergency | null;
  incomingEmergencies: Emergency[];
  emergencyHistory: Emergency[];
  isLoading: boolean;

  // Actions
  setActiveEmergency: (emergency: Emergency | null) => void;
  addIncomingEmergency: (emergency: Emergency) => void;
  removeIncomingEmergency: (emergencyId: string) => void;
  setIncomingEmergencies: (emergencies: Emergency[]) => void;
  updateEmergency: (emergencyId: string, updates: Partial<Emergency>) => void;
  addToHistory: (emergency: Emergency) => void;
  clearActiveEmergency: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeEmergency: null,
  incomingEmergencies: [],
  emergencyHistory: [],
  isLoading: false,
};

export const useEmergencyStore = create<EmergencyState>((set) => ({
  ...initialState,

  setActiveEmergency: (emergency) =>
    set({ activeEmergency: emergency }),

  addIncomingEmergency: (emergency) =>
    set((state) => {
      // Check if emergency already exists to prevent duplicates
      const exists = state.incomingEmergencies.some((e) => e._id === emergency._id);
      if (exists) {
        console.log('⚠️ Emergency already exists, skipping duplicate:', emergency._id);
        return state;
      }
      return {
        incomingEmergencies: [emergency, ...state.incomingEmergencies],
      };
    }),

  removeIncomingEmergency: (emergencyId) =>
    set((state) => ({
      incomingEmergencies: state.incomingEmergencies.filter(
        (e) => e._id !== emergencyId
      ),
    })),

  setIncomingEmergencies: (emergencies) =>
    set({ incomingEmergencies: emergencies }),

  updateEmergency: (emergencyId, updates) =>
    set((state) => {
      const updatedActive =
        state.activeEmergency?._id === emergencyId
          ? { ...state.activeEmergency, ...updates }
          : state.activeEmergency;

      const updatedIncoming = state.incomingEmergencies.map((e) =>
        e._id === emergencyId ? { ...e, ...updates } : e
      );

      return {
        activeEmergency: updatedActive,
        incomingEmergencies: updatedIncoming,
      };
    }),

  addToHistory: (emergency) =>
    set((state) => ({
      emergencyHistory: [emergency, ...state.emergencyHistory],
    })),

  clearActiveEmergency: () =>
    set({ activeEmergency: null }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  reset: () => set(initialState),
}));
