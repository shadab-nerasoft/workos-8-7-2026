import { create } from "zustand";
import type { User } from "@/src/types";

interface EmployeeState {
  users: Map<string, User>;
  usersList: User[];
  hydrate: (users: User[]) => void;
  createUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByTeam: (teamId: string) => User[];
  getUsersByRole: (role: User["role"]) => User[];
  getAllUsers: () => User[];
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  users: new Map(),
  usersList: [],

  hydrate: (users) =>
    set({ users: new Map(users.map((u) => [u.id, u])), usersList: users }),

  createUser: (user) =>
    set((state) => {
      const next = new Map(state.users);
      next.set(user.id, user);
      return { users: next, usersList: Array.from(next.values()) };
    }),

  updateUser: (id, updates) =>
    set((state) => {
      const existing = state.users.get(id);
      if (!existing) return state;
      const next = new Map(state.users);
      next.set(id, { ...existing, ...updates });
      return { users: next, usersList: Array.from(next.values()) };
    }),

  deleteUser: (id) =>
    set((state) => {
      const next = new Map(state.users);
      next.delete(id);
      return { users: next, usersList: Array.from(next.values()) };
    }),

  getUserById: (id) => get().users.get(id),

  getUsersByTeam: (teamId) =>
    get().usersList.filter((u) => u.teamId === teamId),

  getUsersByRole: (role) =>
    get().usersList.filter((u) => u.role === role),

  getAllUsers: () => get().usersList,
}));
