import { Logo } from "@/components/layout/Logo"
import { cn } from "@/lib/utils"

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-16 items-center justify-center border-b sm:justify-start sm:px-6">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className={cn("rounded-2xl border bg-card p-6 shadow-card sm:p-8")}>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  )
}
