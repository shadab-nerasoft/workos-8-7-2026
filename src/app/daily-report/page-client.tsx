"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AppShell } from "@/src/components/common/app-shell";
import { Button } from "@/src/components/ui/button";
import { useAuthStore, useDailyReportStore, useEmployeeStore, useTeamStore } from "@/src/store";
import { DailyReport, TaskLogEntry, MeetingCallEntry, EndOfDayNotes } from "@/src/types";
import { mockWorkspaceTasks } from "@/src/reports/constants";
import { generateHtmlEmail } from "@/src/reports/utils/email-template";
import { FormField, Input, TextArea } from "@/src/components/ui/form-field";

const uuidv4 = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Tick Sound Synthesizer for Wheel Picker
let audioCtx: AudioContext | null = null;
interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const playTick = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch {
    // Audio feedback is optional and should never block reporting.
  }
};

// Time Spent Parser
const parseTimeToHours = (val: string): number => {
  if (!val) return 0;
  const rawDecimalMatch = val.match(/^(\d+(?:\.\d+)?)\s*(?:h|hrs|hours)?$/i);
  if (rawDecimalMatch) {
    return parseFloat(rawDecimalMatch[1]);
  }
  const hoursMatch = val.match(/(\d+)\s*h/i);
  const minsMatch = val.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours + minutes / 60;
};

// Time Picker Wheel Component
interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePickerField({ label, value, onChange }: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const openPopover = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(true);
  };

  const parseTimeSpent = (val: string) => {
    const hoursMatch = (val || "").match(/(\d+)\s*h/i);
    const minsMatch = (val || "").match(/(\d+)\s*m/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    return { hours, minutes };
  };

  const { hours, minutes } = parseTimeSpent(value);
  const displayValue = value || "0h 0m";

  const handleSave = (newHours: number, newMinutes: number) => {
    onChange(`${newHours}h ${newMinutes}m`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPopover();
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className="text-sm font-semibold leading-6 text-slate-950">
        {label}
      </label>
      <div className="relative w-full" ref={triggerRef}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div
          tabIndex={0}
          onClick={openPopover}
          onKeyDown={handleKeyDown}
          className="flex h-11 w-full items-center rounded-xl border border-primary-200/60 bg-white pl-10 pr-4 text-sm leading-6 text-slate-950 outline-none transition focus:ring-2 focus:ring-primary-100 cursor-pointer hover:bg-slate-50 font-medium"
        >
          {displayValue}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="relative z-[99999]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-transparent"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{ top: coords.top, left: coords.left }}
                className="absolute flex flex-col items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 min-w-[150px]"
              >
                <div className="flex items-center gap-1">
                  <WheelPicker
                    options={Array.from({ length: 24 }, (_, i) => i)}
                    value={hours}
                    onChange={(h) => handleSave(h, minutes)}
                    label="h"
                  />
                  <div className="text-xl font-bold text-slate-300 pb-1">:</div>
                  <WheelPicker
                    options={Array.from({ length: 60 }, (_, i) => i)}
                    value={minutes}
                    onChange={(m) => handleSave(hours, m)}
                    label="m"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function WheelPicker({
  options,
  value,
  onChange,
  label,
}: {
  options: number[];
  value: number;
  onChange: (val: number) => void;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 40;
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = options.indexOf(value);
      if (currentIndex > 0) onChange(options[currentIndex - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = options.indexOf(value);
      if (currentIndex < options.length - 1) onChange(options[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (!isScrolling.current && containerRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [value, options]);

  // Clear any pending scroll timer on unmount to avoid a leaked timeout.
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrolling.current = true;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const newValue = options[index];

    if (newValue !== undefined && newValue !== value) {
      playTick();
      onChange(newValue);
    }

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150);
  };

  return (
    <div
      className="relative h-[160px] w-16 overflow-hidden rounded-xl bg-slate-50/50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[40px] -translate-y-1/2 bg-slate-200/40 border-y border-slate-200" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ paddingBottom: '60px', paddingTop: '60px' }}
      >
        {options.map((opt) => (
          <div
            key={opt}
            className={`flex h-[40px] snap-center items-center justify-center text-lg transition-colors cursor-pointer select-none ${opt === value ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
              }`}
            onClick={() => onChange(opt)}
          >
            {opt} <span className="ml-1 text-[13px] font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Select component supporting colored statuses/priorities and left-hand dots
interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  isStatusOrPriority?: boolean;
  value: string;
}

const CustomSelect = ({ label, isStatusOrPriority, value, children, ...rest }: CustomSelectProps) => {
  let colorClass = "bg-white border-slate-200 text-slate-800 focus:border-primary-600 focus:ring-primary-100";
  let dotColor = "bg-transparent";

  if (isStatusOrPriority) {
    const v = (value || "").toLowerCase();
    if (v === "completed") {
      colorClass = "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] focus:ring-emerald-100";
      dotColor = "bg-[#22c55e]";
    } else if (v === "medium") {
      colorClass = "bg-[#fffbeb] border-[#fde68a] text-[#92400e] focus:ring-amber-100";
      dotColor = "bg-[#f59e0b]";
    } else if (v === "high" || v === "critical" || v === "urgent") {
      colorClass = "bg-[#fef2f2] border-[#fecaca] text-[#991b1b] focus:ring-red-100";
      dotColor = "bg-[#ef4444]";
    } else if (v === "in-progress" || v === "in progress") {
      colorClass = "bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af] focus:ring-blue-100";
      dotColor = "bg-[#3b82f6]";
    } else if (v === "todo" || v === "to do" || v === "pending" || v === "backlog") {
      colorClass = "bg-[#f8fafc] border-[#e2e8f0] text-[#475569] focus:ring-slate-100";
      dotColor = "bg-[#94a3b8]";
    } else if (v === "low") {
      colorClass = "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] focus:ring-emerald-100";
      dotColor = "bg-[#22c55e]";
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={rest.id} className="text-sm font-semibold leading-6 text-slate-950">
        {label}
      </label>
      <div className="relative w-full">
        {isStatusOrPriority && value && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${dotColor}`} />
        )}
        <select
          {...rest}
          value={value}
          className={`h-11 w-full rounded-xl border px-4 text-sm leading-6 outline-none transition focus:ring-2 appearance-none cursor-pointer font-medium ${colorClass} ${
            isStatusOrPriority ? "pl-8" : ""
          } ${rest.className || ""}`}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Step 1: TaskLogStep Props
interface TaskLogStepProps {
  taskLogs: TaskLogEntry[];
  onUpdate: (id: string, field: keyof TaskLogEntry, value: string | boolean | number | TaskLogEntry[keyof TaskLogEntry]) => void;
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  onNext: () => void;
  showMeetingsCalls: boolean;
}

const TaskLogStep = ({
  taskLogs,
  onUpdate,
  onAddTask,
  onDeleteTask,
  onNext,
  showMeetingsCalls,
}: TaskLogStepProps) => {
  return (
    <div className="space-y-6">
      {taskLogs.map((task: TaskLogEntry, index: number) => {
        const linkedTask = mockWorkspaceTasks.find(
          wt => wt.description === task.description || `${wt.title} - ${wt.description}` === task.description
        );

        return (
          <div key={task.id} className="p-6 border border-slate-200 rounded-xl bg-white space-y-6 relative shadow-sm">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                {/* Task Editable Title Badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-600 focus-within:ring-2 focus-within:ring-blue-200 transition-shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <input
                    type="text"
                    value={task.title || `Task ${index + 1}`}
                    onChange={(e) => onUpdate(task.id, "title", e.target.value)}
                    className="bg-transparent text-sm font-bold text-blue-600 outline-none w-28 focus:w-48 transition-all"
                    placeholder={`Task ${index + 1}`}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5 opacity-60">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.082a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </div>

                {/* Import Workspace Task Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-[11px] font-semibold text-slate-400">Link Task:</span>
                  <select
                    id={`link-task-${task.id}`}
                    value={linkedTask?.title || ""}
                    onChange={(e) => {
                      const selected = mockWorkspaceTasks.find(wt => wt.title === e.target.value);
                      if (selected) {
                        onUpdate(task.id, "title", selected.title);
                        onUpdate(task.id, "description", `${selected.title} - ${selected.description}`);
                        onUpdate(task.id, "category", selected.category);
                        onUpdate(task.id, "priority", selected.priority);
                        onUpdate(task.id, "status", selected.status);
                        onUpdate(task.id, "expectedDate", selected.expectedCompletionDate);
                      } else {
                        onUpdate(task.id, "description", "");
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-600 bg-transparent border-none outline-none pr-4 cursor-pointer focus:ring-0"
                  >
                    <option value="">Select task...</option>
                    {mockWorkspaceTasks.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remove Card Button */}
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:bg-red-50 h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
                title="Remove task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>

            {/* Inputs Grid Layout matching screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Row 1 */}
              <FormField id={`description-${task.id}`} label="Task description">
                <Input
                  id={`description-${task.id}`}
                  type="text"
                  value={task.description}
                  onChange={(e) => onUpdate(task.id, "description", e.target.value)}
                  placeholder="Describe what you worked on"
                />
              </FormField>

              <CustomSelect
                label="Category"
                id={`category-${task.id}`}
                value={task.category}
                onChange={(e) => onUpdate(task.id, "category", e.target.value)}
              >
                <option value="Figma">Figma</option>
                <option value="Coding">Coding</option>
                <option value="Development">Development</option>
                <option value="Research">Research</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </CustomSelect>

              <CustomSelect
                label="Priority"
                id={`priority-${task.id}`}
                isStatusOrPriority
                value={task.priority}
                onChange={(e) => onUpdate(task.id, "priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </CustomSelect>

              <CustomSelect
                label="Status"
                id={`status-${task.id}`}
                isStatusOrPriority
                value={task.status}
                onChange={(e) => onUpdate(task.id, "status", e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </CustomSelect>

              {/* Row 2 */}
              <TimePickerField
                label="Time spent"
                value={task.timeSpent}
                onChange={(val) => onUpdate(task.id, "timeSpent", val)}
              />

              <FormField id={`expectedDate-${task.id}`} label="Expected date">
                <div className="relative">
                  <Input
                    id={`expectedDate-${task.id}`}
                    type="date"
                    value={task.expectedDate}
                    onChange={(e) => onUpdate(task.id, "expectedDate", e.target.value)}
                    className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                    </svg>
                  </div>
                </div>
              </FormField>

              <div className="md:col-span-2">
                <FormField id={`notes-${task.id}`} label="Notes">
                  <TextArea
                    id={`notes-${task.id}`}
                    value={task.notes}
                    onChange={(e) => onUpdate(task.id, "notes", e.target.value)}
                    placeholder="Add notes, Carry forward plans, or blockers..."
                    className="min-h-[96px]"
                  />
                </FormField>
              </div>
            </div>
          </div>
        );
      })}
      
      <Button
        variant="outline"
        onClick={onAddTask}
        className="w-full border-dashed border-[#2563eb]/30 bg-[#f8fafc] text-[#2563eb] hover:bg-blue-50 py-3 rounded-xl min-h-[52px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add task row
      </Button>

      <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
        <Button
          onClick={onNext}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer min-h-11 shadow-sm flex items-center gap-2"
        >
          Next: {showMeetingsCalls ? "Meetings & Calls" : "End of Day Notes"}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Step 2: MeetingsCallsStep Props
interface MeetingsCallsStepProps {
  meetingCalls: MeetingCallEntry[];
  onUpdate: (id: string, field: keyof MeetingCallEntry, value: string) => void;
  onAddMeetingCall: () => void;
  onDeleteMeetingCall: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  showMeetingsCalls: boolean;
}

const MeetingsCallsStep = ({
  meetingCalls,
  onUpdate,
  onAddMeetingCall,
  onDeleteMeetingCall,
  onBack,
  onNext,
  showMeetingsCalls,
}: MeetingsCallsStepProps) => {
  if (!showMeetingsCalls) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 font-sans">Meetings & Calls</h3>
        <p className="text-slate-600">Meetings & Calls step is not applicable for your department.</p>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>&larr; Back</Button>
          <Button onClick={onNext}>Next: End of Day Notes &rarr;</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {meetingCalls.map((mc: MeetingCallEntry, index: number) => (
        <div key={mc.id} className="p-6 border border-slate-200 bg-white rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Meeting {index + 1}</h4>
            <button
              type="button"
              onClick={() => onDeleteMeetingCall(mc.id)}
              className="text-red-500 hover:bg-red-50 h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
              title="Remove meeting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <FormField id={`subject-${mc.id}`} label="Subject">
              <Input
                id={`subject-${mc.id}`}
                type="text"
                value={mc.subject}
                onChange={(e) => onUpdate(mc.id, "subject", e.target.value)}
                placeholder="Meeting subject"
              />
            </FormField>
            <FormField id={`withWhom-${mc.id}`} label="With whom">
              <Input
                id={`withWhom-${mc.id}`}
                type="text"
                value={mc.withWhom}
                onChange={(e) => onUpdate(mc.id, "withWhom", e.target.value)}
                placeholder="Name/Team"
              />
            </FormField>
            <FormField id={`time-${mc.id}`} label="Time">
              <div className="relative">
                <Input
                  id={`time-${mc.id}`}
                  type="text"
                  value={mc.time}
                  onChange={(e) => onUpdate(mc.id, "time", e.target.value)}
                  placeholder="10:00 AM"
                  className="pr-10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
            </FormField>
            <FormField id={`duration-${mc.id}`} label="Duration (min)">
              <Input
                id={`duration-${mc.id}`}
                type="number"
                value={mc.duration}
                onChange={(e) => onUpdate(mc.id, "duration", e.target.value)}
                placeholder="30"
              />
            </FormField>
            <CustomSelect
              label="Type"
              id={`type-${mc.id}`}
              value={mc.type}
              onChange={(e) => onUpdate(mc.id, "type", e.target.value)}
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="review">Review</option>
              <option value="standup">Standup</option>
            </CustomSelect>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={onAddMeetingCall}
        className="w-full border-dashed border-[#2563eb]/30 bg-[#f8fafc] text-[#2563eb] hover:bg-blue-50 py-3 rounded-xl min-h-[52px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add meeting entry
      </Button>
      <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer min-h-11 shadow-sm flex items-center gap-2"
        >
          Next: End of Day Notes
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Step 3: EndOfDayNotesStep Props
interface EndOfDayNotesStepProps {
  endOfDayNotes: EndOfDayNotes;
  onUpdate: (field: keyof EndOfDayNotes, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const EndOfDayNotesStep = ({
  endOfDayNotes,
  onUpdate,
  onBack,
  onNext,
}: EndOfDayNotesStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField id="pending" label="Pending / Carry Forward">
          <TextArea
            id="pending"
            value={endOfDayNotes.pending}
            onChange={(e) => onUpdate("pending", e.target.value)}
            placeholder="What is pending or carrying forward..."
            className="min-h-[140px]"
          />
        </FormField>
        <FormField id="challenges" label="Blockers / Challenges">
          <TextArea
            id="challenges"
            value={endOfDayNotes.challenges}
            onChange={(e) => onUpdate("challenges", e.target.value)}
            placeholder="Challenges or blockers faced today..."
            className="min-h-[140px]"
          />
        </FormField>
        <FormField id="planForTomorrow" label="Plan For Tomorrow">
          <TextArea
            id="planForTomorrow"
            value={endOfDayNotes.planForTomorrow}
            onChange={(e) => onUpdate("planForTomorrow", e.target.value)}
            placeholder="Plan and priorities for tomorrow..."
            className="min-h-[140px]"
          />
        </FormField>
      </div>
      <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer min-h-11 shadow-sm flex items-center gap-2"
        >
          Next: Preview
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Step 4: PreviewSubmitStep Props
interface PreviewSubmitStepProps {
  report: DailyReport;
  onBack: () => void;
  onSubmit: () => void;
}

const PreviewSubmitStep = ({
  report,
  onBack,
  onSubmit,
}: PreviewSubmitStepProps) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const allEmployees = useEmployeeStore((state) => state.getAllUsers());
  const managerId = currentUser?.role === 'employee' ? allEmployees.find(emp => emp.id === currentUser?.id)?.createdBy || '' : '';
  const manager = allEmployees.find(emp => emp.id === managerId);
  const managerName = manager?.name || "Saurabh Yadav";

  const totalHours = report.taskLogs.reduce((acc, t) => {
    return acc + parseTimeToHours(t.timeSpent);
  }, 0);

  const htmlContent = generateHtmlEmail({
    employeeName: currentUser?.name || "Kuldeep",
    reportDate: report.date,
    department: currentUser?.department || "Technology",
    designation: currentUser?.designation || "Software Engineer",
    managerName,
    totalHours,
    tasks: report.taskLogs.map((t, idx) => ({
      title: t.title || `Task ${idx + 1}`,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      timeSpent: t.timeSpent,
      notes: t.notes,
    })),
    meetings: (report.meetingCalls || []).map(m => ({
      subject: m.subject,
      withWhom: m.withWhom,
      time: m.time,
      duration: m.duration,
      type: m.type,
    })),
    pending: report.endOfDayNotes.pending,
    blockers: report.endOfDayNotes.challenges,
    tomorrowPlan: report.endOfDayNotes.planForTomorrow,
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800 font-sans">Email Report Preview</h3>
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 flex justify-center">
        <div className="w-full max-w-[700px] overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
          <iframe
            srcDoc={htmlContent}
            className="w-full min-w-[320px] max-w-[700px] h-[650px] border-none"
            title="Email Preview"
          />
        </div>
      </div>
      <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer min-h-11 shadow-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
          Submit Daily Report
        </Button>
      </div>
    </div>
  );
};

export default function CreateDailyReportPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const createReport = useDailyReportStore((state) => state.createReport);
  const allEmployees = useEmployeeStore((state) => state.getAllUsers());
  const allTeams = useTeamStore((state) => state.getAllTeams());

  const [currentStep, setCurrentStep] = useState(1);
  const [reportData, setReportData] = useState<DailyReport>({
    id: uuidv4(),
    employeeId: currentUser?.id || '',
    managerId: currentUser?.role === 'employee' ? allEmployees.find(emp => emp.id === currentUser?.id)?.createdBy || '' : currentUser?.id || '',
    date: new Date().toISOString().split('T')[0],
    taskLogs: [
      {
        id: uuidv4(),
        title: 'Task 1',
        description: '',
        category: 'Other',
        priority: 'medium',
        status: 'in-progress',
        timeSpent: '0h 0m',
        expectedDate: new Date().toISOString().split('T')[0],
        notes: '',
      },
    ],
    meetingCalls: [],
    endOfDayNotes: {
      pending: '',
      challenges: '',
      planForTomorrow: '',
    },
    status: 'draft',
  });

  const employeeTeam = allTeams.find(team => team.memberIds.includes(currentUser?.id || ''));
  const showMeetingsCalls = employeeTeam?.type?.toLowerCase() === 'sales';

  const handleTaskLogUpdate = (id: string, field: keyof TaskLogEntry, value: string | boolean | number | TaskLogEntry[keyof TaskLogEntry]) => {
    setReportData((prev) => ({
      ...prev,
      taskLogs: prev.taskLogs.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      ),
    }));
  };

  const handleAddTask = () => {
    setReportData((prev) => {
      const nextTaskIndex = prev.taskLogs.length + 1;
      return {
        ...prev,
        taskLogs: [
          ...prev.taskLogs,
          {
            id: uuidv4(),
            title: `Task ${nextTaskIndex}`,
            description: '',
            category: 'Other',
            priority: 'medium',
            status: 'in-progress',
            timeSpent: '0h 0m',
            expectedDate: new Date().toISOString().split('T')[0],
            notes: '',
          },
        ],
      };
    });
  };

  const handleDeleteTask = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      taskLogs: prev.taskLogs.filter((task) => task.id !== id),
    }));
  };

  const handleMeetingCallUpdate = (id: string, field: keyof MeetingCallEntry, value: string) => {
    setReportData((prev) => ({
      ...prev,
      meetingCalls: prev.meetingCalls?.map((mc) =>
        mc.id === id ? { ...mc, [field]: value } : mc
      ),
    }));
  };

  const handleAddMeetingCall = () => {
    setReportData((prev) => ({
      ...prev,
      meetingCalls: [
        ...(prev.meetingCalls || []),
        {
          id: uuidv4(),
          subject: '',
          withWhom: '',
          time: '',
          duration: '',
          type: 'meeting',
        },
      ],
    }));
  };

  const handleDeleteMeetingCall = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      meetingCalls: prev.meetingCalls?.filter((mc) => mc.id !== id),
    }));
  };

  const handleEndOfDayNotesUpdate = (field: keyof EndOfDayNotes, value: string) => {
    setReportData((prev) => ({
      ...prev,
      endOfDayNotes: {
        ...prev.endOfDayNotes,
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    createReport({ ...reportData, status: 'submitted' });
    alert('Daily Report Submitted!');
    router.push('/reports');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TaskLogStep
            taskLogs={reportData.taskLogs}
            onUpdate={handleTaskLogUpdate}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onNext={() => setCurrentStep(showMeetingsCalls ? 2 : 3)}
            showMeetingsCalls={showMeetingsCalls}
          />
        );
      case 2:
        return (
          <MeetingsCallsStep
            meetingCalls={reportData.meetingCalls || []}
            onUpdate={handleMeetingCallUpdate}
            onAddMeetingCall={handleAddMeetingCall}
            onDeleteMeetingCall={handleDeleteMeetingCall}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            showMeetingsCalls={showMeetingsCalls}
          />
        );
      case 3:
        return (
          <EndOfDayNotesStep
            endOfDayNotes={reportData.endOfDayNotes}
            onUpdate={handleEndOfDayNotesUpdate}
            onBack={() => setCurrentStep(showMeetingsCalls ? 2 : 1)}
            onNext={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <PreviewSubmitStep
            report={reportData}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    { label: "Task Log", subtitle: "What you worked on", num: 1 },
    { label: "Meetings & Calls", subtitle: "Meetings & discussions", num: 2 },
    { label: "End of Day Notes", subtitle: "Summary & plan", num: 3 },
    { label: "Preview", subtitle: "Review & submit", num: 4 },
  ];

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Create Daily Report
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Autosave active</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Saved just now</span>
            </div>
          </div>
        </div>

        {/* Top Preview & Submit Button, disabled unless on preview step */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={currentStep !== 4}
          className="min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-5 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
          Preview & Submit
        </button>
      </div>

      {/* Steps Navigator */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="flex overflow-x-auto items-center px-2 py-3 scrollbar-none">
          {steps.map((s, index) => {
            if (!showMeetingsCalls && s.num === 2) return null;
            const actualNum = showMeetingsCalls ? s.num : (s.num > 2 ? s.num - 1 : s.num);
            const isActive = currentStep === s.num;
            
            return (
              <div key={s.label} className="flex items-center shrink-0 min-w-max">
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`relative flex items-center gap-3 text-left focus:outline-none px-6 py-3 transition-colors ${
                    isActive ? "" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-[#2563eb]"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {actualNum}
                  </span>
                  <span className="flex flex-col">
                    <span className={`text-sm font-bold ${isActive ? "text-[#2563eb]" : "text-slate-700"}`}>
                      {s.label}
                    </span>
                    <span className={`text-xs font-semibold ${isActive ? "text-[#2563eb]/70" : "text-slate-400"}`}>
                      {s.subtitle}
                    </span>
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb]" />
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className="px-4 flex items-center justify-center">
                    <div className="h-px bg-slate-200 w-8" />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5 text-slate-300 -ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Step Content Area */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
        {renderStep()}
      </div>
    </AppShell>
  );
}
