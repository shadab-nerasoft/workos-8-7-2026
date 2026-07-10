import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/src/types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** True once the persisted state has been rehydrated on the client. */
  hasHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole, allUsers: User[]) => void;
  setCurrentUser: (user: User) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (user) => set({ currentUser: user, isAuthenticated: true }),

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      switchRole: (role, allUsers) => {
        const userForRole = allUsers.find((u) => u.role === role);
        if (userForRole) {
          set({ currentUser: userForRole, isAuthenticated: true });
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
