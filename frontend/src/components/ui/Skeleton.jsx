function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} aria-hidden />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-3/4" : "w-full"}`} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-live="polite">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-7 w-48" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-24" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JobsSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Skeleton className="h-9 w-full" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-4 w-28" />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-3 h-3 w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32" />
          <SkeletonText lines={4} className="mt-4" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-32" />
        <SkeletonText lines={3} className="mt-4" />
      </div>
    </div>
  );
}

export function CompaniesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-4 w-32" />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CareerPathSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-4 h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function GraphExplorerSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-10 w-full" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-[420px] w-full rounded-xl" />
      </div>
    </div>
  );
}

export default Skeleton;
