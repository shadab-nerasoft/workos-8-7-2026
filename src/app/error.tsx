"use client";

import { useEffect } from "react";

export default function Error({
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold leading-8 text-slate-950 dark:text-slate-50">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">The workspace could not be loaded. Try again to recover this route.</p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-5 rounded-sm bg-primary-600 px-4 py-2 text-sm font-semibold leading-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
