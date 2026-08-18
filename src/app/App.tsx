import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppProvider } from "./AppContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { AuthGuard } from "@/components/shared/AuthGuard"

import { HomePage } from "@/pages/home/HomePage"
import { BrowsePage } from "@/pages/browse/BrowsePage"
import { ListingDetailPage } from "@/pages/listingDetail/ListingDetailPage"
import { CreateListingPage } from "@/pages/listings/CreateListingPage"
import { EditListingPage } from "@/pages/listings/EditListingPage"
import { MyListingsPage } from "@/pages/listings/MyListingsPage"
import { FavoritesPage } from "@/pages/listings/FavoritesPage"
import { WantedBrowsePage } from "@/pages/wanted/WantedBrowsePage"
import { CreateWantedPage } from "@/pages/wanted/CreateWantedPage"
import { WantedDetailPage } from "@/pages/wanted/WantedDetailPage"
import { MyWantedPage } from "@/pages/wanted/MyWantedPage"
import { MessagesPage } from "@/pages/messages/MessagesPage"
import { ConversationPage } from "@/pages/messages/ConversationPage"
import { ExchangesPage } from "@/pages/exchange/ExchangesPage"
import { NotificationsPage } from "@/pages/notifications/NotificationsPage"
import { PublicProfilePage } from "@/pages/profile/PublicProfilePage"
import { SettingsPage } from "@/pages/profile/SettingsPage"
import { AdminPage } from "@/pages/admin/AdminPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { SignupPage } from "@/pages/auth/SignupPage"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage"
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage"
import { TermsPage } from "@/pages/legal/TermsPage"
import { PrivacyPage } from "@/pages/legal/PrivacyPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

export function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route
                path="/listings/new"
                element={
                  <AuthGuard>
                    <CreateListingPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/listings/:id/edit"
                element={
                  <AuthGuard>
                    <EditListingPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <AuthGuard>
                    <MyListingsPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/favorites"
                element={
                  <AuthGuard>
                    <FavoritesPage />
                  </AuthGuard>
                }
              />
              <Route path="/wanted" element={<WantedBrowsePage />} />
              <Route
                path="/wanted/new"
                element={
                  <AuthGuard>
                    <CreateWantedPage />
                  </AuthGuard>
                }
              />
              <Route path="/wanted/:id" element={<WantedDetailPage />} />
              <Route
                path="/my-wanted"
                element={
                  <AuthGuard>
                    <MyWantedPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/messages"
                element={
                  <AuthGuard>
                    <MessagesPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/messages/:id"
                element={
                  <AuthGuard>
                    <ConversationPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/exchanges"
                element={
                  <AuthGuard>
                    <ExchangesPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AuthGuard>
                    <NotificationsPage />
                  </AuthGuard>
                }
              />
              <Route path="/u/:username" element={<PublicProfilePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route
                path="/settings"
                element={
                  <AuthGuard>
                    <SettingsPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthGuard adminOnly>
                    <AdminPage />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster position="top-center" richColors />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  )
}
