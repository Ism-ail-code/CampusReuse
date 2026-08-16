import type { Listing, UserProfile } from "./types"

/**
 * Local-relevance ranking: same institution first, then same city,
 * then recency. Used by both real and demo data paths so ranking is
 * consistent everywhere.
 */
export function rankListings(listings: Listing[], viewer?: UserProfile | null): Listing[] {
  if (!viewer || listings.length < 2) {
    return [...listings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }
  const viewerInst = viewer.institution_id
  const viewerCity = viewer.institution?.city?.toLowerCase()

  const scored = listings.map((l) => {
    let score = 0
    if (l.seller?.institution_id && l.seller.institution_id === viewerInst) score += 3
    if (
      viewerCity &&
      l.seller?.institution?.city &&
      l.seller.institution.city.toLowerCase() === viewerCity
    ) {
      score += 2
    }
    const ageDays = (Date.now() - new Date(l.created_at).getTime()) / 86400000
    score += Math.max(0, 1 - ageDays / 30)
    return { l, score }
  })

  return scored
    .sort((a, b) => b.score - a.score || new Date(b.l.created_at).getTime() - new Date(a.l.created_at).getTime())
    .map((s) => s.l)
}
