import { UserDTO, QuoteRequestDTO, BookingDTO, CartItemDTO, OrderDTO, TicketDTO, UserRole, ProfileType, ProfileSubscriptionDTO, UserProfileDataDTO, ProductDTO } from "../shared/contracts/types";
import { eventBus, EVENTS } from "../shared/events/event-bus";
import { PROFILES_METADATA, buildDefaultUserProfiles } from "../config/profilesConfig";
// Firestore imports removed

class Store {
  isLoggedIn: boolean = false;

  currentUser: UserDTO = {
    id: "guest",
    fullName: "Visiteur / Invité",
    email: "invite@senauratech.sn",
    phone: "+221",
    role: "CLIENT",
    activeProfile: "CLIENT",
    profiles: buildDefaultUserProfiles({ id: "guest", fullName: "Visiteur / Invité", role: "CLIENT" }),
    region: "Dakar",
    verified: false,
    createdAt: new Date().toISOString(),
  };

  quotes: QuoteRequestDTO[] = [];
  bookings: BookingDTO[] = [];
  orders: OrderDTO[] = [];
  cart: CartItemDTO[] = [];
  enrolledCourseIds: string[] = [];
  tickets: TicketDTO[] = [];
  products: any[] = [];
  courses: any[] = [];
  providers: any[] = [];

  constructor() {
    // 1. Initialiser le chargement depuis Neon DB & Firestore
    this.initDatabaseSync();
  }

  private async initDatabaseSync() {
    // Synchronisation Neon PostgreSQL
    try {
      const [quotesRes, bookingsRes, ordersRes, productsRes, coursesRes, providersRes] = await Promise.all([
        fetch("/api/db/quotes").then((r) => r.json()).catch(() => ({ quotes: [] })),
        fetch("/api/db/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
        fetch("/api/db/orders").then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch("/api/db/products").then((r) => r.json()).catch(() => ({ products: [] })),
        fetch("/api/db/courses").then((r) => r.json()).catch(() => ({ courses: [] })),
        fetch("/api/db/providers").then((r) => r.json()).catch(() => ({ providers: [] })),
      ]);

      if (quotesRes?.quotes && quotesRes.quotes.length > 0) {
        this.quotes = quotesRes.quotes;
      }
      if (bookingsRes?.bookings && bookingsRes.bookings.length > 0) {
        this.bookings = bookingsRes.bookings;
      }
      if (ordersRes?.orders && ordersRes.orders.length > 0) {
        this.orders = ordersRes.orders;
      }
      if (productsRes?.products && productsRes.products.length > 0) {
        this.products = productsRes.products;
      }
      if (coursesRes?.courses && coursesRes.courses.length > 0) {
        this.courses = coursesRes.courses;
      }
      if (providersRes?.providers && providersRes.providers.length > 0) {
        this.providers = providersRes.providers;
      }
    } catch (e) {
      console.info("Neon fetch initialization fallback");
    }

    // 2. Real-time Firebase Firestore Sync (DISABLED to rely purely on Neon DB)
    // subscribeQuotesFromFirestore((updatedQuotes) => { ... });
    // subscribeBookingsFromFirestore((updatedBookings) => { ... });
    // subscribeOrdersFromFirestore((updatedOrders) => { ... });
  }

  async loginWithPhone(
    phone: string,
    fullName: string,
    role: UserRole,
    region: string,
    pin: string = "1234",
    proStatus?: any,
    trialExpiresAt?: string,
    proApproved?: boolean
  ) {
    const isPro = role === "PROFESSIONAL" || role === "FORMATEUR" || role === "VENDEUR";
    const initialProStatus = proStatus || (isPro ? "EN_ATTENTE" : undefined);
    const initialApproved = proApproved !== undefined ? proApproved : !isPro;

    const safeName = fullName || "Utilisateur SEN AURA";
    const user: UserDTO = {
      id: `user-${Date.now().toString().slice(-4)}`,
      fullName: safeName,
      email: `${safeName.toLowerCase().replace(/\s+/g, ".")}@senauratech.sn`,
      phone: phone.startsWith("+221") ? phone : `+221 ${phone}`,
      role: role || "CLIENT",
      activeProfile: (role as ProfileType) || "CLIENT",
      profiles: buildDefaultUserProfiles({ id: `user-${Date.now().toString().slice(-4)}`, fullName, role, region }),
      region: region || "Dakar",
      verified: true,
      proStatus: initialProStatus,
      proApproved: initialApproved,
      trialExpiresAt: trialExpiresAt,
      proFreeTrialActive: initialProStatus === "ESSAI_GRATUIT",
      createdAt: new Date().toISOString(),
    };
    this.currentUser = user;
    this.isLoggedIn = true;

    // Sync to Neon PostgreSQL
    try {
      fetch("/api/db/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pin }),
      }).catch(() => null);
    } catch {}

    eventBus.publish(EVENTS.ROLE_CHANGED, role);
    eventBus.publish("PROFILE_SWITCHED", (role as ProfileType) || "CLIENT");
  }

  isProFreeTrialActive(): boolean {
    if (!this.currentUser.trialExpiresAt) return false;
    return new Date(this.currentUser.trialExpiresAt).getTime() > Date.now();
  }

  // --- MULTI-PROFILE & SUBSCRIPTIONS MANAGEMENT ---
  switchProfile(profileType: ProfileType) {
    if (!this.currentUser.profiles) {
      this.currentUser.profiles = buildDefaultUserProfiles(this.currentUser);
    }

    // If profile exists and is active, switch to it
    this.currentUser = {
      ...this.currentUser,
      role: profileType as UserRole,
      activeProfile: profileType,
    };
    this.isLoggedIn = true;

    eventBus.publish(EVENTS.ROLE_CHANGED, profileType);
    eventBus.publish("PROFILE_SWITCHED", profileType);
  }

  activateProfile(
    profileType: ProfileType,
    profileInfo: {
      displayName?: string;
      companyOrBoutiqueName?: string;
      academyName?: string;
      professionOrCategory?: string;
      bioOrDescription?: string;
      region?: string;
      address?: string;
    },
    subscriptionDetails: {
      planId: string;
      planName: string;
      billingCycle: "MONTHLY" | "YEARLY" | "LIFETIME" | "FREE";
      priceFCFA: number;
      paymentMethod?: "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "CARD" | "FREE";
      isTrial?: boolean;
    }
  ) {
    if (!this.currentUser.profiles) {
      this.currentUser.profiles = buildDefaultUserProfiles(this.currentUser);
    }

    const now = new Date();
    const meta = PROFILES_METADATA[profileType];
    const expiry = new Date(now);
    if (subscriptionDetails.billingCycle === "YEARLY") {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    const trialEnds = new Date(now);
    trialEnds.setDate(trialEnds.getDate() + 30);

    const newProfileData: UserProfileDataDTO = {
      type: profileType,
      active: true,
      title: meta?.title || profileType,
      displayName: profileInfo.displayName || this.currentUser.fullName,
      companyOrBoutiqueName: profileInfo.companyOrBoutiqueName,
      academyName: profileInfo.academyName,
      professionOrCategory: profileInfo.professionOrCategory,
      bioOrDescription: profileInfo.bioOrDescription,
      region: profileInfo.region || this.currentUser.region,
      address: profileInfo.address,
      subscription: {
        profileType: profileType,
        planId: subscriptionDetails.planId,
        planName: subscriptionDetails.planName,
        billingCycle: subscriptionDetails.billingCycle,
        priceFCFA: subscriptionDetails.priceFCFA,
        status: subscriptionDetails.isTrial ? "TRIAL" : "ACTIVE",
        trialEndsAt: subscriptionDetails.isTrial ? trialEnds.toISOString() : undefined,
        expiresAt: expiry.toISOString(),
        features: meta?.coreFeatures || [],
        paymentMethod: subscriptionDetails.paymentMethod || "WAVE",
        activatedAt: now.toISOString(),
      },
      createdAt: now.toISOString(),
    };

    const updatedProfiles = {
      ...this.currentUser.profiles,
      [profileType]: newProfileData,
    };

    this.currentUser = {
      ...this.currentUser,
      role: profileType as UserRole,
      activeProfile: profileType,
      profiles: updatedProfiles,
      proStatus: "ACTIF_ABONNE",
      proApproved: true,
      trialExpiresAt: subscriptionDetails.isTrial ? trialEnds.toISOString() : undefined,
    };

    eventBus.publish(EVENTS.ROLE_CHANGED, profileType);
    eventBus.publish("PROFILE_ACTIVATED", { profileType, profile: newProfileData });
    eventBus.publish("PROFILE_SWITCHED", profileType);
  }

  isProfileActive(profileType: ProfileType): boolean {
    if (profileType === "CLIENT" || profileType === "ADMIN") return true;
    if (!this.currentUser.profiles) return false;
    const profile = this.currentUser.profiles[profileType];
    return !!profile && profile.active;
  }

  getProfileSubscription(profileType: ProfileType): ProfileSubscriptionDTO | null {
    if (!this.currentUser.profiles) return null;
    return this.currentUser.profiles[profileType]?.subscription || null;
  }

  activateProFreeTrial() {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    this.currentUser = {
      ...this.currentUser,
      proStatus: "ESSAI_GRATUIT",
      proApproved: true,
      proFreeTrialActive: true,
      trialExpiresAt: expDate.toISOString(),
    };
    eventBus.publish(EVENTS.ROLE_CHANGED, this.currentUser.role);
  }

  validateProAccount(_userId?: string) {
    this.currentUser = {
      ...this.currentUser,
      proStatus: "ACTIF_ABONNE",
      proApproved: true,
    };
    eventBus.publish(EVENTS.ROLE_CHANGED, this.currentUser.role);
    eventBus.publish("USER_STATUS_CHANGED", { status: "ACTIVE", userId: _userId });
  }

  setProAccountStatus(status: "ACTIVE" | "PENDING", _userId?: string) {
    if (status === "ACTIVE") {
      this.currentUser = {
        ...this.currentUser,
        proStatus: "ACTIF_ABONNE",
        proApproved: true,
      };
    } else {
      this.currentUser = {
        ...this.currentUser,
        proStatus: "EN_ATTENTE",
        proApproved: false,
        proFreeTrialActive: false,
      };
    }
    eventBus.publish(EVENTS.ROLE_CHANGED, this.currentUser.role);
    eventBus.publish("USER_STATUS_CHANGED", { status, userId: _userId });
  }

  switchRole(role: UserRole) {
    this.switchProfile(role as ProfileType);
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = {
      id: "guest",
      fullName: "Visiteur / Invité",
      email: "invite@senauratech.sn",
      phone: "+221",
      role: "CLIENT",
      activeProfile: "CLIENT",
      profiles: buildDefaultUserProfiles({ id: "guest", fullName: "Visiteur / Invité", role: "CLIENT" }),
      region: "Dakar",
      verified: false,
      createdAt: new Date().toISOString(),
    };
    eventBus.publish(EVENTS.ROLE_CHANGED, "CLIENT");
    eventBus.publish("PROFILE_SWITCHED", "CLIENT");
  }

  // Devis & Projets
  saveQuoteDraft(draft: Partial<QuoteRequestDTO>) {
    try {
      localStorage.setItem("senaura_quote_draft", JSON.stringify(draft));
    } catch {}
  }

  getQuoteDraft(): Partial<QuoteRequestDTO> | null {
    try {
      const data = localStorage.getItem("senaura_quote_draft");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearQuoteDraft() {
    try {
      localStorage.removeItem("senaura_quote_draft");
    } catch {}
  }

  addQuote(quote: QuoteRequestDTO) {
    this.quotes.unshift(quote);
    // saveQuoteToFirestore(quote);

    // Save to Neon PostgreSQL & In-Memory backend
    fetch("/api/quotes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    }).catch((e) => console.error("API quote post error:", e));

    eventBus.publish(EVENTS.QUOTE_CREATED, quote);
  }

  updateQuote(id: string, updates: Partial<QuoteRequestDTO>) {
    const idx = this.quotes.findIndex((q) => q.id === id);
    if (idx >= 0) {
      this.quotes[idx] = { ...this.quotes[idx], ...updates };
      // saveQuoteToFirestore(this.quotes[idx]);
      
      fetch(`/api/quotes/${id}/proposal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch(() => null);

      eventBus.publish(EVENTS.QUOTE_CREATED, this.quotes[idx]);
    }
  }

  publishQuoteProposal(
    id: string,
    proposal: {
      proposalAmountFCFA: number;
      items?: QuoteRequestDTO["items"];
      adminNotes?: string;
      validUntil?: string;
      assignedExpertName?: string;
      assignedExpertPhone?: string;
    }
  ) {
    this.updateQuote(id, {
      ...proposal,
      status: "PROPOSITION_ENVOYEE",
      publishedAt: new Date().toISOString(),
    });
  }

  recordClientQuoteDecision(id: string, decision: "ACCEPTE" | "REFUSE", notes?: string) {
    this.updateQuote(id, {
      status: decision === "ACCEPTE" ? "VALIDE" : "REFUSE",
      clientDecision: decision === "ACCEPTE" ? "ACCEPTED" : "REJECTED",
      clientNotes: notes,
    });
  }

  deleteQuote(id: string) {
    this.quotes = this.quotes.filter((q) => q.id !== id);
    try {
      fetch(`/api/quotes/${id}`, { method: "DELETE" }).catch(() => null);
    } catch {}
  }

  // Réservations & Interventions Pro
  addBooking(booking: BookingDTO) {
    this.bookings.unshift(booking);
    // saveBookingToFirestore(booking);

    // Save to Neon PostgreSQL
    fetch("/api/db/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    }).catch((e) => console.error("Neon booking post error:", e));

    eventBus.publish(EVENTS.PRO_BOOKED, booking);
  }

  // Panier & Commandes
  addToCart(product: ProductDTO, quantity = 1) {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    eventBus.publish(EVENTS.PRODUCT_ADDED_TO_CART, { product, quantity });
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    eventBus.publish(EVENTS.PRODUCT_ADDED_TO_CART, { productId });
  }

  clearCart() {
    this.cart = [];
    eventBus.publish(EVENTS.PRODUCT_ADDED_TO_CART, { cleared: true });
  }

  getCartTotalFCFA(): number {
    return this.cart.reduce((sum, item) => sum + item.product.priceFCFA * item.quantity, 0);
  }

  placeOrder(order: OrderDTO) {
    this.orders.unshift(order);
    // saveOrderToFirestore(order);

    // Save to Neon PostgreSQL
    fetch("/api/db/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch((e) => console.error("Neon order post error:", e));

    this.clearCart();
    eventBus.publish(EVENTS.ORDER_COMPLETED, order);
  }

  enrollCourse(courseId: string) {
    if (!this.enrolledCourseIds.includes(courseId)) {
      this.enrolledCourseIds.push(courseId);
      eventBus.publish(EVENTS.COURSE_ENROLLED, courseId);
    }
  }

  createTicket(ticket: TicketDTO) {
    this.tickets.unshift(ticket);
    // saveTicketToFirestore(ticket);
    eventBus.publish(EVENTS.TICKET_CREATED, ticket);
  }
}

export const store = new Store();
