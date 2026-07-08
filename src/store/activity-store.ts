import { create } from "zustand";
import type { Activity } from "@/src/types";

interface ActivityState {
  activities: Activity[];
  hydrate: (activities: Activity[]) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp"> & { id?: string; timestamp?: string }) => void;
  getActivitiesByProject: (projectId: string) => Activity[];
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  hydrate: (activities) =>
    set({ activities }),

  addActivity: (activity) =>
    set((state) => {
      const newActivity: Activity = {
        id: activity.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: activity.timestamp || new Date().toISOString(),
        actorId: activity.actorId,
        action: activity.action,
        subject: activity.subject,
        projectId: activity.projectId,
      };
      // Keep activities in descending order (newest first)
      return { activities: [newActivity, ...state.activities] };
    }),

  getActivitiesByProject: (projectId) =>
    get().activities.filter((act) => act.projectId === projectId),
}));
