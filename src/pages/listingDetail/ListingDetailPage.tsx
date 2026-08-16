import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeftRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Gift,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { VerificationBadges } from "@/components/shared/VerificationBadges"
import { SaveButton } from "@/components/shared/SaveButton"
import { ReportDialog } from "@/components/shared/ReportDialog"
import { BlockButton } from "@/components/shared/BlockButton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { StatusBadge, TransactionBadge } from "@/components/shared/Badges"
import { ListingCard } from "@/components/shared/ListingCard"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProposeExchangeDialog } from "./ProposeExchangeDialog"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { getCategory, conditionLabel } from "@/lib/constants"
import { cn, daysUntil, formatCurrency, formatDate } from "@/lib/utils"
import type { Listing } from "@/lib/types"

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { service, session, requireAuth } = useApp()
  const [listing, setListing] = useState<Listing | null>(null)
  const [similar, setSimilar] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [busy, setBusy] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const swipeLeft = (dx: number, count: number) =>
    setActiveImage((i) => (dx < 0 ? (i + 1) % count : (i - 1 + count) % count))

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [fullscreen])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const l = await service.getListing(id!)
      if (!mounted) return
      setListing(l)
      setActiveImage(0)
      if (l) {
        const sim = await service.listListings({
          category_id: l.category_id,
          only_active: true,
          exclude_sold: true,
        })
        if (mounted) setSimilar(sim.filter((s) => s.id !== l.id).slice(0, 4))
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [id, service])

  const isOwner = listing?.seller_id === session?.user.id
  const isAvailable = listing?.status === "available" || listing?.status === "reserved"
  const images = useMemo(() => listing?.images ?? [], [listing])

  const messageSeller = async () => {
    if (!listing) return
    if (!session?.user.id) {
      requireAuth()
      return
    }
    setBusy(true)
    const res = await service.startConversation(listing.id)
    setBusy(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    window.location.href = `/messages/${res.id}`
  }

  const setStatus = async (status: Listing["status"], label: string) => {
    if (!listing) return
    setBusy(true)
    const res = await service.setListingStatus(listing.id, status)
    setBusy(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success(`Marked as ${label}.`)
      const updated = await service.getListing(listing.id)
      if (updated) setListing(updated)
    }
  }

  const renew = async () => {
    if (!listing) return
    setBusy(true)
    const res = await service.renewListing(listing.id)
    setBusy(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Listing renewed for another 30 days.")
      const updated = await service.getListing(listing.id)
      if (updated) setListing(updated)
    }
  }

  const remove = async () => {
    if (!listing) return
    const res = await service.deleteListing(listing.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Listing deleted.")
      window.location.href = "/my-listings"
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CardGridSkeleton count={1} />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed by its owner or the moderator team.</p>
        <Button asChild className="mt-6">
          <Link to="/browse">Browse materials</Link>
        </Button>
      </div>
    )
  }

  const category = getCategory(listing.category_id)
  const daysLeft = daysUntil(listing.expires_at)
  const seller = listing.seller
  const inactive = !isAvailable

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 md:pb-8">
      <PageHeader title={listing.title} backTo="/browse" />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted"
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX.current == null) return
              const dx = e.changedTouches[0].clientX - touchStartX.current
              touchStartX.current = null
              if (Math.abs(dx) > 40 && images.length > 1) swipeLeft(dx, images.length)
            }}
          >
            {images.length > 0 ? (
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                aria-label="View photo full screen"
                className="block h-full w-full"
              >
                <img src={images[activeImage].url ?? undefined} alt={listing.title} className="h-full w-full object-cover" />
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {category && <category.icon className="h-16 w-16 text-muted-foreground/30" aria-hidden />}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow backdrop-blur"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium shadow backdrop-blur">
                  {activeImage + 1} / {images.length}
                </span>
              </>
            )}
            <span className="absolute left-3 top-3">
              <SaveButton listingId={listing.id} className="!bg-background/90" />
            </span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors",
                    i === activeImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={img.url ?? undefined} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen photo viewer */}
        {fullscreen && (
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-sm font-medium tabular-nums">
                {activeImage + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Close photo viewer"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <div
              className="flex flex-1 items-center justify-center overflow-hidden px-2 pb-8"
              onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX.current == null) return
                const dx = e.changedTouches[0].clientX - touchStartX.current
                touchStartX.current = null
                if (Math.abs(dx) > 40 && images.length > 1) swipeLeft(dx, images.length)
              }}
            >
              <img src={images[activeImage].url ?? undefined} alt={listing.title} className="max-h-full w-full object-contain" />
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => swipeLeft(1, images.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => swipeLeft(-1, images.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <TransactionBadge type={listing.transaction_type} />
            <StatusBadge status={listing.status} />
            <span className="text-xs text-muted-foreground">Listed {formatDate(listing.created_at)}</span>
          </div>

          <h1 className="sr-only">{listing.title}</h1>

          <div className="mt-3">
            {listing.transaction_type === "sell" && listing.price != null && (
              <p className="text-3xl font-bold text-foreground">{formatCurrency(listing.price)}</p>
            )}
            {listing.transaction_type === "give_away" && (
              <p className="flex items-center gap-2 text-xl font-semibold text-emerald-600">
                <Gift className="h-5 w-5" aria-hidden />
                Free — give away
              </p>
            )}
            {listing.transaction_type === "exchange" && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  <ArrowLeftRight className="h-4 w-4" aria-hidden />
                  What the seller wants in return
                </p>
                <p className="mt-1 text-sm text-indigo-900">{listing.exchange_want}</p>
              </div>
            )}
          </div>

          {seller && (
            <Link
              to={`/u/${seller.username}`}
              className="mt-4 flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-card"
            >
              <UserAvatar name={seller.display_name} src={seller.avatar_url} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{seller.display_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {seller.institution?.name ?? "Campus"}
                  {seller.education_level ? ` · ${seller.education_level}` : ""}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Category</dt>
              <dd className="mt-0.5 font-medium capitalize">{category?.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Condition</dt>
              <dd className="mt-0.5 font-medium">{conditionLabel(listing.condition)}</dd>
            </div>
            {listing.subject && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Subject</dt>
                <dd className="mt-0.5 font-medium">{listing.subject}</dd>
              </div>
            )}
            {listing.education_level && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Level</dt>
                <dd className="mt-0.5 font-medium">{listing.education_level}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Location</dt>
              <dd className="mt-0.5 flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {seller?.institution?.city || "—"}
              </dd>
            </div>
            {isAvailable && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Expires</dt>
                <dd className="mt-0.5 flex items-center gap-1 font-medium">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {daysLeft > 3 ? `in ${daysLeft} days` : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                </dd>
              </div>
            )}
          </dl>

          <Separator className="my-5" />

          <div>
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {listing.description || "No additional description provided."}
            </p>
          </div>

          {/* Actions (desktop) */}
          <div className="mt-6 hidden flex-col gap-3 md:flex">
            {!isOwner && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={messageSeller} disabled={busy || inactive}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" aria-hidden />}
                  {listing.status === "sold"
                    ? "Listing sold"
                    : listing.status === "given_away"
                      ? "Given away"
                      : listing.status === "expired"
                        ? "Listing expired"
                        : "Message seller"}
                </Button>
                {listing.transaction_type === "exchange" && isAvailable && (
                  <ProposeExchangeDialog listing={listing} />
                )}
              </div>
            )}

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/listings/${listing.id}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Link>
                </Button>
                {isAvailable && (
                  <Button variant="outline" size="sm" onClick={() => setStatus(listing.transaction_type === "give_away" ? "given_away" : "sold", listing.transaction_type === "give_away" ? "given away" : "sold")} disabled={busy}>
                    Mark {listing.transaction_type === "give_away" ? "given away" : "sold"}
                  </Button>
                )}
                {(listing.status === "expired" || listing.status === "sold" || listing.status === "given_away") && (
                  <Button variant="outline" size="sm" onClick={renew} disabled={busy}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Renew / relist
                  </Button>
                )}
                <ConfirmDialog
                  title="Delete this listing?"
                  description="This permanently removes your listing and its photos."
                  confirmLabel="Delete"
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  }
                  onConfirm={remove}
                />
              </div>
            )}
          </div>

          {/* Delete stays reachable on mobile; the primary actions live in the sticky bar */}
          {isOwner && (
            <div className="mt-6 md:hidden">
              <ConfirmDialog
                title="Delete this listing?"
                description="This permanently removes your listing and its photos."
                confirmLabel="Delete"
                trigger={
                  <Button variant="outline" className="w-full">
                    <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                }
                onConfirm={remove}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        {!isOwner ? (
          <div className="mx-auto flex max-w-md gap-2">
            {listing.transaction_type === "exchange" && isAvailable && (
              <div className="flex-1">
                <ProposeExchangeDialog listing={listing} />
              </div>
            )}
            <Button size="lg" className="flex-1" onClick={messageSeller} disabled={busy || inactive}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" aria-hidden />}
              {listing.status === "sold"
                ? "Listing sold"
                : listing.status === "given_away"
                  ? "Given away"
                  : listing.status === "expired"
                    ? "Listing expired"
                    : "Message seller"}
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md gap-2">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to={`/listings/${listing.id}/edit`}>
                <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                Edit
              </Link>
            </Button>
            {isAvailable ? (
              <Button
                size="lg"
                className="flex-1"
                onClick={() =>
                  setStatus(
                    listing.transaction_type === "give_away" ? "given_away" : "sold",
                    listing.transaction_type === "give_away" ? "given away" : "sold",
                  )
                }
                disabled={busy}
              >
                Mark {listing.transaction_type === "give_away" ? "given away" : "sold"}
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={renew} disabled={busy}>
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                Renew / relist
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Seller card */}
      {seller && (
        <div className="mt-8 rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to={`/u/${seller.username}`} className="flex items-center gap-3">
              <UserAvatar name={seller.display_name} src={seller.avatar_url} className="h-12 w-12" />
              <div>
                <p className="text-sm font-semibold text-foreground">{seller.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {seller.institution?.name ?? "Campus"}
                  {seller.education_level ? ` · ${seller.education_level}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Member since {formatDate(seller.created_at)}</p>
              </div>
            </Link>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <VerificationBadges profile={seller} />
              {!isOwner && (
                <div className="flex gap-2">
                  <BlockButton userId={seller.id} name={seller.display_name} />
                  <ReportDialog targetType="user" targetId={seller.id} />
                </div>
              )}
            </div>
          </div>
          {!isOwner && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>Stay safe:</strong> meet in public or school-approved places, bring a trusted adult
                when appropriate, and only share your contact details when you feel comfortable. CampusReuse
                never handles payments or delivery.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Similar listings */}
      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground">Similar materials</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
