"use client";

import { useMemo, useState, useCallback } from "react";
import { ArrowLeft2, ArrowRight2, Add } from "iconsax-react";
import { useEmployeeStore } from "@/src/store";
import { TaskModal } from "@/src/components/projects/task-modal";
import type { Task } from "@/src/types";

interface WeeklyTimeGridProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  tasks: Task[];
}

// Working hours: 9:30 AM – 7:00 PM (10 half-hour based slots rendered as full hours)
const HOURS = [
  { value: 9, label: "09 AM" },
  { value: 10, label: "10 AM" },
  { value: 11, label: "11 AM" },
  { value: 12, label: "12 PM" },
  { value: 13, label: "01 PM" },
  { value: 14, label: "02 PM" },
  { value: 15, label: "03 PM" },
  { value: 16, label: "04 PM" },
  { value: 17, label: "05 PM" },
  { value: 18, label: "06 PM" },
  { value: 19, label: "07 PM" },
];

const PRIORITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
  high:   { bg: "#fff7ed", border: "#f97316", text: "#9a3412" },
  medium: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  low:    { bg: "#f0fdf4", border: "#22c55e", text: "#166534" },
};

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  backlog:       { label: "Backlog",     dot: "#94a3b8" },
  todo:          { label: "To Do",       dot: "#6366f1" },
  "in-progress": { label: "In Progress", dot: "#f59e0b" },
  review:        { label: "Review",      dot: "#8b5cf6" },
  completed:     { label: "Done",        dot: "#22c55e" },
};

function stableHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatHour(hour24: number): string {
  if (hour24 === 0 || hour24 === 24) return "12 AM";
  if (hour24 === 12) return "12 PM";
  if (hour24 > 12) return `${String(hour24 - 12).padStart(2, "0")} PM`;
  return `${String(hour24).padStart(2, "0")} AM`;
}

const HOUR_HEIGHT = 90;

export function WeeklyTimeGrid({ weekStart, onPrevWeek, onNextWeek, tasks }: WeeklyTimeGridProps) {
  const users = useEmployeeStore((s) => s.usersList);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const weekDates = useMemo(() => {
    const monday = getMonday(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const today = new Date();

  // Position tasks into the grid
  const positionedTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const taskDate = new Date(task.deadline);
        const colIndex = weekDates.findIndex(
          (d) =>
            d.getDate() === taskDate.getDate() &&
            d.getMonth() === taskDate.getMonth() &&
            d.getFullYear() === taskDate.getFullYear()
        );
        if (colIndex === -1) return null;

        // Generate deterministic time slot within working hours (9:30 AM – 7 PM)
        const h = stableHash(task.id);
        const startHourOffset = h % 8; // 0–7 → 9AM to 4PM start
        const duration = 1 + (stableHash(task.id + "d") % 2); // 1 or 2 hours
        const startHour = 9 + startHourOffset;
        const endHour = Math.min(startHour + duration, 19);

        return { task, colIndex, startHour, endHour, duration: endHour - startHour };
      })
      .filter(Boolean) as Array<{
        task: Task;
        colIndex: number;
        startHour: number;
        endHour: number;
        duration: number;
      }>;
  }, [tasks, weekDates]);

  const monthLabel = weekDates[0]
    ? `${weekDates[0].toLocaleString("default", { month: "long" })}, ${weekDates[0].getFullYear()}`
    : "";

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden">
      {/* ─── Top Header ─── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <span>Calendar</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-600">All Calendar</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
          <Add size={16} />
          New Event
        </button>
      </div>

      {/* ─── Sub Header ─── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900">{monthLabel}</h2>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1">
            <div className="h-4 w-4 rounded bg-primary-600 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{positionedTasks.length}</span>
            </div>
            <span className="text-xs font-semibold text-primary-700">
              event{positionedTasks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 rounded-md hover:text-slate-800 transition-colors">Day</button>
            <button className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-white rounded-md shadow-sm">Week</button>
            <button className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 rounded-md hover:text-slate-800 transition-colors">Month</button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              aria-label="Previous week"
            >
              <ArrowLeft2 size={14} />
            </button>
            <button
              onClick={onNextWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              aria-label="Next week"
            >
              <ArrowRight2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Grid ─── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          {/* Day column headers */}
          <div
            className="grid sticky top-0 z-20 bg-white border-b border-slate-200"
            style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}
          >
            <div className="border-r border-slate-100 px-2 py-3 text-[10px] font-semibold text-slate-400 flex items-center justify-center">
              UTC +5:30
            </div>
            {weekDates.map((date, i) => {
              const isSunday = date.getDay() === 0;
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center py-3 border-r border-slate-100 ${
                    isSunday ? "bg-slate-50" : isToday ? "bg-primary-50/40" : ""
                  }`}
                >
                  <span className={`text-xl font-bold leading-none ${
                    isSunday ? "text-slate-400" : isToday ? "text-primary-600" : "text-slate-900"
                  }`}>
                    {date.getDate()}
                  </span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${
                    isSunday ? "text-red-400" : isToday ? "text-primary-500" : "text-slate-400"
                  }`}>
                    {date.toLocaleString("default", { weekday: "long" })}
                    {isSunday && " (Off)"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hour rows + absolutely positioned events */}
          <div className="relative">
            {/* Background hour rows */}
            {HOURS.map((hour) => (
              <div
                key={hour.value}
                className="grid border-b border-slate-100/70"
                style={{ gridTemplateColumns: "72px repeat(7, 1fr)", height: HOUR_HEIGHT }}
              >
                <div className="flex items-start justify-center pt-2 text-[11px] font-semibold text-slate-400 border-r border-slate-100">
                  {hour.label}
                </div>
                {weekDates.map((date, ci) => {
                  const isSunday = date.getDay() === 0;
                  const isToday =
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
                  return (
                    <div
                      key={ci}
                      className={`border-r border-slate-100/60 ${
                        isSunday
                          ? "bg-slate-50/80"
                          : isToday
                          ? "bg-primary-50/20"
                          : ""
                      }`}
                    />
                  );
                })}
              </div>
            ))}

            {/* Event blocks (absolute over the grid) */}
            {positionedTasks.map(({ task, colIndex, startHour, duration }) => {
              const style = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
              const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS.todo;
              const assignee = getUser(task.assigneeId);

              const topPx = (startHour - 9) * HOUR_HEIGHT + 4;
              const heightPx = duration * HOUR_HEIGHT - 8;

              const leftCalc = `calc(72px + ${colIndex} * ((100% - 72px) / 7) + 4px)`;
              const widthCalc = `calc((100% - 72px) / 7 - 8px)`;

              const startLabel = formatHour(startHour);
              const endLabel = formatHour(startHour + duration);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTask(task)}
                  className="absolute rounded-lg overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 text-left"
                  style={{
                    top: topPx,
                    left: leftCalc,
                    width: widthCalc,
                    height: heightPx,
                    backgroundColor: style.bg,
                    borderLeft: `4px solid ${style.border}`,
                    zIndex: 10,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex flex-col justify-between h-full p-2.5">
                    <div>
                      <p className="text-[12px] font-bold leading-tight line-clamp-2" style={{ color: style.text }}>
                        {task.title}
                      </p>
                      {/* Time */}
                      <p className="text-[10px] font-medium mt-1 flex items-center gap-1 opacity-70" style={{ color: style.text }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {startLabel} - {endLabel}
                      </p>
                      {/* Status badge */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusInfo.dot }} />
                        <span className="text-[9px] font-semibold" style={{ color: statusInfo.dot }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Assignee */}
                    {assignee && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-[1.5px] ring-white"
                          style={{ backgroundColor: style.border }}
                        >
                          {assignee.avatar}
                        </div>
                        <span className="text-[9px] font-semibold opacity-60 line-clamp-1" style={{ color: style.text }}>
                          {assignee.name}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={selectedTask.projectId}
        />
      )}
    </div>
  );
}
