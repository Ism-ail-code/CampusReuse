import { BadgeCheck, MailCheck, ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { UserProfile } from "@/lib/types"

export function VerificationBadges({ profile }: { profile: UserProfile | null | undefined }) {
  if (!profile) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      {profile.email_verified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <MailCheck className="h-3.5 w-3.5" aria-hidden />
              <span>Email verified</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>This account's email address has been verified.</TooltipContent>
        </Tooltip>
      )}
      {profile.institution_verified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              <span>Institution verified</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>This account is associated with a recognised institution.</TooltipContent>
        </Tooltip>
      )}
      {profile.role === "admin" && (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Staff
        </span>
      )}
    </span>
  )
}
