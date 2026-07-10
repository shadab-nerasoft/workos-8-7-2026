/**
 * Service layer — the ONLY integration point for backend data.
 *
 * Architecture rule:
 *   pages (page-client.tsx)  →  services  →  stores (client cache)
 *   components               →  props only (never import services/stores)
 *
 * When the real API is ready, swap the function bodies in each
 * *.service.ts file to fetch() calls. Pages and components stay
 * untouched.
 */

export { authApi, DEMO_PASSWORD } from "./auth.service";
export { tasksApi, type CreateTaskInput } from "./tasks.service";
export { projectsApi } from "./projects.service";
export { employeesApi } from "./employees.service";
export { reportsApi } from "./reports.service";
export { TeamsService } from "./teams.service";
