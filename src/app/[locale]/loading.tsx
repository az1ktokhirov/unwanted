import { SkeletonCard, SkeletonMatchCard, SkeletonNewsCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 space-y-12">
      {/* Hero placeholder */}
      <div className="h-[60vh] rounded-2xl bg-white/5 animate-pulse" />
      {/* Content grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonNewsCard key={i} />
        ))}
      </div>
    </div>
  );
}
