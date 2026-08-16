export type AccountType = "student" | "teacher"
export type UserRole = "user" | "admin" | "moderator"
export type InstitutionType = "school" | "college" | "university" | "institute" | "other"
export type ConditionType = "new" | "like_new" | "good" | "used"
export type TransactionType = "sell" | "exchange" | "give_away"
export type ListingStatus = "available" | "reserved" | "sold" | "given_away" | "expired"
export type WantedStatus = "active" | "fulfilled" | "expired"
export type ProposalStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed"
export type ReportStatus = "open" | "reviewed" | "dismissed" | "action_taken"
export type ReportTargetType = "listing" | "user" | "message" | "wanted"

export interface Institution {
  id: string
  name: string
  type: InstitutionType
  city: string
  is_verified: boolean
  is_active?: boolean
  created_at: string
}

export interface Category {
  id: number
  slug: string
  name: string
}

export interface UserProfile {
  id: string
  display_name: string
  username: string
  account_type: AccountType
  education_level: string | null
  program: string | null
  institution_id: string | null
  institution?: Institution | null
  bio: string | null
  avatar_url: string | null
  role: UserRole
  email_verified: boolean
  institution_verified: boolean
  created_at: string
}

export interface PrivateDetails {
  phone: string | null
  gender: string | null
  age: number | null
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string | null
  storage_path: string | null
  position: number
}

export interface Listing {
  id: string
  seller_id: string
  title: string
  category_id: number
  subject: string | null
  education_level: string | null
  condition: ConditionType
  description: string
  transaction_type: TransactionType
  price: number | null
  exchange_want: string | null
  status: ListingStatus
  created_at: string
  updated_at: string
  expires_at: string
  seller?: UserProfile | null
  images?: ListingImage[]
  category?: Category | null
}

export interface WantedPost {
  id: string
  user_id: string
  title: string
  category_id: number
  subject: string | null
  education_level: string | null
  condition_pref: ConditionType | null
  budget: number | null
  description: string
  status: WantedStatus
  created_at: string
  updated_at: string
  expires_at: string
  author?: UserProfile | null
  category?: Category | null
  response_count?: number
}

export interface Conversation {
  id: string
  listing_id: string | null
  wanted_id: string | null
  last_message_at: string
  last_message_preview: string
  created_at: string
  updated_at: string
  last_read_at?: string | null
  other_participant?: UserProfile | null
  listing?: Listing | null
  wanted?: WantedPost | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface ExchangeProposal {
  id: string
  listing_id: string
  proposer_id: string
  offer_listing_id: string | null
  message: string | null
  status: ProposalStatus
  created_at: string
  updated_at: string
  listing?: Listing | null
  proposer?: UserProfile | null
  offer_listing?: Listing | null
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  link: string
  ref_id: string | null
  is_read: boolean
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  details: string | null
  status: ReportStatus
  created_at: string
  reviewed_at: string | null
}

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
}

export interface ListingFilters {
  query?: string
  category_id?: number | null
  institution_id?: string | null
  education_level?: string | null
  subject?: string | null
  transaction_type?: TransactionType | null
  condition?: ConditionType | null
  min_price?: number | null
  max_price?: number | null
  status?: ListingStatus[]
  sort?: "newest" | "relevance"
  exclude_sold?: boolean
  only_active?: boolean
}

export interface WantedFilters {
  query?: string
  category_id?: number | null
  status?: WantedStatus[]
  sort?: "newest"
}

export type NotificationType =
  | "message"
  | "exchange_proposal"
  | "exchange_accepted"
  | "exchange_declined"
  | "wanted_response"
  | "listing_expiring_soon"
  | "listing_expired"
  | "wanted_expiring_soon"
  | "wanted_expired"
  | "listing_sold"
  | "listing_given_away"
  | "system"
