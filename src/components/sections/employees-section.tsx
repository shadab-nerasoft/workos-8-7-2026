"use client";

import { useState } from "react";
import { EmployeesTable } from "@/src/components/ui/employees-table";
import { useAuthStore, useEmployeeStore, useTeamStore } from "@/src/store";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Modal } from "@/src/components/ui/modal";
import { TeamsService } from "@/src/services/teams.service";

export function EmployeesSection() {
  const { currentUser } = useAuthStore();
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  const allTeams = useTeamStore((s) => s.getAllTeams());

  // Modal and Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState("");

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";
  const isManager = currentUser.role === "manager";

  // Access allowed for Admin and Manager
  const isAuthorized = isAdmin || isManager;

  if (!isAuthorized) {
    return (
      <EmptyState
        title="Access restricted"
        message="Only administrators and managers can view the employee directory."
      />
    );
  }

  // Filter teams led by this manager
  const managedTeams = allTeams.filter((t) => t.leadId === currentUser.id);

  // Filter visible employees
  const visibleEmployees = isAdmin
    ? allUsers
    : allUsers.filter((u) => {
        // Only show employees to managers
        if (u.role !== "employee") return false;

        // Share manager's teamId
        if (u.teamId && u.teamId === currentUser.teamId) return true;

        // Manager leads their team
        const team = allTeams.find((t) => t.id === u.teamId);
        if (team && team.leadId === currentUser.id) return true;

        // Created by this manager
        if (u.createdBy === currentUser.id) return true;

        return false;
      });

  const filteredEmployees = visibleEmployees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      (emp.department || "").toLowerCase().includes(q) ||
      emp.title.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q)
    );
  });

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;

    // Default teamId if manager is creating
    const selectedTeamId = isManager
      ? teamId || managedTeams[0]?.id || currentUser.teamId
      : teamId;

    TeamsService.createEmployee({
      name,
      title,
      email,
      teamId: selectedTeamId,
      createdById: currentUser.id,
    });

    // Reset Form
    setName("");
    setTitle("");
    setEmail("");
    setTeamId("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            My Team Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track employee reports, submission statistics, and history.
          </p>
        </div>
        <button
          onClick={() => {
            if (isManager) {
              setTeamId(managedTeams[0]?.id || currentUser.teamId || "");
            } else if (allTeams.length > 0) {
              setTeamId(allTeams[0].id);
            }
            setIsCreateOpen(true);
          }}
          className="primary-cta px-5 py-2 text-xs font-semibold hover:shadow-md transition active:scale-95 shrink-0"
        >
          + Create Employee
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative w-full max-w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name, ID, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
        />
      </div>

      {/* Employees Directory List Table */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          message="No employee profiles match your search criteria."
        />
      ) : (
        <EmployeesTable users={filteredEmployees} />
      )}

      {/* Modal: Create Employee Profile */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Employee Profile">
        <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold leading-5 text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karan Malhotra"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold leading-5 text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backend Engineer"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold leading-5 text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. karan.m@workos.test (optional)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold leading-5 text-slate-700 mb-1">Assign Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
              >
                <option value="">Unassigned</option>
                {allTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            managedTeams.length > 1 && (
              <div>
                <label className="block text-xs font-semibold leading-5 text-slate-700 mb-1">Assign Team</label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
                >
                  {managedTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="submit" className="primary-cta px-5 py-2 text-xs font-semibold hover:shadow-md">
              Create Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
