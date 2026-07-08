

import { create } from "zustand";
import type { Team } from "@/src/types";

interface TeamState {
  teams: Map<string, Team>;
  teamsList: Team[];
  hydrate: (teams: Team[]) => void;
  createTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addMember: (teamId: string, userId: string) => void;
  removeMember: (teamId: string, userId: string) => void;
  addProject: (teamId: string, projectId: string) => void;
  removeProject: (teamId: string, projectId: string) => void;
  getTeamById: (id: string) => Team | undefined;
  getAllTeams: () => Team[];
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: new Map(),
  teamsList: [],

  hydrate: (teams) =>
    set({ teams: new Map(teams.map((t) => [t.id, t])), teamsList: teams }),

  createTeam: (team) =>
    set((state) => {
      const next = new Map(state.teams);
      next.set(team.id, team);
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  updateTeam: (id, updates) =>
    set((state) => {
      const existing = state.teams.get(id);
      if (!existing) return state;
      const next = new Map(state.teams);
      next.set(id, { ...existing, ...updates });
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  deleteTeam: (id) =>
    set((state) => {
      const next = new Map(state.teams);
      next.delete(id);
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  addMember: (teamId, userId) =>
    set((state) => {
      const team = state.teams.get(teamId);
      if (!team || team.memberIds.includes(userId)) return state;
      const next = new Map(state.teams);
      next.set(teamId, { ...team, memberIds: [...team.memberIds, userId] });
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  removeMember: (teamId, userId) =>
    set((state) => {
      const team = state.teams.get(teamId);
      if (!team) return state;
      const next = new Map(state.teams);
      next.set(teamId, { ...team, memberIds: team.memberIds.filter((id) => id !== userId) });
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  addProject: (teamId, projectId) =>
    set((state) => {
      const team = state.teams.get(teamId);
      if (!team || team.projectIds.includes(projectId)) return state;
      const next = new Map(state.teams);
      next.set(teamId, { ...team, projectIds: [...team.projectIds, projectId] });
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  removeProject: (teamId, projectId) =>
    set((state) => {
      const team = state.teams.get(teamId);
      if (!team) return state;
      const next = new Map(state.teams);
      next.set(teamId, { ...team, projectIds: team.projectIds.filter((id) => id !== projectId) });
      return { teams: next, teamsList: Array.from(next.values()) };
    }),

  getTeamById: (id) => get().teams.get(id),

  getAllTeams: () => get().teamsList,
}));
