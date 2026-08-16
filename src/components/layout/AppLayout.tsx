import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { MobileNav } from "./MobileNav"
import { Footer } from "./Footer"
import { DemoBanner } from "@/components/shared/DemoBanner"

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
