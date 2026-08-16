import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FilterX, Search, SlidersHorizontal, X } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/app/AppContext"
import { ListingCard } from "@/components/shared/ListingCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { CATEGORIES, CONDITIONS, EDUCATION_LEVELS, TRANSACTION_TYPES } from "@/lib/constants"
import { rankListings } from "@/lib/ranking"
import type { Institution, Listing } from "@/lib/types"

interface FilterState {
  q: string
  category: string
  institution: string
  education: string
  subject: string
  transaction: string
  condition: string
  min: string
  max: string
  sort: string
}

const defaultFilters: FilterState = {
  q: "",
  category: "",
  institution: "",
  education: "",
  subject: "",
  transaction: "",
  condition: "",
  min: "",
  max: "",
  sort: "relevance",
}

function readFromParams(params: URLSearchParams): FilterState {
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    institution: params.get("institution") ?? "",
    education: params.get("education") ?? "",
    subject: params.get("subject") ?? "",
    transaction: params.get("transaction") ?? "",
    condition: params.get("condition") ?? "",
    min: params.get("min") ?? "",
    max: params.get("max") ?? "",
    sort: params.get("sort") ?? "relevance",
  }
}

export function BrowsePage() {
  const { service, session } = useApp()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(() => readFromParams(params))
  const [listings, setListings] = useState<Listing[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [appliedQ, setAppliedQ] = useState(() => params.get("q") ?? "")

  // Debounce the search query so typing doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setAppliedQ(filters.q), 300)
    return () => clearTimeout(t)
  }, [filters.q])

  // Keep filters in sync with URL (back/forward etc.)
  useEffect(() => {
    setFilters(readFromParams(params))
  }, [params])

  useEffect(() => {
    service.listInstitutions().then(setInstitutions)
  }, [service])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await service.listListings({
        query: appliedQ || undefined,
        category_id: filters.category ? Number(filters.category) : undefined,
        institution_id: filters.institution || undefined,
        education_level: filters.education || undefined,
        subject: filters.subject || undefined,
        transaction_type: (filters.transaction || undefined) as never,
        condition: (filters.condition || undefined) as never,
        min_price: filters.min ? Number(filters.min) : undefined,
        max_price: filters.max ? Number(filters.max) : undefined,
        only_active: true,
      })
      if (!mounted) return
      let ranked = rankListings(res, session?.profile ?? null)
      if (filters.sort === "newest") {
        ranked = [...ranked].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }
      setListings(ranked)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [service, filters, session?.profile, appliedQ])

  const setFilter = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    const sp = new URLSearchParams()
    if (next.q) sp.set("q", next.q)
    if (next.category) sp.set("category", next.category)
    if (next.institution) sp.set("institution", next.institution)
    if (next.education) sp.set("education", next.education)
    if (next.subject) sp.set("subject", next.subject)
    if (next.transaction) sp.set("transaction", next.transaction)
    if (next.condition) sp.set("condition", next.condition)
    if (next.min) sp.set("min", next.min)
    if (next.max) sp.set("max", next.max)
    if (next.sort && next.sort !== "relevance") sp.set("sort", next.sort)
    setParams(sp, { replace: true })
  }

  const clearAll = () => {
    setFilters(defaultFilters)
    setParams({}, { replace: true })
  }

  const activeFilterCount = useMemo(
    () =>
      [filters.category, filters.institution, filters.education, filters.subject, filters.transaction, filters.condition, filters.min, filters.max].filter(Boolean).length,
    [filters],
  )

  const selectedInstitution = institutions.find((i) => i.id === filters.institution)

  const filterPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="inst">Institution</Label>
        <Select value={filters.institution} onValueChange={(v) => setFilter("institution", v)}>
          <SelectTrigger id="inst">
            <SelectValue placeholder="Any institution" />
          </SelectTrigger>
          <SelectContent>
            {institutions.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction">Transaction type</Label>
        <Select value={filters.transaction} onValueChange={(v) => setFilter("transaction", v)}>
          <SelectTrigger id="transaction">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Education level</Label>
        <Select value={filters.education} onValueChange={(v) => setFilter("education", v)}>
          <SelectTrigger id="education">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" value={filters.subject} onChange={(e) => setFilter("subject", e.target.value)} placeholder="e.g. Physics" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select value={filters.condition} onValueChange={(v) => setFilter("condition", v)}>
          <SelectTrigger id="condition">
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price range (Rs.)</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={filters.min} onChange={(e) => setFilter("min", e.target.value)} />
          <span className="text-muted-foreground">–</span>
          <Input type="number" min={0} placeholder="Max" value={filters.max} onChange={(e) => setFilter("max", e.target.value)} />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full gap-2" onClick={clearAll}>
          <FilterX className="h-4 w-4" aria-hidden />
          Clear all filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browse materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.q ? (
              <>
                Results for <span className="font-medium text-foreground">"{filters.q}"</span>
              </>
            ) : (
              "Textbooks, notes, guides, calculators and more from your community."
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filters.sort} onValueChange={(v) => setFilter("sort", v)}>
            <SelectTrigger className="w-40" aria-label="Sort">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most relevant</SelectItem>
              <SelectItem value="newest">Newest first</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 lg:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>
      </div>

      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          enterKeyHint="search"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          placeholder="Search books, notes, guides…"
          className="pl-10"
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              {selectedInstitution && <span className="text-xs text-muted-foreground">{selectedInstitution.name}</span>}
            </div>
            <Separator className="mb-5" />
            {filterPanel}
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <CardGridSkeleton count={8} />
          ) : listings.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching listings"
              description="Try adjusting your search or filters, or list the item yourself."
              actionLabel="List an item"
              onAction={() => (window.location.href = "/listings/new")}
            />
          ) : (
            <>
              <p className="mb-4 text-xs text-muted-foreground">{listings.length} listing(s) found.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <Link to="/wanted" className="text-sm font-medium text-primary hover:underline">
              Can't find it? Post a wanted request →
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile filters — bottom sheet */}
    {showFilters && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setShowFilters(false)}
          className="absolute inset-0 h-full w-full bg-black/50"
        />
        <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-b-0 bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </h2>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {filterPanel}
          <Button className="mt-6 w-full" size="lg" onClick={() => setShowFilters(false)}>
            Show {listings.length} result{listings.length === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    )}
    </>
  )
}
