"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/src/components/common/app-shell";
import { DashboardSection } from "@/src/components/sections/dashboard-section";
import { PageHeader } from "@/src/components/sections/page-header";
import { useAuthStore } from "@/src/store";

export default function Home() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const router = useRouter();

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
      <DashboardSection />
    </AppShell>
  );
}
