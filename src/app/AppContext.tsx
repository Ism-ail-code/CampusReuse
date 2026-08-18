import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { service, isDemoMode } from "@/services"
import type { AuthSession, DataService } from "@/services/service"
import type { UserProfile } from "@/lib/types"

interface AppContextValue {
  service: DataService
  session: AuthSession | null
  profile: UserProfile | null
  loading: boolean
  isDemo: boolean
  unreadMessages: number
  unreadNotifications: number
  refreshUnread: () => void
  refreshProfile: () => void
  requireAuth: (navigateTo?: string) => boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const navigate = useNavigate()

  const refreshUnread = useCallback(async () => {
    if (!session?.user.id) {
      setUnreadMessages(0)
      setUnreadNotifications(0)
      return
    }
    const [m, n] = await Promise.all([
      service.getUnreadMessageCount(),
      service.getUnreadNotificationCount(),
    ])
    setUnreadMessages(m)
    setUnreadNotifications(n)
  }, [session?.user.id])

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) return
    const p = await service.getProfile(session.user.id)
    if (p) setSession((s) => (s ? { ...s, profile: p } : s))
  }, [session?.user.id])

  const requireAuth = useCallback(
    (navigateTo?: string) => {
      if (session) return true
      const dest = navigateTo ?? `${window.location.pathname}${window.location.search}`
      navigate(`/login?next=${encodeURIComponent(dest)}`)
      return false
    },
    [session, navigate],
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const s = await service.getSession()
      if (!mounted) return
      setSession(s)
      setLoading(false)
    })()
    const unsub = service.onAuthStateChange((s) => {
      if (!mounted) return
      setSession(s)
      setLoading(false)
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  useEffect(() => {
    refreshUnread()
  }, [refreshUnread, session?.user.id])

  // Realtime: refresh unread counts when conversations/notifications change.
  useEffect(() => {
    if (!session?.user.id) return
    const unsubConv = service.subscribeToConversations(() => refreshUnread())
    const unsubNotif = service.subscribeToNotifications(() => refreshUnread())
    return () => {
      unsubConv()
      unsubNotif()
    }
  }, [session?.user.id, refreshUnread])

  // Demo: allow a reset of demo data (helpful when exploring).
  const value = useMemo<AppContextValue>(
    () => ({
      service,
      session,
      profile: session?.profile ?? null,
      loading,
      isDemo: isDemoMode,
      unreadMessages,
      unreadNotifications,
      refreshUnread,
      refreshProfile,
      requireAuth,
    }),
    [session, loading, unreadMessages, unreadNotifications, refreshUnread, refreshProfile, requireAuth],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function useDemoReset() {
  const navigate = useNavigate()
  return () => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith("campusreuse_demo")) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
    navigate("/")
  }
}
