import { Skeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-md pt-32">
        <Skeleton className="h-96 rounded-[24px]" />
      </div>
    </main>
  );
}
