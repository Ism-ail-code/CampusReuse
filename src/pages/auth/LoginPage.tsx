import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Loader2, Sparkles } from "lucide-react"
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
  const [loading, setLoading] = useState(false)
  const next = params.get("next") || "/"

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await service.signIn(email, password)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
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
      subtitle="Sign in to buy, sell, and exchange academic materials."
      footer={
        <>
          New to CampusReuse?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create a free account
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
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
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
