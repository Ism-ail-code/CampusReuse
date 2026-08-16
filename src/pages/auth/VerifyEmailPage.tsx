import { Link, useSearchParams } from "react-router-dom"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthShell } from "./AuthShell"

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const email = params.get("email") || "your email"

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a confirmation link to ${email}. Click it to activate your account.`}
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">
          Didn't receive it? Check your spam folder, or sign in and we'll resend if needed.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/login">I've verified my email — sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
