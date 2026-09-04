import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { ListingForm, type ListingFormValues } from "./ListingForm"

export function CreateListingPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const contextParam = params.get("context")
  const initialContext = contextParam === "get_support" ? "get_support" : "marketplace"

  const submit = async (values: ListingFormValues, files: File[]) => {
    setSubmitting(true)
    const res = await service.createListing(
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
    if (values.listingContext === "get_support") {
      toast.success("Your donation is live in Get Support!")
      navigate("/support")
    } else {
      toast.success("Your listing is live!")
      navigate(`/listings/${res.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="List an item"
        subtitle="Sell, exchange, or give away an academic material you no longer need. Takes just a few minutes."
        backTo={initialContext === "get_support" ? "/support" : "/"}
      />
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-subtle">
        <ListingForm
          initial={{ listingContext: initialContext }}
          onSubmit={submit}
          submitting={submitting}
        />
      </div>
    </div>
  )
}
