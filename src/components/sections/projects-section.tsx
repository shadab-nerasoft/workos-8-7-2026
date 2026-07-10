"use client";

import { useMemo, useState } from "react";
import { SearchNormal1, Grid5, RowVertical } from "iconsax-react";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ProjectsGrid } from "@/src/components/ui/projects-grid";
import { ProjectList } from "@/src/components/ui/project-list";
import type { Project, Team, User } from "@/src/types";

interface ProjectsSectionProps {
  /** Projects already scoped to the current user's visibility by the page. */
  projects: Project[];
  teams: Team[];
  users: User[];
}

/**
 * Pure presentational projects browser. Role-based scoping is the
 * responsibility of the page (composition root) — this component only
 * handles local UI state (search query, grid/list view).
 */
export function ProjectsSection({ projects, teams, users }: ProjectsSectionProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return projects;
    const normalizedQuery = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.status.toLowerCase().includes(normalizedQuery),
    );
  }, [projects, query]);

  if (projects.length === 0 && !query) {
    return <EmptyState title="No projects found" message="Create a project to start tracking team execution and business health." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-md">
          <span className="sr-only">Search projects</span>
          <SearchNormal1 size={18} color="currentColor" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" variant="Outline" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects by name or status..."
            className="h-11 w-full rounded-xl border border-primary-200/60 bg-white/80 pl-10 pr-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center justify-center rounded-lg px-3 py-1.5 transition-all ${view === "grid"
              ? "bg-white text-primary-700 shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-700"
              }`}
            aria-label="Card view"
          >
            <Grid5 color="#2563eb" size={18} variant={view === "grid" ? "Bold" : "Outline"} />
            <span className="ml-2 text-sm font-medium">Card</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center justify-center rounded-lg px-3 py-1.5 transition-all ${view === "list"
              ? "bg-white text-primary-700 shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-700"
              }`}
            aria-label="List view"
          >
            <RowVertical color="#2563eb" size={18} variant={view === "list" ? "Bold" : "Outline"} />
            <span className="ml-2 text-sm font-medium">List</span>
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState title="No matches found" message="Try adjusting your search criteria." />
      ) : view === "grid" ? (
        <ProjectsGrid projects={filteredProjects} users={users} />
      ) : (
        <div className="surface-card p-0 overflow-hidden">
          <ProjectList projects={filteredProjects} teams={teams} users={users} />
        </div>
      )}
    </div>
  );
}
