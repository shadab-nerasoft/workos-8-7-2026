"use client";

import Link from "next/link";
import { CalendarTick } from "iconsax-react";
import { ProjectStatusBadge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/utils/format";
import { useEmployeeStore } from "@/src/store";
import type { Project } from "@/src/types";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const getUsersByTeam = useEmployeeStore((s) => s.getUsersByTeam);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const teamMembers = getUsersByTeam(project.teamId);
        const displayedMembers = teamMembers.slice(0, 3);
        const remainingCount = teamMembers.length - 3;

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="surface-card group relative flex flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Soft background gradients for that premium glass look */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/10 blur-3xl transition-all duration-500 group-hover:bg-primary-400/20" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl transition-all duration-500 group-hover:bg-blue-300/20" />

            <div className="relative z-10 flex h-full flex-col">
              {/* Top Row: Date and Status */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarTick size={30} variant="Linear" color="#2563EB" />
                  <span className="text-xs font-semibold">{formatDate(project.dueDate)}</span>
                </div>
                <ProjectStatusBadge status={project.status} />
              </div>

              {/* Middle: Title */}
              <h3 className="mb-8 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-primary-600">
                {project.name}
              </h3>

              {/* Bottom: Team Members and Progress */}
              <div className="mt-auto flex items-center justify-between border-t border-slate-100/50 pt-5">
                <div className="flex items-center -space-x-2">
                  {displayedMembers.map((emp) => (
                    <div
                      key={emp.id}
                      className="group/avatar relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1"
                    >
                      {emp.avatar}
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-10 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center opacity-0 transition-all duration-200 group-hover/avatar:opacity-100 group-hover/avatar:-translate-y-1">
                        <span className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10">
                          {emp.name}
                        </span>
                        <div className="-mt-1 h-2 w-2 rotate-45 rounded-sm bg-slate-900"></div>
                      </div>
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div
                      className="group/avatar relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-600 shadow-sm ring-2 ring-white transition-transform hover:z-20 hover:-translate-y-1"
                    >
                      +{remainingCount}
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-10 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center opacity-0 transition-all duration-200 group-hover/avatar:opacity-100 group-hover/avatar:-translate-y-1">
                        <span className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10">
                          {remainingCount} more
                        </span>
                        <div className="-mt-1 h-2 w-2 rotate-45 rounded-sm bg-slate-900"></div>
                      </div>
                    </div>
                  )}
                  {teamMembers.length === 0 && (
                    <div className="text-[11px] font-medium text-slate-400">No team assigned</div>
                  )}
                </div>

                {/* Progress tag / bar style */}
                <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100 transition-colors group-hover:bg-primary-50 group-hover:ring-primary-100">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-primary-700">{project.progress}%</span>
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200 group-hover:bg-primary-200">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
