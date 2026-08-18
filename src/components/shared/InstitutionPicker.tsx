import { useEffect, useRef, useState } from "react"
import { Building2, Loader2, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/app/AppContext"
import { INSTITUTION_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Institution } from "@/lib/types"

interface Props {
  value: Institution | null
  onChange: (institution: Institution | null) => void
  error?: string
}

export function InstitutionPicker({ value, onChange, error }: Props) {
  const { service } = useApp()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Institution[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [reqName, setReqName] = useState("")
  const [reqType, setReqType] = useState("school")
  const [reqCity, setReqCity] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      const res = await service.searchInstitutions(query)
      setResults(res)
      setLoading(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [query, service])

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const select = (inst: Institution) => {
    onChange(inst)
    setOpen(false)
  }

  const request = async () => {
    if (!reqName.trim()) {
      toast.error("Please enter the institution name.")
      return
    }
    setSubmitting(true)
    const res = await service.requestInstitution({ name: reqName.trim(), type: reqType as Institution["type"], city: reqCity.trim() })
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Institution added. You can now select it.")
    setRequestOpen(false)
    setReqName("")
    setReqCity("")
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {INSTITUTION_TYPES.find((t) => t.value === value.type)?.label ?? value.type}
                {value.city ? ` · ${value.city}` : ""}
                {value.is_verified ? " · Verified" : " · Unverified"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Change
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-ring",
            error && "border-destructive",
          )}
        >
          <Search className="h-4 w-4" aria-hidden />
          {query || "Search your school, college, or university…"}
        </button>
      )}

      {open && !value && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
          <div className="border-b p-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search institutions…"
              className="h-9"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading && <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…</p>}
            {!loading && results.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No institutions found.</p>
            )}
            {results.map((inst) => (
              <button
                key={inst.id}
                type="button"
                onClick={() => select(inst)}
                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>
                  <span className="block font-medium">{inst.name}</span>
                  <span className="block text-xs capitalize text-muted-foreground">
                    {INSTITUTION_TYPES.find((t) => t.value === inst.type)?.label ?? inst.type}
                    {inst.city ? ` · ${inst.city}` : ""}
                  </span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="mt-1 flex w-full items-center gap-2 rounded-md border-t px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-accent"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Can't find your institution? Request it
            </button>
          </div>
        </div>
      )}

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request an institution</DialogTitle>
            <DialogDescription>
              Your institution is added to the directory immediately and attached to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="req-name">Institution name</Label>
              <Input id="req-name" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="e.g. City Grammar School" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="req-type">Type</Label>
                <Select value={reqType} onValueChange={setReqType}>
                  <SelectTrigger id="req-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-city">City</Label>
                <Input id="req-city" value={reqCity} onChange={(e) => setReqCity(e.target.value)} placeholder="e.g. Lahore" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={request} disabled={submitting}>
              {submitting ? "Submitting…" : "Request institution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
