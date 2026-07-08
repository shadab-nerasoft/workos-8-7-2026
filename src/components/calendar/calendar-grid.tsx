"use client";

import { useMemo, useState, useCallback } from "react";
import { ArrowLeft2, ArrowRight2, Add } from "iconsax-react";
import { useEmployeeStore } from "@/src/store";
import { TaskModal } from "@/src/components/projects/task-modal";
import type { Task } from "@/src/types";

export type CalendarViewMode = "day" | "week" | "month";

interface CalendarGridProps {
  focusDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  tasks: Task[];
}

/* ── Constants ── */

const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h24 = 9 + i;
  const h12 = h24 > 12 ? h24 - 12 : h24;
  return { value: h24, label: `${String(h12).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}` };
});

const PRIORITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
  high: { bg: "#fff7ed", border: "#f97316", text: "#9a3412" },
  medium: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  low: { bg: "#f0fdf4", border: "#22c55e", text: "#166534" },
};

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  backlog: { label: "Backlog", dot: "#94a3b8" },
  todo: { label: "To Do", dot: "#6366f1" },
  "in-progress": { label: "In Progress", dot: "#f59e0b" },
  review: { label: "Review", dot: "#8b5cf6" },
  completed: { label: "Done", dot: "#22c55e" },
};

const MONTH_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HOUR_HEIGHT = 90;

/* ── Helpers ── */

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

function formatHour(h24: number): string {
  if (h24 === 0 || h24 === 24) return "12 AM";
  if (h24 === 12) return "12 PM";
  return h24 > 12
    ? `${String(h24 - 12).padStart(2, "0")} PM`
    : `${String(h24).padStart(2, "0")} AM`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

/* ── Component ── */

export function CalendarGrid({
  focusDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  tasks,
}: CalendarGridProps) {
  const users = useEmployeeStore((s) => s.usersList);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const today = useMemo(() => new Date(), []);

  /* ─── Week dates ─── */
  const weekDates = useMemo(() => {
    const mon = getMonday(focusDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  }, [focusDate]);

  /* ─── Header label ─── */
  const headerLabel = useMemo(() => {
    if (viewMode === "day") {
      return `${focusDate.toLocaleString("default", { weekday: "long" })}, ${focusDate.toLocaleString("default", { month: "long" })} ${focusDate.getDate()}, ${focusDate.getFullYear()}`;
    }
    if (viewMode === "month") {
      return `${focusDate.toLocaleString("default", { month: "long" })}, ${focusDate.getFullYear()}`;
    }
    // week
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleString("default", { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${start.toLocaleString("default", { month: "short" })} ${start.getDate()} – ${end.toLocaleString("default", { month: "short" })} ${end.getDate()}, ${end.getFullYear()}`;
  }, [viewMode, focusDate, weekDates]);

  /* ─── Position tasks for time-grid views (day + week) ─── */
  const positionedTasks = useMemo(() => {
    const columns = viewMode === "day" ? [focusDate] : weekDates;
    return tasks
      .map((task) => {
        const td = new Date(task.deadline);
        const colIndex = columns.findIndex((d) => isSameDay(d, td));
        if (colIndex === -1) return null;
        const h = stableHash(task.id);
        const startOffset = h % 8;
        const dur = 1 + (stableHash(task.id + "d") % 2);
        return { task, colIndex, startHour: 9 + startOffset, duration: Math.min(dur, 19 - (9 + startOffset)) };
      })
      .filter(Boolean) as Array<{ task: Task; colIndex: number; startHour: number; duration: number }>;
  }, [tasks, viewMode, focusDate, weekDates]);

  /* ─── Month grid data ─── */
  const monthGridData = useMemo(() => {
    if (viewMode !== "month") return { cells: [] as Array<{ date: Date; isCurrentMonth: boolean; tasks: Task[] }>, weeks: 0 };
    const y = focusDate.getFullYear();
    const m = focusDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const rawStart = firstDay.getDay();
    const startOffset = rawStart === 0 ? 6 : rawStart - 1; // Monday-based

    const cells: Array<{ date: Date; isCurrentMonth: boolean; tasks: Task[] }> = [];

    // Previous month fill
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(y, m, -i);
      cells.push({ date: d, isCurrentMonth: false, tasks: [] });
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(y, m, d);
      const dayTasks = tasks.filter((t) => isSameDay(new Date(t.deadline), date));
      cells.push({ date, isCurrentMonth: true, tasks: dayTasks });
    }
    // Next month fill to complete grid
    while (cells.length % 7 !== 0) {
      const d = new Date(y, m + 1, cells.length - startOffset - lastDay.getDate() + 1);
      cells.push({ date: d, isCurrentMonth: false, tasks: [] });
    }

    return { cells, weeks: cells.length / 7 };
  }, [viewMode, focusDate, tasks]);

  const visibleCount = viewMode === "month"
    ? monthGridData.cells.reduce((s, c) => s + c.tasks.length, 0)
    : positionedTasks.length;

  /* ─── Shared header ─── */
  const renderHeader = () => (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
            <span>Calendar</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-600">All Calendar</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
          <Add color="#ffffff" size={16} />
          New Event
        </button>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900">{headerLabel}</h2>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1">
            <div className="h-4 w-4 rounded bg-primary-600 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{visibleCount}</span>
            </div>
            <span className="text-xs font-semibold text-primary-700">
              event{visibleCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${viewMode === mode
                  ? "text-slate-900 bg-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" aria-label="Previous">
              <ArrowLeft2 color="#2563eb" size={14} />
            </button>
            <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" aria-label="Next">
              <ArrowRight2 color="#2563eb" size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ─── Render an event block (used in day + week view) ─── */
  const renderEventBlock = (
    task: Task,
    colIndex: number,
    startHour: number,
    duration: number,
    totalCols: number,
    gutterPx: number,
  ) => {
    const style = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
    const statusInfo = STATUS_LABELS[task.status] ?? STATUS_LABELS.todo;
    const assignee = getUser(task.assigneeId);

    const topPx = (startHour - 9) * HOUR_HEIGHT + 4;
    const heightPx = duration * HOUR_HEIGHT - 8;
    const leftCalc = `calc(${gutterPx}px + ${colIndex} * ((100% - ${gutterPx}px) / ${totalCols}) + 4px)`;
    const widthCalc = `calc((100% - ${gutterPx}px) / ${totalCols} - 8px)`;

    return (
      <button
        key={task.id}
        type="button"
        onClick={() => setSelectedTask(task)}
        className="absolute rounded-lg overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 text-left"
        style={{ top: topPx, left: leftCalc, width: widthCalc, height: heightPx, backgroundColor: style.bg, borderLeft: `4px solid ${style.border}`, zIndex: 10, cursor: "pointer" }}
      >
        <div className="flex flex-col justify-between h-full p-2.5">
          <div>
            <p className="text-[12px] font-bold leading-tight line-clamp-2" style={{ color: style.text }}>{task.title}</p>
            <p className="text-[10px] font-medium mt-1 flex items-center gap-1 opacity-70" style={{ color: style.text }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              {formatHour(startHour)} - {formatHour(startHour + duration)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusInfo.dot }} />
              <span className="text-[9px] font-semibold" style={{ color: statusInfo.dot }}>{statusInfo.label}</span>
            </div>
          </div>
          {assignee && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-[1.5px] ring-white" style={{ backgroundColor: style.border }}>{assignee.avatar}</div>
              <span className="text-[9px] font-semibold opacity-60 line-clamp-1" style={{ color: style.text }}>{assignee.name}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  /* ─── Time Grid (shared by Day & Week) ─── */
  const renderTimeGrid = (columns: Date[], totalCols: number) => {
    const gutterPx = 72;
    return (
      <div className="flex-1 overflow-auto">
        <div className="min-w-[400px]">
          {/* Column headers */}
          <div className="grid sticky top-0 z-20 bg-white border-b border-slate-200" style={{ gridTemplateColumns: `${gutterPx}px repeat(${totalCols}, 1fr)` }}>
            <div className="border-r border-slate-100 px-2 py-3 text-[10px] font-semibold text-slate-400 flex items-center justify-center">
              UTC +5:30
            </div>
            {columns.map((date, i) => {
              const isSun = date.getDay() === 0;
              const isToday_ = isSameDay(date, today);
              return (
                <div key={i} className={`flex flex-col items-center justify-center py-3 border-r border-slate-100 ${isSun ? "bg-slate-50" : isToday_ ? "bg-primary-50/40" : ""}`}>
                  <span className={`text-xl font-bold leading-none ${isSun ? "text-slate-400" : isToday_ ? "text-primary-600" : "text-slate-900"}`}>{date.getDate()}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${isSun ? "text-red-400" : isToday_ ? "text-primary-500" : "text-slate-400"}`}>
                    {date.toLocaleString("default", { weekday: totalCols === 1 ? "long" : "short" })}
                    {isSun && " (Off)"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hours + events */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour.value} className="grid border-b border-slate-100/70" style={{ gridTemplateColumns: `${gutterPx}px repeat(${totalCols}, 1fr)`, height: HOUR_HEIGHT }}>
                <div className="flex items-start justify-center pt-2 text-[11px] font-semibold text-slate-400 border-r border-slate-100">{hour.label}</div>
                {columns.map((date, ci) => {
                  const isSun = date.getDay() === 0;
                  const isToday_ = isSameDay(date, today);
                  return <div key={ci} className={`border-r border-slate-100/60 ${isSun ? "bg-slate-50/80" : isToday_ ? "bg-primary-50/20" : ""}`} />;
                })}
              </div>
            ))}

            {positionedTasks.map(({ task, colIndex, startHour, duration }) =>
              renderEventBlock(task, colIndex, startHour, duration, totalCols, gutterPx)
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Month View ─── */
  const renderMonthView = () => (
    <div className="flex-1 overflow-auto">
      {/* Day name headers */}
      <div className="grid grid-cols-7 sticky top-0 z-20 bg-white border-b border-slate-200">
        {MONTH_DAY_NAMES.map((d, i) => (
          <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wider border-r border-slate-100 ${i === 6 ? "text-red-400 bg-slate-50" : i === 5 ? "text-slate-500" : "text-slate-500"}`}>
            {d}
            {i === 6 && <span className="text-[9px] font-medium normal-case ml-1">(Off)</span>}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7">
        {monthGridData.cells.map((cell, idx) => {
          const isToday_ = isSameDay(cell.date, today);
          const isSun = cell.date.getDay() === 0;
          return (
            <div
              key={idx}
              className={`min-h-[110px] border-b border-r border-slate-100 p-2 transition-colors ${!cell.isCurrentMonth ? "bg-slate-50/60" : isSun ? "bg-slate-50/80" : isToday_ ? "bg-primary-50/30" : "hover:bg-slate-50/40"
                }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday_ ? "bg-primary-600 text-white" : !cell.isCurrentMonth ? "text-slate-300" : "text-slate-700"
                  }`}>
                  {cell.date.getDate()}
                </span>
                {cell.tasks.length > 0 && (
                  <span className="text-[9px] font-semibold text-slate-400">{cell.tasks.length}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {cell.tasks.slice(0, 3).map((task) => {
                  const s = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="w-full rounded px-1.5 py-1 text-left transition-all hover:shadow-sm hover:scale-[1.02]"
                      style={{ backgroundColor: s.bg, borderLeft: `3px solid ${s.border}` }}
                    >
                      <p className="text-[10px] font-bold leading-tight line-clamp-1" style={{ color: s.text }}>{task.title}</p>
                    </button>
                  );
                })}
                {cell.tasks.length > 3 && (
                  <span className="text-[9px] font-semibold text-slate-400 pl-1">+{cell.tasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden">
      {renderHeader()}

      {viewMode === "day" && renderTimeGrid([focusDate], 1)}
      {viewMode === "week" && renderTimeGrid(weekDates, 7)}
      {viewMode === "month" && renderMonthView()}

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
