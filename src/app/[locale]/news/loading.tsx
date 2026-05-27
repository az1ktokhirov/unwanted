import { SkeletonNewsCard, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonNewsCard key={i} />)}
      </div>
    </div>
  );
}
