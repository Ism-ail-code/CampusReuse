import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2", className)} aria-label="CampusReuse home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BookOpen className="h-4.5 w-4.5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Campus<span className="text-primary">Reuse</span>
      </span>
    </Link>
  )
}
