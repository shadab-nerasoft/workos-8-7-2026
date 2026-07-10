import { useTaskStore } from "@/src/store/task-store";
import type { Task, TaskStatus } from "@/src/types";

/**
 * Tasks service — the single API seam for task data.
 *
 * TODAY: reads/writes the Zustand store (hydrated from mock data).
 * LATER: replace each function body with a fetch() call and keep the
 * store update as the client-side cache write. Pages keep calling the
 * same functions; components never change.
 */

export interface CreateTaskInput {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  managerId?: string;
  status: TaskStatus;
  priority: Task["priority"];
  deadline: string;
}

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    // LATER: const tasks = await (await fetch("/api/tasks")).json(); useTaskStore.getState().hydrate(tasks);
    return useTaskStore.getState().tasks;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    // LATER: const task = await (await fetch("/api/tasks", { method: "POST", body: JSON.stringify(input) })).json();
    const task: Task = {
      id: `t-${Date.now()}`,
      ...input,
      comments: 0,
      attachments: 0,
      createdAt: new Date().toISOString(),
    };
    useTaskStore.getState().createTask(task);
    return task;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
    useTaskStore.getState().updateTask(id, updates);
  },

  async deleteTask(id: string): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    useTaskStore.getState().deleteTask(id);
  },

  async moveTask(id: string, newStatus: TaskStatus): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    useTaskStore.getState().moveTask(id, newStatus);
  },

  async assignTask(id: string, userId: string): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}/assignee`, { method: "PATCH", body: JSON.stringify({ userId }) });
    useTaskStore.getState().assignTask(id, userId);
  },

  async archiveTask(id: string, archivedBy: string, reason?: string): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}/archive`, { method: "POST", body: JSON.stringify({ reason }) });
    useTaskStore.getState().archiveTask(id, archivedBy, reason);
  },

  async restoreTask(id: string): Promise<void> {
    // LATER: await fetch(`/api/tasks/${id}/restore`, { method: "POST" });
    useTaskStore.getState().restoreTask(id);
  },
};
