import {
  BookOpen,
  Calculator,
  FileText,
  GraduationCap,
  NotebookPen,
  Package,
  type LucideIcon,
} from "lucide-react"
import type {
  ConditionType,
  InstitutionType,
  ListingStatus,
  TransactionType,
  WantedStatus,
} from "./types"

export const APP_NAME = "CampusReuse"
export const APP_TAGLINE = "Academic materials shouldn't have to cost a fortune."
export const LISTING_TTL_DAYS = 30
export const WANTED_TTL_DAYS = 30

export const CATEGORIES: { id: number; slug: string; name: string; icon: LucideIcon }[] = [
  { id: 1, slug: "textbook", name: "Textbooks", icon: BookOpen },
  { id: 2, slug: "notes", name: "Notes", icon: FileText },
  { id: 3, slug: "guide", name: "Guides", icon: GraduationCap },
  { id: 4, slug: "calculator", name: "Calculators", icon: Calculator },
  { id: 5, slug: "notebook", name: "Notebooks", icon: NotebookPen },
  { id: 6, slug: "other", name: "Other academic material", icon: Package },
]

export function getCategory(id: number | null | undefined) {
  return CATEGORIES.find((c) => c.id === id) ?? null
}

export const CONDITIONS: { value: ConditionType; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "used", label: "Used" },
]

export function conditionLabel(value: ConditionType | null | undefined): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? "—"
}

export const TRANSACTION_TYPES: {
  value: TransactionType
  label: string
  description: string
}[] = [
  {
    value: "sell",
    label: "Sell",
    description: "Set a price and sell your item.",
  },
  {
    value: "exchange",
    label: "Exchange",
    description: "Swap it for something you need.",
  },
  {
    value: "give_away",
    label: "Give Away",
    description: "Pass it on for free to someone who needs it.",
  },
]

export function transactionLabel(value: TransactionType): string {
  return TRANSACTION_TYPES.find((t) => t.value === value)?.label ?? value
}

export const LISTING_STATUSES: {
  value: ListingStatus
  label: string
  className: string
}[] = [
  { value: "available", label: "Available", className: "bg-emerald-100 text-emerald-700" },
  { value: "reserved", label: "Reserved", className: "bg-amber-100 text-amber-700" },
  { value: "sold", label: "Sold", className: "bg-slate-200 text-slate-600" },
  { value: "given_away", label: "Given Away", className: "bg-sky-100 text-sky-700" },
  { value: "expired", label: "Expired", className: "bg-slate-200 text-slate-500" },
]

export function listingStatusLabel(value: ListingStatus): string {
  return LISTING_STATUSES.find((s) => s.value === value)?.label ?? value
}

export const WANTED_STATUSES: { value: WantedStatus; label: string; className: string }[] = [
  { value: "active", label: "Looking", className: "bg-emerald-100 text-emerald-700" },
  { value: "fulfilled", label: "Fulfilled", className: "bg-sky-100 text-sky-700" },
  { value: "expired", label: "Expired", className: "bg-slate-200 text-slate-500" },
]

export function wantedStatusLabel(value: WantedStatus): string {
  return WANTED_STATUSES.find((s) => s.value === value)?.label ?? value
}

export const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "university", label: "University" },
  { value: "institute", label: "Institute" },
  { value: "other", label: "Other" },
]

export function institutionTypeLabel(value: InstitutionType): string {
  return INSTITUTION_TYPES.find((t) => t.value === value)?.label ?? value
}

export const EDUCATION_LEVELS: string[] = [
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "College",
  "Undergraduate",
  "Postgraduate",
  "Master's",
  "PhD",
  "Other",
]

export const SUBJECTS: string[] = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiat",
  "Pakistan Studies",
  "Economics",
  "Accounting",
  "Business Studies",
  "Statistics",
  "History",
  "Geography",
  "Psychology",
  "Sociology",
  "Other",
]

export const REPORT_REASONS: string[] = [
  "Not an academic material",
  "Misleading or incorrect listing",
  "Inappropriate content",
  "Spam or scam",
  "Harassment or abuse",
  "Prohibited item (phone, clothes, etc.)",
  "Other",
]

export const SEARCH_SUGGESTIONS = [
  "Physics Class 11",
  "Chemistry textbook",
  "Casio calculator",
  "Class 9 notes",
  "Mathematics guide",
  "Biology",
]
