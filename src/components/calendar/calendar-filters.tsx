"use client";

import { useProjectStore, useEmployeeStore, useAuthStore } from "@/src/store";
import { Filter, User } from "iconsax-react";
import type { TaskStatus, Priority } from "@/src/types";

type StatusFilter = TaskStatus | "all";
type PriorityFilter = Priority | "all";

interface CalendarFiltersProps {
  selectedProject: string;
  setSelectedProject: (val: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (val: string) => void;
  selectedStatus: StatusFilter;
  setSelectedStatus: (val: StatusFilter) => void;
  selectedPriority: PriorityFilter;
  setSelectedPriority: (val: PriorityFilter) => void;
}

export function CalendarFilters({
  selectedProject,
  setSelectedProject,
  selectedAssignee,
  setSelectedAssignee,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
}: CalendarFiltersProps) {
  const { currentUser } = useAuthStore();
  const projects = useProjectStore((s) => s.projectsList);
  const users = useEmployeeStore((s) => s.usersList);

  // Admins and Managers can see all users, Employees only see themselves
  const canFilterAssignee = currentUser?.role !== "employee";

  const accessibleProjects = currentUser?.role === "admin"
    ? projects
    : currentUser?.role === "manager"
    ? projects.filter((p) => p.teamId === currentUser.teamId)
    : projects; // For employee, we typically show projects where they have tasks, but showing all accessible projects is fine for filters.

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center">
      <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
        <Filter size={20} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Filters</span>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-3">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Projects</option>
          {accessibleProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {canFilterAssignee && (
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {!canFilterAssignee && currentUser && (
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
            <User size={16} />
            My Tasks Only
          </div>
        )}

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="todo">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Done</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as PriorityFilter)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>
  );
}
