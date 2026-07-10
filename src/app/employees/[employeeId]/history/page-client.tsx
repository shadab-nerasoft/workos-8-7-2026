"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useEmployeeStore, useDailyReportStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, InfoCircle } from "iconsax-react";
import { Badge } from "@/src/components/ui/badge";
import { generateHtmlEmail } from "@/src/reports/utils/email-template";
import { Modal } from "@/src/components/ui/modal";
import { MOCK_ANCHOR_DATE } from "@/src/lib/constants";
import type { DailyReport, TaskLogEntry, MeetingCallEntry } from "@/src/types";

type DateFilter = "today" | "7days" | "15days" | "30days" | "all";
type HistoryRow = {
  date: string;
  tasksSummary: string;
  status: "submitted" | "draft" | "missing";
  hoursLogged: string;
  completion: string;
  report?: DailyReport;
};

const datePresets: { key: DateFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7days", label: "7 Days" },
  { key: "15days", label: "15 Days" },
  { key: "30days", label: "30 Days" },
  { key: "all", label: "All Days" },
];

const parseTimeToHours = (val: string): number => {
  if (!val) return 0;
  const rawDecimalMatch = val.match(/^(\d+(?:\.\d+)?)\s*(?:h|hrs|hours)?$/i);
  if (rawDecimalMatch) {
    return parseFloat(rawDecimalMatch[1]);
  }
  const hoursMatch = val.match(/(\d+)\s*h/i);
  const minsMatch = val.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours + minutes / 60;
};

export default function EmployeeHistoryPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const unwrappedParams = use(params);
  const employeeId = unwrappedParams.employeeId;

  // Reactive selectors — getState() in useMemo would never update after
  // the stores hydrate client-side.
  const usersList = useEmployeeStore((s) => s.usersList);
  const reportsList = useDailyReportStore((s) => s.reportsList);

  const employee = useMemo(
    () => usersList.find((u) => u.id === employeeId),
    [usersList, employeeId],
  );
  const employeeReports = useMemo(
    () => reportsList.filter((r) => r.employeeId === employeeId),
    [reportsList, employeeId],
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // Stores hydrate client-side; empty usersList means loading, not a 404.
  if (usersList.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-500" aria-label="Loading history" />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    notFound();
  }

  // Calculate stats based on all history
  const submittedCount = employeeReports.filter(r => r.status === "submitted").length;

  // Generate rows for dates including simulated missing days
  const getFilteredRows = () => {
    const rows: HistoryRow[] = [];

    // Anchor calculations around MOCK_ANCHOR_DATE (as in mock database)
    let limitDays = 30; // default for 'all'
    if (dateFilter === "today") limitDays = 1;
    if (dateFilter === "7days") limitDays = 7;
    if (dateFilter === "15days") limitDays = 15;
    if (dateFilter === "30days") limitDays = 30;
    if (dateFilter === "all") limitDays = 60; // show wider history

    for (let i = 0; i < limitDays; i++) {
      const d = new Date(MOCK_ANCHOR_DATE);
      d.setDate(MOCK_ANCHOR_DATE.getDate() - i);
      const dateString = d.toISOString().split("T")[0];

      // Check if weekend (0=Sunday, 6=Saturday)
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const report = employeeReports.find((r) => r.date === dateString);

      if (report) {
        const hours = report.taskLogs.reduce((sum, t) => sum + parseTimeToHours(t.timeSpent), 0);
        const tasksSummary = report.taskLogs.map((t) => t.title || t.description).join(", ");
        rows.push({
          date: dateString,
          tasksSummary: tasksSummary || "Daily tasks logged",
          status: report.status,
          hoursLogged: `${hours} hrs`,
          completion: "100%",
          report,
        });
      } else if (!isWeekend) {
        // Missing reports on working days
        rows.push({
          date: dateString,
          tasksSummary: "No task report filled",
          status: "missing",
          hoursLogged: "0 hrs",
          completion: "0%",
        });
      }
    }
    return rows;
  };

  const rows = getFilteredRows();
  const missingCount = rows.filter((r) => r.status === "missing").length;
  const complianceRate = rows.length > 0
    ? Math.round(((rows.length - missingCount) / rows.length) * 100)
    : 100;

  const handleOpenDetails = (row: HistoryRow) => {
    if (row.report) {
      setSelectedReport(row.report);
    }
  };

  // Preview iFrame generation helper
  const getIFrameHtml = () => {
    if (!selectedReport) return "";
    const totalHours = selectedReport.taskLogs.reduce((acc: number, t: TaskLogEntry) => {
      return acc + parseTimeToHours(t.timeSpent);
    }, 0);

    return generateHtmlEmail({
      employeeName: employee.name,
      reportDate: selectedReport.date,
      department: employee.department || "Operations",
      designation: employee.title || "Operations Associate",
      managerName: "Sourabh Yadav",
      totalHours,
      tasks: selectedReport.taskLogs.map((t: TaskLogEntry, idx: number) => ({
        title: t.title || `Task ${idx + 1}`,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        timeSpent: t.timeSpent,
        notes: t.notes,
      })),
      meetings: (selectedReport.meetingCalls || []).map((m: MeetingCallEntry) => ({
        subject: m.subject,
        withWhom: m.withWhom,
        time: m.time,
        duration: m.duration,
        type: m.type,
      })),
      pending: selectedReport.endOfDayNotes?.pending || "",
      blockers: selectedReport.endOfDayNotes?.challenges || "",
      tomorrowPlan: selectedReport.endOfDayNotes?.planForTomorrow || "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge label="Submitted" tone="success" />;
      case "draft":
        return <Badge label="Draft" tone="warning" />;
      case "missing":
        return <Badge label="Missing" tone="error" />;
      default:
        return <Badge label={status} tone="info" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pt-4 pb-10">
        {/* Back Link and Page Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/employees"
            className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition flex items-center gap-1.5 w-max cursor-pointer"
          >
            <ArrowLeft color="#2563eb" size={14} />
            Back to Team Directory
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {employee.name}&apos;s Report History
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                View and manage reports for {employee.name} ({employee.title}).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 border border-primary-200">
                {employee.avatar}
              </span>
            </div>
          </div>
        </div>

        {/* Date Filter presets */}
        <div className="flex flex-wrap gap-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          {datePresets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => setDateFilter(preset.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${dateFilter === preset.key
                  ? "bg-primary-600 text-white border-primary-650 shadow-md shadow-primary-100"
                  : "bg-slate-50 text-slate-650 hover:bg-slate-100 border-slate-200/80"
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Submitted</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1">{submittedCount}</span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Days</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1">{missingCount}</span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compliance Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1">{complianceRate}%</span>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Utilization</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1">{employee.utilization}%</span>
          </div>
        </div>

        {/* History Grid Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Key Tasks</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Submission Status</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Hours Logged</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Completion %</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-700 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2 text-xs">
                        <Calendar size={16} className="text-slate-400" />
                        {row.date}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {row.tasksSummary}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-semibold">
                        {row.hoursLogged}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {row.completion}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.report ? (
                          <button
                            onClick={() => handleOpenDetails(row)}
                            className="text-primary-600 hover:text-primary-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition hover:underline"
                          >
                            <Eye size={14} />
                            Open Details
                          </button>
                        ) : (
                          <span className="text-xs text-slate-350 italic font-semibold">No Preview</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      <InfoCircle size={20} className="mx-auto text-slate-300 mb-2" />
                      No history entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal to show selected report preview */}
      <Modal
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title="Employee Daily Work Report"
      >
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white p-2">
          {selectedReport && (
            <iframe
              srcDoc={getIFrameHtml()}
              className="w-full h-[550px] border-none"
              title="Report Details Email Layout"
            />
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setSelectedReport(null)}
            className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
