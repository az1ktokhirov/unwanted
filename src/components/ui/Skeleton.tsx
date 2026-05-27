interface Props {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-secondary border border-white/5 rounded-xl overflow-hidden ${className}`}>
      <Skeleton className="w-full aspect-video" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonPlayerCard() {
  return (
    <div className="bg-secondary border border-white/5 rounded-xl overflow-hidden">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="bg-secondary border border-white/5 rounded-xl p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonNewsCard() {
  return (
    <div className="bg-secondary border border-white/5 rounded-xl overflow-hidden">
      <Skeleton className="w-full h-44" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3 mt-1" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
      <div className="border-b border-admin-border px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-admin-border px-4 py-3 flex gap-6 items-center last:border-0">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Skeleton key={j} className={`h-3 ${j === 0 ? "flex-1" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
