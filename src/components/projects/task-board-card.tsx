"use client";

import { useMemo } from "react";
import { PriorityBadge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/utils/format";
import type { Task, User } from "@/src/types";

// Helper function to generate a consistent color blob based on a string (like task id)
function getColorsForString(str: string) {
  const colors = [
    { bg: "bg-primary-400/10", blobHover: "group-hover:bg-primary-400/20" },
    { bg: "bg-blue-300/10", blobHover: "group-hover:bg-blue-300/20" },
    { bg: "bg-indigo-400/10", blobHover: "group-hover:bg-indigo-400/20" },
    { bg: "bg-purple-300/10", blobHover: "group-hover:bg-purple-300/20" },
    { bg: "bg-rose-300/10", blobHover: "group-hover:bg-rose-300/20" },
    { bg: "bg-amber-300/10", blobHover: "group-hover:bg-amber-300/20" },
    { bg: "bg-emerald-300/10", blobHover: "group-hover:bg-emerald-300/20" },
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index1 = Math.abs(hash) % colors.length;
  const index2 = Math.abs(hash * 31) % colors.length;
  
  return { color1: colors[index1], color2: colors[index2] };
}

interface TaskBoardCardProps {
  task: Task;
  assignee?: User;
  onClick?: () => void;
}

export function TaskBoardCard({ task, assignee, onClick }: TaskBoardCardProps) {
  const { color1, color2 } = useMemo(() => getColorsForString(task.id), [task.id]);

  return (
    <div
      onClick={onClick}
      className="surface-card group relative flex flex-col overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      {/* Soft background gradients for that premium glass look */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${color1.bg} blur-2xl transition-all duration-500 ${color1.blobHover}`}
      />
      <div
        className={`absolute -bottom-8 -left-8 h-28 w-28 rounded-full ${color2.bg} blur-2xl transition-all duration-500 ${color2.blobHover}`}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Top Row: Date and Priority */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-xs font-semibold">{formatDate(task.deadline)}</span>
          </div>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Middle: Title */}
        <h3 className="mb-6 text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-primary-600">
          {task.title}
        </h3>

        {/* Bottom: Team Members and Tags */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {assignee ? (
              <div className="group/avatar relative flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1">
                {assignee.avatar}
                <div className="pointer-events-none absolute -top-8 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center opacity-0 transition-all duration-200 group-hover/avatar:opacity-100 group-hover/avatar:-translate-y-1">
                  <span className="whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg ring-1 ring-white/10">
                    {assignee.name}
                  </span>
                  <div className="-mt-1 h-2 w-2 rotate-45 rounded-sm bg-slate-900"></div>
                </div>
              </div>
            ) : (
              <div className="group/avatar relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1">
                NA
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              #Ui
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              #Design
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
