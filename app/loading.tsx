import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container-page min-h-screen pt-28">
      <Skeleton className="h-[52vh] min-h-[420px] w-full rounded-2xl" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </main>
  );
}
