import type { User } from "@/src/types";

export function getAssigneeManager(assigneeId: string, users: User[]): User | undefined {
  const assignee = users.find((user) => user.id === assigneeId);

  if (!assignee) {
    return undefined;
  }

  const createdByManager = users.find(
    (user) => user.id === assignee.createdBy && user.role === "manager",
  );

  if (createdByManager) {
    return createdByManager;
  }

  const reportingManager = users.find(
    (user) =>
      user.role === "manager" &&
      (user.id === assignee.reportingManager ||
        user.email === assignee.reportingManagerEmail ||
        user.name === assignee.reportingManager),
  );

  if (reportingManager) {
    return reportingManager;
  }

  return users.find(
    (user) =>
      user.role === "manager" &&
      user.teamId === assignee.teamId &&
      user.id !== assignee.id,
  );
}

export function getTaskManager(taskManagerId: string | undefined, assigneeId: string, users: User[]): User | undefined {
  if (taskManagerId) {
    const assignedManager = users.find((user) => user.id === taskManagerId && user.role === "manager");

    if (assignedManager) {
      return assignedManager;
    }
  }

  return getAssigneeManager(assigneeId, users);
}
