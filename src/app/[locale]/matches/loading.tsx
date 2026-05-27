import { SkeletonMatchCard, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonMatchCard key={i} />)}
      </div>
    </div>
  );
}
