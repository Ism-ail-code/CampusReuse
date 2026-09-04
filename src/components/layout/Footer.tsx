import { Link } from "react-router-dom"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-10 sm:px-6 sm:pb-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Academic materials shouldn't have to cost a fortune. Buy, sell, exchange, and give away
              physical study materials within your student community.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Marketplace</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground">Browse materials</Link></li>
              <li><Link to="/wanted" className="hover:text-foreground">Wanted</Link></li>
              <li><Link to="/listings/new" className="hover:text-foreground">List an item</Link></li>
              <li><Link to="/exchanges" className="hover:text-foreground">Exchanges</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Get Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/support" className="hover:text-foreground">Browse resources</Link></li>
              <li><Link to="/support/new-request" className="hover:text-foreground">Post a request</Link></li>
              <li><Link to="/listings/new?context=get_support" className="hover:text-foreground">Donate an item</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
              <li><Link to="/auth" className="hover:text-foreground">Join free</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground/80">
              Built for students. Shared by students. No payments, no delivery — you arrange the exchange.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CampusReuse. A student-run, public-service project.</p>
          <p className="max-w-md text-center sm:text-right">
            Stay safe: meet in public or school-approved places and involve a trusted adult when appropriate.
          </p>
        </div>
      </div>
    </footer>
  )
}
