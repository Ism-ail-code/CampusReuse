import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Pencil, PlusCircle, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge } from "@/components/shared/Badges"
import { formatCurrency, daysUntil } from "@/lib/utils"
import type { Listing } from "@/lib/types"

export function MyListingsPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await service.getMyListings()
    setListings(res)
    setLoading(false)
  }, [service])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (l: Listing, status: Listing["status"], label: string) => {
    const res = await service.setListingStatus(l.id, status)
    if (res.error) toast.error(res.error)
    else {
      toast.success(`Marked as ${label}.`)
      load()
    }
  }

  const renew = async (l: Listing) => {
    const res = await service.renewListing(l.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Listing renewed for another 30 days.")
      load()
    }
  }

  const remove = async (l: Listing) => {
    const res = await service.deleteListing(l.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Listing deleted.")
      load()
    }
  }

  const firstImage = (l: Listing) => l.images?.[0]?.url ?? null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="My listings"
        subtitle="Manage availability, renew expiring items, and track what you've sold."
        action={
          <Button asChild>
            <Link to="/listings/new">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
              List an item
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <CardGridSkeleton count={3} />
        ) : listings.length === 0 ? (
          <EmptyState
            title="You haven't listed anything yet"
            description="List a textbook, notes, guide, calculator, or notebook you no longer need."
            actionLabel="List your first item"
            onAction={() => navigate("/listings/new")}
          />
        ) : (
          <div className="space-y-3">
            {listings.map((l) => {
              const image = firstImage(l)
              const daysLeft = daysUntil(l.expires_at)
              const canMarkSold = l.status === "available" || l.status === "reserved"
              return (
                <div key={l.id} className="flex gap-4 rounded-xl border bg-card p-4">
                  <Link to={`/listings/${l.id}`} className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {image ? (
                      <img src={image} alt={l.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No photo</div>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/listings/${l.id}`} className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary">
                          {l.title}
                        </Link>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {l.transaction_type === "sell" && l.price != null
                          ? formatCurrency(l.price)
                          : l.transaction_type === "exchange"
                            ? "Exchange"
                            : "Free"}
                        {l.status === "available" &&
                          (daysLeft <= 3 ? (
                            <span className="text-amber-600"> · Expires in {daysLeft} day{daysLeft === 1 ? "" : "s"} — renew soon!</span>
                          ) : (
                            <span> · Expires in {daysLeft} days</span>
                          ))}
                        {l.status === "expired" && <span className="text-amber-600"> · Expired — renew to relist.</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {l.status === "available" && (
                        <Button variant="outline" size="sm" onClick={() => setStatus(l, "reserved", "Reserved")}>
                          Mark reserved
                        </Button>
                      )}
                      {l.status === "reserved" && (
                        <Button variant="outline" size="sm" onClick={() => setStatus(l, "available", "Available")}>
                          Mark available
                        </Button>
                      )}
                      {canMarkSold && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {l.transaction_type === "sell" ? "Mark sold" : l.transaction_type === "give_away" ? "Mark given away" : "Mark sold / exchanged"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setStatus(l, "sold", "Sold")}>
                              {l.transaction_type === "sell" ? "Sold" : "Sold / exchanged"}
                            </DropdownMenuItem>
                            {l.transaction_type === "give_away" && (
                              <DropdownMenuItem onClick={() => setStatus(l, "given_away", "Given away")}>
                                Given away
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {(l.status === "expired" || l.status === "sold" || l.status === "given_away") && (
                        <Button variant="outline" size="sm" onClick={() => renew(l)}>
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Renew / relist
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/listings/${l.id}/edit`}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Edit
                        </Link>
                      </Button>
                      <ConfirmDialog
                        title="Delete this listing?"
                        description="This permanently removes your listing and its photos."
                        confirmLabel="Delete"
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Delete listing">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        onConfirm={() => remove(l)}
                      />
                      {l.status === "sold" && (
                        <span className="text-[11px] text-muted-foreground">Keep sold listings as a record — you can relist anytime.</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
