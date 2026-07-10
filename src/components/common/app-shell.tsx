"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoginCurve, ArrowDown2, ArrowSquareRight, CloseSquare } from "iconsax-react";
import type { CSSProperties, ReactNode } from "react";
import { NavLinks } from "@/src/components/common/nav-links";
import { useAuthStore } from "@/src/store";
import { DropdownMenu, DropdownItem } from "@/src/components/ui/dropdown-menu";
import { titleCase } from "@/src/lib/utils/format";
import { usePermissions } from "@/src/hooks/use-permission";
import { Breadcrumbs } from "@/src/components/common/breadcrumbs";
import { GlobalSearch } from "@/src/components/common/global-search";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const permissions = usePermissions();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAccess = 
    (pathname === "/settings" ? permissions.canViewSettings : true) &&
    (pathname.startsWith("/teams") ? permissions.canViewTeams : true) &&
    (pathname.startsWith("/daily-report") ? permissions.canCreateDailyReport : true) &&
    (pathname.startsWith("/employees") ? (permissions.canManageEmployees || permissions.canViewTeams) : true);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Redirect unauthorized users
  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      router.replace("/");
    }
  }, [isAuthenticated, hasAccess, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated && !hasAccess) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.div 
      className="min-h-screen bg-background text-foreground"
      initial={false}
      style={{ "--sidebar-width": isCollapsed ? "96px" : "288px" } as CSSProperties}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden border-r p-5 backdrop-blur lg:flex lg:flex-col divider-accent bg-background/90 z-30 w-[var(--sidebar-width)]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 flex items-center justify-center focus:outline-none z-50 transition-transform hover:scale-110"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ArrowSquareRight 
            size="32" 
            color="#2563eb" 
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-0" : "rotate-180"}`} 
          />
        </button>

        <Link href="/" className={`flex items-center gap-3 rounded-[20px] py-2 mb-2 transition-all ${isCollapsed ? "justify-center px-0" : "px-3"}`}>
          <span className="primary-cta flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold shadow-sm">W</span>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden whitespace-nowrap"
              >
                <span className="block text-sm font-semibold leading-6 truncate">WorkOS PM</span>
                <span className="block text-[11px] leading-5 text-slate-500 truncate">Project operating system</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <NavLinks isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Mobile Sidebar Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-background p-5 border-r divider-accent flex flex-col lg:hidden shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                  <span className="primary-cta flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold shadow-sm">W</span>
                  <div className="text-left">
                    <span className="block text-sm font-semibold leading-6 text-slate-950">WorkOS PM</span>
                    <span className="block text-[11px] leading-5 text-slate-500">Project operating system</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition"
                  aria-label="Close sidebar"
                >
                  <CloseSquare color="#2563eb" size={20} variant="Outline" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                <NavLinks isCollapsed={false} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area with sticky global header */}
      <div className="lg:pl-[var(--sidebar-width)] min-h-screen flex flex-col transition-all duration-300">
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b divider-accent bg-background/90 px-4 sm:px-6 lg:px-8 backdrop-blur">
          {/* Left: Menu Trigger (Mobile) & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Open sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Breadcrumbs />
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-4 hidden md:block">
            <GlobalSearch />
          </div>

          {/* Right: Search Toggle (Mobile) & Profile Dropdown / Login */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="md:hidden">
              <GlobalSearch />
            </div>

            {isAuthenticated && currentUser ? (
              <DropdownMenu
                align="right"
                side="bottom"
                trigger={
                  <button type="button" className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 border border-primary-200">
                      {currentUser.avatar}
                    </span>
                    <div className="hidden sm:block text-left max-w-[120px]">
                      <p className="text-xs font-bold leading-4 text-slate-950 truncate">{currentUser.name}</p>
                      <p className="text-[10px] leading-3 text-slate-500 truncate">{titleCase(currentUser.role)}</p>
                    </div>
                    <ArrowDown2 size={14} className="text-slate-400 shrink-0" variant="Outline" />
                  </button>
                }
              >
                <DropdownItem onClick={handleLogout} danger>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="primary-cta flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold transition hover:-translate-y-px">
                <LoginCurve size={16} color="currentColor" variant="Outline" aria-hidden="true" />
                Login
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </motion.div>
  );
}
