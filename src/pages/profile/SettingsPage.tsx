import { useEffect, useRef, useState, type FormEvent } from "react"
import { Camera, Check, Loader2, ShieldAlert, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { InstitutionPicker } from "@/components/shared/InstitutionPicker"
import { Skeleton } from "@/components/shared/Skeleton"
import { EDUCATION_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Block, Institution } from "@/lib/types"

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"]

function usernamePatternOk(username: string): boolean {
  return /^[a-z0-9_]{3,30}$/.test(username)
}

export function SettingsPage() {
  const { service, profile, session, refreshProfile, isDemo } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [customLevel, setCustomLevel] = useState("")
  const [program, setProgram] = useState("")
  const [accountType, setAccountType] = useState<"student" | "teacher">("student")
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [savingPrivate, setSavingPrivate] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const [blocked, setBlocked] = useState<Block[]>([])
  const [blockedLoading, setBlockedLoading] = useState(true)
  const [blockedNames, setBlockedNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name)
    setUsername(profile.username)
    setBio(profile.bio ?? "")
    setEducationLevel(profile.education_level ?? "")
    setProgram(profile.program ?? "")
    setAccountType(profile.account_type)
    setInstitution(profile.institution ?? null)
    setAvatarUrl(profile.avatar_url)
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session?.user.id) return
    let mounted = true
    ;(async () => {
      const priv = await service.getPrivateDetails(session.user.id)
      if (!mounted) return
      setPhone(priv?.phone ?? "")
      setGender(priv?.gender ?? "")
      setAge(priv?.age != null ? String(priv.age) : "")
    })()
    return () => {
      mounted = false
    }
  }, [session?.user.id, service])

  useEffect(() => {
    if (!session?.user.id) return
    let mounted = true
    ;(async () => {
      setBlockedLoading(true)
      const rows = await service.getBlockedUsers()
      if (!mounted) return
      setBlocked(rows)
      const names: Record<string, string> = {}
      for (const b of rows) {
        const p = await service.getProfile(b.blocked_id)
        if (p) names[b.blocked_id] = p.display_name
      }
      if (mounted) setBlockedNames(names)
      setBlockedLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [session?.user.id, service])

  useEffect(() => {
    if (!usernamePatternOk(username) || username === profile?.username) {
      setUsernameState("idle")
      return
    }
    setUsernameState("checking")
    const t = setTimeout(async () => {
      const existing = await service.getProfileByUsername(username)
      setUsernameState(existing ? "taken" : "available")
    }, 400)
    return () => clearTimeout(t)
  }, [username, profile?.username, service])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error("Display name is required.")
      return
    }
    if (usernameState === "taken") {
      toast.error("That username is already taken.")
      return
    }
    setSavingProfile(true)
    const res = await service.updateProfile({
      display_name: displayName.trim(),
      username,
      bio: bio.trim() || null,
      education_level: educationLevel === "Other" ? customLevel.trim() || educationLevel : educationLevel || null,
      program: program.trim() || null,
      account_type: accountType,
      institution_id: institution?.id ?? null,
      avatar_url: avatarUrl,
    })
    setSavingProfile(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Profile updated.")
    refreshProfile()
  }

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB.")
      return
    }
    setUploadingAvatar(true)
    const res = await service.uploadAvatar(file)
    setUploadingAvatar(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setAvatarUrl(res.url ?? null)
    toast.success("Photo ready. Save your profile to keep it.")
  }

  const savePrivate = async (e: FormEvent) => {
    e.preventDefault()
    setSavingPrivate(true)
    const parsedAge = age.trim() === "" ? null : Number(age)
    const res = await service.updatePrivateDetails({
      phone: phone.trim() || null,
      gender: gender || null,
      age: parsedAge != null && !Number.isNaN(parsedAge) ? parsedAge : null,
    })
    setSavingPrivate(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Contact details saved. They are never shown publicly.")
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setChangingPassword(true)
    const res = await service.updatePassword(newPassword)
    setChangingPassword(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Password updated.")
    setNewPassword("")
    setConfirmPassword("")
  }

  const unblock = async (userId: string) => {
    const res = await service.unblockUser(userId)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setBlocked((prev) => prev.filter((b) => b.blocked_id !== userId))
    toast.success("User unblocked.")
  }

  if (!profile || !session?.user.id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, contact details, security and privacy."
        backTo={`/u/${profile.username}`}
      />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contact">Contact & privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="blocked">Blocked users ({blocked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <form onSubmit={saveProfile} className="rounded-2xl border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar name={profile.display_name} src={avatarUrl} className="h-16 w-16 text-lg" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
                  aria-label="Upload profile photo"
                >
                  {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" aria-hidden />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void uploadAvatar(e.target.files?.[0])}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Profile photo</p>
                <p>Optional. JPG or PNG under 5 MB.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    autoComplete="off"
                    className={cn(
                      "pr-9",
                      usernameState === "taken" && "border-destructive focus-visible:ring-destructive",
                      usernameState === "available" && "border-emerald-500 focus-visible:ring-emerald-500",
                    )}
                    required
                  />
                  {usernameState === "checking" && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  {usernameState === "available" && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />}
                  {usernameState === "taken" && <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />}
                </div>
                {usernameState === "taken" && <p className="text-xs text-destructive">This username is already taken.</p>}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short intro — what you study, what you're looking for…"
                rows={3}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                <Input id="program" value={program} onChange={(e) => setProgram(e.target.value)} placeholder={accountType === "student" ? "e.g. Pre-Engineering" : "e.g. English"} />
              </div>
            </div>

            {educationLevel === "Other" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="customLevel">Describe your level</Label>
                <Input id="customLevel" value={customLevel} onChange={(e) => setCustomLevel(e.target.value)} placeholder="e.g. BS Computer Science Year 2" />
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <InstitutionPicker value={institution} onChange={setInstitution} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountType">Account type</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as "student" | "teacher")}>
                  <SelectTrigger id="accountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={session.user.email} disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here in V1.</p>
              </div>
            </div>

            <Separator className="my-6" />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Your public profile URL is /u/{username || "…"}</p>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="contact" className="mt-5">
          <form onSubmit={savePrivate} className="rounded-2xl border bg-card p-5 sm:p-7">
            <h2 className="text-base font-semibold">Contact & private details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are never shown on your public profile. You can share them with a buyer or seller yourself if you'd like to continue on WhatsApp.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0300-1234567" inputMode="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-muted-foreground">(optional, private)</span></Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Prefer not to say" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age <span className="text-muted-foreground">(optional, private)</span></Label>
                <Input id="age" type="number" min={5} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 17" />
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPrivate}>
                {savingPrivate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save contact details
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <form onSubmit={changePassword} className="rounded-2xl border bg-card p-5 sm:p-7">
            <h2 className="text-base font-semibold">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use at least 8 characters with a mix of letters and numbers.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            {isDemo && (
              <p className="mt-3 text-xs text-muted-foreground">
                Demo mode: passwords are stored locally in your browser only.
              </p>
            )}
            <Separator className="my-6" />
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPassword}>
                {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="blocked" className="mt-5">
          <div className="rounded-2xl border bg-card p-5 sm:p-7">
            <h2 className="text-base font-semibold">Blocked users</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Blocked users can't message you, respond to your posts, or propose exchanges with you.
            </p>
            <div className="mt-5">
              {blockedLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : blocked.length === 0 ? (
                <EmptyState
                  icon={ShieldAlert}
                  title="No blocked users"
                  description="When you block someone from a profile, they appear here and you can unblock them anytime."
                />
              ) : (
                <ul className="divide-y rounded-lg border">
                  {blocked.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={blockedNames[b.blocked_id] ?? "User"} className="h-9 w-9" />
                        <div>
                          <p className="text-sm font-medium">{blockedNames[b.blocked_id] ?? "User"}</p>
                          <p className="text-xs text-muted-foreground">Blocked</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => void unblock(b.blocked_id)}>
                        Unblock
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
