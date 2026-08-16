import { useCallback, useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { cn } from "@/lib/utils"

export function SaveButton({ listingId, className }: { listingId: string; className?: string }) {
  const { service, session, requireAuth } = useApp()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    let mounted = true
    service.isFavorite(listingId).then((v) => {
      if (mounted) setSaved(v)
    })
    return () => {
      mounted = false
    }
  }, [listingId, session?.user.id, service])

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!session?.user.id) {
        requireAuth()
        return
      }
      if (saved) {
        await service.removeFavorite(listingId)
        setSaved(false)
      } else {
        await service.addFavorite(listingId)
        setSaved(true)
      }
    },
    [saved, session?.user.id, service, listingId, requireAuth],
  )

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={saved ? "Remove from saved" : "Save listing"}
      aria-pressed={saved}
      onClick={toggle}
      className={cn("h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur", className)}
    >
      <Heart className={cn("h-4 w-4", saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
    </Button>
  )
}
