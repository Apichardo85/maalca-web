interface DashboardSkeletonProps {
  variant: "stats" | "table" | "chart" | "cards";
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse ${className ?? ""}`}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <SkeletonBlock className="w-12 h-12" />
            <SkeletonBlock className="w-16 h-5" />
          </div>
          <SkeletonBlock className="w-24 h-4 mb-2" />
          <SkeletonBlock className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <SkeletonBlock className="w-48 h-6" />
        <SkeletonBlock className="w-32 h-9 rounded-lg" />
      </div>
      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-3">
        <SkeletonBlock className="flex-1 h-10 rounded-lg" />
        <SkeletonBlock className="w-36 h-10 rounded-lg" />
      </div>
      {/* Table rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="w-3/4 h-4" />
              <SkeletonBlock className="w-1/2 h-3" />
            </div>
            <SkeletonBlock className="w-20 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="w-40 h-6" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="w-12 h-8 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="relative h-64">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-gray-800 to-transparent rounded-lg animate-pulse" />
        {/* Fake chart bars */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-48 px-4">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <SkeletonBlock
              key={i}
              className="w-8 rounded-t-md"
              style={{ height: `${h}%` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <SkeletonBlock className="w-full h-32 rounded-lg" />
          <SkeletonBlock className="w-3/4 h-5" />
          <SkeletonBlock className="w-1/2 h-4" />
          <div className="flex gap-2">
            <SkeletonBlock className="w-16 h-6 rounded-full" />
            <SkeletonBlock className="w-16 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton({ variant }: DashboardSkeletonProps) {
  const skeletons = {
    stats: StatsSkeleton,
    table: TableSkeleton,
    chart: ChartSkeleton,
    cards: CardsSkeleton,
  };

  const Skeleton = skeletons[variant];
  return <Skeleton />;
}
