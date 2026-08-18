import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden />
}

export function ListingCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-3">
      <Skeleton className="aspect-square w-[28%] max-w-28 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2 py-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-auto h-3 w-full" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
