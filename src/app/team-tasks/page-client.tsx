"use client";

import { useState, useMemo } from "react";
import { useTaskStore, useEmployeeStore, useProjectStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { TaskFilterBar } from "@/src/components/tasks/task-filter-bar";
import { TaskListView } from "@/src/components/tasks/task-list-view";
import { TaskKanbanView } from "@/src/components/tasks/task-kanban-view";
import { TaskStatsCard } from "@/src/components/tasks/task-stats-card";
import { TaskDetailModal } from "@/src/components/tasks/task-detail-modal";
import { Grid2, Menu } from "iconsax-react";
import type { TaskStatus, Task } from "@/src/types";

type ViewMode = "list" | "kanban";

export default function TeamTasksPage() {
  const tasks = useTaskStore((s) => s.tasksList);
  const usersList = useEmployeeStore((s) => s.usersList);
  const projects = useProjectStore((s) => s.projects);
  const updateTask = useTaskStore((s) => s.updateTask);
  const moveTask = useTaskStore((s) => s.moveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    priority?: string;
    searchQuery: string;
  }>({ searchQuery: "" });

  // Get filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

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
  }, [tasks, filters]);

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date())
        .length,
    };
  }, [tasks]);

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
        <div className="flex items-center justify-between">
          <div>
            <PageHeader
              eyebrow="Collaboration"
              title="Team Tasks"
              description="Organize and track all team tasks"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-2 ${
                viewMode === "list"
                  ? "bg-primary-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="List view"
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
            >
              <Grid2 size={20} />
            </button>
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

        {viewMode === "list" ? (
          <TaskListView
            tasks={filteredTasks}
            employeeMap={employeeMap}
            onTaskClick={setSelectedTask}
          />
        ) : (
          <TaskKanbanView
            tasks={filteredTasks}
            employeeMap={employeeMap}
            onTaskClick={setSelectedTask}
            onStatusChange={moveTask}
          />
        )}

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
