"use client";

import { useMemo } from "react";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { ProjectsSection } from "@/src/components/sections/projects-section";
import { useAuthStore, useProjectStore, useEmployeeStore, useTeamStore, useTaskStore } from "@/src/store";
import { can } from "@/src/lib/permissions";

/**
 * Composition root for /projects. Reads stores, applies role-based
 * scoping via permissions, and passes plain props down.
 */
export default function ProjectsPageClient() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const allProjects = useProjectStore((s) => s.projectsList);
  const teams = useTeamStore((s) => s.teamsList);
  const users = useEmployeeStore((s) => s.usersList);
  const tasks = useTaskStore((s) => s.tasks);

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    if (can(currentUser, "project:view-all")) return allProjects;
    if (currentUser.role === "employee") {
      return allProjects.filter((p) =>
        tasks.some((t) => t.projectId === p.id && t.assigneeId === currentUser.id),
      );
    }
    return allProjects.filter(
      (p) => p.ownerId === currentUser.id || p.teamId === currentUser.teamId,
    );
  }, [allProjects, tasks, currentUser]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Project management"
        title="Prioritize active work and delivery risk"
        description="Search, filter, and sort projects with progress, budgets, status, and deadlines visible in one table."
      />
      <ProjectsSection projects={visibleProjects} teams={teams} users={users} />
    </AppShell>
  );
}
