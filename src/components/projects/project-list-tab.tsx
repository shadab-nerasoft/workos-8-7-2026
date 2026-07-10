"use client";

import { useMemo } from "react";
import { TaskStatusBadge, PriorityBadge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/utils/format";
import type { Task, User } from "@/src/types";

/** Pure presentational list view. Tasks are pre-scoped to the project by the page. */
export function ProjectListTab({ tasks, users }: { tasks: Task[]; users: User[] }) {

  // Group tasks by assignee
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};
    
    // Initialize groups for all users involved + Unassigned
    users.forEach(u => groups[u.id] = []);
    groups["unassigned"] = [];

    tasks.forEach(task => {
      if (task.assigneeId && groups[task.assigneeId]) {
        groups[task.assigneeId].push(task);
      } else {
        groups["unassigned"].push(task);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([, groupTasks]) => groupTasks.length > 0);
  }, [tasks, users]);

  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <div className="flex flex-col gap-8 pb-8">
      {groupedTasks.map(([userId, userTasks]) => {
        const user = getUser(userId);
        return (
          <div key={userId} className="flex flex-col gap-4">
            {/* Group Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {user.avatar}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    NA
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Unassigned</h3>
                </div>
              )}
              <span className="flex h-6 items-center justify-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-500">
                {userTasks.length} tasks
              </span>
            </div>

            {/* Tasks List */}
            <div className="flex flex-col gap-3">
              {userTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <TaskStatusBadge status={task.status} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1 max-w-lg">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Due:</span>
                      <span className="text-xs font-bold text-slate-700">{formatDate(task.deadline)}</span>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {groupedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <div className="mb-2 rounded-full bg-slate-100 p-3">
            <svg
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No tasks found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating a new task for this project.
          </p>
        </div>
      )}
    </div>
  );
}
