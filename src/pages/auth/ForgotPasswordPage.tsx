import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/app/AppContext"
import { AuthShell } from "./AuthShell"

export function ForgotPasswordPage() {
  const { service } = useApp()
  const [params] = useSearchParams()
  const next = params.get("next") || "/"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await service.resetPassword(email)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists for that address, we've sent you a link to reset your password."
        footer={<Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">Back to sign in</Link>}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <MailCheck className="h-6 w-6 text-emerald-600" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">Follow the link in the email to choose a new password.</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  )
}
