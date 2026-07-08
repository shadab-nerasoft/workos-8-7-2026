"use client";

import type { Task } from "@/src/types";
import { formatDate } from "@/src/lib/utils/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TaskTimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskTimelineView({ tasks, onTaskClick }: TaskTimelineViewProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [scale, setScale] = useState<"week" | "month">("month");

  const getDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    if (scale === "week") {
      end.setDate(end.getDate() + 7);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return { start, end };
  };

  const getDaysInRange = () => {
    const { start, end } = getDateRange();
    const days = [];
    const current = new Date(start);
    while (current < end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getTaskPosition = (task: Task) => {
    if (!task.deadline) return null;
    const { start, end } = getDateRange();
    const taskDeadline = new Date(task.deadline);
    
    if (taskDeadline < start || taskDeadline > end) return null;
    
    const totalDays = getDaysInRange().length;
    const offset = Math.floor((taskDeadline.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      offset,
      width: Math.max(2, 100 / totalDays),
    };
  };

  const days = getDaysInRange();
  const dayWidth = 100 / days.length;

  const handlePrevious = () => {
    const newDate = new Date(startDate);
    if (scale === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    if (scale === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setStartDate(newDate);
  };

  const tasksWithDeadlines = tasks.filter((t) => t.deadline && getTaskPosition(t));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-slate-900">
            {startDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex gap-2">
          {(["week", "month"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                scale === s
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Header */}
      <div className="overflow-x-auto">
        <div className="flex" style={{ minWidth: "100%" }}>
          {days.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-medium text-slate-600 border-r border-slate-200 flex-1"
              style={{ minWidth: `${dayWidth}%` }}
            >
              {day.getDate()}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Rows */}
      <div className="space-y-2">
        {tasksWithDeadlines.map((task) => {
          const position = getTaskPosition(task);
          if (!position) return null;

          return (
            <div key={task.id} className="flex items-center gap-4 group">
              {/* Task Title */}
              <div className="w-48 flex-shrink-0">
                <button
                  onClick={() => onTaskClick?.(task)}
                  className="text-sm font-medium text-slate-900 hover:text-primary-600 truncate text-left"
                >
                  {task.title}
                </button>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 h-8 bg-slate-100 rounded-lg relative overflow-hidden">
                <div
                  className={`absolute h-full rounded-lg transition-all cursor-pointer hover:opacity-80 ${
                    task.status === "completed"
                      ? "bg-green-500"
                      : task.priority === "urgent"
                        ? "bg-red-500"
                        : task.priority === "high"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                  }`}
                  style={{
                    left: `${position.offset * (100 / days.length)}%`,
                    width: `${Math.max(position.width, 8)}%`,
                  }}
                  onClick={() => onTaskClick?.(task)}
                  title={formatDate(task.deadline)}
                />
              </div>

              {/* Deadline */}
              <div className="w-24 text-right flex-shrink-0">
                <span className="text-xs text-slate-600">
                  {formatDate(task.deadline)}
                </span>
              </div>
            </div>
          );
        })}

        {tasksWithDeadlines.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No tasks with deadlines in this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
