import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, User } from "../types";

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasCompletedOnboarding: (hasCompleted: boolean) => void;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasCompletedOnboarding: false,

      // Actions
      setUser: (user: User) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      setToken: (token: string) => set({ token, isAuthenticated: true }),

      setIsAuthenticated: (isAuthenticated: boolean) =>
        set({ isAuthenticated }),

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      setHasCompletedOnboarding: (hasCompleted: boolean) =>
        set({ hasCompletedOnboarding: hasCompleted }),

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      signOut: async () => {
        // Clear AsyncStorage token
        await AsyncStorage.removeItem("auth-token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
