import { create } from "zustand";
import type { User, UserRole } from "@/src/types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole, allUsers: User[]) => void;
  setCurrentUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load persisted auth state from localStorage if present
  let persisted: { currentUser: User | null; isAuthenticated: boolean } | undefined;
  try {
    const stored = localStorage.getItem("auth-store");
    if (stored) persisted = JSON.parse(stored);
  } catch {
    // ignore errors
  }

  return {
    currentUser: persisted?.currentUser ?? null,
    isAuthenticated: persisted?.isAuthenticated ?? false,

    login: (user) => {
      set({ currentUser: user, isAuthenticated: true });
      try {
        localStorage.setItem(
          "auth-store",
          JSON.stringify({ currentUser: user, isAuthenticated: true })
        );
      } catch {}
    },

    logout: () => {
      set({ currentUser: null, isAuthenticated: false });
      try {
        localStorage.removeItem("auth-store");
      } catch {}
    },

    switchRole: (role, allUsers) => {
      const userForRole = allUsers.find((u) => u.role === role);
      if (userForRole) {
        set({ currentUser: userForRole, isAuthenticated: true });
        try {
          localStorage.setItem(
            "auth-store",
            JSON.stringify({ currentUser: userForRole, isAuthenticated: true })
          );
        } catch {}
      }
    },

    setCurrentUser: (user) => {
      set({ currentUser: user });
      try {
        const existing = localStorage.getItem("auth-store");
        const data = existing ? JSON.parse(existing) : {};
        localStorage.setItem(
          "auth-store",
          JSON.stringify({ ...data, currentUser: user })
        );
      } catch {}
    },
  };
});
