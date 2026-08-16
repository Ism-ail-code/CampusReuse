import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/app/AppContext"
import { WantedPostCard } from "@/components/wanted/WantedPostCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { CATEGORIES } from "@/lib/constants"
import type { WantedPost } from "@/lib/types"

export function WantedBrowsePage() {
  const { service, session } = useApp()
  const [params, setParams] = useSearchParams()
  const [posts, setPosts] = useState<WantedPost[]>([])
  const [loading, setLoading] = useState(true)

  const query = params.get("q") ?? ""
  const category = params.get("category")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await service.listWanted({
        query: query || undefined,
        category_id: category ? Number(category) : undefined,
        status: ["active"],
      })
      if (!mounted) return
      setPosts(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [service, query, category])

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const catName = useMemo(() => CATEGORIES.find((c) => c.id === Number(category))?.name, [category])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wanted</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Students looking for specific materials. Respond if you can help.
          </p>
        </div>
        <Button asChild>
          <Link to="/wanted/new">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden />
            Post what you need
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => updateParam("q", e.target.value || null)}
            placeholder="Search wanted posts…"
            className="pl-9"
          />
        </div>
        <Select value={category ?? "all"} onValueChange={(v) => updateParam("category", v === "all" ? null : v)}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {session?.user.id && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/my-wanted" className="font-medium text-primary hover:underline">
            Manage your wanted posts
          </Link>
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={query ? `No wanted posts match "${query}"` : "No active wanted posts"}
            description="Be the first to post what you're looking for — other students can respond directly."
            actionLabel="Post a wanted request"
            onAction={() => (window.location.href = "/wanted/new")}
          />
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {catName ? `Showing ${posts.length} wanted post(s) in ${catName}.` : `Showing ${posts.length} active wanted post(s).`}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <WantedPostCard key={p.id} post={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
