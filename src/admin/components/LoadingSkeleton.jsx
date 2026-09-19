import { cn } from "@/lib/utils";

export const Skeleton = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-lg bg-gray-200/80 dark:bg-white dark:bg-gray-900/10",
      className
    )}
  />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-white dark:bg-gray-900/5 p-5 backdrop-blur-xl">
    <Skeleton className="h-10 w-10 rounded-xl mb-4" />
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded-xl" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-xl" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-white dark:bg-gray-900/5 p-6 backdrop-blur-xl">
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

export default Skeleton;
