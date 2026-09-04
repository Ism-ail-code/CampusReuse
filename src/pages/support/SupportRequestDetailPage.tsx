import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, MapPin, Clock, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/shared/Skeleton"
import { getCategory, conditionLabel } from "@/lib/constants"
import { formatRelativeTime } from "@/lib/utils"
import type { SupportRequest } from "@/lib/types"

export function SupportRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { service, session } = useApp()
  const [request, setRequest] = useState<SupportRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOfferDialog, setShowOfferDialog] = useState(false)
  const [offerMessage, setOfferMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      const r = await service.getSupportRequest(id)
      if (!mounted) return
      setRequest(r)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [service, id])

  const handleOfferHelp = async () => {
    if (!request || !offerMessage.trim()) return
    setSubmitting(true)
    const res = await service.offerHelp(request.id, offerMessage.trim())
    setSubmitting(false)
    if (res.id) {
      setShowOfferDialog(false)
      navigate(`/messages/${res.id}`)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState
          icon={Heart}
          title="Request not found"
          description="This support request may have been removed or expired."
          actionLabel="Browse support"
          onAction={() => navigate("/support")}
        />
      </div>
    )
  }

  const category = request.category_id ? getCategory(request.category_id) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Student Request"
        subtitle="Support request details"
        backTo="/support"
      />

      <div className="rounded-xl border bg-card p-6 shadow-subtle">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            Looking for help
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatRelativeTime(request.created_at)}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-bold text-foreground">{request.title}</h2>

        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {category && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {category.icon && <category.icon className="h-3.5 w-3.5" aria-hidden />}
              {category.name}
            </span>
          )}
          {request.education_level && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs">{request.education_level}</span>
          )}
          {request.location && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              <MapPin className="h-3 w-3" aria-hidden />
              {request.location}
            </span>
          )}
          {request.condition_pref && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize">
              {conditionLabel(request.condition_pref)}
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 border-t pt-4">
          {request.author ? (
            <>
              <UserAvatar name={request.author.display_name} src={request.author.avatar_url} className="h-10 w-10" />
              <div>
                <p className="text-sm font-medium text-foreground">{request.author.display_name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {request.author.institution?.name && (
                    <>
                      <Building2 className="h-3 w-3" aria-hidden />
                      {request.author.institution.name}
                    </>
                  )}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Student</p>
          )}
        </div>

        {session && session.user.id !== request.user_id && (
          <div className="mt-6 border-t pt-4">
            <Button onClick={() => setShowOfferDialog(true)} className="w-full">
              <Heart className="mr-2 h-4 w-4" aria-hidden />
              Offer Help
            </Button>
          </div>
        )}

        {!session && (
          <div className="mt-6 border-t pt-4">
            <Button onClick={() => navigate("/auth")} className="w-full" variant="outline">
              Sign in to offer help
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offer Help</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Let {request.author?.display_name ?? "the student"} know how you can help.
          </p>
          <Textarea
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            placeholder="Hi! I have the item you're looking for. Would you like to arrange a pickup?"
            rows={4}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowOfferDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleOfferHelp}
              disabled={!offerMessage.trim() || submitting}
              className="flex-1"
            >
              {submitting ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
