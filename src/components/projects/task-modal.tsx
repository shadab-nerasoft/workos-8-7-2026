"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/src/components/ui/modal";
import { FormField, Input, TextArea, Select } from "@/src/components/ui/form-field";
import { getAssigneeManager } from "@/src/lib/utils/task-manager";
import type { Task, TaskStatus, Priority, User, Project } from "@/src/types";

export interface TaskModalSubmitValues {
  title: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  assigneeId: string;
  managerId?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projectId: string;
  /** Users that can be assigned, provided by the page. */
  users: User[];
  /** Projects the current user may move this task into, pre-scoped by the page. */
  availableProjects: Project[];
  /** True when the viewer may not modify this task (computed by the page via permissions). */
  isReadOnly?: boolean;
  /** True when the assignee field is locked to the current user (employees). */
  lockAssigneeTo?: string | null;
  /** Called with the final values on submit. The page owns persistence. */
  onSubmit: (values: TaskModalSubmitValues) => void;
}

/**
 * Pure presentational task create/edit modal.
 * All data, scoping, permissions, and persistence are owned by the page.
 */
export function TaskModal({
  isOpen,
  onClose,
  task,
  projectId,
  users,
  availableProjects,
  isReadOnly = false,
  lockAssigneeTo = null,
  onSubmit,
}: TaskModalProps) {
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const manager = getAssigneeManager(assigneeId, users);

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
        setDeadline(nextWeek.toISOString().split("T")[0]);
        setAssigneeId(lockAssigneeTo ?? "");
        setSelectedProjectId(availableProjects[0]?.id ?? projectId);
      }
    }
  }, [availableProjects, isOpen, projectId, task, lockAssigneeTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !selectedProjectId) return;

    const finalAssigneeId = lockAssigneeTo ?? assigneeId;
    const finalManager = getAssigneeManager(finalAssigneeId, users);

    onSubmit({
      title,
      description,
      projectId: selectedProjectId,
      status,
      priority,
      deadline,
      assigneeId: finalAssigneeId,
      managerId: finalManager?.id,
    });
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
              disabled={isReadOnly || !!lockAssigneeTo}
              required
            >
              <option value="" disabled>Select an assignee</option>
              {users.map((user) => (
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
