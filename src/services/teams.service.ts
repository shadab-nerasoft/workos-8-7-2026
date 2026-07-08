import { useProjectStore } from "@/src/store/project-store";
import { useTaskStore } from "@/src/store/task-store";
import { useTeamStore } from "@/src/store/team-store";
import { useEmployeeStore } from "@/src/store/employee-store";
import type { User, Team, Project } from "@/src/types";

export interface ManagerAnalytics {
  managerId: string;
  name: string;
  department: string;
  schedule: string;
  teamsCount: number;
  ongoingProjectsCount: number;
  completedProjectsCount: number;
}

export interface EmployeeContributionReport {
  employeeId: string;
  name: string;
  title: string;
  email: string;
  utilization: number;
  performance: number;
  workSchedule: string;
  featuresAdded: string[];
  tasksCount: number;
}

export const TeamsService = {
  /**
   * Checks if the manager works 6 days (Sales Manager) or 5 days (all other departments).
   */
  getManagerSchedule(department: string): string {
    const isSales = department.toLowerCase().trim() === "sales";
    return isSales ? "6 days / week (Sales)" : "5 days / week";
  },

  /**
   * Retrieves analytics for a specific manager.
   */
  getManagerAnalytics(manager: User): ManagerAnalytics {
    const teams = useTeamStore.getState().getAllTeams().filter((t) => t.leadId === manager.id);
    const teamIds = new Set(teams.map((t) => t.id));

    const allProjects = useProjectStore.getState().getAllProjects();
    const managerProjects = allProjects.filter((p) => teamIds.has(p.teamId));

    const ongoing = managerProjects.filter((p) => p.status !== "completed").length;
    const completed = managerProjects.filter((p) => p.status === "completed").length;

    const departmentName = manager.department || manager.title.replace(" Manager", "") || "Engineering";

    return {
      managerId: manager.id,
      name: manager.name,
      department: departmentName,
      schedule: this.getManagerSchedule(departmentName),
      teamsCount: teams.length,
      ongoingProjectsCount: ongoing,
      completedProjectsCount: completed,
    };
  },

  /**
   * Retrieves all completed projects managed by a specific manager.
   */
  getManagerCompletedProjects(managerId: string): Project[] {
    const teams = useTeamStore.getState().getAllTeams().filter((t) => t.leadId === managerId);
    const teamIds = new Set(teams.map((t) => t.id));

    return useProjectStore.getState().getAllProjects().filter((p) => teamIds.has(p.teamId) && p.status === "completed");
  },

  /**
   * Retrieves all employees who belong to a specific team.
   */
  getTeamMembers(teamId: string): User[] {
    return useEmployeeStore.getState().getAllUsers().filter((u) => u.teamId === teamId);
  },

  /**
   * Retrieves a dynamic profile and contribution report for an employee.
   */
  getEmployeeContributionReport(employee: User): EmployeeContributionReport {
    // Determine schedule based on department
    const isSales = employee.title.toLowerCase().includes("sales") || employee.email.includes("sales");
    const workSchedule = isSales ? "6 days / week" : "5 days / week";

    const allTasks = useTaskStore.getState().getAllTasks().filter((t) => t.assigneeId === employee.id);
    const completedTasksCount = allTasks.filter((t) => t.status === "completed").length;

    // Dynamically generate colorful features based on their title and completed tasks count
    const features: string[] = [];
    if (employee.title.toLowerCase().includes("frontend")) {
      features.push("Dashboard dark mode refactoring", "Kanban drag-and-drop animation", "Command palette global search UI");
    } else if (employee.title.toLowerCase().includes("backend")) {
      features.push("API Gateway migration and routing", "Zustand hydration middleware hook", "Role-based authorization middleware");
    } else if (employee.title.toLowerCase().includes("designer")) {
      features.push("Design System v2 components styleguide", "Glassmorphic cards theme layout", "Interactive calendar wireframes");
    } else if (employee.title.toLowerCase().includes("qa")) {
      features.push("Cypress integration test suite", "Playwright mobile viewport scenarios", "Auth credentials regression tests");
    } else {
      features.push("Quarterly analytics reporting metrics", "Operations resource monitoring alerts", "Team allocation planning charts");
    }

    return {
      employeeId: employee.id,
      name: employee.name,
      title: employee.title,
      email: employee.email,
      utilization: employee.utilization,
      performance: employee.performance,
      workSchedule,
      featuresAdded: features.slice(0, Math.max(1, Math.min(features.length, completedTasksCount + 1))),
      tasksCount: allTasks.length,
    };
  },

  /**
   * Admin creating a new manager.
   */
  createManager(data: { name: string; department: string; canCreateTeam: boolean }): User {
    const formattedName = data.name.trim();
    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const email = `${formattedName.toLowerCase().replace(/\s+/g, ".")}@workos.test`;
    const managerId = `u-manager-${Date.now()}`;

    const newManager: User = {
      workingDaysPerWeek: data.department.toLowerCase() === "sales" ? 6 : 5,
      id: managerId,
      name: formattedName,
      role: "manager",
      title: `${data.department} Lead`,
      email,
      teamId: "", // unassigned initially
      avatar: initials,
      utilization: 70, // Default baseline
      performance: 85, // Default baseline
      department: data.department,
      canCreateTeam: data.canCreateTeam,
    };

    useEmployeeStore.getState().createUser(newManager);
    return newManager;
  },

  /**
   * Manager or Admin creating a new team.
   */
  createTeam(data: {
    name: string;
    leadId: string;
    description: string;
    icon?: string;
    type?: string;
    priority?: string;
    goals?: string;
    memberIds?: string[];
  }): Team {
    const teamId = `t-${Date.now()}`;
    const initialMemberIds = Array.from(new Set([data.leadId, ...(data.memberIds || [])]));

    const leadUser = useEmployeeStore.getState().getUserById(data.leadId);
    const workingDays = leadUser?.workingDaysPerWeek || (data.type?.toLowerCase() === "sales" ? 6 : 5);

    const newTeam: Team = {
      workingDaysPerWeek: workingDays,
      id: teamId,
      name: data.name.trim(),
      leadId: data.leadId,
      memberIds: initialMemberIds,
      projectIds: [],
      health: 100, // Initial team health is perfect
      velocity: 30, // Default team velocity baseline
      description: data.description.trim(),
      icon: data.icon,
      type: data.type,
      priority: data.priority,
      goals: data.goals,
    };

    // Update lead user's teamId and all initial member teamIds
    const employeeStore = useEmployeeStore.getState();
    initialMemberIds.forEach((mId) => {
      const user = employeeStore.getUserById(mId);
      if (user) {
        employeeStore.updateUser(mId, { teamId });
      }
    });

    useTeamStore.getState().createTeam(newTeam);
    return newTeam;
  },

  /**
   * Admin or Manager creating a new employee profile.
   */
  createEmployee(data: { name: string; title: string; email: string; teamId: string; createdById: string }): User {
    const formattedName = data.name.trim();
    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const email = data.email.trim() || `${formattedName.toLowerCase().replace(/\s+/g, ".")}@workos.test`;
    const employeeId = `u-employee-${Date.now()}`;

    const newEmployee: User = {
      id: employeeId,
      name: formattedName,
      role: "employee",
      title: data.title.trim(),
      email,
      teamId: data.teamId,
      avatar: initials,
      utilization: 70,
      performance: 80,
      createdBy: data.createdById,
    };

    useEmployeeStore.getState().createUser(newEmployee);
    
    // Add member to the team store
    if (data.teamId) {
      useTeamStore.getState().addMember(data.teamId, employeeId);
    }

    return newEmployee;
  },
};
