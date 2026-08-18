import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { BookOpen, CalendarDays, GraduationCap, MapPin, Pencil, ShieldAlert, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { VerificationBadges } from "@/components/shared/VerificationBadges"
import { ListingCard } from "@/components/shared/ListingCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { ReportDialog } from "@/components/shared/ReportDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { formatDate } from "@/lib/utils"
import type { Listing, UserProfile } from "@/lib/types"

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { service, session } = useApp()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)

  const load = useCallback(async () => {
    if (!username) return
    setLoading(true)
    const p = await service.getProfileByUsername(username)
    setProfile(p)
    if (p) {
      const all = await service.listListings({ only_active: true })
      setListings(all.filter((l) => l.seller_id === p.id).slice(0, 12))
      setBlocked(await service.isBlocked(p.id))
    }
    setLoading(false)
  }, [username, service])

  useEffect(() => {
    load()
  }, [load])

  const isMine = profile?.id === session?.user.id

  const toggleBlock = async (unblock: boolean) => {
    if (!profile) return
    const res = unblock ? await service.unblockUser(profile.id) : await service.blockUser(profile.id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setBlocked(!unblock)
    toast.success(unblock ? "User unblocked." : "User blocked. They can no longer message you.")
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <CardGridSkeleton count={3} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Profile not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">No user exists with this username.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <UserAvatar name={profile.display_name} src={profile.avatar_url} className="h-20 w-20 text-2xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
                <Badge variant="outline" className="capitalize">
                  {profile.account_type}
                </Badge>
                {profile.role === "admin" && (
                  <Badge variant="outline" className="border-transparent bg-slate-100 font-medium text-slate-600">
                    Staff
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">@{profile.username}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {profile.institution && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {profile.institution.name}
                    {profile.institution.city ? ` · ${profile.institution.city}` : ""}
                  </span>
                )}
                {profile.education_level && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
                    {profile.education_level}
                  </span>
                )}
                {profile.program && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                    {profile.program}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>
              <div className="mt-3">
                <VerificationBadges profile={profile} />
              </div>
              {profile.bio && <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{profile.bio}</p>}
            </div>
          </div>

          {isMine ? (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/settings">
                <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                Edit profile
              </Link>
            </Button>
          ) : (
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <ReportDialog targetType="user" targetId={profile.id} />
                {blocked ? (
                  <Button variant="outline" size="sm" onClick={() => void toggleBlock(true)}>
                    Unblock
                  </Button>
                ) : (
                  <ConfirmDialog
                    title="Block this user?"
                    description="They will no longer be able to message you or respond to your posts. You can unblock them later from Settings."
                    confirmLabel="Block user"
                    trigger={
                      <Button variant="ghost" size="sm">
                        <ShieldAlert className="mr-1.5 h-4 w-4" aria-hidden />
                        Block
                      </Button>
                    }
                    onConfirm={() => toggleBlock(false)}
                  />
                )}
              </div>
              <p className="flex max-w-xs items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Arrange meetings in public or school-approved places, and consider involving a trusted adult.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Active listings</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isMine ? "Items you currently have listed." : `Items ${profile.display_name} currently has listed.`}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to="/browse">Browse all</Link>
          </Button>
        </div>
        {listings.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title={isMine ? "You have no active listings" : "No active listings"}
            description={
              isMine
                ? "List an academic material you no longer need and it will show up here."
                : "This member doesn't have any active listings right now."
            }
            actionLabel={isMine ? "List an item" : undefined}
            onAction={isMine ? () => navigate("/listings/new") : undefined}
          />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
