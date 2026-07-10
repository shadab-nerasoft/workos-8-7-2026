"use client";

import { useMemo, useState } from "react";
import { Add, ArrowRight2 } from "iconsax-react";
import { TaskBoardCard } from "./task-board-card";
import { StatusTasksModal } from "./status-tasks-modal";
import { titleCase } from "@/src/lib/utils/format";
import type { TaskStatus, Task, User } from "@/src/types";

const boardColumns: TaskStatus[] = ["todo", "in-progress", "completed"];

interface ProjectBoardTabProps {
  /** Tasks pre-scoped to the project by the page. */
  tasks: Task[];
  users: User[];
  /** Permission check for dragging, computed by the page. */
  canDragTask: (task: Task) => boolean;
  /** Called when a task is dropped in a new column. The page owns persistence. */
  onTaskMove: (taskId: string, status: TaskStatus) => void;
  /** Called to open the create modal. The page owns the modal. */
  onCreateTask: () => void;
  /** Called to open the edit modal for a task. The page owns the modal. */
  onEditTask: (task: Task) => void;
}

/** Pure presentational kanban board. Data, permissions, and modals come from the page. */
export function ProjectBoardTab({
  tasks,
  users,
  canDragTask,
  onTaskMove,
  onCreateTask,
  onEditTask,
}: ProjectBoardTabProps) {
  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  // Status View All Modal State
  const [viewAllStatus, setViewAllStatus] = useState<TaskStatus | null>(null);

  // Native Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (!canDragTask(task)) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(task.id);
    e.dataTransfer.effectAllowed = "move";

    // Fallback: apply a class to the body to change cursor globally during native drag if needed
    document.body.classList.add('cursor-grabbing');
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    document.body.classList.remove('cursor-grabbing');
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onTaskMove(draggedTaskId, status);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
    document.body.classList.remove('cursor-grabbing');
  };

  const grouped = useMemo(
    () =>
      boardColumns.map((status) => ({
        status,
        tasks: tasks.filter((t) => t.status === status || (status === "completed" && t.status === "review")),
      })),
    [tasks],
  );

  return (
    <>
      <div className={`relative ${draggedTaskId ? "cursor-grabbing" : ""}`}>
        {/* Decorative background blobs for glassmorphism to look beautiful */}
        <div className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-primary-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/20 blur-[100px]" />

        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {grouped.map((group) => {
            const isDragOver = dragOverColumn === group.status;
            const visibleTasks = group.tasks.slice(0, 5);
            const hiddenCount = group.tasks.length - visibleTasks.length;

            return (
              <div
                key={group.status}
                className="flex flex-col gap-4"
                onDragOver={(e) => handleDragOver(e, group.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.status)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {group.status === "completed" ? "Done" : titleCase(group.status)}
                  </h3>
                  <span className="flex h-5 items-center justify-center rounded-full bg-white/60 px-2 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md">
                    {group.tasks.length}
                  </span>
                </div>

                {/* Cards Container with Glassmorphism */}
                <div
                  className={`relative flex min-h-[500px] flex-col gap-4 rounded-3xl border p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ${isDragOver
                    ? "border-primary-400 bg-primary-50/40 ring-4 ring-primary-500/20 scale-[1.02]"
                    : "border-white/60 bg-white/40 ring-1 ring-slate-900/5 hover:bg-white/50"
                    }`}
                >
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-primary-50/20" />

                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canDragTask(task)}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`transition-opacity ${draggedTaskId === task.id ? "opacity-30 cursor-grabbing" : "opacity-100 cursor-grab"} ${!canDragTask(task) ? "cursor-not-allowed" : ""}`}
                    >
                      <TaskBoardCard
                        task={task}
                        assignee={usersById.get(task.assigneeId)}
                        onClick={() => onEditTask(task)}
                      />
                    </div>
                  ))}

                  {/* View All Button */}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setViewAllStatus(group.status)}
                      className="group flex w-full items-center justify-between rounded-xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-primary-600"
                    >
                      <span>+{hiddenCount} more tasks</span>
                      <ArrowRight2 size={16} variant="Outline" className="transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  {/* Add Task Button inside column */}
                  <button
                    onClick={onCreateTask}
                    className="group mt-auto flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 py-3 pl-3 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur-md transition-all hover:border-primary-400 hover:bg-white/80 hover:text-primary-700"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm transition-transform group-hover:scale-110">
                      <Add color="#2563eb" size={16} variant="Outline" />
                    </div>
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewAllStatus && (
        <StatusTasksModal
          isOpen={!!viewAllStatus}
          onClose={() => setViewAllStatus(null)}
          status={viewAllStatus}
          projectTasks={tasks}
          users={users}
          onEditTask={onEditTask}
        />
      )}
    </>
  );
}
