import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeftRight,
  Bell,
  BellOff,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Tag,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Skeleton } from "@/components/shared/Skeleton"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { Notification } from "@/lib/types"

const TYPE_ICONS: Record<string, LucideIcon> = {
  message: MessageSquare,
  exchange_proposal: ArrowLeftRight,
  exchange_accepted: CheckCircle2,
  exchange_declined: XCircle,
  wanted_response: Send,
  listing_expiring_soon: CalendarClock,
  listing_expired: Clock,
  wanted_expiring_soon: CalendarClock,
  wanted_expired: Clock,
  listing_sold: Tag,
  listing_given_away: Gift,
  system: Bell,
}

export function NotificationsPage() {
  const { service, refreshUnread } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await service.getNotifications()
    setNotifications(res)
    setLoading(false)
  }, [service])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const unsub = service.subscribeToNotifications(() => load())
    return () => unsub()
  }, [service, load])

  const open = async (n: Notification) => {
    if (!n.is_read) {
      await service.markNotificationRead(n.id)
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
      refreshUnread()
    }
    if (n.link) window.location.assign(n.link)
  }

  const markAll = async () => {
    setMarkingAll(true)
    await service.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
    refreshUnread()
  }

  const visible = filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Notifications"
        subtitle="Messages, exchange updates, expiration reminders and community events."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAll} disabled={markingAll}>
              {markingAll ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden />}
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <div className="mt-5 flex gap-2 text-sm">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-medium transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
            description={
              filter === "unread"
                ? "No unread notifications right now."
                : "You'll be notified about messages, exchanges and listing activity here."
            }
          />
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {visible.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell
              return (
                <li key={n.id}>
                  <Link
                    to={n.link || "#"}
                    onClick={() => void open(n)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60",
                      !n.is_read && "bg-primary/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        !n.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("flex items-center justify-between gap-2 text-sm", !n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                        {n.title}
                        {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground/70">{formatRelativeTime(n.created_at)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Mail className="h-3.5 w-3.5" aria-hidden />
        Expiration reminders are sent a few days before your listings and wanted posts expire.
      </p>
    </div>
  )
}
