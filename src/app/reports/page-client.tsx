"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { useAuthStore, useDailyReportStore, useEmployeeStore } from "@/src/store";
import { Badge } from "@/src/components/ui/badge";
import { SearchNormal1, Calendar, ArrowRight, DirectInbox, Sms } from "iconsax-react";
import Link from "next/link";
import { generateHtmlEmail } from "@/src/reports/utils/email-template";
import { MOCK_ANCHOR_DATE } from "@/src/lib/constants";

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

type DateFilter = "all" | "today" | "7days" | "15days" | "30days";

const datePresets: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "7days", label: "7 Days" },
  { key: "15days", label: "15 Days" },
  { key: "30days", label: "30 Days" },
];

export default function ReportsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const allReports = useDailyReportStore((s) => s.reportsList);
  const allEmployees = useEmployeeStore((s) => s.getAllUsers());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All");

  // Selection states for Team Reports Center
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Popover State for Email Simulator
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const isEmployee = currentUser?.role === "employee";

  // ────────────────────────────────────────────────────────
  // Employee: My Reports Rendering Logic
  // ────────────────────────────────────────────────────────
  const myReports = currentUser
    ? allReports.filter((r) => r.employeeId === currentUser.id)
    : [];

  const filteredMyReports = myReports.filter((report) => {
    const matchesSearch = report.date.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || report.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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

  // ────────────────────────────────────────────────────────
  // Manager/Admin: Team Reports Center Filtering Logic
  // ────────────────────────────────────────────────────────
  const visibleReports = useMemo(() => {
    if (!currentUser) return [];

    return allReports.filter((report) => {
      // Find employee details for this report
      const emp = allEmployees.find((u) => u.id === report.employeeId);
      if (!emp) return false;

      // Filter by dynamic visibility based on manager's scope
      if (currentUser.role === "manager") {
        if (emp.createdBy !== currentUser.id && emp.teamId !== currentUser.teamId) {
          return false;
        }
      }

      // Filter by Employee Dropdown Selector
      if (selectedEmployeeId !== "All" && report.employeeId !== selectedEmployeeId) {
        return false;
      }

      // Filter by Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesDept = (emp.department || "").toLowerCase().includes(q);
        const matchesDate = report.date.includes(q);
        if (!matchesName && !matchesDept && !matchesDate) return false;
      }

      // Filter by Status Preset
      if (statusFilter !== "All" && report.status !== statusFilter.toLowerCase()) {
        return false;
      }

      // Filter by Date Presets (anchored around MOCK_ANCHOR_DATE)
      const reportDate = new Date(report.date);
      const diffTime = Math.abs(MOCK_ANCHOR_DATE.getTime() - reportDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "today" && report.date !== "2026-06-23") return false;
      if (dateFilter === "7days" && diffDays > 7) return false;
      if (dateFilter === "15days" && diffDays > 15) return false;
      if (dateFilter === "30days" && diffDays > 30) return false;

      return true;
    });
  }, [allReports, allEmployees, currentUser, searchQuery, statusFilter, dateFilter, selectedEmployeeId]);

  if (!currentUser) return null;

  // Selected Report details for preview iframe
  const activeReport = allReports.find((r) => r.id === selectedReportId) || visibleReports[0];

  const getActiveReportHtml = () => {
    if (!activeReport) return "";
    const emp = allEmployees.find((u) => u.id === activeReport.employeeId);
    if (!emp) return "";

    const totalHours = activeReport.taskLogs.reduce((acc, t) => {
      return acc + parseTimeToHours(t.timeSpent);
    }, 0);

    return generateHtmlEmail({
      employeeName: emp.name,
      reportDate: activeReport.date,
      department: emp.department || "Operations",
      designation: emp.title || "Operations Associate",
      managerName: currentUser.name,
      totalHours,
      tasks: activeReport.taskLogs.map((t, idx) => ({
        title: t.title || `Task ${idx + 1}`,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        timeSpent: t.timeSpent,
        notes: t.notes,
      })),
      meetings: (activeReport.meetingCalls || []).map((m) => ({
        subject: m.subject,
        withWhom: m.withWhom,
        time: m.time,
        duration: m.duration,
        type: m.type,
      })),
      pending: activeReport.endOfDayNotes?.pending || "",
      blockers: activeReport.endOfDayNotes?.challenges || "",
      tomorrowPlan: activeReport.endOfDayNotes?.planForTomorrow || "",
    });
  };

  const activeEmp = activeReport ? allEmployees.find((u) => u.id === activeReport.employeeId) : null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;
    alert(`Email sent to ${recipientEmail} successfully!`);
    setIsMailOpen(false);
  };

  const getAvatarBg = (name: string) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-emerald-50 text-emerald-700 border-emerald-100",
      "bg-amber-50 text-amber-700 border-amber-100",
      "bg-pink-50 text-pink-700 border-pink-100",
      "bg-purple-50 text-purple-700 border-purple-100",
    ];
    return colors[code % colors.length];
  };

  // ───────────��────────────────────────────────────────────
  // Employee Layout Renders
  // ────────────────────────────────────────────────────────
  if (isEmployee) {
    return (
      <AppShell>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <PageHeader
              eyebrow="Reports"
              title="My Reporting History"
              description="View and manage your daily report submissions, drafts, and missing reports."
            />
            <Link 
              href="/daily-report" 
              className="primary-cta px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2"
            >
              Create New Report
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by date (YYYY-MM-DD)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Submitted", "Draft", "Missing"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-700">Report Date</th>
                    <th className="px-6 py-4 font-bold text-slate-700">Tasks</th>
                    <th className="px-6 py-4 font-bold text-slate-700">Meetings</th>
                    <th className="px-6 py-4 font-bold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMyReports.length > 0 ? (
                    filteredMyReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                          <Calendar size={18} className="text-slate-400" />
                          {report.date}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {report.taskLogs.length} tasks
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {report.meetingCalls?.length || 0} meetings
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/employees/${currentUser.id}/history`}
                            className="text-primary-600 hover:text-primary-700 font-bold inline-flex items-center gap-1 hover:underline"
                          >
                            View Details
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No reports found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ────────────────────────────────────────────────────────
  // Manager/Admin Layout: Double-Pane Team Reports Center
  // ────────────────────────────────────────────────────────
  const managerEmployees = currentUser.role === "manager"
    ? allEmployees.filter(emp => emp.createdBy === currentUser.id || emp.teamId === currentUser.teamId)
    : allEmployees;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Reports Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, download, and dispatch daily work reports from your team.
          </p>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Search bar */}
          <div className="relative">
            <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, dept, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-primary-500 focus:outline-none transition"
            />
          </div>

          {/* Employee dropdown filter */}
          <div>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="All">All Employees</option>
              {managerEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets Row */}
          <div className="flex gap-1.5 overflow-x-auto justify-start md:justify-end">
            {datePresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setDateFilter(preset.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition shrink-0 cursor-pointer ${
                  dateFilter === preset.key
                    ? "bg-primary-600 text-white border-primary-650 shadow-2xs"
                    : "bg-slate-50 text-slate-650 hover:bg-slate-100 border-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Double-Pane Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
          {/* Left Pane: Report Cards List */}
          <div className="w-full lg:w-[350px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Submitted Daily Reports ({visibleReports.length})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[550px] p-2 space-y-1">
              {visibleReports.length > 0 ? (
                visibleReports.map((report) => {
                  const emp = allEmployees.find((u) => u.id === report.employeeId);
                  if (!emp) return null;

                  const isActive = activeReport?.id === report.id;

                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setIsMailOpen(false);
                      }}
                      className={`w-full text-left rounded-xl p-3.5 border transition flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? "bg-primary-50/40 border-primary-200 text-primary-950 font-semibold ring-2 ring-primary-500/5 shadow-2xs"
                          : "bg-transparent border-transparent text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${getAvatarBg(emp.name)}`}>
                        {emp.avatar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                          <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                            {report.date}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{emp.title}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {report.taskLogs.length} tasks logged
                          </span>
                          <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                            Submitted
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs italic">
                  <DirectInbox size={24} className="mx-auto text-slate-300 mb-2" />
                  No matching reports submitted.
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Report Preview & Email Simulator */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col p-6 relative">
            {activeReport && activeEmp ? (
              <div className="flex-1 flex flex-col h-full space-y-4">
                {/* Right Pane Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeEmp.name} <span className="text-slate-450 font-normal">({activeEmp.id})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {activeEmp.department} &bull; Daily Report for {activeReport.date}
                    </p>
                  </div>

                  {/* Send to Mail Button with Popover */}
                  <div className="relative shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => {
                        setRecipientEmail(activeEmp.email || "");
                        setIsMailOpen(!isMailOpen);
                      }}
                      className="px-4 py-2 text-xs font-bold bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Sms size={16} />
                      Send to Mail
                    </button>

                    {/* Mail Popover Modal Overlay */}
                    {isMailOpen && (
                      <div className="absolute right-0 mt-2 z-50 w-72 bg-white rounded-2xl p-4 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.15)] border border-slate-150">
                        <form onSubmit={handleSendEmail} className="space-y-3">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Recipient Email
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none bg-slate-50/50"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsMailOpen(false)}
                              className="px-3 py-1.5 text-xs text-slate-550 hover:bg-slate-50 rounded-lg transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 text-xs font-bold bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg transition shadow-2xs"
                            >
                              Send
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>

                {/* iFrame Renderer */}
                <div className="flex-1 w-full border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-2.5 flex justify-center">
                  <iframe
                    srcDoc={getActiveReportHtml()}
                    className="w-full h-[500px] border-none bg-white rounded-xl shadow-2xs"
                    title="Team Report preview layout"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-24">
                <DirectInbox size={32} className="text-slate-300 mb-2" />
                <span>Select a team report from the left pane list to preview its contents.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
