import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowLeftRight, MessageSquare, Send } from "lucide-react"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Skeleton } from "@/components/shared/Skeleton"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { Conversation, Message } from "@/lib/types"

export function ConversationThread({ conversationId, onBack }: { conversationId: string; onBack?: () => void }) {
  const { service, session } = useApp()
  const meId = session?.user.id
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [notFound, setNotFound] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    const conv = await service.getConversation(conversationId)
    if (!conv) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setConversation(conv)
    const msgs = await service.getMessages(conversationId)
    setMessages(msgs)
    setLoading(false)
    scrollToBottom()
  }

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setMessages([])
    setConversation(null)
    load()
  }, [conversationId, service])

  useEffect(() => {
    const unsub = service.subscribeToMessages(conversationId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    })
    return () => unsub()
  }, [conversationId, service])

  useEffect(() => {
    if (messages.length > 0 && meId) {
      const unreadCount = messages.filter((m) => m.sender_id !== meId).length
      if (unreadCount > 0) void service.markConversationRead(conversationId)
    }
  }, [messages, meId, service, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }))
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    const res = await service.sendMessage(conversationId, body)
    if (res.error) {
      // surface error quietly for now
    } else {
      setDraft("")
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex", i % 2 ? "justify-start" : "justify-end")}>
              <Skeleton className={cn("h-9 w-2/3 max-w-xs rounded-2xl")} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium">Conversation not found</p>
        <Link to="/messages" className="text-sm font-medium text-primary hover:underline">
          Back to messages
        </Link>
      </div>
    )
  }

  const other = conversation.other_participant
  const contextLabel = conversation.listing
    ? conversation.listing.title
    : conversation.wanted
      ? `Wanted: ${conversation.wanted.title}`
      : "General chat"

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-card px-3 py-2.5">
        {onBack && (
          <button type="button" onClick={onBack} className="rounded-md p-1.5 hover:bg-muted md:hidden" aria-label="Back">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        <Link to={other ? `/u/${other.username}` : "#"} className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar name={other?.display_name ?? "User"} src={other?.avatar_url} className="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{other?.display_name ?? "User"}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              {conversation.listing ? (
                <>
                  <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                  {contextLabel}
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-3 w-3 shrink-0" aria-hidden />
                  {contextLabel}
                </>
              )}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-medium">Say hello</p>
            <p className="text-xs text-muted-foreground">Introduce yourself and ask about the item.</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn("mt-1 text-right text-[10px]", mine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {formatRelativeTime(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t bg-card p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={1}
          placeholder="Write a message…"
          className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </div>
  )
}
