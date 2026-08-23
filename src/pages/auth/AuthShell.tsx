import { Link, useLocation, useSearchParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function getBackPath(pathname: string, next: string): string {
  if (pathname === "/login" || pathname === "/signup") return "/auth"
  if (pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/verify-email") return "/login"
  return next
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const [params] = useSearchParams()
  const location = useLocation()
  const next = params.get("next") || "/"
  const backPath = getBackPath(location.pathname, next)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex h-14 items-center justify-center border-b sm:h-16">
        <div className="absolute left-3 sm:left-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={backPath}>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back
            </Link>
          </Button>
        </div>
        <Logo />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:py-10">
        <div className="w-full max-w-md">
          <div className={cn("rounded-2xl border bg-card p-5 shadow-card sm:p-8")}>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-5 sm:mt-6">{children}</div>
          </div>
          {footer && <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  )
}
