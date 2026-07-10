import { useProjectStore } from "@/src/store/project-store";
import type { Project } from "@/src/types";

/**
 * Projects service — the single API seam for project data.
 * TODAY: mock/Zustand. LATER: swap bodies to fetch("/api/projects...").
 */

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    return useProjectStore.getState().getAllProjects();
  },

  async createProject(project: Project): Promise<Project> {
    // LATER: POST /api/projects
    useProjectStore.getState().createProject(project);
    return project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    // LATER: PATCH /api/projects/:id
    useProjectStore.getState().updateProject(id, updates);
  },

  async deleteProject(id: string): Promise<void> {
    // LATER: DELETE /api/projects/:id
    useProjectStore.getState().deleteProject(id);
  },
};
