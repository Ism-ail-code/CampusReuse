import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Building2,
  CheckCircle2,
  Flag,
  PackageOpen,
  Search,
  SearchX,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/app/AppContext"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/shared/Skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import type { Report, UserProfile } from "@/lib/types"

type Stats = {
  listings: number
  users: number
  openReports: number
  pendingInstitutionRequests: number
  wantedPosts: number
}

type InstitutionRequestRow = {
  id: string
  name: string
  type: string
  city: string
  status: string
  user: UserProfile
}

const REPORT_STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  reviewed: "bg-sky-100 text-sky-700",
  dismissed: "bg-slate-200 text-slate-600",
  action_taken: "bg-red-100 text-red-700",
}

function reportStatusLabel(status: string): string {
  if (status === "action_taken") return "Action taken"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function AdminPage() {
  const { service } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [requests, setRequests] = useState<InstitutionRequestRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [s, r, i] = await Promise.all([service.getAdminStats(), service.getReports(), service.getInstitutionRequests()])
    setStats(s)
    setReports(r)
    setRequests(i)
    setLoading(false)
  }, [service])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const setReportStatus = async (id: string, status: Report["status"], label: string) => {
    const res = await service.updateReport(id, status)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`Report ${label.toLowerCase()}.`)
    loadAll()
  }

  const reviewRequest = async (id: string, status: "approved" | "rejected" | "duplicate", label: string) => {
    const res = await service.reviewInstitutionRequest(id, status)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`Request ${label.toLowerCase()}.`)
    loadAll()
  }

  const removeListing = async (id: string) => {
    const res = await service.adminRemoveListing(id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Listing removed.")
    loadAll()
  }

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const statCards: { label: string; value: number; icon: typeof Users }[] = [
    { label: "Active listings", value: stats.listings, icon: PackageOpen },
    { label: "Users", value: stats.users, icon: Users },
    { label: "Open reports", value: stats.openReports, icon: Flag },
    { label: "Institution requests", value: stats.pendingInstitutionRequests, icon: Building2 },
    { label: "Active wanted posts", value: stats.wantedPosts, icon: Search },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">Moderate reports, institution requests and users.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <s.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="reports" className="mt-8">
        <TabsList>
          <TabsTrigger value="reports">Reports ({stats.openReports} open)</TabsTrigger>
          <TabsTrigger value="institutions">Institution requests ({stats.pendingInstitutionRequests} pending)</TabsTrigger>
          <TabsTrigger value="users">Users ({stats.users})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-5">
          {reports.length === 0 ? (
            <EmptyState icon={Flag} title="No reports" description="When users report listings, users or messages, they appear here." />
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="rounded-xl border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={REPORT_STATUS_STYLES[r.status]}>
                      {reportStatusLabel(r.status)}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {r.target_type} report
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{formatRelativeTime(r.created_at)}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{r.reason}</p>
                  {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {r.target_type === "listing" && (
                      <>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/listings/${r.target_id}`}>View listing</Link>
                        </Button>
                        <ConfirmDialog
                          title="Remove this listing?"
                          description="This permanently removes the reported listing and its photos."
                          confirmLabel="Remove listing"
                          trigger={
                            <Button variant="outline" size="sm">
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                              Remove listing
                            </Button>
                          }
                          onConfirm={() => removeListing(r.target_id)}
                        />
                      </>
                    )}
                    {r.target_type === "user" && (
                      <span className="text-xs text-muted-foreground">Target: user profile</span>
                    )}
                    <span className="flex-1" />
                    {r.status === "open" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => void setReportStatus(r.id, "dismissed", "Dismissed")}>
                          <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Dismiss
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void setReportStatus(r.id, "reviewed", "Reviewed")}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Mark reviewed
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void setReportStatus(r.id, "action_taken", "Action taken")}>
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Action taken
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="institutions" className="mt-5">
          {requests.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No institution requests"
              description="When a student can't find their school or college, they request it here."
            />
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="rounded-xl border bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <Badge variant="outline" className="capitalize">{r.type}</Badge>
                    {r.city && <Badge variant="outline">{r.city}</Badge>}
                    <Badge
                      variant="outline"
                      className={
                        r.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : r.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "duplicate"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-red-100 text-red-700"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <UserAvatar name={r.user.display_name} src={r.user.avatar_url} className="h-6 w-6" />
                    Requested by {r.user.display_name} (@{r.user.username})
                  </div>
                  {r.status === "pending" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => void reviewRequest(r.id, "approved", "Approved")}>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void reviewRequest(r.id, "duplicate", "Marked duplicate")}>
                        Mark duplicate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void reviewRequest(r.id, "rejected", "Rejected")}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Reject
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UsersTab onDeleted={loadAll} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UsersTab({ onDeleted }: { onDeleted: () => void }) {
  const { service } = useApp()
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const t = setTimeout(async () => {
      setLoading(true)
      const res = await service.searchUsers(query)
      if (!mounted) return
      setUsers(res)
      setLoading(false)
    }, 250)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [query, service])

  const remove = async (u: UserProfile) => {
    const res = await service.adminDeleteUserProfile(u.id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`Deleted ${u.display_name}.`)
    onDeleted()
    setUsers((prev) => prev.filter((x) => x.id !== u.id))
  }

  return (
    <div className="mt-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username…"
          className="pl-9"
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={SearchX} title="No users found" description="Try a different name or username." />
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <UserAvatar name={u.display_name} src={u.avatar_url} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {u.display_name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">@{u.username}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.institution?.name ?? "No institution"}
                    {u.education_level ? ` · ${u.education_level}` : ""} · Joined {formatDate(u.created_at)}
                  </p>
                </div>
                {u.role === "admin" ? (
                  <Badge variant="outline" className="border-transparent bg-slate-100 font-medium text-slate-600">
                    Staff
                  </Badge>
                ) : (
                  <ConfirmDialog
                    title="Delete this user?"
                    description={`This permanently removes ${u.display_name}'s profile and access to the platform. This cannot be undone.`}
                    confirmLabel="Delete user"
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${u.display_name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    onConfirm={() => remove(u)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
