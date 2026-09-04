import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { CATEGORIES, CONDITIONS } from "@/lib/constants"

export function CreateSupportRequestPage() {
  const navigate = useNavigate()
  const { service } = useApp()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [location, setLocation] = useState("")
  const [conditionPref, setConditionPref] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.")
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await service.createSupportRequest({
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      subject: subject.trim() || null,
      educationLevel: educationLevel.trim() || null,
      location: location.trim() || null,
      conditionPref: conditionPref as any || null,
    })
    setSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      navigate(`/support/requests/${res.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Post a Support Request"
        subtitle="Let the community know what you need"
        backTo="/support"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border bg-card p-6 shadow-subtle space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">What are you looking for? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 11 Physics Textbook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community more about what you need…"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
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
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Education Level</Label>
              <Input
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g. Grade 11"
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lahore"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Condition Preference</Label>
            <Select value={conditionPref} onValueChange={setConditionPref}>
              <SelectTrigger>
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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Posting…" : "Post Request"}
        </Button>
      </form>
    </div>
  )
}
