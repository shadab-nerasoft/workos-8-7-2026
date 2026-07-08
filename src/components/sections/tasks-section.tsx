"use client";

import Link from "next/link";
import { KanbanBoard } from "@/src/components/ui/kanban-board";
import { useAuthStore, useTaskStore, useEmployeeStore } from "@/src/store";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Add } from "iconsax-react";

export function TasksSection() {
  const { currentUser } = useAuthStore();
  const allTasks = useTaskStore((s) => s.getAllTasks());
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  
  if (!currentUser) return null;

  // Filter tasks based on role:
  // Admin/Manager: all tasks for projects they care about (for simplicity, we'll show all tasks for Admin, team tasks for Manager)
  // Employee: only assigned tasks
  let visibleTasks = allTasks;
  
  if (currentUser.role === "manager") {
    const teamMembers = allUsers.filter(u => u.teamId === currentUser.teamId).map(u => u.id);
    visibleTasks = allTasks.filter(t => teamMembers.includes(t.assigneeId));
  } else if (currentUser.role === "employee") {
    visibleTasks = allTasks.filter(t => t.assigneeId === currentUser.id);
  }

  const createButton = (
    <div className="-mt-16 mb-8 flex justify-end sm:-mt-20">
      <Link
        href="/daily-report"
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Add size={18} color="currentColor" />
        Create Task
      </Link>
    </div>
  );

  if (visibleTasks.length === 0) {
    return (
      <>
        {createButton}
        <EmptyState title="No tasks found" message="There are no tasks available in your current view." />
      </>
    );
  }

  return (
    <>
      {createButton}
      <KanbanBoard tasks={visibleTasks} users={allUsers} />
    </>
  );
}
