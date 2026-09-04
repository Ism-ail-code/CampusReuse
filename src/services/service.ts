import type {
  Block,
  Conversation,
  ExchangeProposal,
  Institution,
  Listing,
  ListingContext,
  ListingFilters,
  Message,
  Notification,
  PrivateDetails,
  Report,
  ReportStatus,
  ReportTargetType,
  SupportRequest,
  SupportRequestFilters,
  SupportRequestInput as SupportRequestInputType,
  UserProfile,
  WantedFilters,
  WantedPost,
} from "@/lib/types"

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
}

export interface AuthSession {
  user: AuthUser
  profile: UserProfile
}

export interface SignupData {
  displayName: string
  username: string
  email: string
  password: string
  accountType: "student" | "teacher"
  educationLevel: string
  program?: string
  institutionId: string
}

export interface InstitutionRequestInput {
  name: string
  type: Institution["type"]
  city: string
}

export interface ListingInput {
  title: string
  categoryId: number
  subject?: string | null
  educationLevel?: string | null
  condition: Listing["condition"]
  description: string
  transactionType: Listing["transaction_type"]
  listingContext: ListingContext
  price?: number | null
  exchangeWant?: string | null
}

export interface SupportRequestInput {
  title: string
  categoryId?: number | null
  subject?: string | null
  educationLevel?: string | null
  institutionId?: string | null
  location?: string | null
  conditionPref?: Listing["condition"] | null
  description: string
  imageUrl?: string | null
}

export interface WantedInput {
  title: string
  categoryId: number
  subject?: string | null
  educationLevel?: string | null
  conditionPref?: Listing["condition"] | null
  budget?: number | null
  description: string
}

export type Unsubscribe = () => void

export interface DataService {
  // ---- Auth ----
  getSession(): Promise<AuthSession | null>
  onAuthStateChange(cb: (session: AuthSession | null) => void): Unsubscribe
  signUp(data: SignupData): Promise<{ error?: string; needsEmailConfirmation?: boolean }>
  signIn(email: string, password: string): Promise<{ error?: string }>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<{ error?: string }>
  updatePassword(newPassword: string): Promise<{ error?: string }>
  resendVerificationEmail(email: string): Promise<{ error?: string; rateLimited?: boolean }>

  // ---- Profiles ----
  getProfile(id: string): Promise<UserProfile | null>
  getProfileByUsername(username: string): Promise<UserProfile | null>
  getPrivateDetails(userId: string): Promise<PrivateDetails | null>
  updateProfile(patch: Partial<UserProfile> & { id?: string }): Promise<{ error?: string }>
  updatePrivateDetails(patch: Partial<PrivateDetails>): Promise<{ error?: string }>

  // ---- Institutions ----
  listInstitutions(): Promise<Institution[]>
  searchInstitutions(query: string): Promise<Institution[]>
  requestInstitution(input: InstitutionRequestInput): Promise<{ id?: string; pending?: boolean; error?: string }>
  listMyInstitutionRequests(): Promise<{ id: string; name: string; status: string }[]>

  // ---- Listings ----
  listListings(filters?: ListingFilters): Promise<Listing[]>
  getListing(id: string): Promise<Listing | null>
  getMyListings(): Promise<Listing[]>
  createListing(input: ListingInput, images: File[]): Promise<{ id?: string; error?: string }>
  updateListing(
    id: string,
    input: Partial<ListingInput>,
    images?: File[],
  ): Promise<{ error?: string }>
  removeListingImage(imageId: string): Promise<{ error?: string }>
  deleteListing(id: string): Promise<{ error?: string }>
  setListingStatus(id: string, status: Listing["status"]): Promise<{ error?: string }>
  renewListing(id: string): Promise<{ error?: string }>

  // ---- Favorites ----
  getFavorites(): Promise<Listing[]>
  isFavorite(listingId: string): Promise<boolean>
  addFavorite(listingId: string): Promise<{ error?: string }>
  removeFavorite(listingId: string): Promise<{ error?: string }>

  // ---- Wanted ----
  listWanted(filters?: WantedFilters): Promise<WantedPost[]>
  getWanted(id: string): Promise<WantedPost | null>
  getMyWanted(): Promise<WantedPost[]>
  createWanted(input: WantedInput): Promise<{ id?: string; error?: string }>
  updateWanted(id: string, input: Partial<WantedInput>): Promise<{ error?: string }>
  deleteWanted(id: string): Promise<{ error?: string }>
  renewWanted(id: string): Promise<{ error?: string }>
  markWantedFulfilled(id: string): Promise<{ error?: string }>
  respondToWanted(wantedId: string, message: string): Promise<{ id?: string; error?: string }>

  // ---- Support Requests ----
  listSupportRequests(filters?: SupportRequestFilters): Promise<SupportRequest[]>
  getSupportRequest(id: string): Promise<SupportRequest | null>
  getMySupportRequests(): Promise<SupportRequest[]>
  createSupportRequest(input: SupportRequestInput): Promise<{ id?: string; error?: string }>
  updateSupportRequest(id: string, input: Partial<SupportRequestInput>): Promise<{ error?: string }>
  deleteSupportRequest(id: string): Promise<{ error?: string }>
  markSupportRequestFulfilled(id: string): Promise<{ error?: string }>
  offerHelp(requestId: string, message: string): Promise<{ id?: string; error?: string }>

  // ---- Messaging ----
  getConversations(): Promise<Conversation[]>
  getConversation(id: string): Promise<Conversation | null>
  getMessages(conversationId: string): Promise<Message[]>
  startConversation(listingId: string): Promise<{ id?: string; error?: string }>
  sendMessage(conversationId: string, body: string): Promise<{ error?: string }>
  markConversationRead(conversationId: string): Promise<void>
  getUnreadMessageCount(): Promise<number>
  subscribeToMessages(conversationId: string, cb: (message: Message) => void): Unsubscribe
  subscribeToConversations(cb: () => void): Unsubscribe

  // ---- Exchange ----
  getMyExchangeProposals(): Promise<ExchangeProposal[]>
  getProposalsForListing(listingId: string): Promise<ExchangeProposal[]>
  proposeExchange(
    listingId: string,
    offerListingId: string,
    message?: string,
  ): Promise<{ id?: string; error?: string }>
  updateExchangeProposal(id: string, status: string): Promise<{ error?: string }>

  // ---- Notifications ----
  getNotifications(): Promise<Notification[]>
  markNotificationRead(id: string): Promise<void>
  markAllNotificationsRead(): Promise<void>
  getUnreadNotificationCount(): Promise<number>
  subscribeToNotifications(cb: () => void): Unsubscribe

  // ---- Safety ----
  report(targetType: ReportTargetType, targetId: string, reason: string, details?: string): Promise<{ error?: string }>
  blockUser(userId: string): Promise<{ error?: string }>
  unblockUser(userId: string): Promise<{ error?: string }>
  getBlockedUsers(): Promise<Block[]>
  isBlocked(userId: string): Promise<boolean>

  // ---- Uploads ----
  uploadListingImages(listingId: string, files: File[]): Promise<{ urls?: string[]; error?: string }>
  uploadAvatar(file: File): Promise<{ url?: string; error?: string }>

  // ---- Admin ----
  getAdminStats(): Promise<{
    listings: number
    users: number
    openReports: number
    pendingInstitutionRequests: number
    wantedPosts: number
  }>
  getReports(): Promise<Report[]>
  updateReport(id: string, status: ReportStatus): Promise<{ error?: string }>
  getInstitutionRequests(): Promise<
    { id: string; name: string; type: string; city: string; status: string; user: UserProfile }[]
  >
  reviewInstitutionRequest(id: string, status: "approved" | "rejected" | "duplicate", note?: string): Promise<{ error?: string }>
  searchUsers(query: string): Promise<UserProfile[]>
  adminRemoveListing(id: string): Promise<{ error?: string }>
  adminDeleteUserProfile(id: string): Promise<{ error?: string }>
}
