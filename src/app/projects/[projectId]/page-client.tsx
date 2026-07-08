"use client";

import { useProjectStore, useEmployeeStore, useAuthStore, useTaskStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { notFound } from "next/navigation";
import { Add } from "iconsax-react";
import { useState, use } from "react";
import { ProjectBoardTab } from "@/src/components/projects/project-board-tab";
import { ProjectListTab } from "@/src/components/projects/project-list-tab";
import { ProjectActivityTab } from "@/src/components/projects/project-activity-tab";
import { ProjectFilesTab } from "@/src/components/projects/project-files-tab";
import { ProjectCalendarTab } from "@/src/components/projects/project-calendar-tab";
import { EmptyState } from "@/src/components/ui/empty-state";

type TabOption = "board" | "list" | "calendar" | "activity" | "files";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const unwrappedParams = use(params);
  const project = useProjectStore((s) => s.getProjectById(unwrappedParams.projectId));
  const getUsersByTeam = useEmployeeStore((s) => s.getUsersByTeam);
  const { currentUser } = useAuthStore();
  const allTasks = useTaskStore((s) => s.getAllTasks());

  const [activeTab, setActiveTab] = useState<TabOption>("board");

  if (!project) {
    notFound();
  }

  // Block employees not assigned to any tasks in this project
  const isAssigned = allTasks.some(
    (t) => t.projectId === project.id && t.assigneeId === currentUser?.id
  );
  if (currentUser?.role === "employee" && !isAssigned) {
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

  const teamMembers = getUsersByTeam(project.teamId);
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
          {activeTab === "board" && <ProjectBoardTab projectId={project.id} />}
          {activeTab === "list" && <ProjectListTab projectId={project.id} />}
          {activeTab === "calendar" && <ProjectCalendarTab projectId={project.id} />}
          {activeTab === "activity" && <ProjectActivityTab projectId={project.id} />}
          {activeTab === "files" && <ProjectFilesTab projectId={project.id} />}
        </div>
      </div>
    </AppShell>
  );
}
