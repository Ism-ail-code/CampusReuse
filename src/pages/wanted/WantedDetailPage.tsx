import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CalendarClock, Loader2, Send, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { VerificationBadges } from "@/components/shared/VerificationBadges"
import { ReportDialog } from "@/components/shared/ReportDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { WantedPostCard } from "@/components/wanted/WantedPostCard"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { getCategory, conditionLabel, wantedStatusLabel } from "@/lib/constants"
import { daysUntil, formatDate } from "@/lib/utils"
import type { WantedPost } from "@/lib/types"

export function WantedDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { service, session, requireAuth } = useApp()
  const navigate = useNavigate()
  const [post, setPost] = useState<WantedPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<WantedPost[]>([])
  const [respondOpen, setRespondOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const w = await service.getWanted(id!)
      if (!mounted) return
      setPost(w)
      if (w) {
        const rel = await service.listWanted({ category_id: w.category_id, status: ["active"] })
        if (mounted) setRelated(rel.filter((r) => r.id !== w.id).slice(0, 3))
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [id, service])

  const isMine = post?.user_id === session?.user.id
  const daysLeft = post ? daysUntil(post.expires_at) : 0

  const submitResponse = async (e: FormEvent) => {
    e.preventDefault()
    if (!post) return
    if (!session?.user.id) {
      setRespondOpen(false)
      requireAuth()
      return
    }
    setSending(true)
    const res = await service.respondToWanted(post.id, message)
    setSending(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setRespondOpen(false)
    setMessage("")
    toast.success("Response sent! You can continue the conversation.")
    navigate(`/messages/${res.id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <CardGridSkeleton count={1} />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Wanted post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed or expired.</p>
        <Button asChild className="mt-6">
          <Link to="/wanted">Browse wanted posts</Link>
        </Button>
      </div>
    )
  }

  const category = getCategory(post.category_id)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6 md:pb-8">
      <PageHeader title="Wanted post" backTo="/wanted" />

      <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              post.status === "active"
                ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
                : "rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500"
            }
          >
            {wantedStatusLabel(post.status)}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
            {category?.name}
          </span>
          {post.status === "active" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              {daysLeft > 3 ? `Expires in ${daysLeft} days` : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{post.title}</h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {post.education_level && (
            <span>
              Level: <span className="font-medium text-foreground">{post.education_level}</span>
            </span>
          )}
          {post.subject && (
            <span>
              Subject: <span className="font-medium text-foreground">{post.subject}</span>
            </span>
          )}
          {post.condition_pref && (
            <span>
              Condition: <span className="font-medium text-foreground">{conditionLabel(post.condition_pref)}</span>
            </span>
          )}
          {post.budget != null && (
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4" aria-hidden />
              Budget: <span className="font-medium text-foreground">Rs. {post.budget}</span>
            </span>
          )}
        </div>

        <Separator className="my-5" />

        <div>
          <h2 className="text-sm font-semibold text-foreground">Details</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {post.description || "No additional details provided."}
          </p>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to={`/u/${post.author?.username}`} className="flex items-center gap-3">
            <UserAvatar name={post.author?.display_name ?? "?"} src={post.author?.avatar_url} className="h-11 w-11" />
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author?.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {post.author?.institution?.name ?? "Campus"}
              </p>
            </div>
          </Link>
          <VerificationBadges profile={post.author} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!isMine && (
            <Button size="lg" onClick={() => setRespondOpen(true)} disabled={post.status !== "active"} className="hidden md:inline-flex">
              <Send className="mr-2 h-4 w-4" aria-hidden />
              Respond
            </Button>
          )}
          {post.status === "active" && (
            <span className="text-xs text-muted-foreground">
              Posted {formatDate(post.created_at)}
            </span>
          )}
          {isMine && post.status === "active" && (
            <span className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setBusy(true)
                  const res = await service.markWantedFulfilled(post.id)
                  setBusy(false)
                  if (res.error) toast.error(res.error)
                  else {
                    toast.success("Marked as fulfilled.")
                    const updated = await service.getWanted(post.id)
                    if (updated) setPost(updated)
                  }
                }}
                disabled={busy}
              >
                Mark fulfilled
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/my-wanted">Manage</Link>
              </Button>
            </span>
          )}
          {!isMine && (
            <span className="ml-auto">
              <ReportDialog targetType="wanted" targetId={post.id} />
            </span>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground">More wanted posts</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {related.map((w) => (
              <WantedPostCard key={w.id} post={w} compact />
            ))}
          </div>
        </div>
      )}

      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to this wanted post</DialogTitle>
            <DialogDescription>
              Your response opens a conversation with {post.author?.display_name}. Introduce yourself and
              describe what you have.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitResponse} className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`e.g. Hi! I have a ${post.subject ?? "matching"} textbook in good condition.`}
              rows={4}
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRespondOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send response
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile sticky Respond bar */}
      {!isMine && (
        <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <div className="mx-auto max-w-md">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setRespondOpen(true)}
              disabled={post.status !== "active"}
            >
              <Send className="mr-2 h-4 w-4" aria-hidden />
              {post.status === "active" ? "Respond" : "Request closed"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
