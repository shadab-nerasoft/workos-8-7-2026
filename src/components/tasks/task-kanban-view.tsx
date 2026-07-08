"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/src/types";
import { TaskCard } from "./task-card";

interface TaskKanbanViewProps {
  tasks: Task[];
  employeeMap?: Record<string, { name: string; avatar: string }>;
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUSES: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "completed"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  completed: "Completed",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-slate-50 border-slate-200",
  todo: "bg-orange-50 border-orange-200",
  "in-progress": "bg-blue-50 border-blue-200",
  review: "bg-purple-50 border-purple-200",
  completed: "bg-green-50 border-green-200",
};

export function TaskKanbanView({
  tasks,
  employeeMap,
  onTaskClick,
  onStatusChange,
}: TaskKanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      onStatusChange?.(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUSES.map((status) => (
        <div
          key={status}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(status)}
          className={`flex min-h-96 flex-col rounded-lg border-2 border-dashed p-4 transition-colors ${STATUS_COLORS[status]}`}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">{STATUS_LABELS[status]}</h3>
            <p className="text-sm text-slate-600">{tasksByStatus[status].length} tasks</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {tasksByStatus[status].map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                className="cursor-move"
              >
                <TaskCard
                  task={task}
                  onTaskClick={onTaskClick}
                  assigneeName={employeeMap?.[task.assigneeId]?.name}
                />
              </div>
            ))}

            {tasksByStatus[status].length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-400">Drop tasks here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
