import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LISTING_STATUSES, WANTED_STATUSES, transactionLabel } from "@/lib/constants"
import type { ListingStatus, ProposalStatus, TransactionType, WantedStatus } from "@/lib/types"

export function StatusBadge({ status }: { status: ListingStatus | WantedStatus }) {
  const source = (["available", "reserved", "sold", "donated", "expired"] as ListingStatus[]).includes(
    status as ListingStatus,
  )
    ? LISTING_STATUSES.find((s) => s.value === (status as ListingStatus))
    : WANTED_STATUSES.find((s) => s.value === (status as WantedStatus))
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", source?.className)}>
      {source?.label ?? status}
    </Badge>
  )
}

const txStyles: Record<TransactionType, string> = {
  sell: "bg-primary/10 text-primary",
  exchange: "bg-indigo-500/10 text-indigo-600",
  donate: "bg-emerald-500/10 text-emerald-600",
}

export function TransactionBadge({ type, className }: { type: TransactionType; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", txStyles[type], className)}>
      {transactionLabel(type)}
    </Badge>
  )
}

const proposalStyles: Record<ProposalStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
  completed: "bg-sky-100 text-sky-700",
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", proposalStyles[status])}>
      {status === "pending"
        ? "Pending"
        : status === "accepted"
          ? "Accepted"
          : status === "declined"
            ? "Declined"
            : status === "cancelled"
              ? "Cancelled"
              : "Completed"}
    </Badge>
  )
}
