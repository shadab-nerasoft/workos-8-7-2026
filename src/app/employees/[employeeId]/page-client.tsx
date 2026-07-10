"use client";

import { use } from "react";
import Link from "next/link";
import { useEmployeeStore, useTaskStore, useProjectStore, useDailyReportStore } from "@/src/store";
import { AppShell } from "@/src/components/common/app-shell";
import { notFound } from "next/navigation";
import { ArrowLeft, TaskSquare, Profile2User, TickSquare, InfoCircle } from "iconsax-react";
import { Badge, PriorityBadge, TaskStatusBadge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/utils/format";
import { TeamsService } from "@/src/services/teams.service";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const unwrappedParams = use(params);
  const employeeId = unwrappedParams.employeeId;

  const usersList = useEmployeeStore((s) => s.usersList);
  const allTasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projectsList);

  const employee = usersList.find((u) => u.id === employeeId);

  // Stores hydrate client-side, so usersList is empty during SSR and the
  // first render. Treat that as loading rather than a 404.
  if (usersList.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-500" aria-label="Loading employee" />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    notFound();
  }

  // Get tasks assigned to this employee
  const employeeTasks = allTasks.filter((t) => t.assigneeId === employee.id);

  // Get contribution report
  const report = TeamsService.getEmployeeContributionReport(employee);

  // Group tasks by status
  const pendingTasks = employeeTasks.filter((t) => t.status !== "completed");
  const completedTasks = employeeTasks.filter((t) => t.status === "completed");

  const getReportsByEmployeeId = useDailyReportStore((s) => s.getReportsByEmployeeId);
  const employeeReports = getReportsByEmployeeId(employee.id);
  const submittedCount = employeeReports.filter(r => r.status === "submitted").length;
  const draftCount = employeeReports.filter(r => r.status === "draft").length;
  const missingCount = employeeReports.filter(r => r.status === "missing").length;

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
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 border-2 border-primary-200 shadow-sm">
                {employee.avatar}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{employee.name}</h1>
                <p className="text-sm text-slate-500 font-medium">
                  {employee.title} &bull; {employee.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label={`Utilization: ${employee.utilization}%`} tone={employee.utilization > 85 ? "warning" : "primary"} />
              <Badge label={`Performance: ${employee.performance}%`} tone="success" />
            </div>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <CardWrapper title="Active Tasks">
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{pendingTasks.length}</span>
              <span className="text-xs text-slate-400 font-semibold">ongoing</span>
            </div>
          </CardWrapper>
          <CardWrapper title="Completed Tasks">
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{completedTasks.length}</span>
              <span className="text-xs text-slate-400 font-semibold">tasks done</span>
            </div>
          </CardWrapper>
          <CardWrapper title="Total Assigned">
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{employeeTasks.length}</span>
              <span className="text-xs text-slate-400 font-semibold">total</span>
            </div>
          </CardWrapper>
        </div>

        {/* Daily Reports Compliance Stats Grid */}
        <div className="surface-card p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408-.688 3.442a1.125 1.125 0 0 1-1.883.696l-2.22-2.22a1.125 1.125 0 0 1 .342-1.845l3.442-.688m1.21-1.21 1.21-1.21M3 6.249A2.25 2.25 0 0 1 5.25 4h.078m0 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664M5.328 4A2.251 2.251 0 0 1 7.5 2.25H9c1.03 0 1.9.693 2.166 1.638M5.25 21a2.25 2.25 0 0 1-2.25-2.25v-8.25A2.25 2.25 0 0 1 5.25 8.25h8.25A2.25 2.25 0 0 1 15.75 10.5v8.25a2.25 2.25 0 0 1-2.25 2.25H5.25Z" />
            </svg>
            Daily Reports Submission Compliance
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Submitted Reports</span>
              <span className="text-2xl font-extrabold text-emerald-950 mt-1">{submittedCount}</span>
            </div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-650">Missing Reports</span>
              <span className="text-2xl font-extrabold text-red-950 mt-1">{missingCount}</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Draft Reports</span>
              <span className="text-2xl font-extrabold text-amber-950 mt-1">{draftCount}</span>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Compliance Rate</span>
              <span className="text-2xl font-extrabold text-blue-950 mt-1">
                {employeeReports.length > 0
                  ? `${Math.round((submittedCount / (submittedCount + missingCount || 1)) * 100)}%`
                  : "100%"}
              </span>
            </div>
          </div>

          {/* List of employee's reports */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-800">Recent Daily Submissions</h4>
              <Link
                href={`/employees/${employee.id}/history`}
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                Open Log History &rarr;
              </Link>
            </div>
            {employeeReports.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No daily reports recorded for this employee.</p>
            ) : (
              <div className="space-y-2">
                {employeeReports.map((report) => (
                  <div key={report.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      <span className="text-xs font-bold text-slate-700">{report.date}</span>
                      <span className="text-[10px] text-slate-400">• {report.taskLogs.length} tasks logged</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${report.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'draft' ? 'bg-amber-100 text-amber-850' : 'bg-red-100 text-red-800'
                        }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left / Main Column: Task List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="surface-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TaskSquare size={18} className="text-slate-400" />
                Assigned Task List
              </h3>

              {employeeTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center justify-center">
                  <InfoCircle size={24} className="text-slate-300 mb-2" />
                  <span>No tasks currently assigned to this employee.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 pr-4">Task Details</th>
                        <th className="py-3 px-4 text-center">Priority</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 pl-4 text-right">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employeeTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId);
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 pr-4 max-w-[240px] sm:max-w-xs">
                              <p className="font-bold text-slate-950 truncate leading-relaxed">{task.title}</p>
                              {project && (
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                  Project: {project.name}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <TaskStatusBadge status={task.status} />
                            </td>
                            <td className="py-3 pl-4 text-right text-slate-500 font-medium">
                              {formatDate(task.deadline)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contributions & Analytics */}
          <div className="space-y-4">
            {/* Contribution Details */}
            <div className="surface-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TickSquare size={18} className="text-slate-400" />
                Contributions & Active Focus
              </h3>
              <ul className="space-y-3">
                {report.featuresAdded.map((feature, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <TickSquare size={15} className="text-emerald-500 shrink-0 mt-0.5" variant="Bold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Performance Indicators */}
            <div className="surface-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Profile2User size={18} className="text-slate-400" />
                Execution Capacity
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Workload Utilization</span>
                    <span className="font-semibold text-slate-900">{employee.utilization}%</span>
                  </div>
                  <div className="h-2 rounded-sm bg-slate-100">
                    <div
                      className={`h-2 rounded-sm ${employee.utilization > 85 ? "bg-amber-500" : "bg-primary-600"}`}
                      style={{ width: `${employee.utilization}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Delivery Momentum</span>
                    <span className="font-semibold text-slate-900">{employee.performance}%</span>
                  </div>
                  <div className="h-2 rounded-sm bg-slate-100">
                    <div
                      className="h-2 rounded-sm bg-emerald-500"
                      style={{ width: `${employee.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CardWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-4 flex flex-col justify-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">{title}</p>
      {children}
    </div>
  );
}
