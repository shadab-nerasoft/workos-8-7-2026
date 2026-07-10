"use client";

/**
 * Teams page — composition root.
 *
 * Owns all data access (stores/services), scoping, permissions, and
 * persistence. TeamsSection below is purely presentational.
 */
import { useMemo } from "react";
import { AppShell } from "@/src/components/common/app-shell";
import {
  TeamsSection,
  type TeamFormValues,
  type ManagerFormValues,
} from "@/src/components/sections/teams-section";
import { can } from "@/src/lib/permissions";
import { TeamsService } from "@/src/services/teams.service";
import {
  useAuthStore,
  useTeamStore,
  useEmployeeStore,
  useProjectStore,
  useTaskStore,
} from "@/src/store";

export default function TeamsPageClient() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const teamsList = useTeamStore((s) => s.teamsList);
  const usersList = useEmployeeStore((s) => s.usersList);
  const projectsList = useProjectStore((s) => s.projectsList);
  const tasksList = useTaskStore((s) => s.tasks);
  const updateTeam = useTeamStore((s) => s.updateTeam);
  const updateUser = useEmployeeStore((s) => s.updateUser);

  const isCompanyWide = can(currentUser, "team:view-all");

  // Scope teams by role: admins see all; managers see teams they lead or belong to.
  const visibleTeams = useMemo(() => {
    if (!currentUser) return [];
    if (isCompanyWide) return teamsList;
    return teamsList.filter(
      (t) => t.leadId === currentUser.id || t.id === currentUser.teamId,
    );
  }, [currentUser, teamsList, isCompanyWide]);

  if (!currentUser) return null;

  const handleCreateTeam = (values: TeamFormValues) => {
    TeamsService.createTeam(values);
  };

  const handleUpdateTeam = (
    teamId: string,
    values: TeamFormValues,
    previousMemberIds: string[],
  ) => {
    updateTeam(teamId, values);

    // Sync member teamIds: clear removed members, assign new ones.
    const removed = previousMemberIds.filter((id) => !values.memberIds.includes(id));
    for (const id of removed) {
      const user = usersList.find((u) => u.id === id);
      if (user && user.teamId === teamId) {
        updateUser(id, { teamId: "" });
      }
    }
    for (const id of values.memberIds) {
      updateUser(id, { teamId });
    }
  };

  const handleCreateManager = (values: ManagerFormValues) => {
    TeamsService.createManager(values);
  };

  return (
    <AppShell>
      <TeamsSection
        currentUser={currentUser}
        teams={visibleTeams}
        users={usersList}
        projects={projectsList}
        tasks={tasksList}
        canViewSection={can(currentUser, "team:view")}
        canManageManagers={can(currentUser, "employee:manage")}
        canCreateTeam={can(currentUser, "team:create")}
        isCompanyWide={isCompanyWide}
        onCreateTeam={handleCreateTeam}
        onUpdateTeam={handleUpdateTeam}
        onCreateManager={handleCreateManager}
      />
    </AppShell>
  );
}
