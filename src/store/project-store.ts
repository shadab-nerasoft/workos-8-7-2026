import { create } from "zustand";
import type { Project, ProjectStatus } from "@/src/types";

interface ProjectState {
  projects: Map<string, Project>;
  projectsList: Project[];
  hydrate: (projects: Project[]) => void;
  createProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByTeam: (teamId: string) => Project[];
  getProjectsByOwner: (ownerId: string) => Project[];
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getAllProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: new Map(),
  projectsList: [],

  hydrate: (projects) =>
    set({ projects: new Map(projects.map((p) => [p.id, p])), projectsList: projects }),

  createProject: (project) =>
    set((state) => {
      const next = new Map(state.projects);
      next.set(project.id, project);
      return { projects: next, projectsList: Array.from(next.values()) };
    }),

  updateProject: (id, updates) =>
    set((state) => {
      const existing = state.projects.get(id);
      if (!existing) return state;
      const next = new Map(state.projects);
      next.set(id, { ...existing, ...updates });
      return { projects: next, projectsList: Array.from(next.values()) };
    }),

  deleteProject: (id) =>
    set((state) => {
      const next = new Map(state.projects);
      next.delete(id);
      return { projects: next, projectsList: Array.from(next.values()) };
    }),

  getProjectById: (id) => get().projects.get(id),

  getProjectsByTeam: (teamId) =>
    get().projectsList.filter((p) => p.teamId === teamId),

  getProjectsByOwner: (ownerId) =>
    get().projectsList.filter((p) => p.ownerId === ownerId),

  getProjectsByStatus: (status) =>
    get().projectsList.filter((p) => p.status === status),

  getAllProjects: () => get().projectsList,
}));
