import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, Loader2, MailCheck, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { AuthShell } from "./AuthShell"

const RESEND_COOLDOWN = 60

export function VerifyEmailPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get("email") || ""
  const next = params.get("next") || "/"
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    let mounted = true
    const markVerified = () => {
      if (mounted) setVerified(true)
    }
    service.getSession().then((s) => {
      if (s) markVerified()
    })
    const unsub = service.onAuthStateChange((s) => {
      if (s) markVerified()
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [service])

  const resend = async () => {
    if (cooldown > 0 || sending || verified) return
    setSending(true)
    setError(null)
    setRateLimited(false)
    const res = await service.resendVerificationEmail(email)
    setSending(false)
    if (res.error) {
      setError(res.error)
      setRateLimited(Boolean(res.rateLimited))
      if (res.rateLimited) setCooldown(RESEND_COOLDOWN)
      return
    }
    toast.success("Verification email sent.")
    setCooldown(RESEND_COOLDOWN)
  }

  if (verified) {
    return (
      <AuthShell
        title="Email verified"
        subtitle="Your account is active. Welcome to CampusReuse!"
        footer={
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">You can now continue where you left off.</p>
          <Button className="mt-2" onClick={() => navigate(next)}>
            Continue
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle="We've sent a verification link to:"
      footer={
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" aria-hidden />
        </div>

        {email ? (
          <a
            href={`mailto:${email}`}
            className="break-all text-sm font-semibold text-foreground underline decoration-muted-foreground/40 underline-offset-4"
          >
            {email}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">your email</p>
        )}

        <div className="w-full space-y-3 rounded-xl border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Didn't receive it?</p>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
              {!rateLimited && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setRateLimited(false)
                  }}
                  className="ml-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden />
                  Try again
                </button>
              )}
            </div>
          )}

          {cooldown > 0 && !sending ? (
            <p className="text-xs tabular-nums text-muted-foreground">
              Resend available in {cooldown}s
            </p>
          ) : (
            <Button onClick={() => void resend()} disabled={sending || cooldown > 0} className="w-full">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {sending ? "Sending…" : "Resend verification email"}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Check your spam or junk folder — it sometimes ends up there.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Wrong address?{" "}
          <Link
            to={`/signup?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`}
            className="font-medium text-primary hover:underline"
          >
            Change email
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
