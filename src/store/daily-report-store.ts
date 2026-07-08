import { create } from "zustand";
import type { DailyReport } from "@/src/types";

interface DailyReportState {
  reports: Map<string, DailyReport>;
  reportsList: DailyReport[];
  hydrate: (reports: DailyReport[]) => void;
  createReport: (report: DailyReport) => void;
  updateReport: (id: string, updates: Partial<DailyReport>) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => DailyReport | undefined;
  getReportsByEmployeeId: (employeeId: string) => DailyReport[];
  getReportsByManagerId: (managerId: string) => DailyReport[];
  getReportsByDate: (date: string) => DailyReport[];
}

export const useDailyReportStore = create<DailyReportState>((set, get) => ({
  reports: new Map(),
  reportsList: [],

  hydrate: (reports) =>
    set({ reports: new Map(reports.map((r) => [r.id, r])), reportsList: reports }),

  createReport: (report) =>
    set((state) => {
      const next = new Map(state.reports);
      next.set(report.id, report);
      return { reports: next, reportsList: Array.from(next.values()) };
    }),

  updateReport: (id, updates) =>
    set((state) => {
      const existing = state.reports.get(id);
      if (!existing) return state;
      const next = new Map(state.reports);
      next.set(id, { ...existing, ...updates });
      return { reports: next, reportsList: Array.from(next.values()) };
    }),

  deleteReport: (id) =>
    set((state) => {
      const next = new Map(state.reports);
      next.delete(id);
      return { reports: next, reportsList: Array.from(next.values()) };
    }),

  getReportById: (id) => get().reports.get(id),

  getReportsByEmployeeId: (employeeId) =>
    get().reportsList.filter((r) => r.employeeId === employeeId),

  getReportsByManagerId: (managerId) =>
    get().reportsList.filter((r) => r.managerId === managerId),

  getReportsByDate: (date) =>
    get().reportsList.filter((r) => r.date === date),
}));
