import type {
  Block,
  Category,
  Conversation,
  ExchangeProposal,
  Institution,
  Listing,
  ListingFilters,
  ListingImage,
  Message,
  Notification,
  PrivateDetails,
  Report,
  ReportStatus,
  ReportTargetType,
  SupportRequest,
  SupportRequestFilters,
  UserProfile,
  WantedFilters,
  WantedPost,
} from "@/lib/types"
import { WANTED_TTL_DAYS, LISTING_TTL_DAYS } from "@/lib/constants"
import { INSTITUTIONS } from "@/lib/institutions"
import type {
  AuthSession,
  AuthUser,
  DataService,
  InstitutionRequestInput,
  ListingInput,
  SignupData,
  SupportRequestInput,
  Unsubscribe,
  WantedInput,
} from "./service"

// ============================================================================
// Demo database (persisted to localStorage, clearly separated demo data)
// ============================================================================

interface ParticipantRow {
  conversation_id: string
  user_id: string
  last_read_at: string
}

interface WantedResponse {
  id: string
  wanted_id: string
  responder_id: string
  message: string
  created_at: string
}

interface InstitutionRequest {
  id: string
  user_id: string
  name: string
  type: string
  city: string
  status: string
  created_at: string
}

interface DemoDB {
  institutions: Institution[]
  profiles: UserProfile[]
  privateDetails: Record<string, PrivateDetails>
  categories: Category[]
  listings: Listing[]
  listingImages: ListingImage[]
  favorites: { id: string; user_id: string; listing_id: string; created_at: string }[]
  wantedPosts: WantedPost[]
  wantedResponses: WantedResponse[]
  conversations: {
    id: string
    listing_id: string | null
    wanted_id: string | null
    last_message_at: string
    last_message_preview: string
    created_at: string
    updated_at: string
  }[]
  participants: ParticipantRow[]
  messages: Message[]
  exchangeProposals: ExchangeProposal[]
  notifications: Notification[]
  reports: Report[]
  blocks: Block[]
  institutionRequests: InstitutionRequest[]
  supportRequests: SupportRequest[]
  authPasswords: Record<string, string>
}

const STORAGE_KEY = "campusreuse_demo_db_v2"
const SESSION_KEY = "campusreuse_demo_session_v1"

const nowIso = () => new Date().toISOString()
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString()

function uid(prefix = "d"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

// ----------------------------------------------------------------------------
// Seed data
// ----------------------------------------------------------------------------

function buildSeed(): DemoDB {
  const categories: Category[] = [
    { id: 1, slug: "textbook", name: "Textbook" },
    { id: 2, slug: "notes", name: "Notes" },
    { id: 3, slug: "guide", name: "Guide" },
    { id: 4, slug: "calculator", name: "Calculator" },
    { id: 5, slug: "notebook", name: "Notebook" },
    { id: 6, slug: "other", name: "Other academic material" },
  ]

  const institutions: Institution[] = INSTITUTIONS.map((i) => ({
    ...i,
    created_at: daysAgo(400),
  }))

  const mkUser = (
    id: string,
    _email: string,
    display_name: string,
    username: string,
    accountType: "student" | "teacher",
    education_level: string,
    institutionId: string,
    program: string | null,
    opts: Partial<UserProfile> = {},
  ): UserProfile => ({
    id,
    display_name,
    username,
    account_type: accountType,
    education_level,
    program,
    institution_id: institutionId,
    bio: opts.bio ?? null,
    avatar_url: opts.avatar_url ?? null,
    role: opts.role ?? "user",
    email_verified: opts.email_verified ?? true,
    institution_verified: opts.institution_verified ?? true,
    created_at: opts.created_at ?? daysAgo(120),
  })

  const u = {
    ayesha: mkUser("u_ayesha", "demo@campusreuse.app", "Ayesha Khan", "ayesha_khan", "student", "BS Computer Science Year 2", "inst_punjab", "BSCS", { bio: "Second year CS student. Happy to pass on books I no longer need." }),
    admin: mkUser("u_admin", "admin@campusreuse.app", "Campus Admin", "campus_admin", "student", "Masters", "inst_punjab", null, { role: "admin" }),
    bilal: mkUser("u_bilal", "bilal@campusreuse.app", "Bilal Ahmed", "bilal_ahmed", "student", "Grade 11", "inst_lgs", null, { bio: "Grade 11 student at LGS." }),
    fatima: mkUser("u_fatima", "fatima@campusreuse.app", "Fatima Noor", "fatima_noor", "student", "Grade 12", "inst_lgs", null),
    daniyal: mkUser("u_daniyal", "daniyal@campusreuse.app", "Daniyal Shah", "daniyal_shah", "student", "BS Physics Year 3", "inst_uet", "BS Physics"),
    zara: mkUser("u_zara", "zara@campusreuse.app", "Zara Malik", "zara_malik", "student", "Grade 10", "inst_beaconhouse", null),
    mrshah: mkUser("u_mrshah", "mr_shah@campusreuse.app", "Mr. Imran Shah", "imran_shah", "teacher", "Teaching Staff", "inst_lgs", "English Faculty"),
  }
  const profiles = Object.values(u)

  const img = (listingId: string) => `https://picsum.photos/seed/${listingId}/800/600`

  const listing = (
    id: string,
    seller: UserProfile,
    title: string,
    categoryId: number,
    subject: string | null,
    educationLevel: string,
    condition: Listing["condition"],
    description: string,
    transactionType: Listing["transaction_type"],
    price: number | null,
    exchangeWant: string | null,
    status: Listing["status"],
    createdDaysAgo: number,
    expiresInDays: number,
  ): Listing => ({
    id,
    seller_id: seller.id,
    title,
    category_id: categoryId,
    subject,
    education_level: educationLevel,
    condition,
    description,
    transaction_type: transactionType,
    price,
    exchange_want: exchangeWant,
    status,
    created_at: daysAgo(createdDaysAgo),
    updated_at: daysAgo(createdDaysAgo),
    expires_at: daysFromNow(expiresInDays),
    seller,
  })

  const listings: Listing[] = [
    listing("l_201", u.ayesha, "Punjab Board Class 11 Physics Textbook (Part 1 & 2)", 1, "Physics", "Grade 11", "good", "Punjab Textbook Board edition. Minor pencil underlining in two chapters, all pages intact.", "sell", 800, null, "available", 8, 12),
    listing("l_202", u.ayesha, "Chemistry Part 1 & 2 — Federal Board Class 11", 1, "Chemistry", "Grade 11", "like_new", "Hardly used. Looking for Class 11 Mathematics in exchange.", "exchange", null, "Class 11 Mathematics textbook (any board)", "available", 10, 20),
    listing("l_203", u.bilal, "Class 10 Maths Key Book / Solved Guide", 3, "Mathematics", "Grade 10", "good", "Step-by-step solutions. A few margin notes. Great for boards prep.", "sell", 450, null, "available", 3, 25),
    listing("l_204", u.fatima, "Class 9 Biology Complete Notes (handwritten, 120 pages)", 2, "Biology", "Grade 9", "used", "Complete handwritten notes covering all chapters with diagrams.", "donate", null, null, "available", 20, 25),
    listing("l_205", u.daniyal, "Casio fx-991EX ClassWiz Scientific Calculator", 4, null, "BS Physics Year 3", "like_new", "Used for one semester of labs. Original box and manual included.", "sell", 5000, null, "available", 5, 18),
    listing("l_206", u.zara, "English Literature Guide — Class 10", 3, "English", "Grade 10", "good", "Punjab board. Some highlighting in the poetry section.", "donate", null, null, "available", 1, 28),
    listing("l_207", u.mrshah, "Oxford English Grammar Course (Advanced) — unused", 1, "English", "Teacher resource", "new", "Brand new, never opened. Great for O/A level teaching.", "sell", 2200, null, "available", 6, 22),
    listing("l_208", u.daniyal, "Calculus Early Transcendentals — swap for Linear Algebra", 1, "Mathematics", "BS Year 1", "used", "Well used but complete. Looking to swap for Linear Algebra.", "exchange", null, "Linear Algebra textbook", "available", 4, 30),
    listing("l_209", u.bilal, "Pack of 5 A4 Notebooks (unused)", 5, null, "Grade 11", "new", "Unused notebooks from a bulk pack.", "sell", 500, null, "reserved", 2, 9),
    listing("l_210", u.ayesha, "Data Structures & Algorithms in Java (2nd ed)", 1, "Computer Science", "BS CS Year 2", "good", "Core course book. Slight cover wear, inside clean.", "sell", 1500, null, "expired", 35, -2),
    listing("l_211", u.fatima, "Physics Practical Notebook (Class 9)", 5, "Physics", "Grade 9", "like_new", "Completed practical notebook, teacher-checked.", "exchange", null, "Chemistry practical notebook", "available", 7, 15),
    listing("l_212", u.zara, "Computer Science Class 9 Guide", 3, "Computer Science", "Grade 9", "good", "In good condition, no missing pages.", "sell", 350, null, "available", 0, 24),
    // Get Support donations
    listing("l_301", u.ayesha, "Free Class 11 Physics Notes (complete semester)", 2, "Physics", "Grade 11", "good", "Complete physics notes from semester 1 and 2. Free for any student who needs them.", "donate", null, null, "available", 3, 27),
    listing("l_302", u.mrshah, "Oxford Dictionary — donated for student use", 6, null, "General", "like_new", "Donated by teacher. Any student can pick it up.", "donate", null, null, "available", 5, 25),
    listing("l_303", u.daniyal, "Scientific Calculator — free for students in need", 4, null, "BS Physics Year 3", "good", "I upgraded my calculator. This one works perfectly. Free for anyone who needs it.", "donate", null, null, "available", 2, 28),
  ]

  const listingImages: ListingImage[] = listings
    .map((l) => ({
      id: `${l.id}_img1`,
      listing_id: l.id,
      url: img(l.id),
      storage_path: null,
      position: 0,
    }))

  const wantedPosts: WantedPost[] = [
    {
      id: "w_301",
      user_id: u.bilal.id,
      title: "Wanted: Class 11 Physics Textbook",
      category_id: 1,
      subject: "Physics",
      education_level: "Grade 11",
      condition_pref: "good",
      budget: 1000,
      description: "Looking for a used copy in reasonable condition. Any board welcome.",
      status: "active",
      created_at: daysAgo(5),
      updated_at: daysAgo(5),
      expires_at: daysFromNow(15),
      author: u.bilal,
    },
    {
      id: "w_302",
      user_id: u.zara.id,
      title: "Wanted: Class 10 Biology textbook",
      category_id: 1,
      subject: "Biology",
      education_level: "Grade 10",
      condition_pref: "used",
      budget: 600,
      description: "Need it for board prep. Willing to buy used.",
      status: "active",
      created_at: daysAgo(4),
      updated_at: daysAgo(4),
      expires_at: daysFromNow(26),
      author: u.zara,
    },
    {
      id: "w_303",
      user_id: u.daniyal.id,
      title: "Wanted: Linear Algebra textbook",
      category_id: 1,
      subject: "Mathematics",
      education_level: "BS Year 2",
      condition_pref: null,
      budget: 1500,
      description: "Any standard text. Happy to exchange or buy.",
      status: "active",
      created_at: daysAgo(9),
      updated_at: daysAgo(9),
      expires_at: daysFromNow(14),
      author: u.daniyal,
    },
    {
      id: "w_304",
      user_id: u.ayesha.id,
      title: "Wanted: Scientific calculator for exams",
      category_id: 4,
      subject: null,
      education_level: "Grade 12",
      condition_pref: "good",
      budget: 2500,
      description: "Casio or similar. Need it before the November exam session.",
      status: "active",
      created_at: daysAgo(27),
      updated_at: daysAgo(27),
      expires_at: daysFromNow(3),
      author: u.ayesha,
    },
  ]

  const supportRequests: SupportRequest[] = [
    {
      id: "sr_1",
      user_id: u.bilal.id,
      title: "Looking for Class 11 Physics textbook",
      description: "I need a Physics textbook for my board exams. Any board is fine as long as the content is complete.",
      category_id: 1,
      subject: "Physics",
      education_level: "Grade 11",
      institution_id: null,
      location: "Lahore",
      condition_pref: "good",
      image_url: null,
      status: "active",
      created_at: daysAgo(3),
      updated_at: daysAgo(3),
      expires_at: daysFromNow(27),
      author: u.bilal,
    },
    {
      id: "sr_2",
      user_id: u.zara.id,
      title: "Need a scientific calculator for exams",
      description: "Looking for a Casio scientific calculator for my upcoming exams. Can't afford a new one right now.",
      category_id: 4,
      subject: null,
      education_level: "Grade 10",
      institution_id: null,
      location: "Islamabad",
      condition_pref: "good",
      image_url: null,
      status: "active",
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      expires_at: daysFromNow(29),
      author: u.zara,
    },
  ]

  // Conversation 1: Ayesha (seller) & Bilal about listing l_201
  const conv1 = { id: "c_1", listing_id: "l_201", wanted_id: null, last_message_at: daysAgo(0.2), last_message_preview: "Great, thanks! I'll take it.", created_at: daysAgo(2), updated_at: daysAgo(0.2) }
  // Conversation 2: Ayesha responding to Zara's wanted post w_302
  const conv2 = { id: "c_2", listing_id: null, wanted_id: "w_302", last_message_at: daysAgo(1), last_message_preview: "Hi Zara, I have the Biology book.", created_at: daysAgo(1), updated_at: daysAgo(1) }

  const messages: Message[] = [
    { id: "m_1", conversation_id: "c_1", sender_id: u.bilal.id, body: "Hi, is the Physics book still available? Do you have both parts?", created_at: daysAgo(2) },
    { id: "m_2", conversation_id: "c_1", sender_id: u.ayesha.id, body: "Yes both parts are available. Rs. 800 for the set.", created_at: daysAgo(1.8) },
    { id: "m_3", conversation_id: "c_1", sender_id: u.bilal.id, body: "Is there any writing inside?", created_at: daysAgo(0.5) },
    { id: "m_4", conversation_id: "c_1", sender_id: u.ayesha.id, body: "Only light pencil underlining in two chapters, easily erasable.", created_at: daysAgo(0.3) },
    { id: "m_5", conversation_id: "c_1", sender_id: u.bilal.id, body: "Great, thanks! I'll take it.", created_at: daysAgo(0.2) },
    { id: "m_6", conversation_id: "c_2", sender_id: u.ayesha.id, body: "Hi Zara, I have a Class 10 Biology textbook I can sell.", created_at: daysAgo(1) },
    { id: "m_7", conversation_id: "c_2", sender_id: u.zara.id, body: "Perfect! What condition is it in?", created_at: daysAgo(0.9) },
  ]

  const exchangeProposals: ExchangeProposal[] = [
    {
      id: "e_1",
      listing_id: "l_202",
      proposer_id: u.daniyal.id,
      offer_listing_id: "l_208",
      message: "I have a Calculus book I can offer — would you swap for the Chemistry set?",
      status: "pending",
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      proposer: u.daniyal,
      offer_listing: listings.find((l) => l.id === "l_208") ?? null,
    },
  ]

  const notifications: Notification[] = [
    { id: "n_1", user_id: u.ayesha.id, type: "exchange_proposal", title: "New exchange proposal", body: "Daniyal Shah wants to exchange Calculus for your Chemistry set.", link: "/exchanges", ref_id: "e_1", is_read: false, created_at: daysAgo(1) },
    { id: "n_2", user_id: u.ayesha.id, type: "message", title: "New message", body: "Bilal Ahmed: Great, thanks! I'll take it.", link: "/messages/c_1", ref_id: "c_1", is_read: false, created_at: daysAgo(0.2) },
    { id: "n_3", user_id: u.ayesha.id, type: "wanted_expiring_soon", title: "Your wanted post expires soon", body: "Your wanted post 'Scientific calculator for exams' expires in a few days.", link: "/wanted", ref_id: "w_304", is_read: true, created_at: daysAgo(1) },
    { id: "n_4", user_id: u.ayesha.id, type: "listing_expired", title: "Your listing expired", body: "Your listing 'Data Structures & Algorithms in Java' expired.", link: "/my-listings", ref_id: "l_210", is_read: true, created_at: daysAgo(2) },
  ]

  const reports: Report[] = [
    {
      id: "r_1",
      reporter_id: u.fatima.id,
      target_type: "user",
      target_id: u.mrshah.id,
      reason: "Spam or scam",
      details: "This account keeps messaging me about unrelated items.",
      status: "open",
      created_at: daysAgo(1),
      reviewed_at: null,
    },
  ]

  const institutionRequests: InstitutionRequest[] = [
    { id: "ir_1", user_id: u.zara.id, name: "City District Girls High School", type: "school", city: "Lahore", status: "pending", created_at: daysAgo(2) },
  ]

  return {
    institutions,
    profiles,
    privateDetails: {
      [u.ayesha.id]: { phone: "0300-1234567", gender: null, age: null },
    },
    categories,
    listings,
    listingImages,
    favorites: [],
    wantedPosts,
    wantedResponses: [],
    conversations: [conv1, conv2],
    participants: [
      { conversation_id: "c_1", user_id: u.ayesha.id, last_read_at: daysAgo(0.5) },
      { conversation_id: "c_1", user_id: u.bilal.id, last_read_at: daysAgo(0.2) },
      { conversation_id: "c_2", user_id: u.ayesha.id, last_read_at: daysAgo(0.8) },
      { conversation_id: "c_2", user_id: u.zara.id, last_read_at: daysAgo(0.9) },
    ],
    messages,
    exchangeProposals,
    notifications,
    reports,
    blocks: [],
    institutionRequests,
    supportRequests,
    authPasswords: {
      "demo@campusreuse.app": "DemoPass123!",
      "admin@campusreuse.app": "AdminPass123!",
      "bilal@campusreuse.app": "DemoPass123!",
      "fatima@campusreuse.app": "DemoPass123!",
      "daniyal@campusreuse.app": "DemoPass123!",
      "zara@campusreuse.app": "DemoPass123!",
      "mr_shah@campusreuse.app": "DemoPass123!",
    },
  }
}

function loadDb(): DemoDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const db = JSON.parse(raw) as DemoDB
      if (db && db.profiles && db.profiles.length) {
        enrichProfiles(db)
        return db
      }
    }
  } catch {
    /* fall through to reseed */
  }
  const db = buildSeed()
  enrichProfiles(db)
  saveDb(db)
  return db
}

/** Re-derive denormalized joins (seller, institution, category, images). */
function enrichProfiles(db: DemoDB) {
  const instById = new Map(db.institutions.map((i) => [i.id, i]))
  for (const p of db.profiles) {
    p.institution = p.institution_id ? instById.get(p.institution_id) ?? null : null
  }
  for (const l of db.listings) {
    l.seller = db.profiles.find((p) => p.id === l.seller_id) ?? null
    l.category = db.categories.find((c) => c.id === l.category_id) ?? null
    l.images = db.listingImages.filter((im) => im.listing_id === l.id).sort((a, b) => a.position - b.position)
  }
  for (const w of db.wantedPosts) {
    w.author = db.profiles.find((p) => p.id === w.user_id) ?? null
    w.category = db.categories.find((c) => c.id === w.category_id) ?? null
  }
}

function saveDb(db: DemoDB) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* storage full or unavailable — keep in memory */
  }
}

// ============================================================================
// Demo service
// ============================================================================

export class DemoService implements DataService {
  private db: DemoDB = loadDb()
  private sessionUserId: string | null = null
  private authListeners = new Set<(s: AuthSession | null) => void>()
  private messageListeners = new Map<string, Set<(m: Message) => void>>()
  private conversationListeners = new Set<() => void>()
  private notificationListeners = new Set<() => void>()

  constructor() {
    try {
      const s = localStorage.getItem(SESSION_KEY)
      if (s) this.sessionUserId = s
    } catch {
      this.sessionUserId = null
    }
    // Auto sign-in as the demo user on first load so the app is explorable.
    if (!this.sessionUserId && this.db.profiles.some((p) => p.username === "ayesha_khan")) {
      this.sessionUserId = this.db.profiles.find((p) => p.username === "ayesha_khan")!.id
    }
    this.expireStale()
    this.persist()
  }

  private get currentProfile(): UserProfile | null {
    return this.db.profiles.find((p) => p.id === this.sessionUserId) ?? null
  }

  private buildSession(): AuthSession | null {
    const p = this.currentProfile
    if (!p) return null
    const user: AuthUser = {
      id: p.id,
      email: this.emailForProfile(p),
      emailVerified: p.email_verified,
    }
    return { user, profile: p }
  }

  private emailForProfile(p: UserProfile): string {
    const map: Record<string, string> = {
      u_ayesha: "demo@campusreuse.app",
      u_admin: "admin@campusreuse.app",
      u_bilal: "bilal@campusreuse.app",
      u_fatima: "fatima@campusreuse.app",
      u_daniyal: "daniyal@campusreuse.app",
      u_zara: "zara@campusreuse.app",
      u_mrshah: "mr_shah@campusreuse.app",
    }
    return map[p.id] ?? `${p.username}@demo.local`
  }

  private emitAuth() {
    const s = this.buildSession()
    this.authListeners.forEach((cb) => cb(s))
  }
  private emitConversations() {
    this.conversationListeners.forEach((cb) => cb())
  }
  private emitNotifications() {
    this.notificationListeners.forEach((cb) => cb())
  }
  private notify(userId: string, type: string, title: string, body: string, link: string, refId?: string | null) {
    this.db.notifications.unshift({
      id: uid("n"),
      user_id: userId,
      type,
      title,
      body,
      link,
      ref_id: refId ?? null,
      is_read: false,
      created_at: nowIso(),
    })
  }
  private persist() {
    saveDb(this.db)
  }

  private expireStale() {
    const now = Date.now()
    for (const l of this.db.listings) {
      if ((l.status === "available" || l.status === "reserved") && new Date(l.expires_at).getTime() < now) {
        l.status = "expired"
        if (!this.db.notifications.some((n) => n.type === "listing_expired" && n.ref_id === l.id)) {
          this.notify(l.seller_id, "listing_expired", "Your listing expired", `Your listing "${l.title}" expired. Renew it if it is still available.`, "/my-listings", l.id)
        }
      }
    }
    for (const w of this.db.wantedPosts) {
      if (w.status === "active" && new Date(w.expires_at).getTime() < now) {
        w.status = "expired"
        if (!this.db.notifications.some((n) => n.type === "wanted_expired" && n.ref_id === w.id)) {
          this.notify(w.user_id, "wanted_expired", "Your wanted post expired", `Your wanted post "${w.title}" expired. Renew it if you are still looking.`, "/wanted", w.id)
        }
      }
    }
    this.persist()
  }

  // ==========================================================================
  // Auth
  // ==========================================================================

  async getSession(): Promise<AuthSession | null> {
    this.expireStale()
    return this.buildSession()
  }

  onAuthStateChange(cb: (session: AuthSession | null) => void): Unsubscribe {
    this.authListeners.add(cb)
    return () => this.authListeners.delete(cb)
  }

  async signUp(data: SignupData): Promise<{ error?: string; needsEmailConfirmation?: boolean }> {
    const email = data.email.trim().toLowerCase()
    if (this.db.authPasswords[email]) return { error: "An account with this email already exists." }
    if (this.db.profiles.some((p) => p.username === data.username)) return { error: "This username is already taken." }
    const id = uid("u")
    const profile: UserProfile = {
      id,
      display_name: data.displayName,
      username: data.username,
      account_type: data.accountType,
      education_level: data.educationLevel,
      program: data.program ?? null,
      institution_id: data.institutionId,
      bio: null,
      avatar_url: null,
      role: "user",
      email_verified: true,
      institution_verified: false,
      created_at: nowIso(),
    }
    this.db.profiles.push(profile)
    this.db.authPasswords[email] = data.password
    this.sessionUserId = id
    this.persist()
    this.emitAuth()
    return {}
  }

  async resendVerificationEmail(_email: string): Promise<{ error?: string; rateLimited?: boolean }> {
    return {}
  }

  async signIn(email: string, password: string): Promise<{ error?: string }> {
    const normalized = email.trim().toLowerCase()
    if (this.db.authPasswords[normalized] !== password) return { error: "Invalid email or password." }
    const p = this.db.profiles.find((p) => this.emailForProfile(p).toLowerCase() === normalized)
    if (!p) return { error: "Invalid email or password." }
    this.sessionUserId = p.id
    try {
      localStorage.setItem(SESSION_KEY, p.id)
    } catch { /* ignore */ }
    this.expireStale()
    this.emitAuth()
    return {}
  }

  async signOut(): Promise<void> {
    this.sessionUserId = null
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch { /* ignore */ }
    this.emitAuth()
  }

  async resetPassword(_email: string): Promise<{ error?: string }> {
    return {}
  }

  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    const p = this.currentProfile
    if (!p) return { error: "Not authenticated." }
    const email = this.emailForProfile(p)
    this.db.authPasswords[email] = newPassword
    this.persist()
    return {}
  }

  // ==========================================================================
  // Profiles
  // ==========================================================================

  async getProfile(id: string): Promise<UserProfile | null> {
    return this.db.profiles.find((p) => p.id === id) ?? null
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    return this.db.profiles.find((p) => p.username === username) ?? null
  }

  async getPrivateDetails(userId: string): Promise<PrivateDetails | null> {
    return this.db.privateDetails[userId] ?? null
  }

  async updateProfile(patch: Partial<UserProfile> & { id?: string }): Promise<{ error?: string }> {
    const targetId = patch.id ?? this.sessionUserId
    if (!targetId) return { error: "Not authenticated." }
    const profile = this.db.profiles.find((p) => p.id === targetId)
    if (!profile) return { error: "Profile not found." }
    const rest = { ...patch }
    delete rest.id
    delete rest.institution
    Object.assign(profile, rest)
    this.persist()
    this.emitAuth()
    return {}
  }

  async updatePrivateDetails(patch: Partial<PrivateDetails>): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    this.db.privateDetails[this.sessionUserId] = { ...(this.db.privateDetails[this.sessionUserId] ?? {}), ...patch }
    this.persist()
    return {}
  }

  // ==========================================================================
  // Institutions
  // ==========================================================================

  async listInstitutions(): Promise<Institution[]> {
    return [...this.db.institutions].sort((a, b) => a.name.localeCompare(b.name))
  }

  async searchInstitutions(query: string): Promise<Institution[]> {
    const q = query.trim().toLowerCase()
    if (!q) return this.listInstitutions()
    return this.db.institutions
      .filter((i) => i.name.toLowerCase().includes(q) || i.city.toLowerCase().includes(q))
      .slice(0, 20)
  }

  async requestInstitution(input: InstitutionRequestInput): Promise<{ id?: string; pending?: boolean; error?: string }> {
    const name = input.name.trim()
    let inst = this.db.institutions.find((i) => i.name.toLowerCase() === name.toLowerCase())
    if (!inst) {
      inst = { id: uid("inst"), name, type: input.type, city: input.city, is_verified: true, created_at: nowIso() }
      this.db.institutions.push(inst)
    }
    // If signed in, attach it to the profile and record the request.
    if (this.sessionUserId) {
      const p = this.db.profiles.find((x) => x.id === this.sessionUserId)
      if (p) {
        p.institution_id = inst.id
        p.institution_verified = true
      }
      this.db.institutionRequests.unshift({
        id: uid("ir"),
        user_id: this.sessionUserId,
        name,
        type: input.type,
        city: input.city,
        status: "approved",
        created_at: nowIso(),
      })
      enrichProfiles(this.db)
    }
    this.persist()
    return { id: inst.id }
  }

  async listMyInstitutionRequests(): Promise<{ id: string; name: string; status: string }[]> {
    if (!this.sessionUserId) return []
    return this.db.institutionRequests
      .filter((r) => r.user_id === this.sessionUserId)
      .map((r) => ({ id: r.id, name: r.name, status: r.status }))
  }

  // ==========================================================================
  // Listings
  // ==========================================================================

  private listingSearchable(l: Listing): string {
    return `${l.title} ${l.subject ?? ""} ${l.description}`.toLowerCase()
  }

  async listListings(filters: ListingFilters = {}): Promise<Listing[]> {
    let rows = [...this.db.listings]
    const statuses = filters.status ?? (filters.only_active ? ["available", "reserved"] : undefined)
    if (statuses?.length) rows = rows.filter((l) => statuses.includes(l.status))
    if (filters.exclude_sold) rows = rows.filter((l) => l.status !== "sold" && l.status !== "donated")
    if (filters.query) {
      const q = filters.query.trim().toLowerCase()
      rows = rows.filter((l) => this.listingSearchable(l).includes(q))
    }
    if (filters.category_id) rows = rows.filter((l) => l.category_id === filters.category_id)
    if (filters.institution_id) rows = rows.filter((l) => l.seller?.institution_id === filters.institution_id)
    if (filters.education_level) rows = rows.filter((l) => l.education_level === filters.education_level)
    if (filters.subject) rows = rows.filter((l) => (l.subject ?? "").toLowerCase().includes(filters.subject!.toLowerCase()))
    if (filters.transaction_type) rows = rows.filter((l) => l.transaction_type === filters.transaction_type)
    if (filters.condition) rows = rows.filter((l) => l.condition === filters.condition)
    if (filters.min_price != null) rows = rows.filter((l) => l.price != null && l.price >= filters.min_price!)
    if (filters.max_price != null) rows = rows.filter((l) => l.price != null && l.price <= filters.max_price!)

    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 100)
  }

  async getListing(id: string): Promise<Listing | null> {
    return this.db.listings.find((l) => l.id === id) ?? null
  }

  async getMyListings(): Promise<Listing[]> {
    if (!this.sessionUserId) return []
    return this.db.listings
      .filter((l) => l.seller_id === this.sessionUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createListing(input: ListingInput, images: File[]): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const id = uid("l")
    const l: Listing = {
      id,
      seller_id: this.sessionUserId,
      title: input.title,
      category_id: input.categoryId,
      subject: input.subject ?? null,
      education_level: input.educationLevel ?? null,
      condition: input.condition,
      description: input.description,
      transaction_type: input.transactionType,
      price: input.transactionType === "sell" ? input.price ?? null : null,
      exchange_want: input.transactionType === "exchange" ? input.exchangeWant ?? null : null,
      status: "available",
      created_at: nowIso(),
      updated_at: nowIso(),
      expires_at: daysFromNow(LISTING_TTL_DAYS),
      seller: this.currentProfile,
      category: this.db.categories.find((c) => c.id === input.categoryId) ?? null,
      images: [],
    }
    this.db.listings.unshift(l)
    if (images.length) {
      const urls = await Promise.all(images.map((f) => fileToDataUrl(f)))
      urls.forEach((url, i) => {
        this.db.listingImages.push({ id: uid("im"), listing_id: id, url, storage_path: null, position: i })
      })
      l.images = this.db.listingImages.filter((im) => im.listing_id === id).sort((a, b) => a.position - b.position)
    }
    this.persist()
    return { id }
  }

  async updateListing(id: string, input: Partial<ListingInput>, images?: File[]): Promise<{ error?: string }> {
    const l = this.db.listings.find((x) => x.id === id)
    if (!l) return { error: "Listing not found." }
    if (input.title !== undefined) l.title = input.title
    if (input.categoryId !== undefined) l.category_id = input.categoryId
    if (input.subject !== undefined) l.subject = input.subject ?? null
    if (input.educationLevel !== undefined) l.education_level = input.educationLevel ?? null
    if (input.condition !== undefined) l.condition = input.condition
    if (input.description !== undefined) l.description = input.description
    if (input.transactionType !== undefined) {
      l.transaction_type = input.transactionType
      l.price = input.transactionType === "sell" ? input.price ?? null : null
      l.exchange_want = input.transactionType === "exchange" ? input.exchangeWant ?? null : null
    }
    l.updated_at = nowIso()
    if (images && images.length) {
      const urls = await Promise.all(images.map((f) => fileToDataUrl(f)))
      const start = this.db.listingImages.filter((im) => im.listing_id === id).length
      urls.forEach((url, i) => {
        this.db.listingImages.push({ id: uid("im"), listing_id: id, url, storage_path: null, position: start + i })
      })
      l.images = this.db.listingImages.filter((im) => im.listing_id === id).sort((a, b) => a.position - b.position)
    }
    this.persist()
    return {}
  }

  async deleteListing(id: string): Promise<{ error?: string }> {
    this.db.listings = this.db.listings.filter((l) => l.id !== id)
    this.db.listingImages = this.db.listingImages.filter((im) => im.listing_id !== id)
    this.persist()
    return {}
  }

  async removeListingImage(imageId: string): Promise<{ error?: string }> {
    this.db.listingImages = this.db.listingImages.filter((im) => im.id !== imageId)
    this.persist()
    return {}
  }

  async setListingStatus(id: string, status: Listing["status"]): Promise<{ error?: string }> {
    const l = this.db.listings.find((x) => x.id === id)
    if (!l) return { error: "Listing not found." }
    l.status = status
    l.updated_at = nowIso()
    if (status === "sold") {
      this.notify(l.seller_id, "listing_sold", "Your listing was marked as sold", `"${l.title}" was marked as sold.`, "/my-listings", id)
    }
    if (status === "donated") {
      this.notify(l.seller_id, "listing_donated", "Your listing was marked as donated", `"${l.title}" was marked as donated.`, "/my-listings", id)
    }
    this.persist()
    return {}
  }

  async renewListing(id: string): Promise<{ error?: string }> {
    const l = this.db.listings.find((x) => x.id === id)
    if (!l) return { error: "Listing not found." }
    l.status = "available"
    l.expires_at = daysFromNow(LISTING_TTL_DAYS)
    l.updated_at = nowIso()
    this.persist()
    return {}
  }

  // ==========================================================================
  // Favorites
  // ==========================================================================

  async getFavorites(): Promise<Listing[]> {
    if (!this.sessionUserId) return []
    const favIds = this.db.favorites.filter((f) => f.user_id === this.sessionUserId).map((f) => f.listing_id)
    return this.db.listings
      .filter((l) => favIds.includes(l.id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async isFavorite(listingId: string): Promise<boolean> {
    return Boolean(this.sessionUserId && this.db.favorites.some((f) => f.user_id === this.sessionUserId && f.listing_id === listingId))
  }

  async addFavorite(listingId: string): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    if (!this.db.favorites.some((f) => f.user_id === this.sessionUserId && f.listing_id === listingId)) {
      this.db.favorites.push({ id: uid("f"), user_id: this.sessionUserId, listing_id: listingId, created_at: nowIso() })
      this.persist()
    }
    return {}
  }

  async removeFavorite(listingId: string): Promise<{ error?: string }> {
    this.db.favorites = this.db.favorites.filter((f) => !(f.user_id === this.sessionUserId && f.listing_id === listingId))
    this.persist()
    return {}
  }

  // ==========================================================================
  // Wanted
  // ==========================================================================

  private wantedSearchable(w: WantedPost): string {
    return `${w.title} ${w.subject ?? ""} ${w.description}`.toLowerCase()
  }

  async listWanted(filters: WantedFilters = {}): Promise<WantedPost[]> {
    let rows = [...this.db.wantedPosts]
    const statuses = filters.status ?? ["active"]
    rows = rows.filter((w) => statuses.includes(w.status))
    if (filters.query) {
      const q = filters.query.trim().toLowerCase()
      rows = rows.filter((w) => this.wantedSearchable(w).includes(q))
    }
    if (filters.category_id) rows = rows.filter((w) => w.category_id === filters.category_id)
    for (const w of rows) {
      w.response_count = this.db.wantedResponses.filter((r) => r.wanted_id === w.id).length
    }
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 60)
  }

  async getWanted(id: string): Promise<WantedPost | null> {
    const w = this.db.wantedPosts.find((x) => x.id === id)
    if (!w) return null
    w.response_count = this.db.wantedResponses.filter((r) => r.wanted_id === w.id).length
    return w
  }

  async getMyWanted(): Promise<WantedPost[]> {
    if (!this.sessionUserId) return []
    return this.db.wantedPosts
      .filter((w) => w.user_id === this.sessionUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createWanted(input: WantedInput): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const w: WantedPost = {
      id: uid("w"),
      user_id: this.sessionUserId,
      title: input.title,
      category_id: input.categoryId,
      subject: input.subject ?? null,
      education_level: input.educationLevel ?? null,
      condition_pref: input.conditionPref ?? null,
      budget: input.budget ?? null,
      description: input.description,
      status: "active",
      created_at: nowIso(),
      updated_at: nowIso(),
      expires_at: daysFromNow(WANTED_TTL_DAYS),
      author: this.currentProfile,
      category: this.db.categories.find((c) => c.id === input.categoryId) ?? null,
      response_count: 0,
    }
    this.db.wantedPosts.unshift(w)
    this.persist()
    return { id: w.id }
  }

  async updateWanted(id: string, input: Partial<WantedInput>): Promise<{ error?: string }> {
    const w = this.db.wantedPosts.find((x) => x.id === id)
    if (!w) return { error: "Wanted post not found." }
    if (input.title !== undefined) w.title = input.title
    if (input.categoryId !== undefined) w.category_id = input.categoryId
    if (input.subject !== undefined) w.subject = input.subject ?? null
    if (input.educationLevel !== undefined) w.education_level = input.educationLevel ?? null
    if (input.conditionPref !== undefined) w.condition_pref = input.conditionPref ?? null
    if (input.budget !== undefined) w.budget = input.budget ?? null
    if (input.description !== undefined) w.description = input.description
    w.updated_at = nowIso()
    this.persist()
    return {}
  }

  async deleteWanted(id: string): Promise<{ error?: string }> {
    this.db.wantedPosts = this.db.wantedPosts.filter((w) => w.id !== id)
    this.db.wantedResponses = this.db.wantedResponses.filter((r) => r.wanted_id !== id)
    this.persist()
    return {}
  }

  async renewWanted(id: string): Promise<{ error?: string }> {
    const w = this.db.wantedPosts.find((x) => x.id === id)
    if (!w) return { error: "Wanted post not found." }
    w.status = "active"
    w.expires_at = daysFromNow(WANTED_TTL_DAYS)
    w.updated_at = nowIso()
    this.persist()
    return {}
  }

  async markWantedFulfilled(id: string): Promise<{ error?: string }> {
    const w = this.db.wantedPosts.find((x) => x.id === id)
    if (!w) return { error: "Wanted post not found." }
    w.status = "fulfilled"
    w.updated_at = nowIso()
    this.persist()
    return {}
  }

  async respondToWanted(wantedId: string, message: string): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const w = this.db.wantedPosts.find((x) => x.id === wantedId)
    if (!w) return { error: "Wanted post not found." }
    if (w.user_id === this.sessionUserId) return { error: "You cannot respond to your own post." }
    if (this.isBlockedPair(this.sessionUserId, w.user_id)) return { error: "Messaging is not available with this user." }

    this.db.wantedResponses.push({ id: uid("wr"), wanted_id: wantedId, responder_id: this.sessionUserId, message: message || "Hi! I saw your wanted post.", created_at: nowIso() })

    const conv = {
      id: uid("c"),
      listing_id: null,
      wanted_id: wantedId,
      last_message_at: nowIso(),
      last_message_preview: (message || "Hi! I saw your wanted post.").slice(0, 100),
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    this.db.conversations.unshift(conv)
    this.db.participants.push(
      { conversation_id: conv.id, user_id: this.sessionUserId, last_read_at: nowIso() },
      { conversation_id: conv.id, user_id: w.user_id, last_read_at: daysAgo(1) },
    )
    this.db.messages.push({
      id: uid("m"),
      conversation_id: conv.id,
      sender_id: this.sessionUserId,
      body: message || "Hi! I saw your wanted post.",
      created_at: nowIso(),
    })
    this.notify(w.user_id, "wanted_response", "Response to your wanted post", `Someone responded to your wanted post "${w.title}".`, `/messages/${conv.id}`, wantedId)

    this.persist()
    this.emitConversations()
    this.emitNotifications()
    return { id: conv.id }
  }

  // ==========================================================================
  // Support Requests
  // ==========================================================================

  async listSupportRequests(filters: SupportRequestFilters = {}): Promise<SupportRequest[]> {
    let rows = [...this.db.supportRequests]
    const statuses = filters.status ?? ["active"]
    rows = rows.filter((r) => statuses.includes(r.status as SupportRequest["status"]))
    if (filters.query) {
      const q = filters.query.trim().toLowerCase()
      rows = rows.filter((r) => `${r.title} ${r.subject ?? ""} ${r.description}`.toLowerCase().includes(q))
    }
    if (filters.category_id) rows = rows.filter((r) => r.category_id === filters.category_id)
    if (filters.institution_id) rows = rows.filter((r) => r.institution_id === filters.institution_id)
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 60)
  }

  async getSupportRequest(id: string): Promise<SupportRequest | null> {
    return this.db.supportRequests.find((r) => r.id === id) ?? null
  }

  async getMySupportRequests(): Promise<SupportRequest[]> {
    if (!this.sessionUserId) return []
    return this.db.supportRequests
      .filter((r) => r.user_id === this.sessionUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createSupportRequest(input: SupportRequestInput): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const sr: SupportRequest = {
      id: uid("sr"),
      user_id: this.sessionUserId,
      title: input.title,
      description: input.description,
      category_id: input.categoryId ?? null,
      subject: input.subject ?? null,
      education_level: input.educationLevel ?? null,
      institution_id: input.institutionId ?? null,
      location: input.location ?? null,
      condition_pref: input.conditionPref ?? null,
      image_url: input.imageUrl ?? null,
      status: "active",
      created_at: nowIso(),
      updated_at: nowIso(),
      expires_at: daysFromNow(WANTED_TTL_DAYS),
      author: this.currentProfile,
      category: input.categoryId ? this.db.categories.find((c) => c.id === input.categoryId) ?? null : null,
    }
    this.db.supportRequests.unshift(sr)
    this.persist()
    return { id: sr.id }
  }

  async updateSupportRequest(id: string, input: Partial<SupportRequestInput>): Promise<{ error?: string }> {
    const sr = this.db.supportRequests.find((r) => r.id === id)
    if (!sr) return { error: "Support request not found." }
    if (input.title !== undefined) sr.title = input.title
    if (input.description !== undefined) sr.description = input.description
    if (input.categoryId !== undefined) sr.category_id = input.categoryId ?? null
    if (input.subject !== undefined) sr.subject = input.subject ?? null
    if (input.educationLevel !== undefined) sr.education_level = input.educationLevel ?? null
    if (input.institutionId !== undefined) sr.institution_id = input.institutionId ?? null
    if (input.location !== undefined) sr.location = input.location ?? null
    if (input.conditionPref !== undefined) sr.condition_pref = input.conditionPref ?? null
    if (input.imageUrl !== undefined) sr.image_url = input.imageUrl ?? null
    sr.updated_at = nowIso()
    this.persist()
    return {}
  }

  async deleteSupportRequest(id: string): Promise<{ error?: string }> {
    this.db.supportRequests = this.db.supportRequests.filter((r) => r.id !== id)
    this.persist()
    return {}
  }

  async markSupportRequestFulfilled(id: string): Promise<{ error?: string }> {
    const sr = this.db.supportRequests.find((r) => r.id === id)
    if (!sr) return { error: "Support request not found." }
    sr.status = "fulfilled"
    sr.updated_at = nowIso()
    this.persist()
    return {}
  }

  async offerHelp(requestId: string, message: string): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const sr = this.db.supportRequests.find((r) => r.id === requestId)
    if (!sr) return { error: "Support request not found." }
    if (sr.user_id === this.sessionUserId) return { error: "You cannot offer help on your own request." }
    if (this.isBlockedPair(this.sessionUserId, sr.user_id)) return { error: "Messaging is not available with this user." }

    // Check for existing conversation
    let conv = this.db.conversations.find((c) => c.wanted_id === requestId && this.db.participants.some((p) => p.conversation_id === c.id && p.user_id === this.sessionUserId) && this.db.participants.some((p) => p.conversation_id === c.id && p.user_id === sr.user_id))

    if (!conv) {
      conv = { id: uid("c"), listing_id: null, wanted_id: requestId, last_message_at: nowIso(), last_message_preview: message.trim().slice(0, 100), created_at: nowIso(), updated_at: nowIso() }
      this.db.conversations.unshift(conv)
      this.db.participants.push(
        { conversation_id: conv.id, user_id: this.sessionUserId, last_read_at: nowIso() },
        { conversation_id: conv.id, user_id: sr.user_id, last_read_at: daysAgo(1) },
      )
    }

    this.db.messages.push({
      id: uid("m"),
      conversation_id: conv.id,
      sender_id: this.sessionUserId,
      body: message.trim(),
      created_at: nowIso(),
    })
    conv.last_message_at = nowIso()
    conv.last_message_preview = message.trim().slice(0, 100)
    conv.updated_at = nowIso()

    this.notify(sr.user_id, "wanted_response", "Someone wants to help!", `A student offered to help with your request.`, `/messages/${conv.id}`, requestId)
    this.persist()
    this.emitConversations()
    this.emitNotifications()
    return { id: conv.id }
  }

  // ==========================================================================
  // Messaging
  // ==========================================================================

  private isBlockedPair(a: string, b: string): boolean {
    return this.db.blocks.some((bl) => (bl.blocker_id === a && bl.blocked_id === b) || (bl.blocker_id === b && bl.blocked_id === a))
  }

  private conversationFromRow(row: DemoDB["conversations"][number]): Conversation {
    const meId = this.sessionUserId!
    const otherId = this.db.participants.find((p) => p.conversation_id === row.id && p.user_id !== meId)?.user_id
    const other = this.db.profiles.find((p) => p.id === otherId) ?? null
    const listing = row.listing_id ? this.db.listings.find((l) => l.id === row.listing_id) ?? null : null
    const wanted = row.wanted_id ? this.db.wantedPosts.find((w) => w.id === row.wanted_id) ?? null : null
    const myParticipant = this.db.participants.find((p) => p.conversation_id === row.id && p.user_id === meId)
    return {
      id: row.id,
      listing_id: row.listing_id,
      wanted_id: row.wanted_id,
      last_message_at: row.last_message_at,
      last_message_preview: row.last_message_preview,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_read_at: myParticipant?.last_read_at ?? null,
      other_participant: other,
      listing,
      wanted,
    }
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.sessionUserId) return []
    const myConvIds = this.db.participants.filter((p) => p.user_id === this.sessionUserId).map((p) => p.conversation_id)
    return this.db.conversations
      .filter((c) => myConvIds.includes(c.id))
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      .map((c) => this.conversationFromRow(c))
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const row = this.db.conversations.find((c) => c.id === id)
    if (!row) return null
    if (!this.db.participants.some((p) => p.conversation_id === id && p.user_id === this.sessionUserId)) return null
    return this.conversationFromRow(row)
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.db.messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  async startConversation(listingId: string): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const l = this.db.listings.find((x) => x.id === listingId)
    if (!l) return { error: "Listing not found." }
    if (l.seller_id === this.sessionUserId) return { error: "You cannot message yourself." }
    if (this.isBlockedPair(this.sessionUserId, l.seller_id)) return { error: "Messaging is not available with this user." }

    let conv = this.db.conversations.find((c) => c.listing_id === listingId && this.db.participants.some((p) => p.conversation_id === c.id && p.user_id === this.sessionUserId) && this.db.participants.some((p) => p.conversation_id === c.id && p.user_id === l.seller_id))
    if (!conv) {
      conv = { id: uid("c"), listing_id: listingId, wanted_id: null, last_message_at: nowIso(), last_message_preview: "", created_at: nowIso(), updated_at: nowIso() }
      this.db.conversations.unshift(conv)
      this.db.participants.push(
        { conversation_id: conv.id, user_id: this.sessionUserId, last_read_at: nowIso() },
        { conversation_id: conv.id, user_id: l.seller_id, last_read_at: nowIso() },
      )
      this.persist()
      this.emitConversations()
    }
    return { id: conv.id }
  }

  async sendMessage(conversationId: string, body: string): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const trimmed = body.trim()
    if (!trimmed) return { error: "Message cannot be empty." }
    if (!this.db.participants.some((p) => p.conversation_id === conversationId && p.user_id === this.sessionUserId)) {
      return { error: "You are not part of this conversation." }
    }
    const conv = this.db.conversations.find((c) => c.id === conversationId)
    if (!conv) return { error: "Conversation not found." }
    const otherId = this.db.participants.find((p) => p.conversation_id === conversationId && p.user_id !== this.sessionUserId)?.user_id
    if (otherId && this.isBlockedPair(this.sessionUserId, otherId)) return { error: "Messaging is not available with this user." }

    const msg: Message = { id: uid("m"), conversation_id: conversationId, sender_id: this.sessionUserId, body: trimmed, created_at: nowIso() }
    this.db.messages.push(msg)
    conv.last_message_at = nowIso()
    conv.last_message_preview = trimmed.slice(0, 100)
    conv.updated_at = nowIso()

    if (otherId) {
      this.notify(otherId, "message", "New message", `${this.currentProfile?.display_name ?? "Someone"}: ${trimmed.slice(0, 120)}`, `/messages/${conversationId}`, conversationId)
      this.emitNotifications()
    }
    this.persist()
    this.messageListeners.get(conversationId)?.forEach((cb) => cb(msg))
    this.emitConversations()
    return {}
  }

  async markConversationRead(conversationId: string): Promise<void> {
    if (!this.sessionUserId) return
    const p = this.db.participants.find((x) => x.conversation_id === conversationId && x.user_id === this.sessionUserId)
    if (p) p.last_read_at = nowIso()
    this.persist()
  }

  async getUnreadMessageCount(): Promise<number> {
    if (!this.sessionUserId) return 0
    let count = 0
    for (const c of this.db.conversations) {
      const me = this.db.participants.find((p) => p.conversation_id === c.id && p.user_id === this.sessionUserId)
      if (me && new Date(c.last_message_at).getTime() > new Date(me.last_read_at).getTime()) count++
    }
    return count
  }

  subscribeToMessages(conversationId: string, cb: (message: Message) => void): Unsubscribe {
    let set = this.messageListeners.get(conversationId)
    if (!set) {
      set = new Set()
      this.messageListeners.set(conversationId, set)
    }
    set.add(cb)
    return () => set?.delete(cb)
  }

  subscribeToConversations(cb: () => void): Unsubscribe {
    this.conversationListeners.add(cb)
    return () => this.conversationListeners.delete(cb)
  }

  // ==========================================================================
  // Exchange
  // ==========================================================================

  async getMyExchangeProposals(): Promise<ExchangeProposal[]> {
    if (!this.sessionUserId) return []
    const rows = this.db.exchangeProposals
      .filter((e) => {
        const l = this.db.listings.find((x) => x.id === e.listing_id)
        return e.proposer_id === this.sessionUserId || l?.seller_id === this.sessionUserId
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return rows.map((e) => this.decorateProposal(e))
  }

  async getProposalsForListing(listingId: string): Promise<ExchangeProposal[]> {
    return this.db.exchangeProposals
      .filter((e) => e.listing_id === listingId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((e) => this.decorateProposal(e))
  }

  private decorateProposal(e: ExchangeProposal): ExchangeProposal {
    e.proposer = this.db.profiles.find((p) => p.id === e.proposer_id) ?? null
    e.listing = this.db.listings.find((l) => l.id === e.listing_id) ?? null
    e.offer_listing = e.offer_listing_id ? this.db.listings.find((l) => l.id === e.offer_listing_id) ?? null : null
    return e
  }

  async proposeExchange(listingId: string, offerListingId: string, message?: string): Promise<{ id?: string; error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const target = this.db.listings.find((l) => l.id === listingId)
    if (!target) return { error: "Listing not found." }
    if (target.transaction_type !== "exchange") return { error: "This listing is not an exchange." }
    if (target.seller_id === this.sessionUserId) return { error: "You cannot propose an exchange on your own listing." }
    const offer = this.db.listings.find((l) => l.id === offerListingId)
    if (!offer || offer.seller_id !== this.sessionUserId) return { error: "Choose one of your own listings to offer." }
    if (offer.status !== "available") return { error: "The offered listing must be available." }
    if (this.isBlockedPair(this.sessionUserId, target.seller_id)) return { error: "Exchanges are not available with this user." }
    if (this.db.exchangeProposals.some((e) => e.listing_id === listingId && e.proposer_id === this.sessionUserId && (e.status === "pending" || e.status === "accepted"))) {
      return { error: "You already have an active proposal for this listing." }
    }
    const prop: ExchangeProposal = {
      id: uid("e"),
      listing_id: listingId,
      proposer_id: this.sessionUserId,
      offer_listing_id: offerListingId,
      message: message ?? null,
      status: "pending",
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    this.db.exchangeProposals.unshift(prop)
    this.notify(target.seller_id, "exchange_proposal", "New exchange proposal", `${this.currentProfile?.display_name ?? "Someone"} wants to exchange for your listing "${target.title}".`, `/listings/${listingId}`, listingId)
    this.persist()
    this.emitNotifications()
    return { id: prop.id }
  }

  async updateExchangeProposal(id: string, status: string): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    const e = this.db.exchangeProposals.find((x) => x.id === id)
    if (!e) return { error: "Proposal not found." }
    const listing = this.db.listings.find((l) => l.id === e.listing_id)
    const isOwner = listing?.seller_id === this.sessionUserId
    const isProposer = e.proposer_id === this.sessionUserId

    if (status === "accepted" || status === "declined") {
      if (!isOwner) return { error: "Only the listing owner can accept or decline." }
      if (e.status !== "pending") return { error: "Proposal is no longer pending." }
    } else if (status === "cancelled") {
      if (!isProposer) return { error: "Only the proposer can cancel." }
      if (e.status !== "pending" && e.status !== "accepted") return { error: "Proposal cannot be cancelled in its current state." }
    } else if (status === "completed") {
      if (!isOwner && !isProposer) return { error: "Only participants can complete an exchange." }
      if (e.status !== "accepted") return { error: "Only accepted proposals can be completed." }
    } else {
      return { error: "Invalid status." }
    }

    e.status = status as ExchangeProposal["status"]
    e.updated_at = nowIso()
    if (status === "accepted") {
      this.notify(e.proposer_id, "exchange_accepted", "Exchange accepted", `The owner accepted your exchange proposal for "${listing?.title}". Arrange the exchange and mark it complete.`, "/exchanges", e.id)
    } else if (status === "declined") {
      this.notify(e.proposer_id, "exchange_declined", "Exchange declined", `The owner declined your exchange proposal for "${listing?.title}".`, "/exchanges", e.id)
    }
    this.persist()
    this.emitNotifications()
    return {}
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================

  async getNotifications(): Promise<Notification[]> {
    if (!this.sessionUserId) return []
    return this.db.notifications
      .filter((n) => n.user_id === this.sessionUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async markNotificationRead(id: string): Promise<void> {
    const n = this.db.notifications.find((x) => x.id === id)
    if (n) n.is_read = true
    this.persist()
  }

  async markAllNotificationsRead(): Promise<void> {
    for (const n of this.db.notifications) {
      if (n.user_id === this.sessionUserId) n.is_read = true
    }
    this.persist()
  }

  async getUnreadNotificationCount(): Promise<number> {
    if (!this.sessionUserId) return 0
    return this.db.notifications.filter((n) => n.user_id === this.sessionUserId && !n.is_read).length
  }

  subscribeToNotifications(cb: () => void): Unsubscribe {
    this.notificationListeners.add(cb)
    return () => this.notificationListeners.delete(cb)
  }

  // ==========================================================================
  // Safety
  // ==========================================================================

  async report(targetType: ReportTargetType, targetId: string, reason: string, details?: string): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    this.db.reports.unshift({
      id: uid("r"),
      reporter_id: this.sessionUserId,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details ?? null,
      status: "open",
      created_at: nowIso(),
      reviewed_at: null,
    })
    this.persist()
    return {}
  }

  async blockUser(userId: string): Promise<{ error?: string }> {
    if (!this.sessionUserId) return { error: "Not authenticated." }
    if (this.sessionUserId === userId) return { error: "You cannot block yourself." }
    if (!this.db.blocks.some((b) => b.blocker_id === this.sessionUserId && b.blocked_id === userId)) {
      this.db.blocks.push({ id: uid("b"), blocker_id: this.sessionUserId, blocked_id: userId, created_at: nowIso() })
      this.persist()
    }
    return {}
  }

  async unblockUser(userId: string): Promise<{ error?: string }> {
    this.db.blocks = this.db.blocks.filter((b) => !(b.blocker_id === this.sessionUserId && b.blocked_id === userId))
    this.persist()
    return {}
  }

  async getBlockedUsers(): Promise<Block[]> {
    return this.db.blocks.filter((b) => b.blocker_id === this.sessionUserId)
  }

  async isBlocked(userId: string): Promise<boolean> {
    if (!this.sessionUserId) return false
    return this.db.blocks.some((b) => b.blocker_id === this.sessionUserId && b.blocked_id === userId)
  }

  // ==========================================================================
  // Uploads (demo: local file → data URL, no server storage)
  // ==========================================================================

  async uploadListingImages(_listingId: string, files: File[]): Promise<{ urls?: string[]; error?: string }> {
    const urls = await Promise.all(files.map((f) => fileToDataUrl(f)))
    return { urls }
  }

  async uploadAvatar(file: File): Promise<{ url?: string; error?: string }> {
    const url = await fileToDataUrl(file)
    return { url }
  }

  // ==========================================================================
  // Admin (demo: operates on the local store)
  // ==========================================================================

  async getAdminStats(): Promise<{ listings: number; users: number; openReports: number; pendingInstitutionRequests: number; wantedPosts: number }> {
    return {
      listings: this.db.listings.filter((l) => l.status === "available" || l.status === "reserved").length,
      users: this.db.profiles.length,
      openReports: this.db.reports.filter((r) => r.status === "open").length,
      pendingInstitutionRequests: this.db.institutionRequests.filter((r) => r.status === "pending").length,
      wantedPosts: this.db.wantedPosts.filter((w) => w.status === "active").length,
    }
  }

  async getReports(): Promise<Report[]> {
    return [...this.db.reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async updateReport(id: string, status: ReportStatus): Promise<{ error?: string }> {
    const r = this.db.reports.find((x) => x.id === id)
    if (r) {
      r.status = status
      r.reviewed_at = nowIso()
      this.persist()
    }
    return {}
  }

  async getInstitutionRequests(): Promise<{ id: string; name: string; type: string; city: string; status: string; user: UserProfile }[]> {
    return this.db.institutionRequests.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      city: r.city,
      status: r.status,
      user: this.db.profiles.find((p) => p.id === r.user_id)!,
    }))
  }

  async reviewInstitutionRequest(id: string, status: "approved" | "rejected" | "duplicate", _note?: string): Promise<{ error?: string }> {
    const r = this.db.institutionRequests.find((x) => x.id === id)
    if (!r) return { error: "Request not found." }
    if (status === "approved" && !this.db.institutions.some((i) => i.name.toLowerCase() === r.name.toLowerCase())) {
      const inst: Institution = { id: uid("inst"), name: r.name, type: r.type as Institution["type"], city: r.city, is_verified: false, created_at: nowIso() }
      this.db.institutions.push(inst)
      const p = this.db.profiles.find((x) => x.id === r.user_id)
      if (p) p.institution_id = inst.id
      enrichProfiles(this.db)
    }
    r.status = status
    this.persist()
    return {}
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const q = query.trim().toLowerCase()
    if (!q) return [...this.db.profiles].slice(0, 30)
    return this.db.profiles
      .filter((p) => p.display_name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q))
      .slice(0, 30)
  }

  async adminRemoveListing(id: string): Promise<{ error?: string }> {
    return this.deleteListing(id)
  }

  async adminDeleteUserProfile(id: string): Promise<{ error?: string }> {
    this.db.profiles = this.db.profiles.filter((p) => p.id !== id)
    this.persist()
    return {}
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Could not read file."))
    reader.readAsDataURL(file)
  })
}
