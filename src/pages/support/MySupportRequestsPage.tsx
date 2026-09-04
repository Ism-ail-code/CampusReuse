import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Trash2, CheckCircle, Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { getCategory } from "@/lib/constants"
import { formatRelativeTime } from "@/lib/utils"
import type { SupportRequest } from "@/lib/types"

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-sky-100 text-sky-700",
  expired: "bg-slate-200 text-slate-500",
  cancelled: "bg-slate-200 text-slate-500",
}

export function MySupportRequestsPage() {
  const { service } = useApp()
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await service.getMySupportRequests()
      if (!mounted) return
      setRequests(res)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [service])

  const handleDelete = async (id: string) => {
    await service.deleteSupportRequest(id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleMarkFulfilled = async (id: string) => {
    await service.markSupportRequestFulfilled(id)
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "fulfilled" as const } : r))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="My Support Requests"
        subtitle="Manage your support requests"
        backTo="/support"
      />

      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/support/new-request">Post New Request</Link>
        </Button>
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No support requests yet"
          description="Post a request when you need educational resources from the community."
          actionLabel="Post a request"
          onAction={() => window.location.href = "/support/new-request"}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const category = r.category_id ? getCategory(r.category_id) : null
            return (
              <div key={r.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                    {category && (
                      <span className="text-xs text-muted-foreground">{category.name}</span>
                    )}
                  </div>
                  <Link to={`/support/requests/${r.id}`} className="mt-1 block">
                    <h3 className="text-sm font-semibold text-foreground hover:text-primary">{r.title}</h3>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {formatRelativeTime(r.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {r.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkFulfilled(r.id)}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Fulfilled
                    </Button>
                  )}
                  <ConfirmDialog
                    title="Delete support request?"
                    description="This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(r.id)}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden />
                      </Button>
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
