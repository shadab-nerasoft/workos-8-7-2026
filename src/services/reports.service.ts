import { useDailyReportStore } from "@/src/store/daily-report-store";
import type { DailyReport } from "@/src/types";

/**
 * Daily reports service — the single API seam for report data.
 * TODAY: mock/Zustand. LATER: swap bodies to fetch("/api/reports...").
 */

export const reportsApi = {
  async getReports(): Promise<DailyReport[]> {
    return useDailyReportStore.getState().reportsList;
  },

  async createReport(report: DailyReport): Promise<DailyReport> {
    // LATER: POST /api/reports
    useDailyReportStore.getState().createReport(report);
    return report;
  },

  async updateReport(id: string, updates: Partial<DailyReport>): Promise<void> {
    // LATER: PATCH /api/reports/:id
    useDailyReportStore.getState().updateReport(id, updates);
  },

  async deleteReport(id: string): Promise<void> {
    // LATER: DELETE /api/reports/:id
    useDailyReportStore.getState().deleteReport(id);
  },
};
