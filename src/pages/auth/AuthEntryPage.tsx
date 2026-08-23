import { Link, useSearchParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/layout/Logo"

export function AuthEntryPage() {
  const [params] = useSearchParams()
  const next = params.get("next") || "/"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex h-16 items-center justify-center border-b">
        <div className="absolute left-4 sm:left-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back
            </Link>
          </Button>
        </div>
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to Campus Reuse
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Buy, sell, and exchange useful things with fellow students.
            </p>
            <div className="mt-6 space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to={`/login?next=${encodeURIComponent(next)}`}>
                  Log in
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to={`/signup?next=${encodeURIComponent(next)}`}>
                  Create an account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
