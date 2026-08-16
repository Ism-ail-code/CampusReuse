import { Link } from "react-router-dom"
import { ArrowLeftRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TransactionBadge } from "./Badges"
import { SaveButton } from "./SaveButton"
import { UserAvatar } from "./UserAvatar"
import { getCategory, conditionLabel } from "@/lib/constants"
import { cn, formatCurrency, formatRelativeTime, truncate } from "@/lib/utils"
import type { Listing } from "@/lib/types"

export function ListingCard({ listing, showSeller = false }: { listing: Listing; showSeller?: boolean }) {
  const image = listing.images?.[0]?.url ?? null
  const category = getCategory(listing.category_id)
  const isInactive = listing.status === "sold" || listing.status === "given_away" || listing.status === "expired"

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-subtle transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {category && <category.icon className="h-10 w-10 text-muted-foreground/40" aria-hidden />}
          </div>
        )}
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
              {listing.status === "sold" ? "Sold" : listing.status === "given_away" ? "Given away" : "Expired"}
            </span>
          </div>
        )}
        {listing.status === "reserved" && (
          <Badge variant="outline" className="absolute left-2 top-2 border-transparent bg-amber-100 font-medium text-amber-700">
            Reserved
          </Badge>
        )}
        <SaveButton listingId={listing.id} className="absolute right-2 top-2" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          {listing.transaction_type === "sell" && listing.price != null ? (
            <span className="text-lg font-bold text-foreground">{formatCurrency(listing.price)}</span>
          ) : listing.transaction_type === "exchange" ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
              Exchange
            </span>
          ) : (
            <span className="text-sm font-semibold text-emerald-600">Free</span>
          )}
          <TransactionBadge type={listing.transaction_type} className="!px-2 !py-0 text-[11px]" />
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {truncate(listing.title, 90)}
        </h3>

        <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {listing.seller?.institution?.name ?? "Campus"}
            {listing.seller?.institution?.city ? ` · ${listing.seller.institution.city}` : ""}
          </span>
        </div>

        <p className="line-clamp-1 text-xs capitalize text-muted-foreground">{conditionLabel(listing.condition)}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {showSeller && listing.seller ? (
            <span className="flex items-center gap-1.5">
              <UserAvatar name={listing.seller.display_name} src={listing.seller.avatar_url} className="h-5 w-5" />
              <span className="line-clamp-1 max-w-[9rem]">{listing.seller.display_name}</span>
            </span>
          ) : (
            <span className="capitalize">{category?.name.replace(/s$/, "")}</span>
          )}
          <span>{formatRelativeTime(listing.created_at)}</span>
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
          <img src={image} alt={listing.title} loading="lazy" className="h-full w-full object-cover" />
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
