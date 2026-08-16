import { supabase } from "@/lib/supabase"
import type {
  Block,
  Conversation,
  ExchangeProposal,
  Institution,
  Listing,
  ListingFilters,
  Message,
  Notification,
  PrivateDetails,
  Report,
  UserProfile,
  WantedFilters,
  WantedPost,
} from "@/lib/types"
import type {
  AuthSession,
  DataService,
  InstitutionRequestInput,
  ListingInput,
  SignupData,
  Unsubscribe,
  WantedInput,
} from "./service"

const LISTING_STATUSES_ACTIVE = ["available", "reserved"] as const

function mapError(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return fallback
}

async function fetchProfile(id: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("*, institution:institutions(*)")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return data as UserProfile
}

class SupabaseService implements DataService {
  // ==========================================================================
  // Auth
  // ==========================================================================

  async getSession(): Promise<AuthSession | null> {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session?.user) return null
    const profile = await fetchProfile(session.user.id)
    if (!profile) return null
    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        emailVerified: Boolean(session.user.email_confirmed_at),
      },
      profile,
    }
  }

  onAuthStateChange(cb: (session: AuthSession | null) => void): Unsubscribe {
    if (!supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          cb(profile ? { user: { id: session.user.id, email: session.user.email ?? "", emailVerified: Boolean(session.user.email_confirmed_at) }, profile } : null)
        } else {
          cb(null)
        }
      } else if (event === "SIGNED_OUT") {
        cb(null)
      }
    })
    return () => data.subscription.unsubscribe()
  }

  async signUp(data: SignupData): Promise<{ error?: string; needsEmailConfirmation?: boolean }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error, data: result } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          display_name: data.displayName,
          account_type: data.accountType,
          education_level: data.educationLevel,
          program: data.program ?? null,
          institution_id: data.institutionId,
        },
      },
    })
    if (error) return { error: mapError(error, "Could not create account.") }
    return { needsEmailConfirmation: !result.session }
  }

  async signIn(email: string, password: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: mapError(error, "Invalid email or password.") }
    return {}
  }

  async signOut(): Promise<void> {
    await supabase?.auth.signOut()
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })
    if (error) return { error: mapError(error, "Could not send reset email.") }
    return {}
  }

  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: mapError(error, "Could not update password.") }
    return {}
  }

  // ==========================================================================
  // Profiles
  // ==========================================================================

  async getProfile(id: string): Promise<UserProfile | null> {
    return fetchProfile(id)
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from("profiles")
      .select("*, institution:institutions(*)")
      .eq("username", username)
      .maybeSingle()
    if (error || !data) return null
    return data as UserProfile
  }

  async getPrivateDetails(userId: string): Promise<PrivateDetails | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from("private_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
    if (error || !data) return null
    return data as PrivateDetails
  }

  async updateProfile(patch: Partial<UserProfile> & { id?: string }): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const rest: Record<string, unknown> = { ...patch }
    delete rest.id
    delete rest.institution
    let targetId = patch.id
    if (!targetId) {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return { error: "Not authenticated." }
      targetId = data.user.id
    }
    const { error } = await supabase.from("profiles").update(rest).eq("id", targetId)
    if (error) return { error: mapError(error, "Could not update profile.") }
    return {}
  }

  async updatePrivateDetails(patch: Partial<PrivateDetails>): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase
      .from("private_details")
      .upsert({ user_id: data.user.id, ...patch }, { onConflict: "user_id" })
    if (error) return { error: mapError(error, "Could not update private details.") }
    return {}
  }

  // ==========================================================================
  // Institutions
  // ==========================================================================

  async listInstitutions(): Promise<Institution[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .eq("is_active", true)
      .order("name")
    if (error || !data) return []
    return data as Institution[]
  }

  async searchInstitutions(query: string): Promise<Institution[]> {
    const all = await this.listInstitutions()
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all
      .filter((i) => i.name.toLowerCase().includes(q) || i.city.toLowerCase().includes(q))
      .slice(0, 20)
  }

  async requestInstitution(input: InstitutionRequestInput): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("institution_requests").insert({
      user_id: data.user.id,
      name: input.name,
      type: input.type,
      city: input.city,
    })
    if (error) return { error: mapError(error, "Could not submit institution request.") }
    return {}
  }

  async listMyInstitutionRequests(): Promise<{ id: string; name: string; status: string }[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase
      .from("institution_requests")
      .select("id, name, status")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
    return (rows ?? []) as { id: string; name: string; status: string }[]
  }

  // ==========================================================================
  // Listings
  // ==========================================================================

  async listListings(filters: ListingFilters = {}): Promise<Listing[]> {
    if (!supabase) return []
    let q = supabase
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(*, institution:institutions(*)), images:listing_images(*), category:categories(*)")

    if (filters.query) {
      const term = `%${filters.query.trim()}%`
      q = q.or(`title.ilike.${term},subject.ilike.${term},description.ilike.${term}`)
    }
    if (filters.category_id) q = q.eq("category_id", filters.category_id)
    if (filters.institution_id) q = q.eq("seller.institution_id", filters.institution_id)
    if (filters.education_level) q = q.eq("education_level", filters.education_level)
    if (filters.subject) q = q.ilike("subject", `%${filters.subject}%`)
    if (filters.transaction_type) q = q.eq("transaction_type", filters.transaction_type)
    if (filters.condition) q = q.eq("condition", filters.condition)
    if (filters.min_price != null) q = q.gte("price", filters.min_price)
    if (filters.max_price != null) q = q.lte("price", filters.max_price)

    const statuses = filters.status ?? (filters.only_active ? [...LISTING_STATUSES_ACTIVE] : undefined)
    if (statuses && statuses.length) q = q.in("status", statuses as string[])
    if (filters.exclude_sold) q = q.not("status", "in", `("sold","given_away")`)

    q = q.order("created_at", { ascending: false }).limit(100)

    const { data, error } = await q
    if (error || !data) return []
    return (data as unknown as Listing[]).map(normalizeListing)
  }

  async getListing(id: string): Promise<Listing | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(*, institution:institutions(*)), images:listing_images(*), category:categories(*)")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return null
    return normalizeListing(data as Listing)
  }

  async getMyListings(): Promise<Listing[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows, error } = await supabase
      .from("listings")
      .select("*, images:listing_images(*), category:categories(*)")
      .eq("seller_id", data.user.id)
      .order("created_at", { ascending: false })
    if (error || !rows) return []
    return rows.map(normalizeListing)
  }

  async createListing(input: ListingInput, images: File[]): Promise<{ id?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return { error: "Not authenticated." }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: authData.user.id,
        title: input.title,
        category_id: input.categoryId,
        subject: input.subject ?? null,
        education_level: input.educationLevel ?? null,
        condition: input.condition,
        description: input.description,
        transaction_type: input.transactionType,
        price: input.transactionType === "sell" ? input.price : null,
        exchange_want: input.transactionType === "exchange" ? input.exchangeWant : null,
      })
      .select("id")
      .single()
    if (error || !data) return { error: mapError(error, "Could not create listing.") }

    if (images.length > 0) {
      const { error: uploadError } = await this.uploadListingImages(data.id, images)
      if (uploadError) return { id: data.id, error: uploadError }
    }
    return { id: data.id }
  }

  async updateListing(
    id: string,
    input: Partial<ListingInput>,
    images?: File[],
  ): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.categoryId !== undefined) patch.category_id = input.categoryId
    if (input.subject !== undefined) patch.subject = input.subject ?? null
    if (input.educationLevel !== undefined) patch.education_level = input.educationLevel ?? null
    if (input.condition !== undefined) patch.condition = input.condition
    if (input.description !== undefined) patch.description = input.description
    if (input.transactionType !== undefined) patch.transaction_type = input.transactionType
    if (input.transactionType !== undefined) {
      patch.price = input.transactionType === "sell" ? input.price ?? null : null
      patch.exchange_want = input.transactionType === "exchange" ? input.exchangeWant ?? null : null
    }
    const { error } = await supabase.from("listings").update(patch).eq("id", id)
    if (error) return { error: mapError(error, "Could not update listing.") }
    if (images && images.length > 0) {
      const { error: uploadError } = await this.uploadListingImages(id, images)
      if (uploadError) return { error: uploadError }
    }
    return {}
  }

  async deleteListing(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("listings").delete().eq("id", id)
    if (error) return { error: mapError(error, "Could not delete listing.") }
    return {}
  }

  async removeListingImage(imageId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data: img } = await supabase.from("listing_images").select("storage_path").eq("id", imageId).single()
    if (img?.storage_path) {
      await supabase.storage.from("listing-images").remove([img.storage_path])
    }
    const { error } = await supabase.from("listing_images").delete().eq("id", imageId)
    if (error) return { error: mapError(error, "Could not remove photo.") }
    return {}
  }

  async setListingStatus(id: string, status: Listing["status"]): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("listings").update({ status }).eq("id", id)
    if (error) return { error: mapError(error, "Could not update status.") }
    return {}
  }

  async renewListing(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase
      .from("listings")
      .update({ status: "available", expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
      .eq("id", id)
    if (error) return { error: mapError(error, "Could not renew listing.") }
    return {}
  }

  // ==========================================================================
  // Favorites
  // ==========================================================================

  async getFavorites(): Promise<Listing[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase
      .from("favorites")
      .select("listing:listings(*, seller:profiles!listings_seller_id_fkey(*, institution:institutions(*)), images:listing_images(*), category:categories(*))")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
    return (rows ?? []).map((r) => normalizeListing(r.listing as unknown as Listing))
  }

  async isFavorite(listingId: string): Promise<boolean> {
    if (!supabase) return false
    const { data } = await supabase.auth.getUser()
    if (!data.user) return false
    const { data: row } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("listing_id", listingId)
      .maybeSingle()
    return Boolean(row)
  }

  async addFavorite(listingId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("favorites").insert({ user_id: data.user.id, listing_id: listingId })
    if (error) return { error: mapError(error, "Could not save listing.") }
    return {}
  }

  async removeFavorite(listingId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("favorites").delete().eq("user_id", data.user.id).eq("listing_id", listingId)
    if (error) return { error: mapError(error, "Could not remove saved listing.") }
    return {}
  }

  // ==========================================================================
  // Wanted
  // ==========================================================================

  async listWanted(filters: WantedFilters = {}): Promise<WantedPost[]> {
    if (!supabase) return []
    let q = supabase
      .from("wanted_posts")
      .select("*, author:profiles!wanted_posts_user_id_fkey(*, institution:institutions(*)), category:categories(*)")

    if (filters.query) {
      const term = `%${filters.query.trim()}%`
      q = q.or(`title.ilike.${term},subject.ilike.${term},description.ilike.${term}`)
    }
    if (filters.category_id) q = q.eq("category_id", filters.category_id)
    const statuses = filters.status ?? ["active"]
    q = q.in("status", statuses as string[])
    q = q.order("created_at", { ascending: false }).limit(60)

    const { data, error } = await q
    if (error || !data) return []
    return data as WantedPost[]
  }

  async getWanted(id: string): Promise<WantedPost | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from("wanted_posts")
      .select("*, author:profiles!wanted_posts_user_id_fkey(*, institution:institutions(*)), category:categories(*)")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return null
    return data as WantedPost
  }

  async getMyWanted(): Promise<WantedPost[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase
      .from("wanted_posts")
      .select("*, category:categories(*)")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
    return (rows ?? []) as WantedPost[]
  }

  async createWanted(input: WantedInput): Promise<{ id?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { data: row, error } = await supabase
      .from("wanted_posts")
      .insert({
        user_id: data.user.id,
        title: input.title,
        category_id: input.categoryId,
        subject: input.subject ?? null,
        education_level: input.educationLevel ?? null,
        condition_pref: input.conditionPref ?? null,
        budget: input.budget ?? null,
        description: input.description,
      })
      .select("id")
      .single()
    if (error || !row) return { error: mapError(error, "Could not create wanted post.") }
    return { id: row.id }
  }

  async updateWanted(id: string, input: Partial<WantedInput>): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.categoryId !== undefined) patch.category_id = input.categoryId
    if (input.subject !== undefined) patch.subject = input.subject ?? null
    if (input.educationLevel !== undefined) patch.education_level = input.educationLevel ?? null
    if (input.conditionPref !== undefined) patch.condition_pref = input.conditionPref ?? null
    if (input.budget !== undefined) patch.budget = input.budget ?? null
    if (input.description !== undefined) patch.description = input.description
    const { error } = await supabase.from("wanted_posts").update(patch).eq("id", id)
    if (error) return { error: mapError(error, "Could not update wanted post.") }
    return {}
  }

  async deleteWanted(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("wanted_posts").delete().eq("id", id)
    if (error) return { error: mapError(error, "Could not delete wanted post.") }
    return {}
  }

  async renewWanted(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase
      .from("wanted_posts")
      .update({ status: "active", expires_at: new Date(Date.now() + 30 * 86400000).toISOString() })
      .eq("id", id)
    if (error) return { error: mapError(error, "Could not renew wanted post.") }
    return {}
  }

  async markWantedFulfilled(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("wanted_posts").update({ status: "fulfilled" }).eq("id", id)
    if (error) return { error: mapError(error, "Could not update wanted post.") }
    return {}
  }

  async respondToWanted(wantedId: string, message: string): Promise<{ id?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data, error } = await supabase.rpc("respond_to_wanted", {
      p_wanted_id: wantedId,
      p_message: message,
    })
    if (error) return { error: mapError(error, "Could not respond to this post.") }
    return { id: data as string }
  }

  // ==========================================================================
  // Messaging
  // ==========================================================================

  async getConversations(): Promise<Conversation[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []

    const { data: rows } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(*),
        listing:listings(*, images:listing_images(*), category:categories(*)),
        wanted:wanted_posts(*)
      `)
      .order("last_message_at", { ascending: false })

    const meId = data.user.id
    const conversations: (Conversation & {
      _participantRows: { user_id: string; last_read_at: string }[]
      _otherId: string | null
    })[] = (rows ?? []).map((row) => {
      const participants = row.participants ?? []
      const other = participants.find((p: { user_id: string }) => p.user_id !== meId)
      return {
        id: row.id,
        listing_id: row.listing_id,
        wanted_id: row.wanted_id,
        last_message_at: row.last_message_at,
        last_message_preview: row.last_message_preview,
        created_at: row.created_at,
        updated_at: row.updated_at,
        other_participant: null,
        listing: row.listing ? normalizeListing(row.listing as Listing) : null,
        wanted: row.wanted as WantedPost | null,
        _participantRows: participants,
        _otherId: other?.user_id ?? null,
      } as Conversation & {
        _participantRows: { user_id: string; last_read_at: string }[]
        _otherId: string | null
      }
    })

    // Fetch other participant profiles (public)
    const otherIds = [...new Set(conversations.map((c) => c._otherId).filter(Boolean))] as string[]
    const profiles = new Map<string, UserProfile>()
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*, institution:institutions(*)")
        .in("id", otherIds)
      for (const p of profs ?? []) profiles.set(p.id, p as UserProfile)
    }
    for (const c of conversations) {
      if (c._otherId) c.other_participant = profiles.get(c._otherId) ?? null
      const myRow = c._participantRows?.find((p) => p.user_id === meId)
      c.last_read_at = myRow?.last_read_at ?? null
      ;(c as unknown as { _unread: boolean })._unread =
        Boolean(myRow) && new Date(c.last_message_at).getTime() > new Date(myRow!.last_read_at).getTime()
    }
    return conversations
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!supabase) return null
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    const { data: row, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(*),
        listing:listings(*, images:listing_images(*), category:categories(*)),
        wanted:wanted_posts(*)
      `)
      .eq("id", id)
      .maybeSingle()
    if (error || !row) return null

    const meId = data.user.id
    const participants = row.participants ?? []
    const other = participants.find((p: { user_id: string }) => p.user_id !== meId)
    const myRow = participants.find((p: { user_id: string }) => p.user_id === meId)
    const otherProfile = other?.user_id ? await fetchProfile(other.user_id) : null
    return {
      id: row.id,
      listing_id: row.listing_id,
      wanted_id: row.wanted_id,
      last_message_at: row.last_message_at,
      last_message_preview: row.last_message_preview,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_read_at: myRow?.last_read_at ?? null,
      other_participant: otherProfile,
      listing: row.listing ? normalizeListing(row.listing as Listing) : null,
      wanted: row.wanted as WantedPost | null,
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
    if (error || !data) return []
    return data as Message[]
  }

  async startConversation(listingId: string): Promise<{ id?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data, error } = await supabase.rpc("start_conversation", { p_listing_id: listingId })
    if (error) return { error: mapError(error, "Could not start conversation.") }
    return { id: data as string }
  }

  async sendMessage(conversationId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const trimmed = body.trim()
    if (!trimmed) return { error: "Message cannot be empty." }
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: data.user.id,
      body: trimmed,
    })
    if (error) return { error: mapError(error, "Could not send message.") }
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), last_message_preview: trimmed.slice(0, 100) })
      .eq("id", conversationId)
    return {}
  }

  async markConversationRead(conversationId: string): Promise<void> {
    if (!supabase) return
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", data.user.id)
  }

  async getUnreadMessageCount(): Promise<number> {
    const conversations = await this.getConversations()
    return conversations.filter((c) => (c as unknown as { _unread: boolean })._unread).length
  }

  subscribeToMessages(conversationId: string, cb: (message: Message) => void): Unsubscribe {
    const client = supabase
    if (!client) return () => {}
    const channel = client
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          cb(payload.new as Message)
        },
      )
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }

  subscribeToConversations(cb: () => void): Unsubscribe {
    const client = supabase
    if (!client) return () => {}
    const channel = client
      .channel("conversations")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => cb())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => cb())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }

  // ==========================================================================
  // Exchange
  // ==========================================================================

  async getMyExchangeProposals(): Promise<ExchangeProposal[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase
      .from("exchange_proposals")
      .select("*, listing:listings!exchange_proposals_listing_id_fkey(*, images:listing_images(*), category:categories(*), seller:profiles!listings_seller_id_fkey(*)), proposer:profiles!exchange_proposals_proposer_id_fkey(*), offer_listing:listings!exchange_proposals_offer_listing_id_fkey(*, images:listing_images(*), category:categories(*))")
      .or(`proposer_id.eq.${data.user.id},listing.seller_id.eq.${data.user.id}`)
      .order("created_at", { ascending: false })
    if (!rows) return []
    return (rows ?? []).map((r) => ({
      ...r,
      listing: r.listing ? normalizeListing(r.listing) : null,
      offer_listing: r.offer_listing ? normalizeListing(r.offer_listing) : null,
    })) as ExchangeProposal[]
  }

  async getProposalsForListing(listingId: string): Promise<ExchangeProposal[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from("exchange_proposals")
      .select("*, listing:listings!exchange_proposals_listing_id_fkey(*, images:listing_images(*), category:categories(*)), proposer:profiles!exchange_proposals_proposer_id_fkey(*, institution:institutions(*)), offer_listing:listings!exchange_proposals_offer_listing_id_fkey(*, images:listing_images(*), category:categories(*))")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
    if (error || !data) return []
    return data.map((r) => ({
      ...r,
      listing: r.listing ? normalizeListing(r.listing) : null,
      offer_listing: r.offer_listing ? normalizeListing(r.offer_listing) : null,
    })) as ExchangeProposal[]
  }

  async proposeExchange(
    listingId: string,
    offerListingId: string,
    message?: string,
  ): Promise<{ id?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data, error } = await supabase.rpc("propose_exchange", {
      p_listing_id: listingId,
      p_offer_listing_id: offerListingId,
      p_message: message ?? null,
    })
    if (error) return { error: mapError(error, "Could not propose exchange.") }
    return { id: data as string }
  }

  async updateExchangeProposal(id: string, status: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.rpc("update_exchange_proposal", {
      p_proposal_id: id,
      p_new_status: status,
    })
    if (error) return { error: mapError(error, "Could not update exchange.") }
    return {}
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async getNotifications(): Promise<Notification[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(100)
    return (rows ?? []) as Notification[]
  }

  async markNotificationRead(id: string): Promise<void> {
    if (!supabase) return
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
  }

  async markAllNotificationsRead(): Promise<void> {
    if (!supabase) return
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", data.user.id).eq("is_read", false)
  }

  async getUnreadNotificationCount(): Promise<number> {
    if (!supabase) return 0
    const { data } = await supabase.auth.getUser()
    if (!data.user) return 0
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id)
      .eq("is_read", false)
    return count ?? 0
  }

  subscribeToNotifications(cb: () => void): Unsubscribe {
    const client = supabase
    if (!client) return () => {}
    const channel = client
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => cb())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }

  // ==========================================================================
  // Safety
  // ==========================================================================

  async report(targetType: Report["target_type"], targetId: string, reason: string, details?: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("reports").insert({
      reporter_id: data.user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details ?? null,
    })
    if (error) return { error: mapError(error, "Could not submit report.") }
    return {}
  }

  async blockUser(userId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("blocks").insert({ blocker_id: data.user.id, blocked_id: userId })
    if (error) return { error: mapError(error, "Could not block user.") }
    return {}
  }

  async unblockUser(userId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const { error } = await supabase.from("blocks").delete().eq("blocker_id", data.user.id).eq("blocked_id", userId)
    if (error) return { error: mapError(error, "Could not unblock user.") }
    return {}
  }

  async getBlockedUsers(): Promise<Block[]> {
    if (!supabase) return []
    const { data } = await supabase.auth.getUser()
    if (!data.user) return []
    const { data: rows } = await supabase.from("blocks").select("*").eq("blocker_id", data.user.id)
    return (rows ?? []) as Block[]
  }

  async isBlocked(userId: string): Promise<boolean> {
    const blocked = await this.getBlockedUsers()
    return blocked.some((b) => b.blocked_id === userId)
  }

  // ==========================================================================
  // Uploads
  // ==========================================================================

  async uploadListingImages(listingId: string, files: File[]): Promise<{ urls?: string[]; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${data.user.id}/${listingId}/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
      const { error } = await supabase.storage.from("listing-images").upload(path, file)
      if (error) continue
      const { data: pub } = supabase.storage.from("listing-images").getPublicUrl(path)
      urls.push(pub.publicUrl)
    }
    if (urls.length > 0) {
      const existing = await supabase
        .from("listing_images")
        .select("position")
        .eq("listing_id", listingId)
        .order("position", { ascending: false })
        .limit(1)
      const start = existing.data?.length ? (existing.data[0].position ?? 0) + 1 : 0
      await supabase.from("listing_images").insert(
        urls.map((url, i) => ({ listing_id: listingId, url, position: start + i })),
      )
    }
    if (urls.length === 0 && files.length > 0) return { error: "Could not upload photos. Please try again." }
    return { urls }
  }

  async uploadAvatar(file: File): Promise<{ url?: string; error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: "Not authenticated." }
    const path = `${data.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const { error } = await supabase.storage.from("avatars").upload(path, file)
    if (error) return { error: mapError(error, "Could not upload photo.") }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path)
    return { url: pub.publicUrl }
  }

  // ==========================================================================
  // Admin
  // ==========================================================================

  async getAdminStats(): Promise<{ listings: number; users: number; openReports: number; pendingInstitutionRequests: number; wantedPosts: number }> {
    if (!supabase) return { listings: 0, users: 0, openReports: 0, pendingInstitutionRequests: 0, wantedPosts: 0 }
    const [listings, users, reports, reqs, wanted] = await Promise.all([
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("institution_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("wanted_posts").select("id", { count: "exact", head: true }).eq("status", "active"),
    ])
    return {
      listings: listings.count ?? 0,
      users: users.count ?? 0,
      openReports: reports.count ?? 0,
      pendingInstitutionRequests: reqs.count ?? 0,
      wantedPosts: wanted.count ?? 0,
    }
  }

  async getReports(): Promise<Report[]> {
    if (!supabase) return []
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100)
    return (data ?? []) as Report[]
  }

  async updateReport(id: string, status: Report["status"]): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("reports").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id)
    if (error) return { error: mapError(error, "Could not update report.") }
    return {}
  }

  async getInstitutionRequests(): Promise<{ id: string; name: string; type: string; city: string; status: string; user: UserProfile }[]> {
    if (!supabase) return []
    const { data } = await supabase
      .from("institution_requests")
      .select("*, user:profiles(*)")
      .order("created_at", { ascending: false })
      .limit(100)
    return (data ?? []) as { id: string; name: string; type: string; city: string; status: string; user: UserProfile }[]
  }

  async reviewInstitutionRequest(id: string, status: "approved" | "rejected" | "duplicate", note?: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { data: req } = await supabase.from("institution_requests").select("*").eq("id", id).single()
    if (!req) return { error: "Request not found." }

    if (status === "approved") {
      const { data: inst, error: instError } = await supabase
        .from("institutions")
        .insert({ name: req.name, type: req.type, city: req.city, is_verified: false })
        .select("id")
        .single()
      if (instError) return { error: mapError(instError, "Could not create institution.") }
      await supabase.from("profiles").update({ institution_id: inst.id }).eq("id", req.user_id)
    }

    const { error } = await supabase
      .from("institution_requests")
      .update({ status, admin_note: note ?? null, reviewed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return { error: mapError(error, "Could not update request.") }
    return {}
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    if (!supabase) return []
    const term = `%${query.trim()}%`
    const { data, error } = await supabase
      .from("profiles")
      .select("*, institution:institutions(*)")
      .or(`display_name.ilike.${term},username.ilike.${term}`)
      .limit(30)
    if (error || !data) return []
    return data as UserProfile[]
  }

  async adminRemoveListing(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.from("listings").delete().eq("id", id)
    if (error) return { error: mapError(error, "Could not remove listing.") }
    return {}
  }

  async adminDeleteUserProfile(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: "Supabase not configured" }
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return { error: mapError(error, "Could not delete user.") }
    return {}
  }
}

function normalizeListing(listing: Listing): Listing {
  if (listing.images) {
    listing.images = [...listing.images].sort((a, b) => a.position - b.position)
  }
  return listing
}

export const supabaseService = new SupabaseService()
