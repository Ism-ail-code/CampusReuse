import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useApp } from "@/app/AppContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { ListingForm, type ListingFormValues } from "./ListingForm"

export function CreateListingPage() {
  const { service } = useApp()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

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
        transactionType: values.transactionType,
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
    toast.success("Your listing is live!")
    navigate(`/listings/${res.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="List an item"
        subtitle="Sell, exchange, or give away an academic material you no longer need. Takes just a few minutes."
        backTo="/"
      />
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-subtle">
        <ListingForm onSubmit={submit} submitting={submitting} />
      </div>
    </div>
  )
}
