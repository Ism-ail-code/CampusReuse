import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar({
  placeholder = "Search books, notes, guides, calculators…",
  initialValue = "",
  className,
}: {
  placeholder?: string
  initialValue?: string
  className?: string
}) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse")
  }

  return (
    <form onSubmit={submit} className={`flex w-full items-center gap-2 ${className ?? ""}`} role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-9 pr-3"
          aria-label="Search listings"
        />
      </div>
      <Button type="submit" className="h-11 px-5">
        Search
      </Button>
    </form>
  )
}
