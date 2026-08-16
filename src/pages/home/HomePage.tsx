import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Handshake,
  HeartHandshake,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/app/AppContext"
import { SearchBar } from "@/components/shared/SearchBar"
import { ListingCard } from "@/components/shared/ListingCard"
import { WantedPostCard } from "@/components/wanted/WantedPostCard"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { CATEGORIES } from "@/lib/constants"
import { rankListings } from "@/lib/ranking"
import type { Listing, WantedPost } from "@/lib/types"

export function HomePage() {
  const { service, session } = useApp()
  const [listings, setListings] = useState<Listing[]>([])
  const [wanted, setWanted] = useState<WantedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [ls, ws] = await Promise.all([
        service.listListings({ only_active: true, exclude_sold: true }),
        service.listWanted({ status: ["active"] }),
      ])
      if (!mounted) return
      setListings(rankListings(ls, session?.profile ?? null))
      setWanted(ws)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [service, session?.profile])

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Built for students. Shared by students.
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Academic materials shouldn't have to cost a fortune.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Buy what you need. Sell what you no longer use. Exchange what you have. Give what you can —
            all within your student community.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/browse">
                Browse materials
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/listings/new">List an item</Link>
            </Button>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <SearchBar placeholder="Search books, notes, guides, calculators…" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Browse by category</h2>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/browse?category=${cat.id}`}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-primary/40 hover:shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <cat.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby listings */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {session?.profile?.institution ? "Nearby & relevant" : "Recent listings"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {session?.profile?.institution
                ? `Prioritising items from ${session.profile.institution.name} and nearby institutions.`
                : "Fresh academic materials from your community."}
            </p>
          </div>
          <Link to="/browse" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
            Browse all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No listings yet"
            description="Be the first to list an academic material in your community."
            actionLabel="List an item"
            onAction={() => (window.location.href = "/listings/new")}
          />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.slice(0, 8).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Wanted */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">What students are looking for</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Respond if you have something they need.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/wanted/new">Post a wanted request</Link>
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {wanted.slice(0, 4).map((w) => (
              <WantedPostCard key={w.id} post={w} />
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link to="/wanted" className="text-sm font-medium text-primary hover:underline">
              See all wanted posts →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">How it works</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            We connect you. You arrange the exchange — in person, on your own terms. No payments, no delivery, no fees.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Search, title: "1. Find", text: "Search for the exact textbook, notes, or guide you need from your own institution or nearby." },
              { icon: MessagesSquare, title: "2. Connect", text: "Message the seller, ask about condition and availability, and agree on a meeting." },
              { icon: Handshake, title: "3. Exchange", text: "Meet at a public or school-approved place and hand over the material in person." },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border bg-card p-6 text-center shadow-subtle">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission + trust */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Our mission</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Every year, students spend a lot of money on books and materials that earlier students no
              longer need. CampusReuse keeps useful academic materials in the hands of students who need
              them — reducing cost and waste, one class at a time. This is a free, public-service project
              built for students by students.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {[
              { icon: ShieldCheck, title: "Verified identities", text: "Email and institution verification help you know who you're dealing with." },
              { icon: BookOpen, title: "Academic materials only", text: "Textbooks, notes, guides, calculators and notebooks. No random classifieds." },
              { icon: HeartHandshake, title: "Free forever", text: "No listing fees, no transaction fees, no premium accounts. Ever." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                  <item.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
