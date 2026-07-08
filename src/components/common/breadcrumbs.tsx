"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProjectStore } from "@/src/store/project-store";
import { ArrowRight2 } from "iconsax-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const getProjectById = useProjectStore((s) => s.getProjectById);

  if (!pathname || pathname === "/") {
    return (
      <span className="text-sm font-semibold text-slate-800">Dashboard</span>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium select-none" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-primary-600 transition duration-150">
        Dashboard
      </Link>
      {segments.map((segment, idx) => {
        const path = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;

        // Try to get a nice label for the path segment
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        
        // Handle dynamic project IDs starting with "p-"
        if (segment.startsWith("p-")) {
          const project = getProjectById(segment);
          if (project) {
            label = project.name;
          }
        }

        return (
          <div key={path} className="flex items-center gap-1.5 min-w-0">
            <ArrowRight2 size={12} className="text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[200px]" aria-current="page">
                {label}
              </span>
            ) : (
              <Link href={path} className="hover:text-primary-600 transition duration-150 truncate max-w-[120px] sm:max-w-[200px]">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
