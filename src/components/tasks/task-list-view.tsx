"use client";

import type { Task } from "@/src/types";
import { TaskCard } from "./task-card";
import { EmptyState } from "@/src/components/ui/empty-state";

interface TaskListViewProps {
  tasks: Task[];
  employeeMap?: Record<string, { name: string; avatar: string }>;
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
}

export function TaskListView({ tasks, employeeMap, onTaskClick, isLoading }: TaskListViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState title="No tasks found" message="Try adjusting your filters or create a new task." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskClick={onTaskClick}
          assigneeName={employeeMap?.[task.assigneeId]?.name}
          managerName={task.managerId ? employeeMap?.[task.managerId]?.name : undefined}
        />
      ))}
    </div>
  );
}
