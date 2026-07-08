"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SearchNormal1,
  ArrowRight2,
  TaskSquare,
  Kanban,
  Profile2User,
  People,
  Element3,
  Chart2,
  Setting2,
  CalendarTick,
} from "iconsax-react";
import { SearchService } from "@/src/services/search.service";
import { usePermissions } from "@/src/hooks/use-permission";
import { useAuthStore, useTaskStore } from "@/src/store";

export function GlobalSearch() {
  const router = useRouter();
  const permissions = usePermissions();
  const { currentUser } = useAuthStore();
  const allTasks = useTaskStore((s) => s.getAllTasks());
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickLinks = [
    { href: "/", label: "Dashboard", icon: Element3 },
    { href: "/projects", label: "Projects", icon: TaskSquare },
    { href: "/tasks", label: "Tasks", icon: Kanban },
    { href: "/calendar", label: "Calendar", icon: CalendarTick },
    { href: "/teams", label: "Teams", icon: Profile2User, show: permissions.canViewTeams },
    { href: "/employees", label: "Employees", icon: People, show: permissions.canManageEmployees },
    { href: "/analytics", label: "Analytics", icon: Chart2, show: permissions.canViewCompanyAnalytics },
    { href: "/settings", label: "Settings", icon: Setting2 },
  ].filter((item) => item.show !== false);

  const results = SearchService.search(query).filter((r) => {
    if (r.type === "team" && !permissions.canViewTeams) return false;
    if (currentUser?.role === "employee") {
      if (r.type === "project") {
        return allTasks.some((t) => t.projectId === r.id && t.assigneeId === currentUser.id);
      }
      if (r.type === "task") {
        return allTasks.some((t) => t.id === r.id && t.assigneeId === currentUser.id);
      }
    }
    return true;
  });

  const navigableItems = query
    ? results
    : quickLinks.map((item) => ({
      id: item.href,
      type: "navigation" as const,
      title: item.label,
      subtitle: "Navigate to page",
      href: item.href,
      icon: item.icon,
    }));

  // Handle Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync open/close state with dialog element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      setQuery("");
      setActiveIndex(0);
      // Timeout is necessary to wait for dialog to open before focusing input
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Click outside / Cancel handling
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      setIsOpen(false);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!isInDialog) {
        setIsOpen(false);
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, []);

  // Keyboard navigation inside command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % navigableItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + navigableItems.length) % navigableItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = navigableItems[activeIndex];
        if (selected) {
          router.push(selected.href);
          setIsOpen(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, navigableItems, router]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <>
      {/* Desktop Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-4 py-2 text-xs text-slate-400 font-medium transition cursor-pointer w-full max-w-[280px]"
      >
        <SearchNormal1 size={14} className="text-slate-400 shrink-0" />
        <span className="flex-1 text-left text-slate-500">Search Workspace...</span>
        <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Mobile Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
        aria-label="Search"
      >
        <SearchNormal1 color="#2563eb" size={20} />
      </button>

      {/* Command Palette Dialog */}
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-xl rounded-2xl bg-white p-0 shadow-2xl border border-slate-100 backdrop:bg-slate-900/30 backdrop:backdrop-blur-sm focus:outline-none transition-all duration-200"
      >
        <div className="flex flex-col max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <SearchNormal1 color="#2563eb" size={18} className="shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anything (projects, tasks, users)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-white border border-slate-200 transition"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
            {query ? (
              results.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Search Results
                  </div>
                  {results.map((result, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 transition-colors duration-150 cursor-pointer ${isActive
                          ? "bg-primary-50 text-primary-900"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                            }`}>
                            {result.type === "project" && <TaskSquare size={16} />}
                            {result.type === "task" && <Kanban size={16} />}
                            {result.type === "team" && <Profile2User size={16} />}
                            {result.type === "employee" && <People size={16} />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? "text-primary-950" : "text-slate-900"}`}>
                              {result.title}
                            </p>
                            <p className={`text-xs truncate ${isActive ? "text-primary-700" : "text-slate-500"}`}>
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                        <ArrowRight2
                          size={14}
                          color="#2563eb"
                          className={`shrink-0 transition-transform ${isActive ? "text-primary-600 translate-x-0.5" : "text-slate-400"
                            }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-slate-500">
                  No matches found for <span className="font-semibold text-slate-800">&quot;{query}&quot;</span>.
                </div>
              )
            ) : (
              /* Quick Nav Links */
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Pages
                </div>
                {quickLinks.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 transition-colors duration-150 cursor-pointer ${isActive
                        ? "bg-primary-50 text-primary-900"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                          }`}>
                          <Icon color="#2563eb" size={16} />
                        </div>
                        <span className={`text-sm font-medium ${isActive ? "text-primary-950" : "text-slate-900"}`}>
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight2
                        size={14}
                        color="#2563eb"
                        className={`shrink-0 transition-transform ${isActive ? "text-primary-600 translate-x-0.5" : "text-slate-400"
                          }`}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="bg-white border rounded px-1 py-0.5">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="bg-white border rounded px-1 py-0.5">Enter</kbd> Select
              </span>
            </div>
            <span>WorkOS Workspace Search</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
