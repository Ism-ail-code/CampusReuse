import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  subtitle,
  backTo,
  onBack,
  action,
  className,
}: {
  title: string
  subtitle?: string
  backTo?: string
  onBack?: () => void
  action?: React.ReactNode
  className?: string
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <div className={cn("mb-5", className)}>
      <div className="sticky top-16 z-30 -mx-4 flex items-center gap-1 border-b bg-background/95 px-4 py-2 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:-ml-2 sm:h-9 sm:w-9"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-foreground sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">{subtitle}</p>}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
    </div>
  )
}