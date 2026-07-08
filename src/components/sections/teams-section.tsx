"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Badge } from "@/src/components/ui/badge";
import { Modal } from "@/src/components/ui/modal";
import { useAuthStore, useTeamStore, useEmployeeStore, useProjectStore, useTaskStore } from "@/src/store";
import { TeamsService } from "@/src/services/teams.service";
import type { User, Team, Project } from "@/src/types";
import { titleCase } from "@/src/lib/utils/format";
import { People, InfoCircle, VolumeHigh, Edit2, Chart, Command, Headphone, Designtools } from "iconsax-react";

// Helper for rendering custom SVGs for team icons
const getIconSvg = (name?: string, isActive?: boolean) => {
  const color = isActive === undefined ? "currentColor" : (isActive ? "#2563eb" : "#90a1b9");
  const size = 20;

  switch (name) {
    case "megaphone":
      return <VolumeHigh size={size} color={color} variant="Outline" />;
    case "pen":
      return <Edit2 size={size} color={color} variant="Outline" />;
    case "chart":
      return <Chart size={size} color={color} variant="Outline" />;
    case "node":
      return <Command size={size} color={color} variant="Outline" />;
    case "headset":
      return <Headphone size={size} color={color} variant="Outline" />;
    case "rocket":
      return <Designtools size={size} color={color} variant="Outline" />;
    default:
      return <VolumeHigh size={size} color={color} variant="Outline" />;
  }
};

// Helper for rendering custom theme colors depending on the team's type
const getIconColorClasses = (type?: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("marketing")) {
    return "bg-amber-50 text-amber-600 border-amber-200/50";
  }
  if (t.includes("engineering") || t.includes("dev") || t.includes("product")) {
    return "bg-blue-50 text-blue-600 border-blue-200/50";
  }
  if (t.includes("design") || t.includes("creative")) {
    return "bg-pink-50 text-pink-600 border-pink-200/50";
  }
  if (t.includes("qa") || t.includes("test") || t.includes("quality")) {
    return "bg-purple-50 text-purple-600 border-purple-200/50";
  }
  if (t.includes("sales")) {
    return "bg-emerald-50 text-emerald-600 border-emerald-200/50";
  }
  if (t.includes("operations") || t.includes("ops")) {
    return "bg-cyan-50 text-cyan-600 border-cyan-200/50";
  }
  return "bg-slate-50 text-slate-600 border-slate-200/50";
};

// Department color themes for managers
const getDeptColorClasses = (dept: string) => {
  const d = dept.toLowerCase();
  if (d.includes("sales")) {
    return {
      border: "border-t-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50/50",
      gradient: "from-amber-500 to-orange-500",
      ring: "ring-amber-500/20",
    };
  }
  if (d.includes("engineering")) {
    return {
      border: "border-t-blue-500",
      text: "text-blue-700",
      bg: "bg-blue-50/50",
      gradient: "from-blue-500 to-indigo-500",
      ring: "ring-blue-500/20",
    };
  }
  if (d.includes("design")) {
    return {
      border: "border-t-pink-500",
      text: "text-pink-700",
      bg: "bg-pink-50/50",
      gradient: "from-pink-500 to-rose-500",
      ring: "ring-pink-500/20",
    };
  }
  if (d.includes("qa") || d.includes("quality")) {
    return {
      border: "border-t-purple-500",
      text: "text-purple-700",
      bg: "bg-purple-50/50",
      gradient: "from-purple-500 to-fuchsia-500",
      ring: "ring-purple-500/20",
    };
  }
  return {
    border: "border-t-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50/50",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/20",
  };
};

export function TeamsSection() {
  const { currentUser } = useAuthStore();
  const allTeams = useTeamStore((s) => s.getAllTeams());
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  const allProjects = useProjectStore((s) => s.getAllProjects());
  const allTasks = useTaskStore((s) => s.getAllTasks());

  // Navigation tabs (Only visible to Admin)
  const [activeTab, setActiveTab] = useState<"teams" | "managers">("teams");

  // Layout view modes
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Selection states for Inline Project/Contributions Analysis
  const [selectedManagerForProjects, setSelectedManagerForProjects] = useState<User | null>(null);
  const [projectFilter, setProjectFilter] = useState<"completed" | "ongoing">("completed");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modal toggle states
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [selectedTeamForDetail, setSelectedTeamForDetail] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form states for Team Creation/Editing
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLeadId, setNewTeamLeadId] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamType, setNewTeamType] = useState("Engineering");
  const [newTeamIcon, setNewTeamIcon] = useState("megaphone");
  const [newTeamPriority, setNewTeamPriority] = useState("medium");
  const [newTeamGoals, setNewTeamGoals] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [sendInvites, setSendInvites] = useState(true);
  const [setDefaultHours, setSetDefaultHours] = useState(true);

  // Form states for Manager Creation
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerDept, setNewManagerDept] = useState("Engineering");
  const [newManagerAccess, setNewManagerAccess] = useState(true);

  // Admin filter by department
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");

  if (!currentUser) return null;

  if (currentUser.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-900 leading-tight">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
          The Teams section is restricted to Administrators and Managers. Please contact your manager if you require access.
        </p>
        <Link
          href="/"
          className="mt-5 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-full transition cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const isManager = currentUser.role === "manager";

  // Managers should not see other managers (Managers tab only visible to Admin)
  const showManagersTab = isAdmin;

  // Check if current user has team creation access (All managers have access by default)
  const canCreateTeam = isAdmin || isManager;

  // Teams view filter: managers see only their led teams, employees see their team, admin sees all (with department filter)
  const visibleTeams = isAdmin
    ? (departmentFilter === "All" ? allTeams : allTeams.filter((t) => t.type === departmentFilter))
    : allTeams.filter((t) => t.leadId === currentUser.id || t.id === currentUser.teamId);

  // Managers list (Admins only view)
  const managers = allUsers.filter((u) => u.role === "manager");

  // Determine current department name
  const departmentName = isManager
    ? (currentUser.department || (currentUser.title.toLowerCase().includes("engineering") ? "Engineering" : currentUser.title.toLowerCase().includes("sales") ? "Sales" : currentUser.title.toLowerCase().includes("design") ? "Design" : currentUser.title.toLowerCase().includes("qa") ? "QA" : "Engineering"))
    : "Product Development";

  // Helper to compute team tasks
  const getTeamTasks = (teamId: string) => {
    const teamProjects = allProjects.filter((p) => p.teamId === teamId);
    const pIds = new Set(teamProjects.map((p) => p.id));
    return allTasks.filter((t) => pIds.has(t.projectId));
  };

  // Metric computations for the dynamic metrics row
  const totalTeamsCount = visibleTeams.length;
  const totalMembersCount = Array.from(new Set(visibleTeams.flatMap((t) => t.memberIds))).length;
  const avgHealthScore = Math.round(
    visibleTeams.reduce((sum, t) => sum + t.health, 0) / (totalTeamsCount || 1)
  );

  const allTeamTasks = visibleTeams.flatMap((t) => getTeamTasks(t.id));
  const totalTasksCount = allTeamTasks.length;
  const completedTasksCount = allTeamTasks.filter((t) => t.status === "completed").length;

  // Form Submission handlers
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    // Determine leadId: if manager and not editing, defaults to manager's id
    const leadId = editingTeam
      ? newTeamLeadId
      : (isManager ? currentUser.id : newTeamLeadId || managers[0]?.id);

    if (!leadId) return;

    if (editingTeam) {
      // Perform update
      useTeamStore.getState().updateTeam(editingTeam.id, {
        name: newTeamName.trim(),
        leadId,
        description: newTeamDesc.trim(),
        icon: newTeamIcon,
        type: newTeamType,
        priority: newTeamPriority,
        goals: newTeamGoals.trim(),
        memberIds: Array.from(new Set([leadId, ...selectedMembers]))
      });

      // Update teamId for the members
      const employeeStore = useEmployeeStore.getState();

      const oldMembers = editingTeam.memberIds;
      const newMembers = Array.from(new Set([leadId, ...selectedMembers]));
      const removedMembers = oldMembers.filter(mId => !newMembers.includes(mId));

      removedMembers.forEach(mId => {
        const u = employeeStore.getUserById(mId);
        if (u && u.teamId === editingTeam.id) {
          employeeStore.updateUser(mId, { teamId: "" });
        }
      });

      newMembers.forEach(mId => {
        const u = employeeStore.getUserById(mId);
        if (u) {
          employeeStore.updateUser(mId, { teamId: editingTeam.id });
        }
      });

    } else {
      // Perform create
      TeamsService.createTeam({
        name: newTeamName,
        leadId,
        description: newTeamDesc,
        icon: newTeamIcon,
        type: newTeamType,
        priority: newTeamPriority,
        goals: newTeamGoals,
        memberIds: selectedMembers
      });
    }

    // Reset Form
    setNewTeamName("");
    setNewTeamLeadId("");
    setNewTeamDesc("");
    setNewTeamType("Engineering");
    setNewTeamIcon("megaphone");
    setNewTeamPriority("medium");
    setNewTeamGoals("");
    setSelectedMembers([]);
    setEditingTeam(null);
    setIsCreateTeamOpen(false);
  };

  const handleCreateManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerName.trim()) return;

    TeamsService.createManager({
      name: newManagerName,
      department: newManagerDept,
      canCreateTeam: newManagerAccess,
    });

    // Reset Form
    setNewManagerName("");
    setNewManagerDept("Engineering");
    setNewManagerAccess(true);
    setIsCreateManagerOpen(false);
  };

  // Filter projects by ongoing vs. completed for selected manager
  const getFilteredProjects = () => {
    if (!selectedManagerForProjects) return [];
    const teams = allTeams.filter((t) => t.leadId === selectedManagerForProjects.id);
    const teamIds = new Set(teams.map((t) => t.id));

    if (projectFilter === "completed") {
      return allProjects.filter((p) => teamIds.has(p.teamId) && p.status === "completed");
    } else {
      return allProjects.filter((p) => teamIds.has(p.teamId) && p.status !== "completed");
    }
  };

  // If a manager is selected, render the dedicated inline page subview
  if (selectedManagerForProjects) {
    return (
      <div className="space-y-6">
        {/* Navigation back and header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
          <div>
            <button
              onClick={() => {
                setSelectedManagerForProjects(null);
                setSelectedProject(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition flex items-center gap-1.5 mb-1 cursor-pointer"
            >
              &larr; Back to {isManager ? "Team View" : "Managers List"}
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {projectFilter === "completed" ? "Completed" : "Ongoing"} Projects Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing projects and contributions for teams led by <span className="font-semibold text-slate-700">{selectedManagerForProjects.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              label={`${projectFilter === "completed" ? "Completed" : "Ongoing"} Projects`}
              tone={projectFilter === "completed" ? "success" : "info"}
            />
          </div>
        </div>

        {/* 2-Pane Layout directly on the page! */}
        <div className="flex flex-col md:flex-row gap-6 min-h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Left sidebar: Projects list */}
          <div className="w-full md:w-64 border-r border-slate-200 flex flex-col bg-slate-50/50 overflow-y-auto shrink-0 p-4 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              {projectFilter === "completed" ? "Completed Projects" : "Ongoing Projects"}
            </h4>
            {getFilteredProjects().length === 0 ? (
              <div className="text-xs text-slate-400 p-2 italic">
                No {projectFilter} projects found.
              </div>
            ) : (
              getFilteredProjects().map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProject(p);
                  }}
                  className={`w-full text-left rounded-xl p-3 text-xs transition duration-150 flex flex-col gap-1.5 cursor-pointer border ${selectedProject?.id === p.id
                    ? "bg-white border-primary-200 text-primary-950 font-semibold shadow-xs ring-2 ring-primary-500/5"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <span className="truncate w-full font-semibold">{p.name}</span>
                  <Badge
                    label={p.status === "completed" ? "Completed" : `${p.progress}%`}
                    tone={p.status === "completed" ? "success" : p.status === "at-risk" ? "warning" : "info"}
                  />
                </button>
              ))
            )}
          </div>

          {/* Right panel: Active project report details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedProject ? (
              <>
                {/* Project Header Info Card - NO BUDGET */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{selectedProject.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{selectedProject.description}</p>
                    </div>
                    <Badge
                      label={titleCase(selectedProject.status)}
                      tone={
                        selectedProject.status === "completed"
                          ? "success"
                          : selectedProject.status === "at-risk"
                            ? "warning"
                            : "info"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4 text-xs leading-relaxed text-slate-600">
                    <div>
                      <span className="block font-semibold text-slate-400 text-[10px] uppercase">Due Date</span>
                      <span className="text-sm font-semibold text-slate-800">{selectedProject.dueDate}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-400 text-[10px] uppercase">Progress</span>
                      <span className="text-sm font-semibold text-slate-800">{selectedProject.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Team members panel - Real Routes redirect */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <People size={16} className="text-slate-400" />
                    Project Members (Click to view Profile & Report)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TeamsService.getTeamMembers(selectedProject.teamId).map((emp) => (
                      <Link
                        key={emp.id}
                        href={`/employees/${emp.id}`}
                        className="text-left p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-350 hover:bg-slate-50 transition flex items-center gap-3 w-full cursor-pointer hover:shadow-xs"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {emp.avatar}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-900 truncate font-semibold">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-16">
                <InfoCircle size={24} className="text-slate-300 mb-2" />
                <span>Select a project from the left panel to review report analysis.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render regular Teams / Managers tabbed dashboard
  return (
    <div className="space-y-6">

      {/* Top Banner Header with Department Specific Title & Date Pill */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isManager ? `${departmentName} Space` : `${departmentName} Department`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isManager
              ? `Manage and monitor your team's velocity, tasks, and members`
              : `Overview of collaborative workspaces, cross-functional performance, and active tracks`
            }
          </p>
        </div>

        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Calendar date pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-full text-slate-600 text-xs font-semibold shadow-2xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Jun 1 - Jun 30, 2026</span>
          </div>

          {/* Department Filter (Admin only) */}
          {isAdmin && activeTab === "teams" && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/25 cursor-pointer shadow-2xs"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="QA">QA</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
            </select>
          )}

          {/* Create Team CTA */}
          {activeTab === "teams" && canCreateTeam && (
            <button
              onClick={() => {
                setEditingTeam(null);
                setNewTeamName("");
                setNewTeamDesc("");
                setNewTeamType(isManager ? departmentName : "Engineering");
                setNewTeamIcon("megaphone");
                setNewTeamPriority("medium");
                setNewTeamGoals("");
                setSelectedMembers([]);
                setNewTeamLeadId(currentUser.id);
                setIsCreateTeamOpen(true);
              }}
              className="primary-cta px-5 py-2 text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              + Create New Team
            </button>
          )}
          {activeTab === "managers" && isAdmin && (
            <button
              onClick={() => setIsCreateManagerOpen(true)}
              className="primary-cta px-5 py-2 text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              + Create Manager
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Teams Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Teams</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{totalTeamsCount}</p>
            </div>
          </div>

          {/* Total Members Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Members</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{totalMembersCount}</p>
            </div>
          </div>

          {/* Avg Health Score Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2Z" />
                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Avg. Health</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{avgHealthScore}%</p>
            </div>
          </div>

          {/* Total Tasks Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Tasks</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{totalTasksCount}</p>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4 col-span-2 lg:col-span-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Completed Tasks</p>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{completedTasksCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Header: Tabs (Admins see Managers/Teams) & Card/List Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2 gap-4">
        {showManagersTab ? (
          <div className="flex border-b border-transparent">
            <button
              onClick={() => setActiveTab("teams")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-2.5 ${activeTab === "teams"
                ? "border-primary-600 text-primary-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              Teams ({visibleTeams.length})
            </button>
            <button
              onClick={() => setActiveTab("managers")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-2.5 ${activeTab === "managers"
                ? "border-primary-600 text-primary-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              Managers ({managers.length})
            </button>
          </div>
        ) : (
          <h3 className="text-sm font-bold text-slate-850 pb-2 border-b-2 border-primary-600 -mb-2.5">
            Teams Space List ({visibleTeams.length})
          </h3>
        )}

        {/* View Mode Toggle (only for Teams tab) */}
        {activeTab === "teams" && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs self-end sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-400 hover:text-slate-600"
                }`}
              title="List View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${viewMode === "card"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-400 hover:text-slate-600"
                }`}
              title="Grid Card View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content: Teams List */}
      {activeTab === "teams" && (
        visibleTeams.length === 0 ? (
          <EmptyState
            title="No teams found"
            message={isAdmin ? "Teams will appear here after admins create company structure." : "You do not belong to any active teams."}
          />
        ) : viewMode === "list" ? (
          /* List View Layout */
          <div className="space-y-4">
            {visibleTeams.map((team) => {
              const teamProjects = allProjects.filter((p) => p.teamId === team.id);
              const ongoingCount = teamProjects.filter((p) => p.status !== "completed").length;
              const completedCount = teamProjects.filter((p) => p.status === "completed").length;
              const members = allUsers.filter((u) => team.memberIds.includes(u.id));

              const handleOngoingClick = () => {
                const leadUser = allUsers.find((u) => u.id === team.leadId);
                if (leadUser) {
                  setSelectedManagerForProjects(leadUser);
                  setProjectFilter("ongoing");
                  const ongoingProjects = teamProjects.filter((p) => p.status !== "completed");
                  setSelectedProject(ongoingProjects[0] || null);
                }
              };

              const handleCompletedClick = () => {
                const leadUser = allUsers.find((u) => u.id === team.leadId);
                if (leadUser) {
                  setSelectedManagerForProjects(leadUser);
                  setProjectFilter("completed");
                  const completedProjects = teamProjects.filter((p) => p.status === "completed");
                  setSelectedProject(completedProjects[0] || null);
                }
              };

              const teamTasks = allTasks.filter((t) => teamProjects.some(p => p.id === t.projectId));
              const totalTasks = teamTasks.length;
              const completedTaskCount = teamTasks.filter(t => t.status === "completed").length;
              const computedHealth = totalTasks > 0 ? Math.round((completedTaskCount / totalTasks) * 100) : 100;

              // Health color logic
              let healthColorClass = "bg-emerald-500";
              let healthTextClass = "text-emerald-700";
              if (computedHealth < 50) {
                healthColorClass = "bg-rose-500";
                healthTextClass = "text-rose-700";
              } else if (computedHealth < 80) {
                healthColorClass = "bg-amber-500";
                healthTextClass = "text-amber-700";
              }

              // Priority pill colors
              const getPriorityColor = (p?: string) => {
                switch ((p || "").toLowerCase()) {
                  case "urgent":
                    return "bg-red-50 text-red-700 border-red-100";
                  case "high":
                    return "bg-orange-50 text-orange-700 border-orange-100";
                  case "medium":
                    return "bg-blue-50 text-blue-700 border-blue-100";
                  case "low":
                    return "bg-slate-50 text-slate-600 border-slate-100";
                  default:
                    return "bg-slate-50 text-slate-600 border-slate-100";
                }
              };

              return (
                <div
                  key={team.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 border border-slate-200/80 bg-white hover:border-slate-350 hover:shadow-xs rounded-2xl transition-all duration-205 gap-5 relative overflow-hidden"
                >
                  {/* Priority indicator left bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${team.priority === "urgent" ? "bg-red-500" :
                    team.priority === "high" ? "bg-orange-500" :
                      team.priority === "medium" ? "bg-blue-500" : "bg-slate-300"
                    }`} />

                  {/* Left Column: Icon & Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0 pl-1.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 shadow-2xs ${getIconColorClasses(team.type)}`}>
                      {getIconSvg(team.icon)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{team.name}</h4>
                        {team.type && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/30">
                            {team.type}
                          </span>
                        )}
                        {team.leadId === currentUser.id && (
                          <span className="text-[9px] font-bold bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-md border border-primary-100/50">
                            Lead Team
                          </span>
                        )}
                        {team.priority && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityColor(team.priority)}`}>
                            {team.priority}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-lg leading-relaxed">
                        {team.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Members, Ongoing, Completed, Health */}
                  <div className="flex items-center gap-6 sm:gap-10 flex-wrap lg:flex-nowrap shrink-0 w-full lg:w-auto justify-between lg:justify-end pl-1.5 lg:pl-0">
                    {/* Overlapping Members Stack */}
                    <div className="flex items-center">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {members.slice(0, 4).map((member) => (
                          <Link
                            key={member.id}
                            href={`/employees/${member.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-150 text-[10px] font-extrabold text-slate-700 ring-2 ring-white border border-slate-200/50 hover:z-10 hover:-translate-y-0.5 transition-transform"
                            title={`${member.name} - ${member.title}`}
                          >
                            {member.avatar}
                          </Link>
                        ))}
                        {members.length > 4 && (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[9px] font-extrabold text-slate-800 ring-2 ring-white border border-slate-300">
                            +{members.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold ml-3 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/40">
                        {team.memberIds.length} members
                      </span>
                    </div>

                    {/* Ongoing Tasks clickable */}
                    <button
                      onClick={handleOngoingClick}
                      className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 rounded-xl transition group text-center cursor-pointer min-w-[76px] shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-600 uppercase tracking-wider">Ongoing</span>
                      <span className="text-sm font-extrabold text-slate-800 mt-0.5 group-hover:text-amber-700">{ongoingCount}</span>
                    </button>

                    {/* Completed Tasks clickable */}
                    <button
                      onClick={handleCompletedClick}
                      className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 rounded-xl transition group text-center cursor-pointer min-w-[76px] shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-wider">Completed</span>
                      <span className="text-sm font-extrabold text-slate-800 mt-0.5 group-hover:text-emerald-700">{completedCount}</span>
                    </button>

                    {/* Health progress bar */}
                    <div className="w-28 shrink-0">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Health</span>
                        <span className={`font-bold ${healthTextClass}`}>{computedHealth}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                        <div className={`h-full rounded-full transition-all duration-300 ${healthColorClass}`} style={{ width: `${computedHealth}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions Column: View Team and Dropdown */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                    <button
                      onClick={() => setSelectedTeamForDetail(team)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-800 text-xs font-semibold rounded-full transition cursor-pointer"
                    >
                      View Details
                    </button>


                  </div>
                </div>
              );
            })}

            {/* Bottom CTA Row (Matches screenshot requirement) */}
            {canCreateTeam && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 hover:bg-slate-50/80 transition duration-150 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 border border-primary-100 text-primary-600 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="16" y1="11" x2="22" y2="11" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">+ Add New {departmentName} Team</p>
                    <p className="text-[10px] text-slate-500">Launch a dedicated collaborative unit to organize track objectives</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingTeam(null);
                    setNewTeamName("");
                    setNewTeamDesc("");
                    setNewTeamType(isManager ? departmentName : "Engineering");
                    setNewTeamIcon("megaphone");
                    setNewTeamPriority("medium");
                    setNewTeamGoals("");
                    setSelectedMembers([]);
                    setNewTeamLeadId(currentUser.id);
                    setIsCreateTeamOpen(true);
                  }}
                  className="primary-cta px-4 py-2 text-xs font-bold shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer"
                >
                  + Create Team
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Card View Layout */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleTeams.map((team) => {
              const lead = allUsers.find((user) => user.id === team.leadId);
              const teamProjects = allProjects.filter((p) => p.teamId === team.id);
              const ongoingCount = teamProjects.filter((p) => p.status !== "completed").length;
              const completedCount = teamProjects.filter((p) => p.status === "completed").length;
              const members = allUsers.filter((u) => team.memberIds.includes(u.id));

              const handleOngoingClick = () => {
                const leadUser = allUsers.find((u) => u.id === team.leadId);
                if (leadUser) {
                  setSelectedManagerForProjects(leadUser);
                  setProjectFilter("ongoing");
                  const ongoingProjects = teamProjects.filter((p) => p.status !== "completed");
                  setSelectedProject(ongoingProjects[0] || null);
                }
              };

              const handleCompletedClick = () => {
                const leadUser = allUsers.find((u) => u.id === team.leadId);
                if (leadUser) {
                  setSelectedManagerForProjects(leadUser);
                  setProjectFilter("completed");
                  const completedProjects = teamProjects.filter((p) => p.status === "completed");
                  setSelectedProject(completedProjects[0] || null);
                }
              };

              const teamTasks = allTasks.filter((t) => teamProjects.some(p => p.id === t.projectId));
              const totalTasks = teamTasks.length;
              const completedTaskCount = teamTasks.filter(t => t.status === "completed").length;
              const computedHealth = totalTasks > 0 ? Math.round((completedTaskCount / totalTasks) * 100) : 100;

              // Health color logic
              let healthColorClass = "bg-emerald-500";
              let healthTextClass = "text-emerald-700";
              if (computedHealth < 50) {
                healthColorClass = "bg-rose-500";
                healthTextClass = "text-rose-700";
              } else if (computedHealth < 80) {
                healthColorClass = "bg-amber-500";
                healthTextClass = "text-amber-700";
              }

              return (
                <Card key={team.id} className="transition-all hover:-translate-y-0.5 hover:shadow-md duration-200 relative overflow-hidden flex flex-col justify-between">
                  {/* Top priority highlight line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${team.priority === "urgent" ? "bg-red-500" :
                    team.priority === "high" ? "bg-orange-500" :
                      team.priority === "medium" ? "bg-blue-500" : "bg-slate-300"
                    }`} />

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header: Icon and Title */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border shrink-0 shadow-2xs ${getIconColorClasses(team.type)}`}>
                          {getIconSvg(team.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{team.name}</h4>
                          <span className="text-[10px] font-semibold text-slate-400 mt-0.5 inline-block">{team.type || "General"}</span>
                        </div>
                      </div>

                      {/* Action buttons (View Details + Dropdown) */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedTeamForDetail(team)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-full transition cursor-pointer"
                        >
                          Details
                        </button>


                      </div>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {team.description || "No description provided."}
                      </p>

                      {/* Team Lead */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-400 font-medium">Team Lead</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50 text-[9px] font-bold text-primary-700">
                            {lead?.avatar || "?"}
                          </span>
                          <span>{lead?.name || "Unassigned"}</span>
                          {team.leadId === currentUser.id && (
                            <span className="text-[9px] bg-primary-100 text-primary-700 px-1 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </div>

                      {/* Bubble stack + clickable task counts */}
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                        <div className="bg-slate-50 p-2 rounded-xl text-center flex flex-col items-center justify-center border border-slate-200/10">
                          <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Members</p>
                          <div className="flex -space-x-2 overflow-hidden">
                            {members.slice(0, 2).map((member) => (
                              <Link
                                key={member.id}
                                href={`/employees/${member.id}`}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-150 text-[8px] font-extrabold text-slate-700 ring-2 ring-white border border-slate-200/50 hover:z-10 hover:-translate-y-0.5 transition-transform"
                                title={`${member.name} - ${member.title}`}
                              >
                                {member.avatar}
                              </Link>
                            ))}
                            {members.length > 2 && (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[8px] font-extrabold text-slate-800 ring-2 ring-white border border-slate-300">
                                +{members.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={handleOngoingClick}
                          className="bg-slate-50 p-2 rounded-xl text-center flex flex-col justify-center border border-slate-200/10 hover:bg-amber-50 hover:border-amber-200 transition cursor-pointer group"
                        >
                          <p className="text-[9px] font-bold uppercase text-slate-400 group-hover:text-amber-600">Ongoing</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5 group-hover:text-amber-700 group-hover:underline">{ongoingCount}</p>
                        </button>

                        <button
                          onClick={handleCompletedClick}
                          className="bg-slate-50 p-2 rounded-xl text-center flex flex-col justify-center border border-slate-200/10 hover:bg-emerald-50 hover:border-emerald-200 transition cursor-pointer group"
                        >
                          <p className="text-[9px] font-bold uppercase text-slate-400 group-hover:text-emerald-600">Completed</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5 group-hover:text-emerald-700 group-hover:underline">{completedCount}</p>
                        </button>
                      </div>

                      {/* Health progress bar */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Team Health</span>
                          <span className={`font-bold ${healthTextClass}`}>{computedHealth}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 border border-slate-200/20 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${healthColorClass}`} style={{ width: `${computedHealth}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* TabContent: Managers List */}
      {activeTab === "managers" && showManagersTab && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {managers.map((manager) => {
            const stats = TeamsService.getManagerAnalytics(manager);
            const deptThemes = getDeptColorClasses(stats.department);
            const teams = allTeams.filter((t) => t.leadId === manager.id);
            const teamIds = new Set(teams.map((t) => t.id));

            return (
              <Card
                key={manager.id}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col justify-between border border-slate-200/80"
              >
                {/* Modern colorful top glow header border */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${deptThemes.gradient}`} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Profile Header Block */}
                  <div className="flex items-start justify-between gap-3.5 mb-4">
                    <div className="flex items-center gap-3.5">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm font-bold text-slate-800 ring-2 ${deptThemes.ring}`}>
                        {manager.avatar}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold leading-5 text-slate-900">{manager.name}</h3>
                        <p className={`text-xs font-semibold leading-5 text-slate-500`}>
                          {manager.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-5 leading-normal">{manager.email}</p>

                  {/* Grid Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 mt-auto">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center flex flex-col justify-center border border-slate-100">
                      <p className="text-[10px] font-bold uppercase leading-4 text-slate-400">Teams</p>
                      <p className="text-base font-bold text-slate-850 mt-1">{stats.teamsCount}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedManagerForProjects(manager);
                        setProjectFilter("ongoing");
                        const ongoingProjects = allProjects.filter(
                          (p) => teamIds.has(p.teamId) && p.status !== "completed"
                        );
                        setSelectedProject(ongoingProjects[0] || null);
                      }}
                      className="bg-slate-50 p-2.5 rounded-xl text-center flex flex-col justify-center hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 transition cursor-pointer group shadow-3xs"
                    >
                      <p className="text-[10px] font-bold uppercase leading-4 text-slate-400 group-hover:text-amber-600">Ongoing</p>
                      <p className="text-base font-bold text-slate-800 mt-1 group-hover:text-amber-700 group-hover:underline">
                        {stats.ongoingProjectsCount}
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedManagerForProjects(manager);
                        setProjectFilter("completed");
                        const completedProjects = TeamsService.getManagerCompletedProjects(manager.id);
                        setSelectedProject(completedProjects[0] || null);
                      }}
                      className="bg-slate-50 p-2.5 rounded-xl text-center flex flex-col justify-center hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition cursor-pointer group shadow-3xs"
                    >
                      <p className="text-[10px] font-bold uppercase leading-4 text-slate-400 group-hover:text-emerald-600">Completed</p>
                      <p className="text-base font-bold text-slate-800 mt-1 group-hover:text-emerald-700 group-hover:underline">
                        {stats.completedProjectsCount}
                      </p>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Team */}
      <Modal
        isOpen={isCreateTeamOpen}
        onClose={() => {
          setIsCreateTeamOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? `Edit Team Settings: ${editingTeam.name}` : "Create New Team Space"}
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4">

          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Campaign Analytics"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-slate-50/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Description</label>
            <textarea
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              placeholder="Describe team's core focus and track responsibilities..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-slate-50/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Team Type / Department */}
            <div>
              <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Department</label>
              <select
                value={newTeamType}
                onChange={(e) => setNewTeamType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="QA">QA</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Team Lead Select (Admin only) */}
            <div>
              <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Team Lead</label>
              {isAdmin ? (
                <select
                  value={newTeamLeadId}
                  onChange={(e) => setNewTeamLeadId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700">
                  {currentUser.name} (You)
                </div>
              )}
            </div>
          </div>

          {/* Custom Team Icon Picker */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-2">Team Icon Accent</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: "megaphone", label: "Marketing" },
                { name: "pen", label: "Creative" },
                { name: "chart", label: "Sales" },
                { name: "node", label: "Dev" },
                { name: "headset", label: "Support" },
                { name: "rocket", label: "Launch" }
              ].map((i) => {
                const isSelected = newTeamIcon === i.name;
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setNewTeamIcon(i.name)}
                    className={`flex flex-col items-center justify-center p-2 border.5 rounded-xl transition-all gap-1 cursor-pointer ${isSelected
                      ? "bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-500/10 font-bold"
                      : "border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-400"
                      }`}
                    title={i.label}
                  >
                    <div className={isSelected ? "scale-105 transition" : ""}>
                      {getIconSvg(i.name, isSelected)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Button Group */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-2">Priority Level</label>
            <div className="flex gap-2">
              {["low", "medium", "high", "urgent"].map((p) => {
                const isSelected = newTeamPriority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewTeamPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-bold border rounded-lg transition-all capitalize cursor-pointer ${isSelected
                      ? p === "urgent"
                        ? "bg-red-50 border-red-400 text-red-700 ring-2 ring-red-500/5"
                        : p === "high"
                          ? "bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-500/5"
                          : p === "medium"
                            ? "bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/5"
                            : "bg-slate-100 border-slate-400 text-slate-700 ring-2 ring-slate-400/5"
                      : "border-slate-200 hover:bg-slate-50 text-slate-500"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Members Checklist */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1.5">Select Team Members</label>
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search employee directory..."
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-primary-500 focus:outline-none mb-2 bg-slate-50/20"
            />
            <div className="max-h-36 overflow-y-auto border border-slate-200/60 rounded-lg p-2 space-y-1 bg-slate-50/20">
              {allUsers
                .filter((u) => u.role === "employee" && (u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(memberSearchQuery.toLowerCase())))
                .map((emp) => {
                  const isChecked = selectedMembers.includes(emp.id);
                  return (
                    <label key={emp.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white transition cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedMembers(selectedMembers.filter((id) => id !== emp.id));
                          } else {
                            setSelectedMembers([...selectedMembers, emp.id]);
                          }
                        }}
                        className="rounded border-slate-350 text-primary-600 focus:ring-primary-500/30 h-4 w-4"
                      />
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600">
                        {emp.avatar}
                      </span>
                      <span className="font-semibold text-slate-700">{emp.name}</span>
                      <span className="text-[10px] text-slate-400">({emp.title})</span>
                    </label>
                  );
                })}
              {allUsers.filter((u) => u.role === "employee" && (u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))).length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">No members match search criteria</p>
              )}
            </div>
          </div>

          {/* Team Goals */}
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Target Objectives & Goals (Optional)</label>
            <textarea
              value={newTeamGoals}
              onChange={(e) => setNewTeamGoals(e.target.value)}
              placeholder="e.g., Automate track reports, maintain over 80% customer happiness index..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-slate-50/20"
            />
          </div>

          {/* Config options checkboxes */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={sendInvites}
                onChange={(e) => setSendInvites(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-slate-300 rounded"
              />
              <span className="font-semibold text-slate-700 select-none">Send invitation emails to new members</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={setDefaultHours}
                onChange={(e) => setSetDefaultHours(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-slate-300 rounded"
              />
              <span className="font-semibold text-slate-700 select-none">Set default schedule ({newTeamType.toLowerCase() === "sales" ? "6 days" : "5 days"} / week)</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsCreateTeamOpen(false);
                setEditingTeam(null);
              }}
              className="rounded-full px-5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="primary-cta px-6 py-2 text-xs font-bold shadow-xs hover:shadow-md cursor-pointer">
              {editingTeam ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Manager */}
      <Modal isOpen={isCreateManagerOpen} onClose={() => setIsCreateManagerOpen(false)} title="Create New Manager">
        <form onSubmit={handleCreateManagerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Manager Name</label>
            <input
              type="text"
              required
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
              placeholder="e.g. Harish Kumar"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold leading-5 text-slate-700 mb-1">Department</label>
            <select
              value={newManagerDept}
              onChange={(e) => setNewManagerDept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
            >
              <option value="Engineering">Engineering (5 days / week)</option>
              <option value="Sales">Sales (6 days / week)</option>
              <option value="Design">Design (5 days / week)</option>
              <option value="QA">QA (5 days / week)</option>
              <option value="Operations">Operations (5 days / week)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="teamAccess"
              checked={newManagerAccess}
              onChange={(e) => setNewManagerAccess(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-slate-200 rounded"
            />
            <label htmlFor="teamAccess" className="text-xs font-bold text-slate-700 select-none">
              Authorize to Create Teams
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateManagerOpen(false)}
              className="rounded-full px-5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="primary-cta px-6 py-2 text-xs font-bold shadow-xs hover:shadow-md cursor-pointer">
              Create Manager
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Team Detail Profile */}
      <Modal
        isOpen={selectedTeamForDetail !== null}
        onClose={() => setSelectedTeamForDetail(null)}
        title={selectedTeamForDetail ? `${selectedTeamForDetail.name} Profile` : "Team Profile"}
      >
        {selectedTeamForDetail && (
          <div className="space-y-5">
            {/* Team Meta Block */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 shadow-2xs ${getIconColorClasses(selectedTeamForDetail.type)}`}>
                  {getIconSvg(selectedTeamForDetail.icon)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedTeamForDetail.name}</h3>
                  <span className="text-xs text-slate-400 mt-0.5 inline-block font-medium">{selectedTeamForDetail.type || "General"}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 text-right gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${selectedTeamForDetail.priority === "urgent" ? "bg-red-50 text-red-700 border-red-100" :
                  selectedTeamForDetail.priority === "high" ? "bg-orange-50 text-orange-700 border-orange-100" :
                    selectedTeamForDetail.priority === "medium" ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-slate-50 text-slate-600 border-slate-100"
                  }`}>
                  {selectedTeamForDetail.priority || "Medium"} Priority
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Health: {selectedTeamForDetail.health}%
                </span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid md:grid-cols-5 gap-5">
              {/* Left detail column (3/5) */}
              <div className="md:col-span-3 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedTeamForDetail.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Goals</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedTeamForDetail.goals || "No target goals configured for this team."}
                  </p>
                </div>
              </div>

              {/* Right members column (2/5) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Lead</h4>
                  {(() => {
                    const lead = allUsers.find(u => u.id === selectedTeamForDetail.leadId);
                    return lead ? (
                      <div className="flex items-center gap-2.5 p-2 border border-slate-100 bg-white rounded-xl mt-1.5 shadow-2xs">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700 ring-2 ring-primary-100/5">
                          {lead.avatar}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">{lead.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{lead.title}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic mt-1">No lead assigned.</p>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Team Members ({selectedTeamForDetail.memberIds.length})
                  </h4>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-100 bg-slate-50/20 p-2 rounded-xl">
                    {allUsers
                      .filter(u => selectedTeamForDetail.memberIds.includes(u.id))
                      .map(m => (
                        <div key={m.id} className="flex items-center justify-between p-1.5 bg-white border border-slate-100 rounded-lg shadow-3xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-700">
                              {m.avatar}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{m.name}</p>
                              <p className="text-[9px] text-slate-400 truncate mt-0.5">{m.title}</p>
                            </div>
                          </div>
                          {m.id === selectedTeamForDetail.leadId && (
                            <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded leading-none">Lead</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              {(isAdmin || selectedTeamForDetail.leadId === currentUser.id) ? (
                <button
                  onClick={() => {
                    const team = selectedTeamForDetail;
                    setSelectedTeamForDetail(null);
                    setEditingTeam(team);
                    setNewTeamName(team.name);
                    setNewTeamDesc(team.description || "");
                    setNewTeamType(team.type || "Engineering");
                    setNewTeamIcon(team.icon || "megaphone");
                    setNewTeamPriority(team.priority || "medium");
                    setNewTeamGoals(team.goals || "");
                    setSelectedMembers(team.memberIds.filter(id => id !== team.leadId));
                    setNewTeamLeadId(team.leadId);
                    setIsCreateTeamOpen(true);
                  }}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-full transition cursor-pointer"
                >
                  Edit Team
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedTeamForDetail(null)}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-full transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
