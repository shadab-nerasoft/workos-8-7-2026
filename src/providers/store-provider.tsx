"use client";

import { useEffect, useRef } from "react";
import { users } from "@/src/mock-data/users";
import { teams } from "@/src/mock-data/teams";
import { projects } from "@/src/mock-data/projects";
import { tasks } from "@/src/mock-data/tasks";
import { dailyReports } from "@/src/mock-data/daily-reports";
import { activity } from "@/src/mock-data/analytics";
import {
  useAuthStore,
  useEmployeeStore,
  useTeamStore,
  useProjectStore,
  useTaskStore,
  useDailyReportStore,
  useActivityStore,
} from "@/src/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    // Hydrate all stores with mock data
    useEmployeeStore.getState().hydrate(users);
    useTeamStore.getState().hydrate(teams);
    useProjectStore.getState().hydrate(projects);
    useTaskStore.getState().hydrate(tasks);
    useDailyReportStore.getState().hydrate(dailyReports);
    useActivityStore.getState().hydrate(activity);
    
    // Set a default user (e.g. an admin) if not logged in
    const authStore = useAuthStore.getState();
    if (!authStore.isAuthenticated) {
      const defaultUser = users.find((u) => u.role === "admin");
      if (defaultUser) {
        authStore.login(defaultUser);
      }
    }

    initialized.current = true;
  }, []);

  return <>{children}</>;
}
