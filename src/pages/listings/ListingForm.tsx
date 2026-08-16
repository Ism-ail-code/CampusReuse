import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react"
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
import { CATEGORIES, CONDITIONS, EDUCATION_LEVELS, SUBJECTS, TRANSACTION_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { TransactionType } from "@/lib/types"

export interface ListingFormValues {
  title: string
  categoryId: string
  subject: string
  educationLevel: string
  customLevel: string
  condition: string
  description: string
  transactionType: TransactionType
  price: string
  exchangeWant: string
}

export function ListingForm({
  initial,
  existingImages,
  onRemoveExistingImage,
  onSubmit,
  submitLabel = "Publish listing",
  submitting = false,
}: {
  initial?: Partial<ListingFormValues>
  existingImages?: string[]
  onRemoveExistingImage?: (index: number) => void
  onSubmit: (values: ListingFormValues, files: File[]) => Promise<void>
  submitLabel?: string
  submitting?: boolean
}) {
  const [values, setValues] = useState<ListingFormValues>({
    title: initial?.title ?? "",
    categoryId: initial?.categoryId ?? "",
    subject: initial?.subject ?? "",
    educationLevel: initial?.educationLevel ?? "",
    customLevel: initial?.customLevel ?? "",
    condition: initial?.condition ?? "good",
    description: initial?.description ?? "",
    transactionType: initial?.transactionType ?? "sell",
    price: initial?.price ?? "",
    exchangeWant: initial?.exchangeWant ?? "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const list = Array.from(selected)
    if (files.length + list.length > 6) {
      setError("You can upload up to 6 photos.")
      return
    }
    setError("")
    const nextFiles = [...files, ...list]
    setFiles(nextFiles)
    const nextPreviews: string[] = []
    list.forEach((f) => {
      const url = URL.createObjectURL(f)
      nextPreviews.push(url)
    })
    setPreviews((p) => [...p, ...nextPreviews])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles((f) => f.filter((_, i) => i !== index))
    setPreviews((p) => p.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= files.length) return
    setFiles((f) => {
      const copy = [...f]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy
    })
    setPreviews((p) => {
      const copy = [...p]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!values.title.trim()) return setError("Please enter a title.")
    if (!values.categoryId) return setError("Please choose a category.")
    if (values.transactionType === "sell" && (!values.price || Number(values.price) < 0)) {
      return setError("Please enter a valid price.")
    }
    if (values.transactionType === "exchange" && !values.exchangeWant.trim()) {
      return setError("Please specify what you want in return for the exchange.")
    }
    if (existingImages?.length === 0 && files.length === 0) {
      return setError("Please add at least one photo of the item.")
    }
    await onSubmit(
      {
        ...values,
        educationLevel: values.educationLevel === "Other" ? values.customLevel : values.educationLevel,
      },
      files,
    )
  }

  const imageCount = (existingImages?.length ?? 0) + files.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photos */}
      <div className="space-y-2">
        <Label>Photos {existingImages ? "(add more)" : ""}</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImages?.map((url, i) => (
            <div key={`existing-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              {onRemoveExistingImage && (
                <button
                  type="button"
                  onClick={() => onRemoveExistingImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 shadow transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={`new-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img src={url} alt={`New photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 shadow transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveFile(i, -1)}
                    disabled={i === 0}
                    aria-label="Move photo left"
                    className="absolute bottom-1 left-1 rounded-full bg-background/90 p-1.5 shadow transition-opacity disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(i, 1)}
                    disabled={i === previews.length - 1}
                    aria-label="Move photo right"
                    className="absolute bottom-1 right-1 rounded-full bg-background/90 p-1.5 shadow transition-opacity disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
          {imageCount < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-6 w-6" aria-hidden />
              <span className="text-xs font-medium">Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
        <p className="text-xs text-muted-foreground">
          Clear photos of the actual item work best. Up to 6 photos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Federal Board Class 11 Physics Textbook"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
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
          <Input id="subject" list="subject-suggestions" value={values.subject} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Physics" />
          <datalist id="subject-suggestions">
            {SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="educationLevel">Education level</Label>
          <Select value={values.educationLevel} onValueChange={(v) => set("educationLevel", v)}>
            <SelectTrigger id="educationLevel">
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
          <Label htmlFor="condition">Condition</Label>
          <Select value={values.condition} onValueChange={(v) => set("condition", v)}>
            <SelectTrigger id="condition">
              <SelectValue />
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

      {values.educationLevel === "Other" && (
        <div className="space-y-2">
          <Label htmlFor="customLevel">Describe the level</Label>
          <Input id="customLevel" value={values.customLevel} onChange={(e) => set("customLevel", e.target.value)} placeholder="e.g. BS Computer Science Year 2" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Condition, writing or highlighting, missing pages, damage, edition, and anything else a buyer should know."
          rows={5}
        />
      </div>

      {/* Transaction type */}
      <div className="space-y-2">
        <Label>How would you like to pass this on?</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TRANSACTION_TYPES.map((t) => {
            const active = values.transactionType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => set("transactionType", t.value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-ring",
                )}
              >
                <span className={cn("text-sm font-semibold", active ? "text-primary" : "text-foreground")}>{t.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {values.transactionType === "sell" && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (Rs.)</Label>
          <Input id="price" type="number" min={0} value={values.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 800" />
        </div>
      )}

      {values.transactionType === "exchange" && (
        <div className="space-y-2">
          <Label htmlFor="exchangeWant">What are you looking for in return?</Label>
          <Input id="exchangeWant" value={values.exchangeWant} onChange={(e) => set("exchangeWant", e.target.value)} placeholder="e.g. Class 11 Chemistry Textbook" />
          <p className="text-xs text-muted-foreground">
            V1 supports a simple 1-item-for-1-item exchange. Interested students will propose one of their active listings.
          </p>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 -mx-6 -mb-6 flex flex-col gap-2 border-t bg-card/95 p-4 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
