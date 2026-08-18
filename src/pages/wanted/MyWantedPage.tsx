import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Clock, PlusCircle, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { wantedStatusLabel } from "@/lib/constants"
import { daysUntil, formatDate } from "@/lib/utils"
import type { WantedPost } from "@/lib/types"

export function MyWantedPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<WantedPost[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await service.getMyWanted()
    setPosts(res)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [service])

  const renew = async (p: WantedPost) => {
    const res = await service.renewWanted(p.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Wanted post renewed for another 30 days.")
      load()
    }
  }

  const remove = async (p: WantedPost) => {
    const res = await service.deleteWanted(p.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Wanted post deleted.")
      load()
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="My wanted posts"
        subtitle="Manage what you're looking for."
        backTo="/wanted"
        action={
          <Button asChild variant="outline">
            <Link to="/wanted/new">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
              New post
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <CardGridSkeleton count={2} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No wanted posts yet"
            description="Post what you're looking for and let students with the material respond."
            actionLabel="Create a wanted post"
            onAction={() => navigate("/wanted/new")}
          />
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const daysLeft = daysUntil(p.expires_at)
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link to={`/wanted/${p.id}`} className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary">{p.title}</h2>
                      <span
                        className={
                          p.status === "active"
                            ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                            : "shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                        }
                      >
                        {wantedStatusLabel(p.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.status === "active"
                        ? daysLeft > 3
                          ? `Expires in ${daysLeft} days · ${formatDate(p.expires_at)}`
                          : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — renew soon!`
                        : p.status === "expired"
                          ? "Expired — renew to keep it active."
                          : "Fulfilled."}
                    </p>
                  </Link>
                  <div className="flex shrink-0 gap-2">
                    {(p.status === "expired" || p.status === "active") && (
                      <Button variant="outline" size="sm" onClick={() => renew(p)}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Renew
                      </Button>
                    )}
                    <ConfirmDialog
                      title="Delete this wanted post?"
                      description="This will remove your wanted post permanently."
                      confirmLabel="Delete"
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      onConfirm={() => remove(p)}
                    />
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
