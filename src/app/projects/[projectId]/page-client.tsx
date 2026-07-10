"use client";

import { useMemo, useState, use } from "react";
import { Add } from "iconsax-react";
import { AppShell } from "@/src/components/common/app-shell";
import { ProjectBoardTab } from "@/src/components/projects/project-board-tab";
import { ProjectListTab } from "@/src/components/projects/project-list-tab";
import { ProjectActivityTab } from "@/src/components/projects/project-activity-tab";
import { ProjectFilesTab } from "@/src/components/projects/project-files-tab";
import { ProjectCalendarTab } from "@/src/components/projects/project-calendar-tab";
import { TaskModal, type TaskModalSubmitValues } from "@/src/components/projects/task-modal";
import { EmptyState } from "@/src/components/ui/empty-state";
import { can } from "@/src/lib/permissions";
import { tasksApi } from "@/src/services";
import {
  useActivityStore,
  useAuthStore,
  useEmployeeStore,
  useProjectStore,
  useTaskStore,
} from "@/src/store";
import type { Task } from "@/src/types";

type TabOption = "board" | "list" | "calendar" | "activity" | "files";

/**
 * Composition root for /projects/[projectId].
 * Owns all data access, scoping, permissions, mutations, and modal state.
 * Every tab component is pure — props in, callbacks out.
 */
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const unwrappedParams = use(params);
  const currentUser = useAuthStore((s) => s.currentUser);
  const projectsList = useProjectStore((s) => s.projectsList);
  const allTasks = useTaskStore((s) => s.tasks);
  const users = useEmployeeStore((s) => s.usersList);
  const allActivities = useActivityStore((s) => s.activities);

  const [activeTab, setActiveTab] = useState<TabOption>("board");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const project = projectsList.find((p) => p.id === unwrappedParams.projectId);

  // ----- Data scoping (owned by the page) -----
  const projectTasks = useMemo(
    () => allTasks.filter((t) => t.projectId === unwrappedParams.projectId),
    [allTasks, unwrappedParams.projectId],
  );

  const projectActivities = useMemo(
    () => allActivities.filter((a) => a.projectId === unwrappedParams.projectId),
    [allActivities, unwrappedParams.projectId],
  );

  const teamMembers = useMemo(
    () => (project ? users.filter((u) => u.teamId === project.teamId) : []),
    [users, project],
  );

  // Projects the current user may move a task into (used by the task modal).
  const availableProjects = useMemo(() => {
    if (!currentUser || !project) return [];
    if (can(currentUser, "project:view-all")) return projectsList;

    if (currentUser.role === "manager") {
      const managed = projectsList.filter(
        (p) => p.ownerId === currentUser.id || p.teamId === currentUser.teamId,
      );
      return managed.some((p) => p.id === project.id) ? managed : [project, ...managed];
    }

    const assignedProjectIds = new Set(
      allTasks.filter((t) => t.assigneeId === currentUser.id).map((t) => t.projectId),
    );
    const assigned = projectsList.filter((p) => assignedProjectIds.has(p.id));
    return assigned.some((p) => p.id === project.id) ? assigned : [project, ...assigned];
  }, [currentUser, project, projectsList, allTasks]);

  // ----- Permissions (owned by the page) -----
  const isEmployee = currentUser?.role === "employee";
  const canDragTask = (task: Task) =>
    !isEmployee || task.assigneeId === currentUser?.id;
  const isTaskReadOnly =
    !!editingTask &&
    !can(currentUser, "task:edit", { task: editingTask });

  // ----- Mutations (route through the API-ready service layer) -----
  const handleTaskMove = (taskId: string, status: Task["status"]) => {
    void tasksApi.moveTask(taskId, status);
  };

  const handleTaskSubmit = (values: TaskModalSubmitValues) => {
    if (editingTask) {
      void tasksApi.updateTask(editingTask.id, values);
    } else {
      void tasksApi.createTask(values);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Stores hydrate in a client-side effect, so projectsList is empty during
  // SSR and the first client render. Treat that as loading — only report
  // "not found" once data actually exists.
  if (projectsList.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-500" aria-label="Loading project" />
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <EmptyState
            title="Project not found"
            message="This project does not exist or may have been removed."
          />
        </div>
      </AppShell>
    );
  }

  // Block employees not assigned to any tasks in this project
  const isAssigned = projectTasks.some((t) => t.assigneeId === currentUser?.id);
  if (isEmployee && !isAssigned) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <EmptyState
            title="Access restricted"
            message="You are not assigned to this project."
          />
        </div>
      </AppShell>
    );
  }

  const displayedMembers = teamMembers.slice(0, 3);
  const remainingCount = teamMembers.length - 3;

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-10 pt-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              {project.description || "Complete redesign of company website."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              {displayedMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="group/avatar relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1"
                >
                  {emp.avatar}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="group/avatar relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-600 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1">
                  +{remainingCount}
                </div>
              )}
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius)] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50">
              <Add color="#2563eb" size={18} variant="Outline" />
              Invite
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {(["board", "list", "calendar", "activity", "files"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors
                  ${activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "board" && (
            <ProjectBoardTab
              tasks={projectTasks}
              users={users}
              canDragTask={canDragTask}
              onTaskMove={handleTaskMove}
              onCreateTask={openCreateModal}
              onEditTask={openEditModal}
            />
          )}
          {activeTab === "list" && <ProjectListTab tasks={projectTasks} users={users} />}
          {activeTab === "calendar" && (
            <ProjectCalendarTab
              tasks={projectTasks}
              users={users}
              onTaskSelect={openEditModal}
            />
          )}
          {activeTab === "activity" && (
            <ProjectActivityTab activities={projectActivities} users={users} />
          )}
          {activeTab === "files" && <ProjectFilesTab projectId={project.id} />}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        projectId={project.id}
        users={users}
        availableProjects={availableProjects}
        isReadOnly={isTaskReadOnly}
        lockAssigneeTo={isEmployee ? (currentUser?.id ?? null) : null}
        onSubmit={handleTaskSubmit}
      />
    </AppShell>
  );
}
