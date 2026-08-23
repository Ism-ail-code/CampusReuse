import { Link, NavLink, useNavigate } from "react-router-dom"
import { Bell, ChevronDown, LogOut, MessageSquare, PlusCircle, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/app/AppContext"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Logo } from "./Logo"
import { cn } from "@/lib/utils"

function NavLinkItem({ to, children, end = false }: { to: string; children: React.ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
          isActive && "bg-muted text-foreground",
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const { session, profile, unreadMessages, unreadNotifications, service } = useApp()
  const navigate = useNavigate()

  const signOut = async () => {
    await service.signOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary">
            <NavLinkItem to="/browse">Browse</NavLinkItem>
            <NavLinkItem to="/wanted">Wanted</NavLinkItem>
            <NavLinkItem to="/exchanges">Exchange</NavLinkItem>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {session?.user.id ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/listings/new">
                  <PlusCircle className="mr-1.5 h-4 w-4" aria-hidden />
                  Sell
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Messages">
                <Link to="/messages">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                  {unreadMessages > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" aria-hidden />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-muted" aria-label="Account menu">
                    <UserAvatar name={profile?.display_name ?? "User"} src={profile?.avatar_url} className="h-8 w-8" />
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">{profile?.display_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">@{profile?.username}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/u/${profile?.username}`)}>
                    <User className="h-4 w-4" aria-hidden />
                    Public profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-listings")}>
                    <PlusCircle className="h-4 w-4" aria-hidden />
                    My listings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/exchanges")}>
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    Exchanges
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4" aria-hidden />
                    Settings
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <User className="h-4 w-4" aria-hidden />
                        Admin
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4" aria-hidden />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Join free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
