import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Search, PlusCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/app/AppContext"
import { ListingCard } from "@/components/shared/ListingCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import type { Listing, SupportRequest } from "@/lib/types"

export function GetSupportPage() {
  const { service, session } = useApp()
  const [activeTab, setActiveTab] = useState<"resources" | "requests">("resources")
  const [donations, setDonations] = useState<Listing[]>([])
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const [d, sr] = await Promise.all([
        service.listListings({ transaction_type: "donate", only_active: true }),
        service.listSupportRequests({ status: ["active"] }),
      ])
      if (!mounted) return
      setDonations(d)
      setSupportRequests(sr)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [service])

  const filteredDonations = donations.filter((l) =>
    !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRequests = supportRequests.filter((r) =>
    !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" aria-hidden />
            Get Support
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Educational resources shared by the community
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/support/new-request">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
              Post a Request
            </Link>
          </Button>
          {session && (
            <Button asChild size="sm">
              <Link to="/listings/new?context=get_support">
                <Heart className="mr-2 h-4 w-4" aria-hidden />
                Donate
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Community Support</p>
        <p className="mt-1">
          Students and teachers share free educational resources — books, notes, guides, and more.
          Financial support will be available once our verified donation infrastructure is established.
        </p>
      </div>

      <div className="mt-6 flex gap-1 rounded-lg border bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "resources"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Available Resources
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Student Requests
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "resources" ? "Search available resources…" : "Search student requests…"}
            className="pl-9"
          />
        </div>
      </div>

      {session?.user.id && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/my-support-requests" className="font-medium text-primary hover:underline">
            Manage your support requests
          </Link>
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : activeTab === "resources" ? (
          filteredDonations.length === 0 ? (
            <EmptyState
              icon={Heart}
              title={searchQuery ? `No resources match "${searchQuery}"` : "No available resources yet"}
              description="Be the first to share educational resources with the community."
              actionLabel="Donate a resource"
              onAction={() => window.location.href = "/listings/new?context=get_support"}
            />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                Showing {filteredDonations.length} available resource(s).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDonations.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </>
          )
        ) : (
          filteredRequests.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchQuery ? `No requests match "${searchQuery}"` : "No active student requests"}
              description="Be the first to post a request — other students can offer help directly."
              actionLabel="Post a request"
              onAction={() => window.location.href = "/support/new-request"}
            />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                Showing {filteredRequests.length} active request(s).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.map((r) => (
                  <SupportRequestCard key={r.id} request={r} />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

function SupportRequestCard({ request }: { request: SupportRequest }) {
  return (
    <Link
      to={`/support/requests/${request.id}`}
      className="group flex flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          Looking for help
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
        {request.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{request.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
        {request.category && (
          <span className="rounded-md bg-muted px-2 py-0.5">{request.category.name}</span>
        )}
        {request.education_level && (
          <span className="rounded-md bg-muted px-2 py-0.5">{request.education_level}</span>
        )}
        {request.location && (
          <span className="rounded-md bg-muted px-2 py-0.5">{request.location}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          {request.author?.display_name ?? "Student"}
        </span>
        <span>{new Date(request.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
