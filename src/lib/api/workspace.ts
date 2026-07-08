import { activity, analytics, dashboardStats } from "@/src/mock-data/analytics";
import { projects } from "@/src/mock-data/projects";
import { tasks } from "@/src/mock-data/tasks";
import { teams } from "@/src/mock-data/teams";
import { users } from "@/src/mock-data/users";
import type { DashboardData, Project, Task, Team, User } from "@/src/types";

const wait = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
};

export async function getDashboardData(): Promise<DashboardData> {
  await wait();

  return {
    currentUser: users[0],
    stats: dashboardStats,
    projects,
    tasks,
    teams,
    users,
    activity,
    analytics,
  };
}

export async function getProjects(): Promise<Project[]> {
  await wait();
  return projects;
}

export async function getTasks(): Promise<Task[]> {
  await wait();
  return tasks;
}

export async function getTeams(): Promise<Team[]> {
  await wait();
  return teams;
}

export async function getUsers(): Promise<User[]> {
  await wait();
  return users;
}
