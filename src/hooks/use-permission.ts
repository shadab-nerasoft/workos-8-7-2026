import { useMemo } from "react";
import { useAuthStore } from "@/src/store/auth-store";
import type { Permissions, UserRole } from "@/src/types";

const PERMISSION_MAP: Record<UserRole, Permissions> = {
  admin: {
    canCreateTeam: true,
    canEditTeam: true,
    canDeleteTeam: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignTasks: true,
    canManageEmployees: true,
    canViewAllTeams: true,
    canViewAllProjects: true,
    canViewCompanyAnalytics: true,
    canViewTeamAnalytics: true,
    canViewSettings: true,
    canEditSettings: true,
    canCreateDailyReport: false,
    canViewTeams: true,
  },
  manager: {
    canCreateTeam: true,
    canEditTeam: true,
    canDeleteTeam: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignTasks: true,
    canManageEmployees: true,
    canViewAllTeams: false,
    canViewAllProjects: false,
    canViewCompanyAnalytics: false,
    canViewTeamAnalytics: true,
    canViewSettings: false,
    canEditSettings: false,
    canCreateDailyReport: false,
    canViewTeams: true,
  },
  employee: {
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignTasks: false,
    canManageEmployees: false,
    canViewAllTeams: false,
    canViewAllProjects: false,
    canViewCompanyAnalytics: false,
    canViewTeamAnalytics: false,
    canViewSettings: false,
    canEditSettings: false,
    canCreateDailyReport: true,
    canViewTeams: false,
  },
};

const DEFAULT_PERMISSIONS: Permissions = PERMISSION_MAP.employee;

export function usePermissions(): Permissions {
  const currentUser = useAuthStore((s) => s.currentUser);

  return useMemo(() => {
    if (!currentUser) return DEFAULT_PERMISSIONS;
    return PERMISSION_MAP[currentUser.role];
  }, [currentUser]);
}
