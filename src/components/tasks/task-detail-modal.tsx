"use client";

import { useState } from "react";
import type { Task, TaskComment, TaskAttachment, TaskActivity } from "@/src/types";
import { formatDate } from "@/src/lib/utils/format";
import { TaskStatusBadge, PriorityBadge } from "@/src/components/ui/badge";
import { Modal } from "@/src/components/ui/modal";
import { TaskComments } from "./task-comments";
import { TaskAttachments } from "./task-attachments";
import { TaskActivityTimeline } from "./task-activity-timeline";
import { Trash, Edit } from "iconsax-react";

type TabType = "details" | "comments" | "attachments" | "activity";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  onAddComment?: (taskId: string, content: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onAddAttachment?: (taskId: string, attachment: TaskAttachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  assigneeName?: string;
  managerName?: string;
  projectName?: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  activities?: TaskActivity[];
  currentUserId?: string;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
  assigneeName,
  managerName,
  projectName,
  comments = [],
  attachments = [],
  activities = [],
  currentUserId = "current-user",
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");

  if (!task) return null;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: "details", label: "Details" },
    { id: "comments", label: "Comments", badge: comments.length },
    { id: "attachments", label: "Files", badge: attachments.length },
    { id: "activity", label: "Activity" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} description={projectName}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "details" && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
                {projectName && <p className="mt-1 text-sm text-slate-600">{projectName}</p>}
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg p-2 hover:bg-slate-100" title="Edit task">
                  <Edit size={18} className="text-slate-600" />
                </button>
                <button
                  onClick={() => {
                    onDelete?.(task.id);
                    onClose();
                  }}
                  className="rounded-lg p-2 hover:bg-red-50"
                  title="Delete task"
                >
                  <Trash size={18} className="text-red-600" />
                </button>
              </div>
            </div>

            {task.description && (
              <div>
                <h3 className="font-semibold text-slate-900">Description</h3>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">{task.description}</p>
              </div>
            )}

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-700">Status</p>
                <div className="mt-2">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-700">Priority</p>
                <div className="mt-2">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-700">Deadline</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm ${isOverdue ? "font-semibold text-red-600" : "text-slate-600"}`}>
                    {task.deadline ? formatDate(task.deadline) : "Not set"}
                    {isOverdue && " (Overdue)"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-700">Created</p>
                <p className="mt-2 text-sm text-slate-600">{task.createdAt ? formatDate(task.createdAt) : "Unknown"}</p>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <p className="text-xs font-semibold uppercase text-slate-700">Assigned To</p>
              <p className="mt-2 text-sm text-slate-600">{assigneeName || "Unassigned"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-700">Manager</p>
              <p className="mt-2 text-sm text-slate-600">{managerName || "Unassigned"}</p>
            </div>
          </>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <TaskComments
            taskId={task.id}
            comments={comments}
            currentUserId={currentUserId}
            onAddComment={onAddComment || (() => {})}
            onDeleteComment={onDeleteComment}
            onEditComment={() => {}}
          />
        )}

        {/* Attachments Tab */}
        {activeTab === "attachments" && (
          <TaskAttachments
            taskId={task.id}
            attachments={attachments}
            onAddAttachment={onAddAttachment || (() => {})}
            onDeleteAttachment={onDeleteAttachment}
          />
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <TaskActivityTimeline activities={activities} />
        )}

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={() => {
              onUpdate?.(task.id, { status: task.status === "completed" ? "in-progress" : "completed" });
            }}
            className="flex-1 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
          >
            {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
