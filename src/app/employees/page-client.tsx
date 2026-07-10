"use client";

import { useMemo } from "react";
import { AppShell } from "@/src/components/common/app-shell";
import {
  EmployeesSection,
  type CreateEmployeeInput,
} from "@/src/components/sections/employees-section";
import { can } from "@/src/lib/permissions";
import { employeesApi } from "@/src/services";
import { useAuthStore, useEmployeeStore, useTeamStore } from "@/src/store";
import type { User } from "@/src/types";

/**
 * Composition root for /employees.
 * Owns data access, visibility scoping, permissions, and mutations.
 * EmployeesSection and EmployeesTable are pure — they only receive props.
 */
export default function EmployeesPageClient() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const usersList = useEmployeeStore((s) => s.usersList);
  const teamsList = useTeamStore((s) => s.teamsList);

  const isAdmin = currentUser?.role === "admin";
  const isManager = currentUser?.role === "manager";

  // Visibility scoping is owned by the page, not the component.
  const visibleEmployees = useMemo(() => {
    const employees = usersList.filter((u) => u.role === "employee");
    if (isAdmin) return employees;
    if (isManager) {
      const managedTeamIds = new Set(
        teamsList.filter((t) => t.leadId === currentUser?.id).map((t) => t.id),
      );
      return employees.filter(
        (u) => managedTeamIds.has(u.teamId) || u.createdBy === currentUser?.id,
      );
    }
    return [];
  }, [usersList, teamsList, isAdmin, isManager, currentUser?.id]);

  const assignableTeams = useMemo(() => {
    if (isAdmin) return teamsList;
    if (isManager) return teamsList.filter((t) => t.leadId === currentUser?.id);
    return [];
  }, [teamsList, isAdmin, isManager, currentUser?.id]);

  const handleCreateEmployee = (input: CreateEmployeeInput) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: input.name,
      role: "employee",
      title: input.title,
      email: input.email,
      teamId: input.teamId,
      avatar: "",
      utilization: 0,
      performance: 0,
      createdBy: currentUser?.id,
    };
    // API-ready seam: the service body becomes fetch("/api/employees") later.
    void employeesApi.createEmployee(newUser);
  };

  const handleDeleteEmployee = (userId: string) => {
    void employeesApi.deleteEmployee(userId);
  };

  return (
    <AppShell>
      <EmployeesSection
        employees={visibleEmployees}
        assignableTeams={assignableTeams}
        canView={can(currentUser, "employee:view")}
        canDelete={can(currentUser, "employee:manage")}
        allowUnassignedTeam={isAdmin}
        currentUserId={currentUser?.id ?? ""}
        onCreateEmployee={handleCreateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />
    </AppShell>
  );
}
