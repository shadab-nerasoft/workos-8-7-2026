import { create } from "zustand";
import type { Task, TaskStatus, TaskComment, TaskAttachment, TaskActivity, Subtask, TaskDependency, TaskLabel, ArchivedTask, TaskNotification, TaskSearchFilter } from "@/src/types";
import { useAuthStore } from "./auth-store";
import { useActivityStore } from "./activity-store";

interface TaskState {
  /** Single source of truth for active (non-archived) tasks. */
  tasks: Task[];
  comments: Map<string, TaskComment[]>;
  attachments: Map<string, TaskAttachment[]>;
  activities: Map<string, TaskActivity[]>;
  subtasks: Map<string, Subtask[]>;
  dependencies: Map<string, TaskDependency[]>;
  labels: TaskLabel[];
  archivedTasks: ArchivedTask[];
  notifications: TaskNotification[];
  savedFilters: TaskSearchFilter[];
  hydrate: (tasks: Task[]) => void;
  createTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  assignTask: (taskId: string, userId: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getAllTasks: () => Task[];
  getTeamTasks: (teamMemberIds: string[]) => Task[];
  getOverdueTasks: (beforeDate?: Date) => Task[];
  searchTasks: (query: string) => Task[];
  getTasksByPriority: (priority: Task["priority"]) => Task[];
  getTaskStats: () => { total: number; completed: number; inProgress: number; overdue: number };
  filterTasks: (filters: { status?: TaskStatus; priority?: Task["priority"]; assigneeIds?: string[] }) => Task[];
  addComment: (taskId: string, comment: TaskComment) => void;
  updateComment: (taskId: string, commentId: string, content: string) => void;
  deleteComment: (taskId: string, commentId: string) => void;
  getComments: (taskId: string) => TaskComment[];
  addAttachment: (taskId: string, attachment: TaskAttachment) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
  getAttachments: (taskId: string) => TaskAttachment[];
  addActivity: (taskId: string, activity: TaskActivity) => void;
  getActivities: (taskId: string) => TaskActivity[];
  // Subtask methods
  addSubtask: (taskId: string, subtask: Subtask) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  getSubtasks: (taskId: string) => Subtask[];
  getSubtaskCompletionPercent: (taskId: string) => number;
  // Dependency methods
  addDependency: (dependency: TaskDependency) => void;
  removeDependency: (dependencyId: string) => void;
  getDependencies: (taskId: string) => TaskDependency[];
  getBlockedTasks: (taskId: string) => string[];
  // Label methods
  createLabel: (label: TaskLabel) => void;
  updateLabel: (labelId: string, updates: Partial<TaskLabel>) => void;
  deleteLabel: (labelId: string) => void;
  getLabels: () => TaskLabel[];
  // Archive methods
  archiveTask: (taskId: string, userId: string, reason?: string) => void;
  restoreTask: (taskId: string) => void;
  getArchivedTasks: () => ArchivedTask[];
  // Notification methods
  addNotification: (notification: TaskNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  getNotifications: (userId: string) => TaskNotification[];
  // Filter methods
  saveFilter: (filter: TaskSearchFilter) => void;
  deleteFilter: (filterId: string) => void;
  getSavedFilters: () => TaskSearchFilter[];
  applyFilter: (filter: TaskSearchFilter) => Task[];
}

function logCompletionActivity(task: Task) {
  const currentUser = useAuthStore.getState().currentUser;
  if (currentUser) {
    useActivityStore.getState().addActivity({
      actorId: currentUser.id,
      action: "completed task",
      subject: task.title,
      projectId: task.projectId,
    });
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  comments: new Map(),
  attachments: new Map(),
  activities: new Map(),
  subtasks: new Map(),
  dependencies: new Map(),
  labels: [],
  archivedTasks: [],
  notifications: [],
  savedFilters: [],

  hydrate: (tasks) => set({ tasks }),

  createTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => {
      const existing = state.tasks.find((t) => t.id === id);
      if (!existing) return state;

      if (updates.status === "completed" && existing.status !== "completed") {
        logCompletionActivity(existing);
      }

      return {
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
    }),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  moveTask: (taskId, newStatus) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return state;

      if (newStatus === "completed") {
        logCompletionActivity(task);
      }

      return {
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      };
    }),

  assignTask: (taskId, userId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, assigneeId: userId } : t)),
    })),

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  getTasksByProject: (projectId) =>
    get().tasks.filter((t) => t.projectId === projectId),

  getTasksByAssignee: (assigneeId) =>
    get().tasks.filter((t) => t.assigneeId === assigneeId),

  getTasksByStatus: (status) =>
    get().tasks.filter((t) => t.status === status),

  getAllTasks: () => get().tasks,

  // Manager & Admin query methods
  getTeamTasks: (teamMemberIds) =>
    get().tasks.filter((t) => teamMemberIds.includes(t.assigneeId)),

  getOverdueTasks: (beforeDate = new Date()) =>
    get().tasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < beforeDate),

  searchTasks: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().tasks.filter((t) => t.title.toLowerCase().includes(lowerQuery) || t.description?.toLowerCase().includes(lowerQuery));
  },

  getTasksByPriority: (priority) =>
    get().tasks.filter((t) => t.priority === priority),

  getTaskStats: () => {
    const tasks = get().tasks;
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date()).length,
    };
  },

  filterTasks: (filters) => {
    let filtered = get().tasks;

    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      filtered = filtered.filter((t) => filters.assigneeIds!.includes(t.assigneeId));
    }

    return filtered;
  },

  // Comment methods
  addComment: (taskId, comment) =>
    set((state) => {
      const next = new Map(state.comments);
      const existing = next.get(taskId) || [];
      next.set(taskId, [...existing, comment]);

      return {
        comments: next,
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, comments: existing.length + 1 } : t
        ),
      };
    }),

  updateComment: (taskId, commentId, content) =>
    set((state) => {
      const next = new Map(state.comments);
      const comments = next.get(taskId) || [];
      const updated = comments.map((c) => (c.id === commentId ? { ...c, content, edited: true, updatedAt: new Date().toISOString() } : c));
      next.set(taskId, updated);
      return { comments: next };
    }),

  deleteComment: (taskId, commentId) =>
    set((state) => {
      const next = new Map(state.comments);
      const comments = next.get(taskId) || [];
      const filtered = comments.filter((c) => c.id !== commentId);
      next.set(taskId, filtered);

      return {
        comments: next,
        tasks: state.tasks.map((t) =>
          t.id === taskId && t.comments > 0 ? { ...t, comments: t.comments - 1 } : t
        ),
      };
    }),

  getComments: (taskId) => get().comments.get(taskId) || [],

  // Attachment methods
  addAttachment: (taskId, attachment) =>
    set((state) => {
      const next = new Map(state.attachments);
      const existing = next.get(taskId) || [];
      next.set(taskId, [...existing, attachment]);

      return {
        attachments: next,
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, attachments: existing.length + 1 } : t
        ),
      };
    }),

  deleteAttachment: (taskId, attachmentId) =>
    set((state) => {
      const next = new Map(state.attachments);
      const attachments = next.get(taskId) || [];
      const filtered = attachments.filter((a) => a.id !== attachmentId);
      next.set(taskId, filtered);

      return {
        attachments: next,
        tasks: state.tasks.map((t) =>
          t.id === taskId && t.attachments > 0 ? { ...t, attachments: t.attachments - 1 } : t
        ),
      };
    }),

  getAttachments: (taskId) => get().attachments.get(taskId) || [],

  // Activity methods
  addActivity: (taskId, activity) =>
    set((state) => {
      const next = new Map(state.activities);
      const existing = next.get(taskId) || [];
      next.set(taskId, [activity, ...existing]);
      return { activities: next };
    }),

  getActivities: (taskId) => get().activities.get(taskId) || [],

  // Subtask methods
  addSubtask: (taskId, subtask) =>
    set((state) => {
      const next = new Map(state.subtasks);
      const existing = next.get(taskId) || [];
      next.set(taskId, [...existing, subtask]);
      return { subtasks: next };
    }),

  updateSubtask: (taskId, subtaskId, updates) =>
    set((state) => {
      const next = new Map(state.subtasks);
      const subtasks = next.get(taskId) || [];
      const updated = subtasks.map((s) => (s.id === subtaskId ? { ...s, ...updates } : s));
      next.set(taskId, updated);
      return { subtasks: next };
    }),

  deleteSubtask: (taskId, subtaskId) =>
    set((state) => {
      const next = new Map(state.subtasks);
      const subtasks = next.get(taskId) || [];
      next.set(taskId, subtasks.filter((s) => s.id !== subtaskId));
      return { subtasks: next };
    }),

  getSubtasks: (taskId) => get().subtasks.get(taskId) || [],

  getSubtaskCompletionPercent: (taskId) => {
    const subtasks = get().subtasks.get(taskId) || [];
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  },

  // Dependency methods
  addDependency: (dependency) =>
    set((state) => {
      const next = new Map(state.dependencies);
      const existing = next.get(dependency.sourceTaskId) || [];
      next.set(dependency.sourceTaskId, [...existing, dependency]);
      return { dependencies: next };
    }),

  removeDependency: (dependencyId) =>
    set((state) => {
      const next = new Map(state.dependencies);
      for (const [key, deps] of next.entries()) {
        next.set(key, deps.filter((d) => d.id !== dependencyId));
      }
      return { dependencies: next };
    }),

  getDependencies: (taskId) => get().dependencies.get(taskId) || [],

  getBlockedTasks: (taskId) => {
    const deps = get().dependencies.get(taskId) || [];
    return deps.filter((d) => d.type === "blocks").map((d) => d.targetTaskId);
  },

  // Label methods
  createLabel: (label) =>
    set((state) => ({
      labels: [...state.labels, label],
    })),

  updateLabel: (labelId, updates) =>
    set((state) => ({
      labels: state.labels.map((l) => (l.id === labelId ? { ...l, ...updates } : l)),
    })),

  deleteLabel: (labelId) =>
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== labelId),
    })),

  getLabels: () => get().labels,

  // Archive methods — archiving removes the task from the active list;
  // restoring puts it back. The task lives in exactly one of the two lists.
  archiveTask: (taskId, userId, reason) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;
      const archived: ArchivedTask = {
        id: `archived-${taskId}`,
        task,
        archivedAt: new Date().toISOString(),
        archivedBy: userId,
        reason,
      };
      return {
        tasks: state.tasks.filter((t) => t.id !== taskId),
        archivedTasks: [...state.archivedTasks, archived],
      };
    }),

  restoreTask: (taskId) =>
    set((state) => {
      const archived = state.archivedTasks.find((a) => a.task.id === taskId);
      if (!archived) return state;
      return {
        tasks: [...state.tasks, archived.task],
        archivedTasks: state.archivedTasks.filter((a) => a.task.id !== taskId),
      };
    }),

  getArchivedTasks: () => get().archivedTasks,

  // Notification methods
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    })),

  getNotifications: (userId) => {
    const notifications = get().notifications.filter((n) => n.userId === userId);
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Filter methods
  saveFilter: (filter) =>
    set((state) => ({
      savedFilters: [...state.savedFilters, filter],
    })),

  deleteFilter: (filterId) =>
    set((state) => ({
      savedFilters: state.savedFilters.filter((f) => f.id !== filterId),
    })),

  getSavedFilters: () => get().savedFilters,

  applyFilter: (filter) => {
    const tasks = get().tasks;
    return tasks.filter((task) => {
      return filter.conditions.every((condition) => {
        switch (condition.field) {
          case "status":
            return task.status === condition.value;
          case "priority":
            return task.priority === condition.value;
          case "assignee":
            return task.assigneeId === condition.value;
          case "label":
            return task.labels?.includes(condition.value as string) || false;
          case "deadline":
            if (!task.deadline) return condition.operator === "is-empty";
            return new Date(task.deadline) >= new Date(condition.value as string);
          default:
            return true;
        }
      });
    });
  },
}));
