"use client";

import type { Task } from "@/src/types";
import { formatDate } from "@/src/lib/utils/format";
import { TaskStatusBadge, PriorityBadge } from "@/src/components/ui/badge";
import { Calendar, Clock } from "iconsax-react";

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  assigneeName?: string;
}

export function TaskCard({ task, onTaskClick, assigneeName }: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";
  const daysUntilDue = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div
      onClick={() => onTaskClick?.(task)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="flex-1 font-semibold text-slate-900 group-hover:text-primary-600">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && <p className="mb-3 line-clamp-2 text-sm text-slate-600">{task.description}</p>}

      <div className="mb-3 flex flex-wrap gap-2">
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex flex-col gap-2 text-xs text-slate-600">
        {assigneeName && <div className="font-medium text-slate-700">👤 {assigneeName}</div>}

        {task.deadline && (
          <div className="flex items-center gap-2">
            {isOverdue ? <Clock className="text-red-500" size={14} /> : <Calendar size={14} />}
            <span className={isOverdue ? "font-medium text-red-600" : ""}>
              {isOverdue ? "Overdue: " : ""}
              {formatDate(task.deadline)}
            </span>
            {daysUntilDue !== null && !isOverdue && <span className="text-slate-500">({daysUntilDue}d left)</span>}
          </div>
        )}
      </div>
    </div>
  );
}
