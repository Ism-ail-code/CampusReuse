import { useState } from "react"
import { Ban } from "lucide-react"
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
import { useApp } from "@/app/AppContext"

export function BlockButton({ userId, name }: { userId: string; name: string }) {
  const { service, session, requireAuth } = useApp()
  const [open, setOpen] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(false)

  const block = async () => {
    if (!session?.user.id) {
      setOpen(false)
      requireAuth()
      return
    }
    setLoading(true)
    const res = await service.blockUser(userId)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setBlocked(true)
    setOpen(false)
    toast.success(`${name} has been blocked. You will no longer receive messages from them.`)
  }

  const unblock = async () => {
    const res = await service.unblockUser(userId)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setBlocked(false)
    toast.success(`${name} has been unblocked.`)
  }

  if (blocked) {
    return (
      <Button variant="outline" size="sm" onClick={unblock}>
        Unblock
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Ban className="h-3.5 w-3.5" aria-hidden />
          Block
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Block {name}?</DialogTitle>
          <DialogDescription>
            Blocking hides their messages and prevents them from contacting you. You can unblock them at any time from your settings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={block} disabled={loading}>
            {loading ? "Blocking…" : "Block user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
