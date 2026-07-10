import type { Permissions, Task, User, UserRole } from "@/src/types";

/**
 * Central RBAC module — the single source of truth for every
 * role/permission decision in the app.
 *
 * Usage:
 *   can(user, "task:create")                  → boolean
 *   can(user, "task:edit", { task })          → boolean (resource-aware)
 *   getPermissions(user)                      → full boolean map for a role
 *
 * Components NEVER import this module or check roles. Pages compute
 * booleans with `can()` and pass them down as props.
 */

export type Action =
  | "task:create"
  | "task:edit"
  | "task:delete"
  | "task:assign" // assign a task to someone OTHER than yourself
  | "task:archive"
  | "task:view-all" // see every task in the org
  | "task:view-team" // see the whole team's tasks
  | "project:create"
  | "project:edit"
  | "project:delete"
  | "project:view-all"
  | "team:create"
  | "team:edit"
  | "team:delete"
  | "team:view"
  | "team:view-all"
  | "employee:manage"
  | "employee:view"
  | "report:create-daily"
  | "report:view-team"
  | "analytics:view-company"
  | "analytics:view-team"
  | "settings:view"
  | "settings:edit"
  | "admin:create-manager";

interface ActionContext {
  task?: Task;
}

type RoleMatrix = Record<UserRole, boolean>;

const MATRIX: Record<Action, RoleMatrix> = {
  // Tasks — employees can create tasks (self-assigned only, see task:assign)
  "task:create": { admin: true, manager: true, employee: true },
  "task:edit": { admin: true, manager: true, employee: true }, // employee: own tasks only (checked contextually)
  "task:delete": { admin: true, manager: true, employee: false },
  "task:assign": { admin: true, manager: true, employee: false },
  "task:archive": { admin: true, manager: true, employee: false },
  "task:view-all": { admin: true, manager: false, employee: false },
  "task:view-team": { admin: true, manager: true, employee: false },
  // Projects
  "project:create": { admin: true, manager: true, employee: false },
  "project:edit": { admin: true, manager: true, employee: false },
  "project:delete": { admin: true, manager: false, employee: false },
  "project:view-all": { admin: true, manager: false, employee: false },
  // Teams
  "team:create": { admin: true, manager: true, employee: false },
  "team:edit": { admin: true, manager: true, employee: false },
  "team:delete": { admin: true, manager: true, employee: false },
  "team:view": { admin: true, manager: true, employee: false },
  "team:view-all": { admin: true, manager: false, employee: false },
  // Employees
  "employee:manage": { admin: true, manager: true, employee: false },
  "employee:view": { admin: true, manager: true, employee: false },
  // Reports
  "report:create-daily": { admin: false, manager: false, employee: true },
  "report:view-team": { admin: true, manager: true, employee: false },
  // Analytics
  "analytics:view-company": { admin: true, manager: false, employee: false },
  "analytics:view-team": { admin: true, manager: true, employee: false },
  // Settings
  "settings:view": { admin: true, manager: false, employee: false },
  "settings:edit": { admin: true, manager: false, employee: false },
  // Admin-only
  "admin:create-manager": { admin: true, manager: false, employee: false },
};

/**
 * Check whether a user may perform an action, optionally against a
 * specific resource. Returns false for unauthenticated users.
 */
export function can(user: User | null | undefined, action: Action, context?: ActionContext): boolean {
  if (!user) return false;

  const allowed = MATRIX[action][user.role];
  if (!allowed) return false;

  // Contextual (resource-level) rules
  if (user.role === "employee" && context?.task) {
    switch (action) {
      case "task:edit":
        // Employees may only edit tasks assigned to them
        return context.task.assigneeId === user.id;
      default:
        break;
    }
  }

  return allowed;
}

/**
 * Full permission map for a role — used by pages to compute prop
 * booleans in one place, and by the legacy `usePermissions` hook.
 */
export function getPermissions(user: User | null | undefined): Permissions {
  return {
    canCreateTeam: can(user, "team:create"),
    canEditTeam: can(user, "team:edit"),
    canDeleteTeam: can(user, "team:delete"),
    canCreateProject: can(user, "project:create"),
    canEditProject: can(user, "project:edit"),
    canDeleteProject: can(user, "project:delete"),
    canCreateTask: can(user, "task:create"),
    canEditTask: can(user, "task:edit"),
    canDeleteTask: can(user, "task:delete"),
    canAssignTasks: can(user, "task:assign"),
    canManageEmployees: can(user, "employee:manage"),
    canViewAllTeams: can(user, "team:view-all"),
    canViewAllProjects: can(user, "project:view-all"),
    canViewCompanyAnalytics: can(user, "analytics:view-company"),
    canViewTeamAnalytics: can(user, "analytics:view-team"),
    canViewSettings: can(user, "settings:view"),
    canEditSettings: can(user, "settings:edit"),
    canCreateDailyReport: can(user, "report:create-daily"),
    canViewTeams: can(user, "team:view"),
  };
}

/**
 * Scope a task list to what the user is allowed to see.
 * - admin    → everything
 * - manager  → own team's tasks + tasks they manage
 * - employee → only tasks assigned to them
 */
export function scopeTasksForUser(user: User | null | undefined, tasks: Task[], allUsers: User[]): Task[] {
  if (!user) return [];

  if (user.role === "admin") return tasks;

  if (user.role === "manager") {
    const teamMemberIds = new Set(
      allUsers.filter((u) => u.teamId === user.teamId).map((u) => u.id)
    );
    return tasks.filter(
      (t) => teamMemberIds.has(t.assigneeId) || t.managerId === user.id
    );
  }

  return tasks.filter((t) => t.assigneeId === user.id);
}
