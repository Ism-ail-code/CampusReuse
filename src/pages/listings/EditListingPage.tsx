import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { ListingForm, type ListingFormValues } from "./ListingForm"
import { CardGridSkeleton } from "@/components/shared/Skeleton"
import type { Listing } from "@/lib/types"

export function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const { service, session } = useApp()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const l = await service.getListing(id!)
      if (!mounted) return
      if (!l || l.seller_id !== session?.user.id) {
        toast.error("Listing not found or you don't have permission to edit it.")
        navigate("/my-listings")
        return
      }
      setListing(l)
      setExistingImages((l.images ?? []).map((im) => im.url ?? "").filter(Boolean))
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [id, service, session?.user.id, navigate])

  if (loading || !listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <CardGridSkeleton count={1} />
      </div>
    )
  }

  const removeExisting = async (index: number) => {
    const image = listing.images?.[index]
    if (!image) return
    const res = await service.removeListingImage(image.id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    const remaining = [...existingImages]
    remaining.splice(index, 1)
    setExistingImages(remaining)
    setListing((l) => (l ? { ...l, images: (l.images ?? []).filter((_, i) => i !== index) } : l))
  }

  const submit = async (values: ListingFormValues, files: File[]) => {
    setSubmitting(true)
    const res = await service.updateListing(
      listing.id,
      {
        title: values.title,
        categoryId: Number(values.categoryId),
        subject: values.subject || null,
        educationLevel: values.educationLevel || null,
        condition: values.condition as never,
        description: values.description,
        listingContext: values.listingContext,
        transactionType: values.listingContext === "get_support" ? "give_away" : values.transactionType,
        price: values.transactionType === "sell" ? Number(values.price) || 0 : null,
        exchangeWant: values.transactionType === "exchange" ? values.exchangeWant : null,
      },
      files,
    )
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Listing updated.")
    navigate(`/listings/${listing.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader title="Edit listing" backTo={`/listings/${listing.id}`} />
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-subtle">
        <ListingForm
          initial={{
            title: listing.title,
            categoryId: String(listing.category_id),
            subject: listing.subject ?? "",
            educationLevel: listing.education_level ?? "",
            condition: listing.condition,
            description: listing.description,
            listingContext: listing.listing_context ?? "marketplace",
            transactionType: listing.transaction_type,
            price: listing.price != null ? String(listing.price) : "",
            exchangeWant: listing.exchange_want ?? "",
          }}
          existingImages={existingImages}
          onRemoveExistingImage={removeExisting}
          onSubmit={submit}
          submitLabel="Save changes"
          submitting={submitting}
        />
      </div>
      {submitting && <Loader2 className="mt-4 h-4 w-4 animate-spin" />}
    </div>
  )
}
