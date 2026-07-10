"use client";

import { ActivityTimeline } from "@/src/components/ui/activity-timeline";
import { AnalyticsChart } from "@/src/components/ui/analytics-chart";
import { Card, CardHeader } from "@/src/components/ui/card";
import { StatsGrid } from "@/src/components/ui/stats-grid";
import { ProjectList } from "@/src/components/ui/project-list";
import { KanbanBoard } from "@/src/components/ui/kanban-board";
import { EmptyState } from "@/src/components/ui/empty-state";
import { analytics, dashboardStats } from "@/src/mock-data/analytics";
import type { Activity, DailyReport, Project, Task, Team, User } from "@/src/types";

interface DashboardSectionProps {
  currentUser: User;
  projects: Project[];
  teams: Team[];
  users: User[];
  tasks: Task[];
  activities: Activity[];
  /** Reports for the current user (employee view). Pass [] for admin/manager. */
  myReports?: DailyReport[];
  /** Count of missing daily reports (employee view), computed by the page. */
  missingReportsCount?: number;
}

/**
 * Pure presentational dashboard. All data is passed in by the page
 * (composition root) — this component never reads stores or services.
 */
export function DashboardSection({
  currentUser,
  projects,
  teams,
  users,
  tasks,
  activities,
  myReports = [],
  missingReportsCount = 0,
}: DashboardSectionProps) {
  if (currentUser.role === "admin") {
    return (
      <div className="space-y-6">
        <StatsGrid stats={dashboardStats} />
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader title="Company Analytics" />
            <div className="p-5">
              <AnalyticsChart data={analytics} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Recent Activity" />
            <ActivityTimeline activity={activities} users={users} />
          </Card>
        </div>
        <Card>
          <CardHeader title="Project Health" />
          <ProjectList projects={projects} teams={teams} users={users} />
        </Card>
      </div>
    );
  }

  if (currentUser.role === "manager") {
    const teamProjects = projects.filter((p) => p.teamId === currentUser.teamId);

    return (
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader title="Team Delivery Trend" />
            <div className="p-5">
              <AnalyticsChart data={analytics.slice(6)} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Team Activity" />
            <ActivityTimeline activity={activities.slice(0, 4)} users={users} />
          </Card>
        </div>
        <Card>
          <CardHeader title="Team Projects" />
          {teamProjects.length > 0 ? (
            <ProjectList projects={teamProjects} teams={teams} users={users} />
          ) : (
            <EmptyState title="No active projects" message="Your team doesn't have any active projects right now." />
          )}
        </Card>
      </div>
    );
  }

  // Employee view
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const myProjects = projects.filter((p) => myTasks.some((t) => t.projectId === p.id));
  const submittedCount = myReports.filter((r) => r.status === "submitted").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted Reports</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">{submittedCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Reports</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">{missingReportsCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Performance</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1">{currentUser.performance}%</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Utilization</span>
          <span className="text-2xl font-extrabold text-primary-600 mt-1">{currentUser.utilization}%</span>
        </div>
      </div>

      <Card>
        <CardHeader title="My Active Tasks" />
        <div className="p-5">
          {myTasks.length > 0 ? (
            <KanbanBoard tasks={myTasks} users={users} />
          ) : (
            <EmptyState title="No tasks assigned" message="You don't have any active tasks on your board." />
          )}
        </div>
      </Card>
      <Card>
        <CardHeader title="Projects I'm Contributing To" />
        {myProjects.length > 0 ? (
          <ProjectList projects={myProjects} teams={teams} users={users} />
        ) : (
          <EmptyState title="No active projects" message="You aren't contributing to any active projects right now." />
        )}
      </Card>
    </div>
  );
}
