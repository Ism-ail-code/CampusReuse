import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftRight, ArrowRight, CheckCircle2, Loader2, MessageSquare, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Skeleton } from "@/components/shared/Skeleton"
import { ProposalStatusBadge } from "@/components/shared/Badges"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { ExchangeProposal } from "@/lib/types"

type Direction = "incoming" | "outgoing"

export function ExchangesPage() {
  const { service, session } = useApp()
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<ExchangeProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Direction>("incoming")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await service.getMyExchangeProposals()
    setProposals(res)
    setLoading(false)
  }, [service])

  useEffect(() => {
    load()
  }, [load])

  const me = session?.user.id
  const incoming = proposals.filter((p) => p.listing?.seller_id === me && p.proposer_id !== me)
  const outgoing = proposals.filter((p) => p.proposer_id === me)
  const visible = tab === "incoming" ? incoming : outgoing

  const act = async (p: ExchangeProposal, status: string, successLabel: string) => {
    setBusyId(p.id)
    const res = await service.updateExchangeProposal(p.id, status)
    setBusyId(null)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(successLabel)
    load()
  }

  const message = async (p: ExchangeProposal) => {
    const targetId = p.proposer_id === me ? p.listing_id : p.offer_listing_id
    if (!targetId) {
      toast.error("The related listing is no longer available.")
      return
    }
    setBusyId(p.id)
    const res = await service.startConversation(targetId)
    setBusyId(null)
    if (res.error) {
      toast.error(res.error)
      return
    }
    navigate(`/messages/${res.id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Exchanges"
        subtitle="Track 1-for-1 swap proposals on your listings and the ones you've made."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Direction)} className="mt-6">
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          <TabsTrigger value="incoming">On my listings ({incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing">My proposals ({outgoing.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={tab === "incoming" ? "No exchange proposals yet" : "You haven't proposed any exchanges"}
            description={
              tab === "incoming"
                ? "When someone proposes to swap for one of your listings, it will appear here."
                : "Find an exchange listing you need and propose one of your own items in return."
            }
            actionLabel={tab === "incoming" ? "Browse listings" : undefined}
            onAction={tab === "incoming" ? () => navigate("/browse") : undefined}
          />
        ) : (
          visible.map((p) => {
            const listing = p.listing
            const offer = p.offer_listing
            const isOwner = listing?.seller_id === me
            const canDecide = isOwner && p.status === "pending"
            const canCancel = p.proposer_id === me && (p.status === "pending" || p.status === "accepted")
            const canComplete = (isOwner || p.proposer_id === me) && p.status === "accepted"
            return (
              <div key={p.id} className="rounded-xl border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ProposalStatusBadge status={p.status} />
                  {isOwner && <span className="text-xs font-medium text-muted-foreground">Proposal on your listing</span>}
                </div>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {isOwner ? "Their listing wants" : "Listing"}
                    </p>
                    {listing ? (
                      <Link to={`/listings/${listing.id}`} className="mt-1 block text-sm font-semibold text-foreground hover:text-primary">
                        {listing.title}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Listing removed</p>
                    )}
                    {listing?.exchange_want && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Looking for: <span className="font-medium text-foreground">{listing.exchange_want}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Offered in return</p>
                    {offer ? (
                      <Link to={`/listings/${offer.id}`} className="mt-1 block text-sm font-semibold text-foreground hover:text-primary">
                        {offer.title}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Offered listing removed</p>
                    )}
                    {offer?.transaction_type === "sell" && offer.price != null && (
                      <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(offer.price)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link to={`/u/${p.proposer?.username}`} className="flex items-center gap-2">
                    <UserAvatar name={p.proposer?.display_name ?? "?"} src={p.proposer?.avatar_url} className="h-7 w-7" />
                    <span className="text-xs font-medium text-foreground">{p.proposer?.display_name ?? "Unknown user"}</span>
                  </Link>
                  {!isOwner && listing?.seller && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      <span className="flex items-center gap-2">
                        <UserAvatar name={listing.seller.display_name} src={listing.seller.avatar_url} className="h-7 w-7" />
                        <span className="text-xs font-medium text-foreground">{listing.seller.display_name}</span>
                      </span>
                    </>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
                </div>

                {p.message && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm italic text-muted-foreground">"{p.message}"</p>
                  </>
                )}

                {(canDecide || canCancel || canComplete) && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap items-center gap-2">
                      {canDecide && (
                        <>
                          <Button size="sm" onClick={() => act(p, "accepted", "Exchange accepted. Arrange the swap in person.")} disabled={busyId === p.id}>
                            {busyId === p.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />}
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => act(p, "declined", "Proposal declined.")} disabled={busyId === p.id}>
                            <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
                            Decline
                          </Button>
                        </>
                      )}
                    {canComplete && (
                      <Button size="sm" onClick={() => act(p, "completed", "Exchange marked as completed.")} disabled={busyId === p.id}>
                        Mark completed
                      </Button>
                    )}
                    {canCancel && (
                      <Button size="sm" variant="ghost" onClick={() => act(p, "cancelled", "Proposal cancelled.")} disabled={busyId === p.id}>
                        Cancel proposal
                      </Button>
                    )}
                    {(p.status === "pending" || p.status === "accepted") && (
                      <Button size="sm" variant="outline" onClick={() => void message(p)} disabled={busyId === p.id}>
                        <MessageSquare className="mr-1.5 h-4 w-4" aria-hidden />
                        Message
                      </Button>
                    )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {p.status === "accepted" && "Both parties can mark this exchange complete after the swap."}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
