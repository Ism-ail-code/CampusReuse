import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

export function daysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0
  const d = new Date(date)
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export function truncate(text: string, length = 120): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + "…"
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/** Rewrite a Supabase storage public URL into a resized thumbnail URL. */
export function thumbUrl(url: string, width = 600): string {
  const m = url.match(/^(.+?)\/storage\/v1\/object\/public\/(.+)$/)
  if (!m) return url
  return `${m[1]}/storage/v1/render/image/public/${m[2]}?width=${width}&quality=80`
}
