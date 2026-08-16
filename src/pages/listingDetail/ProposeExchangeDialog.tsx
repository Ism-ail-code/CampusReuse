import { useEffect, useMemo, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Listing } from "@/lib/types"

export function ProposeExchangeDialog({ listing }: { listing: Listing }) {
  const { service, session, requireAuth } = useApp()
  const [open, setOpen] = useState(false)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [offerId, setOfferId] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !session?.user.id) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await service.getMyListings()
      if (!mounted) return
      setMyListings(res.filter((l) => l.id !== listing.id && l.status === "available"))
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [open, session?.user.id, service, listing.id])

  const availableCount = useMemo(() => myListings.length, [myListings])

  const openDialog = () => {
    if (!session?.user.id) {
      requireAuth()
      return
    }
    setOpen(true)
  }

  const submit = async () => {
    if (!offerId) {
      toast.error("Please choose one of your listings to offer.")
      return
    }
    setSubmitting(true)
    const res = await service.proposeExchange(listing.id, offerId, message || undefined)
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Exchange proposal sent!")
    setOpen(false)
    setOfferId("")
    setMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={openDialog} size="lg" variant="secondary" className="w-full sm:w-auto">
        <Send className="mr-2 h-4 w-4" aria-hidden />
        Propose exchange
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose an exchange</DialogTitle>
          <DialogDescription>
            Offer one of your active listings in return for "{listing.title}".
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : availableCount === 0 ? (
          <div className="py-2">
            <EmptyState
              title="You need an active listing to exchange"
              description="List something first, then come back to propose this exchange."
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setOpen(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer">Your listing to offer</Label>
              <Select value={offerId} onValueChange={setOfferId}>
                <SelectTrigger id="offer">
                  <SelectValue placeholder="Choose a listing" />
                </SelectTrigger>
                <SelectContent>
                  {myListings.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only your active listings are shown. You can cancel your proposal later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Hi! I'd love to swap for your Chemistry set."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Sending…" : "Send proposal"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
