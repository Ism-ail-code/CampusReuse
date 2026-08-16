import { Navigate, useLocation } from "react-router-dom"
import { useApp } from "@/app/AppContext"

export function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { session, loading } = useApp()
  const location = useLocation()

  if (loading) return null
  if (!session?.user.id) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  if (adminOnly && session.profile.role !== "admin") {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
