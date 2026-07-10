"use client";

import { useMemo, useState, useEffect } from "react";
import { Modal } from "@/src/components/ui/modal";
import { FormField, Input, TextArea, Select } from "@/src/components/ui/form-field";
import { useAuthStore, useEmployeeStore, useProjectStore, useTaskStore } from "@/src/store";
import { getAssigneeManager } from "@/src/lib/utils/task-manager";
import type { Task, TaskStatus, Priority } from "@/src/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projectId: string;
}

export function TaskModal({ isOpen, onClose, task, projectId }: TaskModalProps) {
  const { currentUser } = useAuthStore();
  const allUsers = useEmployeeStore((s) => s.getAllUsers());
  const allProjects = useProjectStore((s) => s.getAllProjects());
  const allTasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const isEdit = !!task;
  const isEmployee = currentUser?.role === "employee";
  
  // If editing an existing task, an employee can only edit it if they are the assignee
  const isReadOnly = isEdit && isEmployee && task.assigneeId !== currentUser?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const manager = getAssigneeManager(assigneeId, allUsers);

  const availableProjects = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const currentProject = allProjects.find((project) => project.id === (task?.projectId ?? projectId));

    if (currentUser.role === "admin") {
      return allProjects;
    }

    if (currentUser.role === "manager") {
      const managerProjects = allProjects.filter(
        (project) => project.ownerId === currentUser.id || project.teamId === currentUser.teamId,
      );

      return currentProject && !managerProjects.some((project) => project.id === currentProject.id)
        ? [currentProject, ...managerProjects]
        : managerProjects;
    }

    const assignedProjectIds = new Set(
      allTasks
        .filter((userTask) => userTask.assigneeId === currentUser.id)
        .map((userTask) => userTask.projectId),
    );

    const employeeProjects = allProjects.filter((project) => assignedProjectIds.has(project.id));

    return currentProject && !employeeProjects.some((project) => project.id === currentProject.id)
      ? [currentProject, ...employeeProjects]
      : employeeProjects;
  }, [allProjects, allTasks, currentUser, projectId, task]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setDeadline(task.deadline);
        setAssigneeId(task.assigneeId);
        setSelectedProjectId(task.projectId);
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        // default deadline to one week from today
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setDeadline(nextWeek.toISOString().split('T')[0]);
        // Employees can only assign to themselves
        setAssigneeId(isEmployee && currentUser ? currentUser.id : "");
        setSelectedProjectId(availableProjects[0]?.id ?? projectId);
      }
    }
  }, [availableProjects, isOpen, projectId, task, isEmployee, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !selectedProjectId) return;

    if (isEdit) {
      updateTask(task.id, {
        title,
        description,
        projectId: selectedProjectId,
        status,
        priority,
        deadline,
        assigneeId,
        managerId: manager?.id,
      });
    } else {
      const finalAssigneeId = isEmployee && currentUser ? currentUser.id : assigneeId;
      const finalManager = getAssigneeManager(finalAssigneeId, allUsers);

      createTask({
        id: `t-${Date.now()}`,
        title,
        description,
        projectId: selectedProjectId,
        assigneeId: finalAssigneeId,
        managerId: finalManager?.id,
        status,
        priority,
        deadline,
        comments: 0,
        attachments: 0,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReadOnly ? "View Task" : isEdit ? "Edit Task" : "Create Task"}
      description={isReadOnly ? "You only have permission to view this task." : "Fill in the details below."}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField id="title" label="Task Title" required>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design new landing page"
            disabled={isReadOnly}
            required
          />
        </FormField>

        <FormField id="description" label="Description" required>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task requirements..."
            disabled={isReadOnly}
            required
          />
        </FormField>

        <FormField id="project" label="Project" required>
          <Select
            id="project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={isReadOnly}
            required
          >
            <option value="" disabled>Select a project</option>
            {availableProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="status" label="Status">
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={isReadOnly}
            >
              <option value="todo">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed/Done</option>
            </Select>
          </FormField>

          <FormField id="priority" label="Priority">
            <Select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={isReadOnly}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="deadline" label="Deadline" required>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isReadOnly}
              required
            />
          </FormField>

          <FormField id="assignee" label="Assignee" required>
            <Select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={isReadOnly || isEmployee} // Employees cannot change assignee
              required
            >
              <option value="" disabled>Select an assignee</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField id="manager" label="Manager">
          <Input
            id="manager"
            value={manager ? `${manager.name} (${manager.role})` : "No manager assigned"}
            disabled
            readOnly
          />
        </FormField>

        {!isReadOnly && (
          <div className="mt-2 flex justify-end gap-3 border-t pt-5 divider-accent">
            <button
              type="button"
              onClick={onClose}
              className="soft-control px-5 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProjectId}
              className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
