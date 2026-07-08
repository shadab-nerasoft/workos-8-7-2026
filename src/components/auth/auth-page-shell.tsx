import Link from "next/link";
import type { ReactNode } from "react";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
            <span className="primary-cta flex h-10 w-10 items-center justify-center">W</span>
            WorkOS PM
          </Link>
          <Link href="/" className="soft-control px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-primary-700">
            Back to dashboard
          </Link>
        </header>
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden lg:block">
            <p className="text-xs font-semibold uppercase leading-5 text-primary-600">Enterprise project operating system</p>
            <h2 className="mt-3 max-w-xl text-5xl font-bold leading-[56px] text-slate-950">
              Secure access for teams, managers, and operators.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Frontend auth screens are prepared for backend integration while keeping role-aware product navigation clear.
            </p>
          </section>
          <div className="flex justify-center lg:justify-end">{children}</div>
        </div>
      </div>
    </main>
  );
}
