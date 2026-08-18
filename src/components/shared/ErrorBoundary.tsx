import { Component, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled application error:", error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-6">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border bg-card p-8 text-center shadow-card">
            <TriangleAlert className="h-10 w-10 text-destructive" aria-hidden />
            <h1 className="text-base font-semibold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred while rendering this page. Reloading usually fixes it.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button onClick={this.handleReset}>Reload page</Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}