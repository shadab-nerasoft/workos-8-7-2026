"use client";

import { useState, useMemo } from "react";
import { ArrowLeft2, ArrowRight2, ArrowDown2, ArrowUp2 } from "iconsax-react";
import { useEmployeeStore, useAuthStore, useTaskStore } from "@/src/store";

interface CalendarSidebarProps {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  selectedAssignees: Set<string>;
  onToggleAssignee: (id: string) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (id: string) => void;
}

const DAYS_HEADER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const CATEGORIES = [
  { id: "urgent", label: "Urgent", color: "#ef4444" },
  { id: "high", label: "High Priority", color: "#f97316" },
  { id: "medium", label: "Medium", color: "#3b82f6" },
  { id: "low", label: "Low Priority", color: "#22c55e" },
] as const;

export function CalendarSidebar({
  currentWeekStart,
  onWeekChange,
  selectedAssignees,
  onToggleAssignee,
  selectedCategories,
  onToggleCategory,
}: CalendarSidebarProps) {
  const { currentUser } = useAuthStore();
  const users = useEmployeeStore((s) => s.usersList);
  const allTasks = useTaskStore((s) => s.tasksList);

  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const [miniDate, setMiniDate] = useState(() => new Date(currentWeekStart));
  const miniYear = miniDate.getFullYear();
  const miniMonth = miniDate.getMonth();
  const daysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
  const rawFirstDay = new Date(miniYear, miniMonth, 1).getDay();
  const startOffset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const monthLabel = miniDate.toLocaleString("default", { month: "long" });

  const canFilterAssignees = currentUser?.role !== "employee";

  // Count tasks per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.id] = allTasks.filter((t) => t.priority === cat.id).length;
    }
    return counts;
  }, [allTasks]);

  // Determine which dates fall in the selected week for highlighting
  const weekDateSet = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
    return s;
  }, [currentWeekStart]);

  const handleMiniPrev = () => setMiniDate(new Date(miniYear, miniMonth - 1, 1));
  const handleMiniNext = () => setMiniDate(new Date(miniYear, miniMonth + 1, 1));

  const handleDateClick = (date: number) => {
    const clicked = new Date(miniYear, miniMonth, date);
    const day = clicked.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(clicked);
    monday.setDate(clicked.getDate() + mondayOffset);
    onWeekChange(monday);
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
      {/* Logo / Title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 border border-primary-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-600">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="absolute bottom-0.5 text-[9px] font-black text-primary-700">
            {today.getDate()}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">All Calendar</p>
          <p className="text-[11px] text-slate-400">Personal, Teams</p>
        </div>
      </div>

      {/* ─── Mini Calendar ─── */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleMiniPrev}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Previous month"
          >
            <ArrowLeft2 size={14} />
          </button>
          <span className="text-sm font-bold text-slate-800">{monthLabel}</span>
          <button
            onClick={handleMiniNext}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Next month"
          >
            <ArrowRight2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {DAYS_HEADER.map((d) => (
            <span key={d} className="py-1 text-[10px] font-bold text-slate-800">{d}</span>
          ))}

          {Array.from({ length: startOffset }).map((_, i) => (
            <span key={`e-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const dateKey = `${miniYear}-${miniMonth}-${date}`;
            const isToday = dateKey === todayKey;
            const isInWeek = weekDateSet.has(dateKey);

            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className={`flex h-7 items-center justify-center rounded-full text-xs font-medium transition-all
                  ${isToday
                    ? "bg-primary-600 text-white font-bold shadow-sm"
                    : isInWeek
                    ? "bg-primary-100 text-primary-700 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                {date}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── My Schedule (Assignee filter) ─── */}
      {canFilterAssignees && (
        <div className="px-5 py-5 border-b border-slate-100">
          <button
            onClick={() => setScheduleOpen(!scheduleOpen)}
            className="flex w-full items-center justify-between mb-3 group"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Schedule</span>
            {scheduleOpen
              ? <ArrowUp2 size={14} className="text-slate-400 group-hover:text-slate-700" />
              : <ArrowDown2 size={14} className="text-slate-400 group-hover:text-slate-700" />
            }
          </button>

          {scheduleOpen && (
            <div className="flex flex-col gap-2.5">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.has(user.id)}
                      onChange={() => onToggleAssignee(user.id)}
                      className="peer h-[15px] w-[15px] appearance-none rounded border-[1.5px] border-slate-300 bg-white transition-all checked:border-primary-600 checked:bg-primary-600 focus:outline-none"
                    />
                    <svg className="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-slate-600 group-hover:text-slate-900 font-medium">{user.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Categories (Priority filter) — NOW WITH WORKING TOGGLE ─── */}
      <div className="px-5 py-5">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="flex w-full items-center justify-between mb-3 group"
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</span>
          {categoriesOpen
            ? <ArrowUp2 size={14} className="text-slate-400 group-hover:text-slate-700" />
            : <ArrowDown2 size={14} className="text-slate-400 group-hover:text-slate-700" />
          }
        </button>

        {categoriesOpen && (
          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategories.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 transition-all ${
                    isActive
                      ? "bg-slate-50"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 transition-transform ${isActive ? "scale-100" : "scale-75"}`}
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={`text-[13px] font-medium ${isActive ? "text-slate-800" : "text-slate-500"}`}>
                      {cat.label}
                    </span>
                  </div>
                  <span
                    className="flex h-5 min-w-[22px] items-center justify-center rounded-md px-1.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: isActive ? `${cat.color}18` : "#e2e8f0",
                      color: isActive ? cat.color : "#94a3b8",
                    }}
                  >
                    {categoryCounts[cat.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
