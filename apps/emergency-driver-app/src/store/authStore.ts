import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'driver';
  driverInfo: {
    licenseNumber: string;
    ambulanceNumber: string;
    currentLocation?: {
      lat: number;
      lng: number;
    };
    status: 'available' | 'busy' | 'offline';
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User | null, token: string | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateDriverStatus: (status: 'available' | 'busy' | 'offline') => void;
  updateDriverLocation: (location: { lat: number; lng: number }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) =>
    set({
      token,
      isAuthenticated: !!token,
    }),

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: !!user && !!token,
    }),

  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  updateDriverStatus: (status) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            driverInfo: {
              ...state.user.driverInfo,
              status,
            },
          }
        : null,
    })),

  updateDriverLocation: (location) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            driverInfo: {
              ...state.user.driverInfo,
              currentLocation: location,
            },
          }
        : null,
    })),
}));
