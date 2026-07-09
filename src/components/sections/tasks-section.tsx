"use client";

import { useMemo, useState } from "react";
import { KanbanBoard } from "@/src/components/ui/kanban-board";
import { TaskModal } from "@/src/components/projects/task-modal";
import { useAuthStore, useTaskStore, useEmployeeStore, useProjectStore } from "@/src/store";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Add } from "iconsax-react";
import { getTaskManager } from "@/src/lib/utils/task-manager";
import type { Task } from "@/src/types";

export function TasksSection() {
  const { currentUser } = useAuthStore();
  const allTasks = useTaskStore((s) => s.getAllTasks());
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  const allProjects = useProjectStore((s) => s.getAllProjects());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const visibleTasks = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === "manager") {
      const teamMembers = allUsers.filter((user) => user.teamId === currentUser.teamId).map((user) => user.id);
      return allTasks.filter((task) => {
        const manager = getTaskManager(task.managerId, task.assigneeId, allUsers);
        return teamMembers.includes(task.assigneeId) || manager?.id === currentUser.id;
      });
    }

    if (currentUser.role === "employee") {
      return allTasks.filter((task) => task.assigneeId === currentUser.id);
    }

    return allTasks;
  }, [allTasks, allUsers, currentUser]);

  const availableProjects = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === "manager") {
      return allProjects.filter((project) => project.teamId === currentUser.teamId);
    }

    if (currentUser.role === "admin") {
      return allProjects;
    }

    const assignedProjectIds = new Set(visibleTasks.map((task) => task.projectId));
    const assignedProjects = allProjects.filter((project) => assignedProjectIds.has(project.id));

    return assignedProjects.length > 0 ? assignedProjects : allProjects;
  }, [allProjects, currentUser, visibleTasks]);

  if (!currentUser) return null;

  const defaultProjectId = availableProjects[0]?.id;
  const modalProjectId = editingTask?.projectId ?? defaultProjectId;

  const openCreateModal = () => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const createButton = (
    <div className="-mt-16 mb-8 flex justify-end sm:-mt-20">
      <button
        type="button"
        onClick={openCreateModal}
        disabled={!defaultProjectId}
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Add size={18} color="currentColor" />
        Create Task
      </button>
    </div>
  );

  const taskModal = modalProjectId ? (
    <TaskModal
      isOpen={isCreateModalOpen}
      onClose={() => {
        setIsCreateModalOpen(false);
        setEditingTask(null);
      }}
      task={editingTask}
      projectId={modalProjectId}
    />
  ) : null;

  const content = visibleTasks.length === 0 ? (
    <EmptyState title="No tasks found" message="There are no tasks available in your current view." />
  ) : (
    <KanbanBoard tasks={visibleTasks} users={allUsers} onTaskSelect={openEditModal} />
  );

  return (
    <>
      {createButton}
      {content}
      {taskModal}
    </>
  );
}
