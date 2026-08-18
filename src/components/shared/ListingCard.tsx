import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight, Building2 } from "lucide-react"
import { getCategory, conditionLabel } from "@/lib/constants"
import { cn, formatCurrency, formatRelativeTime, thumbUrl } from "@/lib/utils"
import type { Listing } from "@/lib/types"

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  const thumb = thumbUrl(src)
  return (
    <img
      src={failed ? src : thumb}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
}

export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0]?.url ?? null
  const category = getCategory(listing.category_id)
  const isInactive = listing.status === "sold" || listing.status === "given_away" || listing.status === "expired"

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex gap-3 rounded-xl border bg-card p-3 shadow-subtle transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-square w-[28%] max-w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <CardImage src={image} alt={listing.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {category && <category.icon className="h-7 w-7 text-muted-foreground/40" aria-hidden />}
          </div>
        )}
        {isInactive && (
          <span className="absolute inset-x-1 bottom-1 line-clamp-1 rounded-md bg-background/85 px-1.5 py-0.5 text-center text-[10px] font-semibold capitalize text-muted-foreground backdrop-blur-sm">
            {listing.status === "sold" ? "Sold" : listing.status === "given_away" ? "Given away" : "Expired"}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2">
          {listing.transaction_type === "sell" && listing.price != null ? (
            <span className="text-base font-bold text-foreground">{formatCurrency(listing.price)}</span>
          ) : listing.transaction_type === "exchange" ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
              Exchange
            </span>
          ) : (
            <span className="text-sm font-semibold text-emerald-600">Free</span>
          )}
          {listing.status === "reserved" && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Reserved</span>
          )}
        </div>

        <p className="line-clamp-1 text-xs capitalize text-muted-foreground">{conditionLabel(listing.condition)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{listing.seller?.institution?.name ?? "Campus"}</span>
          </span>
          <span className="shrink-0">{formatRelativeTime(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}

export function ListingCardCompact({ listing, className }: { listing: Listing; className?: string }) {
  const image = listing.images?.[0]?.url ?? null
  const isInactive = listing.status === "sold" || listing.status === "given_away" || listing.status === "expired"
  return (
    <Link
      to={`/listings/${listing.id}`}
      className={cn("group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-subtle transition-shadow hover:shadow-card", className)}
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {image ? (
          <CardImage src={image} alt={listing.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            {(() => {
              const C = getCategory(listing.category_id)?.icon
              return C ? <C className="h-6 w-6" /> : null
            })()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{listing.title}</h3>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          {listing.transaction_type === "sell" && listing.price != null ? (
            <span className="font-semibold text-foreground">{formatCurrency(listing.price)}</span>
          ) : listing.transaction_type === "exchange" ? (
            <span className="font-semibold text-indigo-600">Exchange</span>
          ) : (
            <span className="font-semibold text-emerald-600">Free</span>
          )}
          {isInactive && <span className="capitalize">{listing.status}</span>}
          <span>{formatRelativeTime(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
