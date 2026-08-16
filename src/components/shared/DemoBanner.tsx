import { FlaskConical, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp, useDemoReset } from "@/app/AppContext"

const DEMO_ACCOUNTS = [
  { label: "Ayesha Khan (student)", email: "demo@campusreuse.app", password: "DemoPass123!" },
  { label: "Bilal Ahmed (Grade 11)", email: "bilal@campusreuse.app", password: "DemoPass123!" },
  { label: "Zara Malik (Grade 10)", email: "zara@campusreuse.app", password: "DemoPass123!" },
  { label: "Mr. Imran Shah (teacher)", email: "mr_shah@campusreuse.app", password: "DemoPass123!" },
  { label: "Admin", email: "admin@campusreuse.app", password: "AdminPass123!" },
]

export function DemoBanner() {
  const { isDemo, service } = useApp()
  const reset = useDemoReset()

  if (!isDemo) return null

  const switchAccount = async (email: string) => {
    const account = DEMO_ACCOUNTS.find((a) => a.email === email)
    if (!account) return
    const res = await service.signIn(account.email, account.password)
    if (res.error) toast.error(res.error)
    else toast.success(`Signed in as ${account.label.split(" (")[0]}`)
  }

  return (
    <div className="border-b border-primary/20 bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-xs text-foreground sm:justify-between">
        <p className="flex items-center gap-1.5 font-medium">
          <FlaskConical className="h-3.5 w-3.5 text-primary" aria-hidden />
          Demo mode — sample data. Connect Supabase to go live.
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden text-muted-foreground sm:inline">Preview as:</span>
          <Select onValueChange={switchAccount} value={undefined}>
            <SelectTrigger className="h-7 w-48 text-xs" aria-label="Switch demo account">
              <SelectValue placeholder="Switch demo account" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_ACCOUNTS.map((a) => (
                <SelectItem key={a.email} value={a.email}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={reset}>
            <RotateCcw className="h-3 w-3" aria-hidden />
            Reset demo data
          </Button>
        </div>
      </div>
    </div>
  )
}
