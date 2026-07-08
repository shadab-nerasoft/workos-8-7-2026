"use client";

import { useState } from "react";
import type { Subtask } from "@/src/types";
import { Add, Trash } from "iconsax-react";
import { Button } from "@/src/components/ui/button";

interface TaskSubtasksProps {
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  completionPercent: number;
}

export function TaskSubtasks({
  taskId,
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  completionPercent,
}: TaskSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(taskId, newSubtaskTitle);
      setNewSubtaskTitle("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Subtasks</h3>
          <div className="text-sm text-slate-600">{completionPercent}% complete</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 group"
          >
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => onToggleSubtask(taskId, subtask.id, !subtask.completed)}
              className="w-5 h-5 rounded accent-primary-600 flex-shrink-0 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${subtask.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
              {subtask.title}
            </span>
            <button
              onClick={() => onDeleteSubtask(taskId, subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
            >
              <Trash size={16} className="text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask */}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") setIsAdding(false);
            }}
            placeholder="Add a subtask..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={handleAddSubtask} size="sm">
            Add
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Add size={16} />
          Add subtask
        </button>
      )}
    </div>
  );
}
