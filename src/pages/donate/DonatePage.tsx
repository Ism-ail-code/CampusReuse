import { useEffect } from "react"
import { Heart, Copy, Check, MessageCircle, ArrowRight, Shield } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DONATION_CONFIG } from "@/lib/donation-config"
import { cn } from "@/lib/utils"

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "gap-1.5 text-xs",
        copied && "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied!" : label}
    </Button>
  )
}

export function DonatePage() {
  useEffect(() => {
    document.title = "Donate to Support Students | CampusReuse"
  }, [])

  const whatsappUrl = `https://wa.me/${DONATION_CONFIG.whatsappNumber}?text=${encodeURIComponent(DONATION_CONFIG.whatsappMessage)}`

  const isConfigured =
    DONATION_CONFIG.accountNumber.length > 0 &&
    DONATION_CONFIG.iban.length > 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <Heart className="h-6 w-6 text-rose-500" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Donate</h1>
          <p className="text-sm text-muted-foreground">Support Students Through Fixit</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your contribution can help provide educational support to students through Fixit.
          Every contribution, regardless of size, helps make educational resources more accessible.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">How It Works</h2>
        <ol className="mt-3 space-y-3">
          {[
            "Send your donation directly to Fixit using the account details below.",
            "Keep your payment confirmation from your bank or payment app.",
            "Send the confirmation screenshot to us on WhatsApp.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{DONATION_CONFIG.organization} Donation Details</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Transfer any amount you would like to contribute directly to this account.
        </p>

        {isConfigured ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Account Title</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{DONATION_CONFIG.accountTitle}</p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Bank</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{DONATION_CONFIG.bankName}</p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Account Number</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-foreground">{DONATION_CONFIG.accountNumber}</p>
              </div>
              <CopyButton text={DONATION_CONFIG.accountNumber} label="Copy" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">IBAN</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-foreground break-all">{DONATION_CONFIG.iban}</p>
              </div>
              <CopyButton text={DONATION_CONFIG.iban} label="Copy" />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Donation account details will be available soon.
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Make Your Donation</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Transfer any amount you would like to contribute directly to the account above
          using your bank app, JazzCash, Easypaisa, or any other payment method.
        </p>
      </div>

      <div className="mt-8 rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Done With Your Donation?</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          After completing your transfer, send your payment confirmation screenshot to our
          WhatsApp so we can document the contribution and share the confirmation with {DONATION_CONFIG.organization}.
        </p>
        <Button asChild className="mt-4 gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden />
            Send Screenshot on WhatsApp
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-semibold">Important:</span> Donations are sent directly to {DONATION_CONFIG.organization}.
            Campus Reuse does not receive or hold donation funds. We only help coordinate and record the confirmation.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Why This Matters</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Many students face financial barriers to accessing educational materials.
          Unused textbooks and supplies often go to waste while other students go without.
          By contributing through {DONATION_CONFIG.organization}, you help bridge this gap
          and make educational support more accessible to students who need it most.
        </p>
      </div>
    </div>
  )
}
