"use client";

import { ActivityTimeline } from "@/src/components/ui/activity-timeline";
import { AnalyticsChart } from "@/src/components/ui/analytics-chart";
import { Card, CardHeader } from "@/src/components/ui/card";
import { StatsGrid } from "@/src/components/ui/stats-grid";
import { ProjectList } from "@/src/components/ui/project-list";
import { KanbanBoard } from "@/src/components/ui/kanban-board";
import { useAuthStore, useProjectStore, useTeamStore, useEmployeeStore, useTaskStore, useActivityStore, useDailyReportStore } from "@/src/store";
import { analytics, dashboardStats } from "@/src/mock-data/analytics";
import { EmptyState } from "@/src/components/ui/empty-state";
import { MOCK_ANCHOR_DATE } from "@/src/lib/constants";

export function DashboardSection() {
  const { currentUser } = useAuthStore();
  const allProjects = useProjectStore((s) => s.getAllProjects());
  const allTeams = useTeamStore((s) => s.getAllTeams());
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  const allTasks = useTaskStore((s) => s.getAllTasks());
  const activities = useActivityStore((s) => s.activities);

  if (!currentUser) return null;

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
            <ActivityTimeline activity={activities} users={allUsers} />
          </Card>
        </div>
        <Card>
          <CardHeader title="Project Health" />
          <ProjectList projects={allProjects} teams={allTeams} users={allUsers} />
        </Card>
      </div>
    );
  }

  if (currentUser.role === "manager") {
    const teamProjects = allProjects.filter((p) => p.teamId === currentUser.teamId);
    
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
            <ActivityTimeline activity={activities.slice(0, 4)} users={allUsers} />
          </Card>
        </div>
        <Card>
          <CardHeader title="Team Projects" />
          {teamProjects.length > 0 ? (
            <ProjectList projects={teamProjects} teams={allTeams} users={allUsers} />
          ) : (
            <EmptyState title="No active projects" message="Your team doesn't have any active projects right now." />
          )}
        </Card>
      </div>
    );
  }

  // Employee View
  const myTasks = allTasks.filter((t) => t.assigneeId === currentUser.id);
  const myProjects = allProjects.filter((p) => myTasks.some((t) => t.projectId === p.id));

  const myReports = useDailyReportStore.getState().getReportsByEmployeeId(currentUser.id);
  const submittedCount = myReports.filter((r) => r.status === "submitted").length;

  const getMissingCount = () => {
    let missing = 0;
    for (let i = 0; i < 15; i++) {
      const d = new Date(MOCK_ANCHOR_DATE);
      d.setDate(MOCK_ANCHOR_DATE.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!isWeekend && !myReports.some((r) => r.date === dateString)) {
        missing++;
      }
    }
    return missing;
  };

  const missingCount = getMissingCount();

  return (
    <div className="space-y-6">
      {/* Employee Personal stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted Reports</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">{submittedCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Reports</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1">{missingCount}</span>
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
            <KanbanBoard tasks={myTasks} users={allUsers} />
          ) : (
            <EmptyState title="No tasks assigned" message="You don't have any active tasks on your board." />
          )}
        </div>
      </Card>
      <Card>
        <CardHeader title="Projects I'm Contributing To" />
        {myProjects.length > 0 ? (
          <ProjectList projects={myProjects} teams={allTeams} users={allUsers} />
        ) : (
          <EmptyState title="No active projects" message="You aren't contributing to any active projects right now." />
        )}
      </Card>
    </div>
  );
}
