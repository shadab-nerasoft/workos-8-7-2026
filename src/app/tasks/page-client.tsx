"use client";

import { useState, useMemo } from "react";
import { useAuthStore, useTaskStore, useEmployeeStore, useProjectStore, useTeamStore } from "@/src/store";
import { tasksApi } from "@/src/services";
import { can, scopeTasksForUser } from "@/src/lib/permissions";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { TaskFilterBar } from "@/src/components/tasks/task-filter-bar";
import { TaskListView } from "@/src/components/tasks/task-list-view";
import { TaskKanbanView } from "@/src/components/tasks/task-kanban-view";
import { TaskStatsCard } from "@/src/components/tasks/task-stats-card";
import { TaskDetailModal } from "@/src/components/tasks/task-detail-modal";
import { TaskModal } from "@/src/components/projects/task-modal";
import { getTaskManager } from "@/src/lib/utils/task-manager";
import { Add, Grid2, Menu } from "iconsax-react";
import type { TaskStatus, Task } from "@/src/types";

type ViewMode = "list" | "kanban";

const HEADER_BY_ROLE = {
  admin: {
    eyebrow: "Admin",
    title: "All Company Tasks",
    description: "Monitor and manage every task across the organization",
  },
  manager: {
    eyebrow: "Team Management",
    title: "Team Tasks",
    description: "Manage and monitor your team members' tasks",
  },
  employee: {
    eyebrow: "My Work",
    title: "My Tasks",
    description: "Track and update the tasks assigned to you",
  },
} as const;

export default function TasksPage() {
  // ── Composition root: the ONLY place this route touches stores/services ──
  const currentUser = useAuthStore((s) => s.currentUser);
  const tasks = useTaskStore((s) => s.tasks);
  const usersList = useEmployeeStore((s) => s.usersList);
  const projectsList = useProjectStore((s) => s.projectsList);
  const teamsList = useTeamStore((s) => s.teamsList);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    priority?: string;
    searchQuery: string;
  }>({ searchQuery: "" });

  // ── Permissions (computed once, passed down as booleans) ──
  const canCreate = can(currentUser, "task:create");
  const canDelete = can(currentUser, "task:delete");
  const canFilterByTeam = can(currentUser, "task:view-all");

  // ── Role-scoped task list ──
  const scopedTasks = useMemo(
    () => scopeTasksForUser(currentUser, tasks, usersList),
    [currentUser, tasks, usersList]
  );

  // Admin-only team filter
  const teamFilteredTasks = useMemo(() => {
    if (!selectedTeam) return scopedTasks;
    const teamMemberIds = new Set(
      usersList.filter((u) => u.teamId === selectedTeam).map((u) => u.id)
    );
    return scopedTasks.filter((t) => teamMemberIds.has(t.assigneeId));
  }, [scopedTasks, selectedTeam, usersList]);

  const visibleTasks = useMemo(() => {
    let filtered = teamFilteredTasks;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    return filtered;
  }, [teamFilteredTasks, filters]);

  const taskStats = useMemo(
    () => ({
      total: teamFilteredTasks.length,
      completed: teamFilteredTasks.filter((t) => t.status === "completed").length,
      inProgress: teamFilteredTasks.filter((t) => t.status === "in-progress").length,
      overdue: teamFilteredTasks.filter(
        (t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date()
      ).length,
    }),
    [teamFilteredTasks]
  );

  const employeeMap = useMemo(
    () =>
      Object.fromEntries(
        usersList.map((user) => [user.id, { name: user.name, avatar: user.avatar || "" }])
      ),
    [usersList]
  );

  const projectMap = useMemo(
    () => Object.fromEntries(projectsList.map((proj) => [proj.id, proj.name])),
    [projectsList]
  );

  if (!currentUser) return null;

  const header = HEADER_BY_ROLE[currentUser.role];
  const defaultProjectId = projectsList[0]?.id;
  const modalProjectId = editingTask?.projectId ?? defaultProjectId;

  const canEditSelected = can(currentUser, "task:edit", { task: selectedTask ?? undefined });

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            eyebrow={header.eyebrow}
            title={header.title}
            description={header.description}
          />
          <div className="flex shrink-0 gap-2">
            {canCreate && (
              <button
                type="button"
                onClick={openCreateModal}
                disabled={!defaultProjectId}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Add size={18} color="currentColor" />
                Create Task
              </button>
            )}
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-2 ${
                viewMode === "list"
                  ? "bg-primary-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="List view"
              aria-label="List view"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg px-3 py-2 ${
                viewMode === "kanban"
                  ? "bg-primary-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="Kanban view"
              aria-label="Kanban view"
            >
              <Grid2 size={20} />
            </button>
          </div>
        </div>

        {canFilterByTeam && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Filter by Team</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTeam(null)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTeam === null
                    ? "bg-primary-500 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                All Teams
              </button>
              {teamsList.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTeam === team.id
                      ? "bg-primary-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <TaskStatsCard
          total={taskStats.total}
          completed={taskStats.completed}
          inProgress={taskStats.inProgress}
          overdue={taskStats.overdue}
        />

        <TaskFilterBar
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters({ searchQuery: "" })}
        />

        {viewMode === "list" ? (
          <TaskListView
            tasks={visibleTasks}
            employeeMap={employeeMap}
            onTaskClick={setSelectedTask}
          />
        ) : (
          <TaskKanbanView
            tasks={visibleTasks}
            employeeMap={employeeMap}
            onTaskClick={setSelectedTask}
            onStatusChange={(taskId, newStatus) => tasksApi.moveTask(taskId, newStatus)}
          />
        )}

        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(taskId, updates) => tasksApi.updateTask(taskId, updates)}
          onDelete={(taskId) => tasksApi.deleteTask(taskId)}
          canEdit={canEditSelected}
          canDelete={canDelete}
          assigneeName={selectedTask ? employeeMap[selectedTask.assigneeId]?.name : undefined}
          managerName={
            selectedTask
              ? getTaskManager(selectedTask.managerId, selectedTask.assigneeId, usersList)?.name
              : undefined
          }
          projectName={selectedTask ? projectMap[selectedTask.projectId] : undefined}
          currentUserId={currentUser.id}
        />

        {modalProjectId && (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            task={editingTask}
            projectId={modalProjectId}
          />
        )}
      </div>
    </AppShell>
  );
}
