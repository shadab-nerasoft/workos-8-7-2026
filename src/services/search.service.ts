import { useProjectStore } from "@/src/store/project-store";
import { useTaskStore } from "@/src/store/task-store";
import { useTeamStore } from "@/src/store/team-store";
import { useEmployeeStore } from "@/src/store/employee-store";

export interface SearchResult {
  id: string;
  type: "project" | "task" | "team" | "employee";
  title: string;
  subtitle: string;
  href: string;
}

export const SearchService = {
  /**
   * Performs a case-insensitive search across projects, tasks, teams, and employees.
   */
  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Projects
    try {
      const projects = useProjectStore.getState().getAllProjects();
      projects.forEach((p) => {
        if (
          p.name.toLowerCase().includes(lowerQuery) ||
          (p.description && p.description.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            id: p.id,
            type: "project",
            title: p.name,
            subtitle: `Project • Status: ${p.status} • Progress: ${p.progress}%`,
            href: `/projects/${p.id}`,
          });
        }
      });
    } catch (e) {
      console.error("SearchService: Failed to search projects", e);
    }

    // 2. Search Tasks
    try {
      const tasks = useTaskStore.getState().getAllTasks();
      tasks.forEach((t) => {
        if (
          t.title.toLowerCase().includes(lowerQuery) ||
          (t.description && t.description.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            id: t.id,
            type: "task",
            title: t.title,
            subtitle: `Task • Status: ${t.status} • Priority: ${t.priority}`,
            href: `/tasks`,
          });
        }
      });
    } catch (e) {
      console.error("SearchService: Failed to search tasks", e);
    }

    // 3. Search Teams
    try {
      const teams = useTeamStore.getState().getAllTeams();
      teams.forEach((t) => {
        if (
          t.name.toLowerCase().includes(lowerQuery) ||
          (t.description && t.description.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            id: t.id,
            type: "team",
            title: t.name,
            subtitle: `Team • ${t.memberIds.length} Members • Health: ${t.health}%`,
            href: `/teams`,
          });
        }
      });
    } catch (e) {
      console.error("SearchService: Failed to search teams", e);
    }

    // 4. Search Employees
    try {
      const employees = useEmployeeStore.getState().getAllUsers();
      employees.forEach((emp) => {
        if (
          emp.name.toLowerCase().includes(lowerQuery) ||
          emp.email.toLowerCase().includes(lowerQuery) ||
          emp.title.toLowerCase().includes(lowerQuery) ||
          emp.role.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: emp.id,
            type: "employee",
            title: emp.name,
            subtitle: `Employee • ${emp.title} (${emp.role}) • ${emp.email}`,
            href: `/employees`,
          });
        }
      });
    } catch (e) {
      console.error("SearchService: Failed to search employees", e);
    }

    return results;
  },
};
