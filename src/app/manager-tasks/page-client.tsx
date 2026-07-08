"use client";

import { useState, useMemo } from "react";
import { useTaskStore, useEmployeeStore, useProjectStore, useAuthStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { TaskFilterBar } from "@/src/components/tasks/task-filter-bar";
import { TaskListView } from "@/src/components/tasks/task-list-view";
import { TaskStatsCard } from "@/src/components/tasks/task-stats-card";
import { TaskDetailModal } from "@/src/components/tasks/task-detail-modal";
import type { TaskStatus, Task } from "@/src/types";

export default function ManagerTasksPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const tasks = useTaskStore((s) => s.tasksList);
  const usersList = useEmployeeStore((s) => s.usersList);
  const projects = useProjectStore((s) => s.projects);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    priority?: string;
    searchQuery: string;
  }>({ searchQuery: "" });

  // Get team members (get users in same team as manager)
  const teamMemberIds = useMemo(() => {
    if (!currentUser) return [];
    return usersList
      .filter((user) => user.teamId === currentUser.teamId && user.id !== currentUser.id)
      .map((user) => user.id);
  }, [usersList, currentUser]);

  // Get team tasks filtered by current filters
  const teamTasks = useMemo(() => {
    let filtered = tasks.filter((t) => teamMemberIds.includes(t.assigneeId));

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
  }, [tasks, teamMemberIds, filters]);

  const taskStats = useMemo(() => {
    return {
      total: teamTasks.length,
      completed: teamTasks.filter((t) => t.status === "completed").length,
      inProgress: teamTasks.filter((t) => t.status === "in-progress").length,
      overdue: teamTasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date())
        .length,
    };
  }, [teamTasks]);

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
          eyebrow="Team Management"
          title="Team Tasks"
          description="Manage and monitor your team members' tasks"
        />

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
          tasks={teamTasks}
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
          projectName={selectedTask ? projectMap[selectedTask.projectId] : undefined}
        />
      </div>
    </AppShell>
  );
}
