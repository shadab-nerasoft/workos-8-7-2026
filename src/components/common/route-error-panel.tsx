"use client";

import { useEffect } from "react";

export function RouteErrorPanel({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold leading-8 text-slate-950 dark:text-slate-50">This section could not load</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Retry the route to restore the latest workspace state.</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-5 rounded-sm bg-primary-600 px-4 py-2 text-sm font-semibold leading-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Retry
      </button>
    </section>
  );
}
