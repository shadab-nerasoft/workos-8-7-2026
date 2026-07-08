"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RouteErrorPanel } from "@/src/components/common/route-error-panel";

export default function Error(props: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signup on error since this route is deprecated
    router.push("/signup");
  }, [router]);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-md pt-32">
        <RouteErrorPanel {...props} />
      </div>
    </main>
  );
}
