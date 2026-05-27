import { SkeletonPlayerCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
      <div className="h-48 rounded-xl bg-white/5 animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => <SkeletonPlayerCard key={i} />)}
      </div>
    </div>
  );
}
