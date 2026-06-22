import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="bg-background" style={{display: "flex", minHeight: "100vh"}}>
      {/* Sidebar skeleton */}
      <div className="w-[280px] border-r border-border bg-background space-y-6" style={{padding: "1rem"}}>
        {/* Logo area */}
        <div style={{display: "flex", alignItems: "center", gap: "0.75rem", paddingLeft: "0.5rem", paddingRight: "0.5rem"}}>
          <Skeleton className="h-8 w-8" style={{borderRadius: "0.375rem"}} />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Menu items */}
        <div className="space-y-2" style={{paddingLeft: "0.5rem", paddingRight: "0.5rem"}}>
          <Skeleton className="h-10" style={{width: "100%", borderRadius: "0.5rem"}} />
          <Skeleton className="h-10" style={{width: "100%", borderRadius: "0.5rem"}} />
          <Skeleton className="h-10" style={{width: "100%", borderRadius: "0.5rem"}} />
        </div>

        {/* User profile area at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="px-1" style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
            <Skeleton className="h-9 w-9" style={{borderRadius: "9999px"}} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 space-y-4" style={{padding: "1rem"}}>
        {/* Content blocks */}
        <Skeleton className="h-12 w-48" style={{borderRadius: "0.5rem"}} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{gap: "1rem"}}>
          <Skeleton className="h-32" style={{borderRadius: "0.75rem"}} />
          <Skeleton className="h-32" style={{borderRadius: "0.75rem"}} />
          <Skeleton className="h-32" style={{borderRadius: "0.75rem"}} />
        </div>
        <Skeleton className="h-64" style={{borderRadius: "0.75rem"}} />
      </div>
    </div>
  );
}
