import { useState } from "react"
import { Flag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { REPORT_REASONS } from "@/lib/constants"
import type { ReportTargetType } from "@/lib/types"

interface Props {
  targetType: ReportTargetType
  targetId: string
  variant?: "ghost" | "outline" | "link"
  size?: "default" | "sm" | "icon"
  label?: string
  triggerClassName?: string
}

export function ReportDialog({ targetType, targetId, variant = "ghost", size = "sm", label, triggerClassName }: Props) {
  const { service, session, requireAuth } = useApp()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!reason) {
      toast.error("Please choose a reason.")
      return
    }
    if (!session?.user.id) {
      setOpen(false)
      requireAuth()
      return
    }
    setSubmitting(true)
    const res = await service.report(targetType, targetId, reason, details || undefined)
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Report submitted. Our team will review it.")
    setOpen(false)
    setReason("")
    setDetails("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={triggerClassName}>
          <Flag className="h-3.5 w-3.5" aria-hidden />
          {label ?? "Report"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {targetType === "listing" ? "this listing" : targetType === "user" ? "this user" : targetType === "message" ? "this message" : "this post"}</DialogTitle>
          <DialogDescription>
            Reports are reviewed by our moderation team. You can report anything that breaks our community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any helpful details…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
