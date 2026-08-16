import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { CATEGORIES, CONDITIONS, EDUCATION_LEVELS } from "@/lib/constants"

export function CreateWantedPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [subject, setSubject] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [customLevel, setCustomLevel] = useState("")
  const [conditionPref, setConditionPref] = useState("")
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      toast.error("Please choose a category.")
      return
    }
    setLoading(true)
    const res = await service.createWanted({
      title,
      categoryId: Number(categoryId),
      subject: subject || null,
      educationLevel: educationLevel === "Other" ? customLevel : educationLevel || null,
      conditionPref: (conditionPref || null) as never,
      budget: budget ? Number(budget) : null,
      description,
    })
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Wanted post published. Students can now respond.")
    navigate(`/wanted/${res.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Post a wanted request"
        subtitle="Tell your community what you're looking for. Posts expire after 30 days."
        backTo="/wanted"
      />

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-xl border bg-card p-6 shadow-subtle">
        <div className="space-y-2">
          <Label htmlFor="title">What are you looking for?</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wanted: Class 11 Physics Textbook"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Physics" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="level">Education level</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger id="level">
                <SelectValue placeholder="e.g. Grade 11" />
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
            <Label htmlFor="condition">Condition preference (optional)</Label>
            <Select value={conditionPref} onValueChange={setConditionPref}>
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
        </div>

        {educationLevel === "Other" && (
          <div className="space-y-2">
            <Label htmlFor="customLevel">Describe your level</Label>
            <Input id="customLevel" value={customLevel} onChange={(e) => setCustomLevel(e.target.value)} placeholder="e.g. BS Computer Science Year 2" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="budget">Budget in Rs. (optional)</Label>
          <Input id="budget" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 1000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you need, edition, condition, board, etc."
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/wanted")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish wanted post
          </Button>
        </div>
      </form>
    </div>
  )
}
