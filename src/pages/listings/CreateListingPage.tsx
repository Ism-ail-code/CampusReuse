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
  const initialTransactionType = contextParam === "get_support" ? "donate" : "sell"

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
    if (values.transactionType === "donate") {
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
        subtitle="Sell, exchange, or donate an academic material you no longer need. Takes just a few minutes."
        backTo={initialTransactionType === "donate" ? "/support" : "/"}
      />
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-subtle">
        <ListingForm
          initial={{ transactionType: initialTransactionType }}
          onSubmit={submit}
          submitting={submitting}
        />
      </div>
    </div>
  )
}
