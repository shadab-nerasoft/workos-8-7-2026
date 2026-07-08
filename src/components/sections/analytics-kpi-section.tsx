"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useAuthStore, useEmployeeStore, useTeamStore, useDailyReportStore, useTaskStore } from "@/src/store";
import type { User } from "@/src/types";

export function AnalyticsKPISection() {
  const { currentUser } = useAuthStore();
  const allEmployees = useEmployeeStore((s) => s.getAllUsers());
  const allTeams = useTeamStore((s) => s.getAllTeams());
  const allReports = useDailyReportStore((s) => s.reportsList);
  const allTasks = useTaskStore((s) => s.getAllTasks());

  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";
  const isManager = currentUser.role === "manager";

  // For managers, get their team
  const managerTeams = isManager
    ? allTeams.filter((t) => t.leadId === currentUser.id)
    : [];

  const managerTeamIds = new Set(managerTeams.map((t) => t.id));

  // Get employees based on role
  const visibleEmployees = isAdmin
    ? allEmployees.filter((u) => u.role === "employee")
    : isManager
    ? allEmployees.filter((u) => u.teamId && managerTeamIds.has(u.teamId) && u.role === "employee")
    : [];

  // Calculate KPI for an employee
  const getEmployeeKPI = (employee: User) => {
    const employeeReports = allReports.filter((r) => r.employeeId === employee.id);
    const employeeTasks = allTasks.filter((t) => t.assigneeId === employee.id);
    const completedTasks = employeeTasks.filter((t) => t.status === "completed").length;
    const submittedReports = employeeReports.filter((r) => r.status === "submitted").length;
    const missingReports = employeeReports.filter((r) => r.status === "missing").length;

    return {
      totalTasks: employeeTasks.length,
      completedTasks,
      taskCompletionRate: employeeTasks.length > 0 ? Math.round((completedTasks / employeeTasks.length) * 100) : 0,
      submittedReports,
      missingReports,
      performanceScore: employee.performance,
      utilizationScore: employee.utilization,
    };
  };

  // Calculate team KPI
  const getTeamKPI = (teamId: string) => {
    const teamMembers = allEmployees.filter((u) => u.teamId === teamId && u.role === "employee");
    const teamTasks = allTasks.filter((t) => {
      const assignee = allEmployees.find((u) => u.id === t.assigneeId);
      return assignee && assignee.teamId === teamId;
    });
    const completedTeamTasks = teamTasks.filter((t) => t.status === "completed").length;
    const teamReports = allReports.filter((r) => {
      const employee = allEmployees.find((u) => u.id === r.employeeId);
      return employee && employee.teamId === teamId;
    });
    const submittedTeamReports = teamReports.filter((r) => r.status === "submitted").length;

    const avgPerformance = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)
      : 0;
    const avgUtilization = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.utilization, 0) / teamMembers.length)
      : 0;

    return {
      memberCount: teamMembers.length,
      totalTasks: teamTasks.length,
      completedTasks: completedTeamTasks,
      taskCompletionRate: teamTasks.length > 0 ? Math.round((completedTeamTasks / teamTasks.length) * 100) : 0,
      submittedReports: submittedTeamReports,
      avgPerformance,
      avgUtilization,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Analytics & KPI</h2>
        <p className="text-sm text-slate-600 mt-1">
          {isAdmin ? "Company-wide performance metrics and team analytics" : "Your team's performance and employee KPIs"}
        </p>
      </div>

      {/* Manager/Admin View: Team Performance Overview */}
      {(isAdmin || isManager) && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Team Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(isAdmin ? allTeams : managerTeams).map((team) => {
              const teamKPI = getTeamKPI(team.id);
              return (
                <Card
                  key={team.id}
                  className="cursor-pointer hover:shadow-md transition"
                  onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{team.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{teamKPI.memberCount} members</p>
                      </div>
                      <Badge label={`${teamKPI.taskCompletionRate}% Complete`} tone="success" />
                    </div>
                  </CardHeader>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 font-medium">Tasks Completed</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">
                          {teamKPI.completedTasks}/{teamKPI.totalTasks}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 font-medium">Avg Performance</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{teamKPI.avgPerformance}%</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 font-medium">Reports Submitted</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{teamKPI.submittedReports}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 font-medium">Avg Utilization</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{teamKPI.avgUtilization}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee KPI Table */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {isAdmin ? "Employee KPI Overview" : "Team Member KPI"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Tasks Completed</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Completion Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Reports Submitted</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Performance</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => {
                const kpi = getEmployeeKPI(employee);
                return (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => setSelectedEmployee(selectedEmployee?.id === employee.id ? null : employee)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {employee.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{employee.name}</p>
                          <p className="text-xs text-slate-500">{employee.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-slate-900">{kpi.completedTasks}/{kpi.totalTasks}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${kpi.taskCompletionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{kpi.taskCompletionRate}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        label={`${kpi.submittedReports} submitted`}
                        tone={kpi.submittedReports > 0 ? "success" : "warning"}
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${kpi.performanceScore >= 80 ? "text-emerald-600" : kpi.performanceScore >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                        {kpi.performanceScore}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${kpi.utilizationScore >= 80 ? "text-emerald-600" : kpi.utilizationScore >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                        {kpi.utilizationScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Employee Detail */}
      {selectedEmployee && (
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{selectedEmployee.name}</h4>
              <p className="text-sm text-slate-600">{selectedEmployee.title}</p>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const kpi = getEmployeeKPI(selectedEmployee);
              return (
                <>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase">Total Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.totalTasks}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{kpi.completedTasks}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase">Performance</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.performanceScore}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase">Utilization</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.utilizationScore}%</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
