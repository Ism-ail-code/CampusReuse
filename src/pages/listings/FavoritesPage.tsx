import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"
import { useApp } from "@/app/AppContext"
import { ListingCard } from "@/components/shared/ListingCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import type { Listing } from "@/lib/types"

export function FavoritesPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const res = await service.getFavorites()
      if (!mounted) return
      setListings(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [service])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title="Saved listings" subtitle="Items you've saved to revisit later." />

      <div className="mt-6">
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved listings yet"
            description="Tap the heart on any listing to save it here for later."
            actionLabel="Browse materials"
            onAction={() => navigate("/browse")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
          Continue browsing →
        </Link>
      </div>
    </div>
  )
}
