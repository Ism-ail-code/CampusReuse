import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/app/AppContext"
import { AuthShell } from "./AuthShell"
import { InstitutionPicker } from "@/components/shared/InstitutionPicker"
import { EDUCATION_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Institution } from "@/lib/types"

export function SignupPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get("next") || "/"
  const prefilledEmail = params.get("email") || ""

  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [email, setEmail] = useState(prefilledEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<"student" | "teacher">("student")
  const [educationLevel, setEducationLevel] = useState("")
  const [customLevel, setCustomLevel] = useState("")
  const [program, setProgram] = useState("")
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [institutionError, setInstitutionError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setUsernameState("idle")
      return
    }
    setUsernameState("checking")
    const t = setTimeout(async () => {
      const existing = await service.getProfileByUsername(username)
      setUsernameState(existing ? "taken" : "available")
    }, 400)
    return () => clearTimeout(t)
  }, [username, service])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!institution) {
      setInstitutionError("Please select your institution.")
      return
    }
    if (usernameState === "taken") {
      toast.error("That username is already taken.")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    const res = await service.signUp({
      displayName,
      username,
      email,
      password,
      accountType,
      educationLevel: educationLevel === "Other" ? customLevel : educationLevel,
      program: program || undefined,
      institutionId: institution.id,
    })
    setLoading(false)
    if (res.error) {
      const msg = res.error.toLowerCase()
      if (msg.includes("already") && msg.includes("email")) {
        toast.error("An account with this email already exists. Log in instead.")
      } else if (msg.includes("already") && msg.includes("username")) {
        toast.error("This username is already taken. Please choose another.")
      } else {
        toast.error(res.error)
      }
      return
    }
    if (res.needsEmailConfirmation) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`)
      return
    }
    toast.success("Your account is ready!")
    navigate(next)
  }

  return (
    <AuthShell
      title="Create your CampusReuse account"
      subtitle="Just a few details to get you started."
      footer={
        <>
          Already have an account?{" "}
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Tabs value={accountType} onValueChange={(v) => setAccountType(v as "student" | "teacher")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">I'm a student</TabsTrigger>
            <TabsTrigger value="teacher">I'm a teacher</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="displayName">Full name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
              placeholder="e.g. ayesha_khan"
              autoComplete="off"
              className={cn(
                "pr-9",
                usernameState === "taken" && "border-destructive focus-visible:ring-destructive",
                usernameState === "available" && "border-emerald-500 focus-visible:ring-emerald-500",
              )}
              required
            />
            {usernameState === "checking" && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {usernameState === "available" && (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            )}
            {usernameState === "taken" && (
              <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">This is the name other users will see. 3–30 characters: lowercase letters, numbers, underscores.</p>
          {usernameState === "taken" && (
            <p className="text-xs text-destructive">This username is already taken.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10"
                required
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institution</Label>
          <InstitutionPicker
            value={institution}
            onChange={(i) => { setInstitution(i); setInstitutionError("") }}
            error={institutionError}
          />
          <p className="text-xs text-muted-foreground">Helps people find relevant listings.</p>
          {institutionError && <p className="text-xs text-destructive">{institutionError}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="educationLevel">Education level</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger id="educationLevel">
                <SelectValue placeholder={accountType === "teacher" ? "Teaching level" : "e.g. Grade 11"} />
              </SelectTrigger>
              <SelectContent>
                {accountType === "teacher"
                  ? ["Teaching Staff", "College Faculty", "University Faculty", "Other"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)
                  : EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">
              {accountType === "student" ? "Program / class details" : "Subject / department"} <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder={accountType === "student" ? "e.g. Pre-Engineering" : "e.g. English"}
            />
          </div>
        </div>

        {educationLevel === "Other" && (
          <div className="space-y-2">
            <Label htmlFor="customLevel">Describe your level</Label>
            <Input
              id="customLevel"
              value={customLevel}
              onChange={(e) => setCustomLevel(e.target.value)}
              placeholder="e.g. BS Computer Science Year 2"
            />
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By joining, you agree to use CampusReuse for academic materials and to follow our community guidelines.
        </p>
      </form>
    </AuthShell>
  )
}
