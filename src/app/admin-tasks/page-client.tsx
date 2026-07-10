"use client";

import { useState, useMemo } from "react";
import { useTaskStore, useEmployeeStore, useProjectStore, useTeamStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { TaskFilterBar } from "@/src/components/tasks/task-filter-bar";
import { TaskListView } from "@/src/components/tasks/task-list-view";
import { TaskStatsCard } from "@/src/components/tasks/task-stats-card";
import { TaskDetailModal } from "@/src/components/tasks/task-detail-modal";
import { getTaskManager } from "@/src/lib/utils/task-manager";
import type { TaskStatus, Task } from "@/src/types";

export default function AdminTasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const usersList = useEmployeeStore((s) => s.usersList);
  const projects = useProjectStore((s) => s.projects);
  const teamsList = useTeamStore((s) => s.teamsList);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    priority?: string;
    searchQuery: string;
  }>({ searchQuery: "" });

  // Get team member IDs if a team is selected, otherwise get all
  const visibleEmployeeIds = useMemo(() => {
    if (selectedTeam) {
      return usersList.filter((user) => user.teamId === selectedTeam).map((user) => user.id);
    }
    return usersList.map((user) => user.id);
  }, [usersList, selectedTeam]);

  // Get filtered tasks
  const visibleTasks = useMemo(() => {
    let filtered = tasks.filter((t) => visibleEmployeeIds.includes(t.assigneeId));

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
  }, [tasks, visibleEmployeeIds, filters]);

  const taskStats = useMemo(() => {
    return {
      total: visibleTasks.length,
      completed: visibleTasks.filter((t) => t.status === "completed").length,
      inProgress: visibleTasks.filter((t) => t.status === "in-progress").length,
      overdue: visibleTasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date())
        .length,
    };
  }, [visibleTasks]);

  const employeeMap = useMemo(
    () =>
      Object.fromEntries(
        usersList.map((user) => [user.id, { name: user.name, avatar: user.avatar || "" }])
      ),
    [usersList]
  );

  const projectMap = useMemo(
    () =>
      Object.fromEntries(
        Array.from(projects.values()).map((proj) => [proj.id, proj.name])
      ),
    [projects]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Dashboard"
          title="All Company Tasks"
          description="Monitor all tasks across the organization"
        />

        {/* Team Filter */}
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

        <TaskListView
          tasks={visibleTasks}
          employeeMap={employeeMap}
          onTaskClick={setSelectedTask}
        />

        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          assigneeName={selectedTask ? employeeMap[selectedTask.assigneeId]?.name : undefined}
          managerName={selectedTask ? getTaskManager(selectedTask.managerId, selectedTask.assigneeId, usersList)?.name : undefined}
          projectName={selectedTask ? projectMap[selectedTask.projectId] : undefined}
        />
      </div>
    </AppShell>
  );
}
