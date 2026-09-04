import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight, MessageSquare, SearchX } from "lucide-react"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Skeleton } from "@/components/shared/Skeleton"
import { cn, formatRelativeTime, truncate } from "@/lib/utils"
import type { Conversation } from "@/lib/types"
import { Button } from "@/components/ui/button"

export function ConversationList({ activeId, onSelect }: { activeId?: string; onSelect?: (id: string) => void }) {
  const { service } = useApp()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const res = await service.getConversations()
      setConversations(res)
    } catch {
      setError("We couldn't load your messages.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [service])

  useEffect(() => {
    const unsub = service.subscribeToConversations(() => load())
    return () => unsub()
  }, [service])

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          Try again
        </Button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <SearchX className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="text-xs text-muted-foreground">Message a seller from any listing to start chatting.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y">
      {conversations.map((c) => {
        const unread =
          c.last_read_at != null
            ? new Date(c.last_message_at).getTime() > new Date(c.last_read_at).getTime()
            : new Date(c.last_message_at).getTime() > new Date(c.updated_at).getTime()
        const inner = (
          <>
            <UserAvatar
              name={c.other_participant?.display_name ?? "User"}
              src={c.other_participant?.avatar_url}
              className={cn("h-10 w-10 shrink-0 md:h-11 md:w-11", unread && "ring-2 ring-primary/40")}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn("truncate text-sm", unread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                  {c.other_participant?.display_name ?? "User"}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(c.last_message_at)}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className={cn("truncate text-xs", unread ? "font-medium text-foreground/80" : "text-muted-foreground")}>
                  {c.listing ? (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                      {truncate(c.last_message_preview || "About your listing", 60)}
                    </span>
                  ) : c.wanted ? (
                    <span className="flex items-center gap-1">
                      <ArrowLeftRight className="h-3 w-3 shrink-0" aria-hidden />
                      {truncate(c.last_message_preview || "Wanted post conversation", 60)}
                    </span>
                  ) : c.wanted_id ? (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                      {truncate(c.last_message_preview || "Support request conversation", 60)}
                    </span>
                  ) : (
                    truncate(c.last_message_preview || "Start a conversation", 60)
                  )}
                </p>
              </div>
            </div>
          </>
        )

        const rowClass = cn(
          "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 md:gap-3 md:p-3",
          activeId === c.id && "bg-muted/70",
        )

        return onSelect ? (
          <li key={c.id}>
            <button type="button" onClick={() => onSelect(c.id)} className={rowClass}>
              {inner}
            </button>
          </li>
        ) : (
          <li key={c.id}>
            <Link to={`/messages/${c.id}`} className={rowClass}>
              {inner}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
