import { SkeletonTable, Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-admin-card border border-admin-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-8 w-16 mt-3" />
            <Skeleton className="h-2 w-20" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
