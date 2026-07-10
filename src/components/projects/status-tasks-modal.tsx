"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/src/components/ui/modal";
import { PriorityBadge } from "@/src/components/ui/badge";
import { formatDate, titleCase } from "@/src/lib/utils/format";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import type { Task, TaskStatus, User } from "@/src/types";

interface StatusTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus;
  /** Tasks pre-scoped to the project by the page. */
  projectTasks: Task[];
  users: User[];
  onEditTask: (task: Task) => void;
}

const ITEMS_PER_PAGE = 5;

/** Pure presentational "view all by status" modal. Data comes from the page. */
export function StatusTasksModal({ isOpen, onClose, status, projectTasks, users, onEditTask }: StatusTasksModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const tasks = useMemo(
    () =>
      projectTasks.filter(
        (t) => t.status === status || (status === "completed" && t.status === "review"),
      ),
    [projectTasks, status],
  );

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getUser = (id: string) => users.find(u => u.id === id);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`All ${titleCase(status === "completed" ? "Done" : status)} Tasks`}
      description={`Showing ${paginatedTasks.length} of ${tasks.length} tasks`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {paginatedTasks.map((task) => {
            const assignee = getUser(task.assigneeId);
            return (
              <div
                key={task.id}
                onClick={() => {
                  onClose();
                  onEditTask(task);
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600">{task.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">Due: {formatDate(task.deadline)}</span>
                    {assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[9px] font-bold text-primary-700">
                          {assignee.avatar}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Unassigned</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs font-medium text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft2 size={16} />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
