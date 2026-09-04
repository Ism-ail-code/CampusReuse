import { NavLink } from "react-router-dom"
import { Heart, Home, MessageSquare, PlusCircle, Search, User } from "lucide-react"
import { useApp } from "@/app/AppContext"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const { session, unreadMessages } = useApp()

  const items = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/browse", label: "Browse", icon: Search, end: false },
    { to: "/support", label: "Support", icon: Heart, end: false },
    ...(session?.user.id ? [{ to: "/listings/new", label: "Sell", icon: PlusCircle, end: false }] : []),
    { to: "/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages, end: false },
    {
      to: session?.user.id ? `/u/${session.profile.username}` : "/auth",
      label: "Profile",
      icon: User,
      end: false,
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors",
                isActive && "text-primary",
              )
            }
          >
            <span className="relative">
              <item.icon className="h-5 w-5" aria-hidden />
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
