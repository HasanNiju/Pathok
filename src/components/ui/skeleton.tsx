import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary", className)} />;
}

/** Preset: a single line of placeholder text. */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

/** Preset: a circular avatar placeholder. */
export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

/** Preset matching BookCard's shape, for library/grid loading states. */
export function SkeletonBookCard({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}
