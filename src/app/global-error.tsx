"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-slate-950">
          <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold leading-8">Workspace unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">A global application error interrupted rendering.</p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-5 rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold leading-6 text-white"
            >
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
