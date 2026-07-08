"use client";

import { useState } from "react";
import type { TaskLabel } from "@/src/types";
import { Add } from "iconsax-react";

interface TaskLabelsProps {
  taskId: string;
  assignedLabels: string[];
  availableLabels: TaskLabel[];
  onAddLabel: (taskId: string, labelId: string) => void;
  onRemoveLabel: (taskId: string, labelId: string) => void;
  onCreateLabel?: (label: TaskLabel) => void;
}

export function TaskLabels({
  taskId,
  assignedLabels,
  availableLabels,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
}: TaskLabelsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const assignedLabelObjects = availableLabels.filter((l) => assignedLabels.includes(l.id));
  const unassignedLabels = availableLabels.filter((l) => !assignedLabels.includes(l.id));

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      const label: TaskLabel = {
        id: `label-${Date.now()}`,
        name: newLabelName,
        color: newLabelColor,
        createdBy: "current-user",
        createdAt: new Date().toISOString(),
      };
      onCreateLabel?.(label);
      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      setIsCreating(false);
    }
  };

  const handleAddLabel = (labelId: string) => {
    onAddLabel(taskId, labelId);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Labels</h3>

      {/* Assigned Labels */}
      <div className="flex flex-wrap gap-2">
        {assignedLabelObjects.map((label) => (
          <div
            key={label.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white group"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
            <button
              onClick={() => onRemoveLabel(taskId, label.id)}
              className="ml-1 opacity-75 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add Label */}
      {isAdding ? (
        <div className="space-y-2 p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Select a label</span>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {isCreating ? "Browse" : "Create new"}
            </button>
          </div>

          {isCreating ? (
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newLabelColor === color ? "border-slate-900" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLabel}
                  className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {unassignedLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => handleAddLabel(label.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </button>
              ))}
              {unassignedLabels.length === 0 && (
                <p className="text-sm text-slate-500 px-3 py-2">All labels assigned</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Add size={16} />
          Add label
        </button>
      )}
    </div>
  );
}
