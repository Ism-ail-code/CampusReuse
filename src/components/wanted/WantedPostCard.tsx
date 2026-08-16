import { Link } from "react-router-dom"
import { Clock, MessagesSquare, Wallet } from "lucide-react"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { getCategory, wantedStatusLabel } from "@/lib/constants"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import type { WantedPost } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-sky-100 text-sky-700",
  expired: "bg-slate-200 text-slate-500",
}

export function WantedPostCard({ post, compact = false }: { post: WantedPost; compact?: boolean }) {
  const category = getCategory(post.category_id)
  const isActive = post.status === "active"

  if (compact) {
    return (
      <Link
        to={`/wanted/${post.id}`}
        className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-card"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {category && <category.icon className="h-5 w-5" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground">{post.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {post.author?.display_name}
            {post.budget != null ? ` · up to ${formatCurrency(post.budget)}` : ""}
          </p>
        </div>
        <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    )
  }

  return (
    <Link
      to={`/wanted/${post.id}`}
      className="group flex flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusStyles[post.status])}>
          {wantedStatusLabel(post.status)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {isActive ? "Open" : "Closed"}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
        {post.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{post.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-md bg-muted px-2 py-0.5 capitalize">{category?.name}</span>
        {post.author?.institution?.name && (
          <span className="line-clamp-1 rounded-md bg-muted px-2 py-0.5">{post.author.institution.name}</span>
        )}
        {post.education_level && <span className="rounded-md bg-muted px-2 py-0.5">{post.education_level}</span>}
        {post.budget != null && (
          <span className="flex items-center gap-0.5 rounded-md bg-muted px-2 py-0.5">
            <Wallet className="h-3 w-3" aria-hidden />
            {formatCurrency(post.budget)}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        {post.author ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <UserAvatar name={post.author.display_name} src={post.author.avatar_url} className="h-5 w-5" />
            <span className="line-clamp-1">{post.author.display_name}</span>
          </span>
        ) : (
          <span>—</span>
        )}
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>
    </Link>
  )
}
