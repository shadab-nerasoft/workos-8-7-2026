"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/src/components/common/app-shell";
import { DashboardSection } from "@/src/components/sections/dashboard-section";
import { PageHeader } from "@/src/components/sections/page-header";
import {
  useAuthStore,
  useProjectStore,
  useTeamStore,
  useEmployeeStore,
  useTaskStore,
  useActivityStore,
  useDailyReportStore,
} from "@/src/store";
import { MOCK_ANCHOR_DATE } from "@/src/lib/constants";

export default function Home() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  // Composition root: read all dashboard data here, pass down as props.
  const projects = useProjectStore((s) => s.projectsList);
  const teams = useTeamStore((s) => s.teamsList);
  const users = useEmployeeStore((s) => s.usersList);
  const tasks = useTaskStore((s) => s.tasks);
  const activities = useActivityStore((s) => s.activities);
  const allReports = useDailyReportStore((s) => s.reportsList);

  const myReports = useMemo(
    () => (currentUser ? allReports.filter((r) => r.employeeId === currentUser.id) : []),
    [allReports, currentUser],
  );

  const missingReportsCount = useMemo(() => {
    if (!currentUser || currentUser.role !== "employee") return 0;
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
  }, [currentUser, myReports]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const getHeaderInfo = () => {
    switch (currentUser.role) {
      case "admin":
        return {
          eyebrow: "Admin Dashboard",
          title: "Company Health & Performance",
          description: "High-level visibility into company-wide project completion, team productivity, and active bottlenecks."
        };
      case "manager":
        return {
          eyebrow: "Manager Dashboard",
          title: `Managing ${currentUser.department} Team`,
          description: "Track your team's daily reports, task progress, and overall performance metrics."
        };
      default:
        return {
          eyebrow: "Employee Dashboard",
          title: `Welcome back, ${currentUser.name}`,
          description: "Manage your daily tasks, submit your reports, and track your performance."
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <AppShell>
      <PageHeader
        eyebrow={headerInfo.eyebrow}
        title={headerInfo.title}
        description={headerInfo.description}
      />
      <DashboardSection
        currentUser={currentUser}
        projects={projects}
        teams={teams}
        users={users}
        tasks={tasks}
        activities={activities}
        myReports={myReports}
        missingReportsCount={missingReportsCount}
      />
    </AppShell>
  );
}
