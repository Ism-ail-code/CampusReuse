import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/app/AppContext"
import { AuthShell } from "./AuthShell"

export function LoginPage() {
  const { service, isDemo } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const next = params.get("next") || "/"

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await service.signIn(email, password)
    setLoading(false)
    if (res.error) {
      const msg = res.error.toLowerCase()
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password") || msg.includes("user not found")) {
        toast.error("The email or password doesn't match an existing account.")
      } else if (msg.includes("email not confirmed") || msg.includes("email not verified")) {
        toast.error("Please verify your email first. Check your inbox for the verification link.")
      } else {
        toast.error(res.error)
      }
      return
    }
    toast.success("Welcome back!")
    navigate(next)
  }

  const fillDemo = () => {
    setEmail("demo@campusreuse.app")
    setPassword("DemoPass123!")
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your CampusReuse account."
      footer={
        <>
          New to CampusReuse?{" "}
          <Link to={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Logging in..." : "Log in"}
        </Button>

        {isDemo && (
          <Button type="button" variant="outline" className="w-full gap-2" onClick={fillDemo}>
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Use demo account (Ayesha)
          </Button>
        )}
      </form>
    </AuthShell>
  )
}
