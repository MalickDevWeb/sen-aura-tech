import { sql, initializeDatabase } from "./neon.ts";
import { QuoteRequestDTO, BookingDTO, OrderDTO, UserDTO } from "../shared/contracts/types";

export const neonDbService = {
  // Helper to ensure database is ready
  async ensureDb() {
    try {
      await initializeDatabase();
    } catch (e) {
      console.warn("ensureDb warning:", e);
    }
  },

  // === 1. UTILISATEURS & VÉRIFICATION D'UNICITÉ (DATABASE SIDE) ===
  normalizePhone(phone: string = ""): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("00221") && digits.length > 9) return digits.slice(5).slice(-9);
    if (digits.startsWith("221") && digits.length > 9) return digits.slice(3).slice(-9);
    return digits.slice(-9);
  },

  async checkUserUniqueness(phone: string, email?: string, excludeUserId?: string): Promise<{
    available: boolean;
    isPhoneTaken: boolean;
    isEmailTaken: boolean;
    existingUser?: any;
    error?: string;
  }> {
    try {
      await this.ensureDb();
      const normalizedPhone = this.normalizePhone(phone);
      const normalizedEmail = email ? email.trim().toLowerCase() : "";

      let isPhoneTaken = false;
      let isEmailTaken = false;
      let existingUser: any = null;

      // 1. Vérification stricte du téléphone
      if (normalizedPhone) {
        const phoneResult = await sql`
          SELECT * FROM sat_users 
          WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '%' || ${normalizedPhone}
          ${excludeUserId ? sql`AND id != ${excludeUserId}` : sql``}
          LIMIT 1;
        `;
        if (phoneResult && phoneResult.length > 0) {
          isPhoneTaken = true;
          existingUser = phoneResult[0];
        }
      }

      // 2. Vérification stricte de l'email
      if (normalizedEmail && normalizedEmail !== "") {
        const emailResult = await sql`
          SELECT * FROM sat_users 
          WHERE LOWER(TRIM(email)) = ${normalizedEmail}
          ${excludeUserId ? sql`AND id != ${excludeUserId}` : sql``}
          LIMIT 1;
        `;
        if (emailResult && emailResult.length > 0) {
          isEmailTaken = true;
          if (!existingUser) existingUser = emailResult[0];
        }
      }

      if (isPhoneTaken && isEmailTaken) {
        return {
          available: false,
          isPhoneTaken: true,
          isEmailTaken: true,
          existingUser,
          error: "Ce numéro de téléphone et cette adresse email sont déjà associés à un compte existant.",
        };
      }

      if (isPhoneTaken) {
        return {
          available: false,
          isPhoneTaken: true,
          isEmailTaken: false,
          existingUser,
          error: "Ce numéro de téléphone est déjà utilisé par un autre compte utilisateur.",
        };
      }

      if (isEmailTaken) {
        return {
          available: false,
          isPhoneTaken: false,
          isEmailTaken: true,
          existingUser,
          error: "Cette adresse email est déjà enregistrée sur un autre compte utilisateur.",
        };
      }

      return {
        available: true,
        isPhoneTaken: false,
        isEmailTaken: false,
      };
    } catch (e: any) {
      console.error("Neon checkUserUniqueness error:", e);
      return {
        available: true,
        isPhoneTaken: false,
        isEmailTaken: false,
      };
    }
  },

  async getUserByEmail(email: string) {
    try {
      if (!email) return null;
      await this.ensureDb();
      const normalizedEmail = (email || "").trim().toLowerCase();
      const result = await sql`
        SELECT * FROM sat_users 
        WHERE LOWER(TRIM(email)) = ${normalizedEmail}
        LIMIT 1;
      `;
      return result[0] || null;
    } catch (e) {
      console.error("Neon getUserByEmail error:", e);
      return null;
    }
  },

  async upsertUser(user: UserDTO, pin: string = "1234") {
    try {
      await this.ensureDb();
      
      // Vérification préalable d'unicité côté base de données avant insertion
      if (user.phone || user.email) {
        const uniqueness = await this.checkUserUniqueness(user.phone, user.email, user.id);
        if (!uniqueness.available && uniqueness.existingUser && uniqueness.existingUser.id !== user.id) {
          console.warn("Neon upsertUser returning existing user:", uniqueness.error);
          return { ...uniqueness.existingUser, existing: true };
        }
      }

      const result = await sql`
        INSERT INTO sat_users (id, full_name, email, phone, role, region, pin, verified, data, password_hash, updated_at)
        VALUES (${user.id}, ${user.fullName}, ${user.email || ""}, ${user.phone}, ${user.role}, ${user.region || "Dakar"}, ${pin}, ${user.verified || false}, ${JSON.stringify(user as any)}, ${(user as any).passwordHash || null}, NOW())
        ON CONFLICT (phone) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          region = EXCLUDED.region,
          verified = EXCLUDED.verified,
          data = EXCLUDED.data,
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e: any) {
      console.error("Neon upsertUser error:", e);
      return null;
    }
  },

  async getUserByPhone(phone: string) {
    try {
      await this.ensureDb();
      const normalizedPhone = this.normalizePhone(phone);
      if (!normalizedPhone) return null;
      const result = await sql`
        SELECT * FROM sat_users 
        WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '%' || ${normalizedPhone}
        LIMIT 1;
      `;
      return result[0] || null;
    } catch (e) {
      console.error("Neon getUserByPhone error:", e);
      return null;
    }
  },

  async getAllUsers() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_users ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        region: r.region || "Dakar",
        verified: r.verified || false,
        status: r.status || "ACTIF",
        data: r.data || {},
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllUsers error:", e);
      return [];
    }
  },

  async updateUser(id: string, updates: Record<string, any>) {
    try {
      await this.ensureDb();
      const existing = await sql`SELECT * FROM sat_users WHERE id = ${id} LIMIT 1;`;
      if (!existing || existing.length === 0) return null;

      const e = existing[0];
      const fullName = updates.fullName !== undefined ? updates.fullName : (updates.full_name !== undefined ? updates.full_name : e.full_name);
      const email = updates.email !== undefined ? updates.email : e.email;
      const phone = updates.phone !== undefined ? updates.phone : e.phone;
      const role = updates.role !== undefined ? updates.role : e.role;
      const region = updates.region !== undefined ? updates.region : e.region;
      const verified = updates.verified !== undefined ? updates.verified : e.verified;
      const status = updates.status !== undefined ? updates.status : (e.status || "ACTIF");

      const existingData = (e.data && typeof e.data === "object") ? e.data : {};
      const dataKeys = ["city", "avatar", "proStatus", "proApproved", "trialExpiresAt", "proFreeTrialActive", "profiles", "activeProfile", "pin"];
      const mergedData = { ...existingData };
      for (const k of dataKeys) {
        if (updates[k] !== undefined) mergedData[k] = updates[k];
      }

      const result = await sql`
        UPDATE sat_users SET
          full_name = ${fullName},
          email = ${email},
          phone = ${phone},
          role = ${role},
          region = ${region || "Dakar"},
          verified = ${verified},
          status = ${status},
          data = ${JSON.stringify(mergedData)},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result || result.length === 0) return null;
      const r = result[0];
      return {
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        region: r.region || "Dakar",
        verified: r.verified || false,
        status: r.status || "ACTIF",
        data: r.data || {},
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      };
    } catch (e) {
      console.error("Neon updateUser error:", e);
      return null;
    }
  },

  async updateUserStatus(phoneOrId: string, status: string) {
    try {
      await this.ensureDb();
      const cleanDigits = phoneOrId.replace(/\D/g, "");
      const result = await sql`
        UPDATE sat_users
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${phoneOrId}
           OR (REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+221', ''), '-', '') = ${cleanDigits})
        RETURNING *;
      `;
      return result[0] || null;
    } catch (e) {
      console.error("Neon updateUserStatus error:", e);
      return null;
    }
  },

  // === 2. DEVIS & PROJETS ===
  async generateSequentialQuoteId(): Promise<string> {
    try {
      await this.ensureDb();
      const res = await sql`SELECT nextval('sat_quotes_seq') as seq_value`;
      const num = res[0].seq_value;
      return `DEVIS-${String(num).padStart(5, '0')}`;
    } catch (e) {
      console.warn("generateSequentialQuoteId fallback:", e);
      return `DEVIS-${Math.floor(10000 + Math.random() * 90000)}`;
    }
  },

  async generateSequentialOrderId(): Promise<string> {
    try {
      await this.ensureDb();
      const res = await sql`SELECT nextval('sat_orders_seq') as seq_value`;
      const num = res[0].seq_value;
      return `CMD-${String(num).padStart(5, '0')}`;
    } catch (e) {
      console.warn("generateSequentialOrderId fallback:", e);
      return `CMD-${Math.floor(10000 + Math.random() * 90000)}`;
    }
  },

  async saveQuote(quote: QuoteRequestDTO) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_quotes (id, user_id, user_name, user_phone, pole, service_title, description, budget_fcfa, status)
        VALUES (
          ${quote.id}, 
          ${quote.userId || "guest"}, 
          ${quote.userName || "Client"}, 
          ${quote.userPhone || ""}, 
          ${quote.pole}, 
          ${quote.serviceTitle}, 
          ${quote.description || ""}, 
          ${quote.budgetFCFA || 0}, 
          ${quote.status || "EN_ATTENTE"}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          budget_fcfa = EXCLUDED.budget_fcfa,
          description = EXCLUDED.description
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveQuote error:", e);
      return null;
    }
  },

  async getAllQuotes(): Promise<QuoteRequestDTO[]> {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_quotes 
        ORDER BY created_at DESC 
        LIMIT 100;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userPhone: r.user_phone,
        pole: r.pole,
        serviceTitle: r.service_title,
        description: r.description,
        budgetFCFA: Number(r.budget_fcfa) || 0,
        status: r.status,
        region: "Dakar",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Neon getAllQuotes error:", e);
      return [];
    }
  },

  // === 3. RÉSERVATIONS & INTERVENTIONS PRO ===
  async saveBooking(booking: BookingDTO) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_bookings (id, client_name, client_phone, pro_name, pro_category, location, status)
        VALUES (
          ${booking.id},
          ${booking.clientName || "Client"},
          ${booking.clientPhone || ""},
          ${booking.proName || "Technicien"},
          ${booking.proCategory || "Général"},
          ${booking.address || booking.region || "Dakar"},
          ${booking.status || "CONFIRMEE"}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          location = EXCLUDED.location
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveBooking error:", e);
      return null;
    }
  },

  async getAllBookings(): Promise<BookingDTO[]> {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_bookings 
        ORDER BY created_at DESC 
        LIMIT 100;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        clientId: "client-id",
        clientName: r.client_name,
        clientPhone: r.client_phone,
        proId: "pro-id",
        proName: r.pro_name,
        proCategory: r.pro_category,
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        region: r.location || "Dakar",
        address: r.location || "Dakar",
        description: `Intervention ${r.pro_category}`,
        estimatedFCFA: 50000,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Neon getAllBookings error:", e);
      return [];
    }
  },

  // === 4. COMMANDES MARKETPLACE & BOUTIQUE ===
  // === 4. COMMANDES MARKETPLACE & BOUTIQUE ===
  async checkOrderUniqueness(orderId: string): Promise<boolean> {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT id FROM sat_orders WHERE id = ${orderId} LIMIT 1;
      `;
      return rows.length === 0;
    } catch {
      return true;
    }
  },

  async saveOrder(order: OrderDTO) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_orders (id, customer_name, customer_phone, items_json, total_fcfa, payment_method, payment_status)
        VALUES (
          ${order.id},
          ${order.userName || "Client"},
          ${order.userId || ""},
          ${JSON.stringify(order.items || [])},
          ${order.totalFCFA || 0},
          ${order.paymentMethod || "WAVE"},
          ${order.paymentStatus || "SUCCES"}
        )
        ON CONFLICT (id) DO UPDATE SET
          payment_status = EXCLUDED.payment_status
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveOrder error:", e);
      return null;
    }
  },

  async getAllOrders(): Promise<OrderDTO[]> {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_orders 
        ORDER BY created_at DESC 
        LIMIT 100;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.customer_phone || "user-id",
        userName: r.customer_name || "Client",
        items: r.items_json ? (typeof r.items_json === "string" ? JSON.parse(r.items_json) : r.items_json) : [],
        totalFCFA: Number(r.total_fcfa) || 0,
        paymentMethod: r.payment_method || "WAVE",
        paymentStatus: r.payment_status || "SUCCES",
        status: r.status || "EN_ATTENTE",
        shippingAddress: "Dakar, Sénégal",
        region: "Dakar",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Neon getAllOrders error:", e);
      return [];
    }
  },

  // === 4B. CERTIFICATS & DIPLÔMES OFFICIELS (UNICITÉ & VÉRIFICATION) ===
  async checkCertificateUniqueness(certificateNumber: string, qrCode?: string): Promise<{
    available: boolean;
    existing?: any;
  }> {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_certificates 
        WHERE certificate_number = ${certificateNumber} 
           OR id = ${certificateNumber}
           ${qrCode ? sql`OR qr_verification_code = ${qrCode}` : sql``}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return { available: false, existing: rows[0] };
      }
      return { available: true };
    } catch {
      return { available: true };
    }
  },

  async saveCertificate(cert: {
    id: string;
    certificateNumber?: string;
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    courseId?: string;
    courseTitle: string;
    scoreOrMention?: string;
    badgeTitle?: string;
    instructorName?: string;
    hoursCount?: number;
    issueDate?: string;
    qrVerificationCode?: string;
    status?: string;
  }) {
    try {
      await this.ensureDb();
      const certNum = cert.certificateNumber || cert.id;
      const qr = cert.qrVerificationCode || `SAT-VERIFY-${certNum}`;
      const result = await sql`
        INSERT INTO sat_certificates (
          id, certificate_number, student_name, student_email, student_phone, 
          course_id, course_title, score_or_mention, badge_title, instructor_name, 
          hours_count, issue_date, qr_verification_code, status
        )
        VALUES (
          ${cert.id}, ${certNum}, ${cert.studentName}, ${cert.studentEmail || ""}, ${cert.studentPhone || ""},
          ${cert.courseId || "course-default"}, ${cert.courseTitle}, ${cert.scoreOrMention || "Validation Pratique (Mention Excellent)"},
          ${cert.badgeTitle || "Certified Specialist"}, ${cert.instructorName || "Dr. Amadou Ba"},
          ${cert.hoursCount || 40}, ${cert.issueDate || new Date().toLocaleDateString("fr-FR")},
          ${qr}, ${cert.status || "OFFICIEL"}
        )
        ON CONFLICT (id) DO UPDATE SET
          student_name = EXCLUDED.student_name,
          course_title = EXCLUDED.course_title,
          status = EXCLUDED.status
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveCertificate error:", e);
      return null;
    }
  },

  async getCertificateByNumber(numberOrId: string) {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_certificates 
        WHERE certificate_number = ${numberOrId} 
           OR id = ${numberOrId} 
           OR qr_verification_code = ${numberOrId}
        LIMIT 1;
      `;
      return rows[0] || null;
    } catch (e) {
      console.error("Neon getCertificateByNumber error:", e);
      return null;
    }
  },

  async getAllCertificates() {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_certificates 
        ORDER BY created_at DESC 
        LIMIT 100;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        certificateNumber: r.certificate_number,
        studentName: r.student_name,
        studentEmail: r.student_email,
        studentPhone: r.student_phone,
        courseId: r.course_id,
        courseTitle: r.course_title,
        scoreOrMention: r.score_or_mention,
        badgeTitle: r.badge_title,
        instructorName: r.instructor_name,
        hoursCount: r.hours_count,
        issueDate: r.issue_date,
        qrVerificationCode: r.qr_verification_code,
        status: r.status,
        createdAt: r.created_at,
      }));
    } catch (e) {
      console.error("Neon getAllCertificates error:", e);
      return [];
    }
  },

  // === 4C. FACTURES OFFICIELLES (UNICITÉ & ARCHIVAGE) ===
  async saveInvoice(inv: {
    id: string;
    invoiceNumber?: string;
    orderId?: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    amountFCFA: number;
    status?: string;
    paymentMethod?: string;
    items?: any[];
  }) {
    try {
      await this.ensureDb();
      const invNum = inv.invoiceNumber || inv.id;
      const result = await sql`
        INSERT INTO sat_invoices (
          id, invoice_number, order_id, client_name, client_phone, client_email, 
          amount_fcfa, status, payment_method, items_json
        )
        VALUES (
          ${inv.id}, ${invNum}, ${inv.orderId || ""}, ${inv.clientName}, 
          ${inv.clientPhone || ""}, ${inv.clientEmail || ""}, ${inv.amountFCFA || 0}, 
          ${inv.status || "PAYEE"}, ${inv.paymentMethod || "WAVE"}, ${JSON.stringify(inv.items || [])}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          amount_fcfa = EXCLUDED.amount_fcfa
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveInvoice error:", e);
      return null;
    }
  },

  async getInvoiceByNumber(numberOrId: string) {
    try {
      await this.ensureDb();
      const rows = await sql`
        SELECT * FROM sat_invoices 
        WHERE invoice_number = ${numberOrId} 
           OR id = ${numberOrId} 
           OR order_id = ${numberOrId}
        LIMIT 1;
      `;
      return rows[0] || null;
    } catch (e) {
      console.error("Neon getInvoiceByNumber error:", e);
      return null;
    }
  },

  // === 4D. RECHERCHE RAPIDE MULTI-INDEXÉE GLOBALE ===
  async searchFast(queryText: string) {
    try {
      await this.ensureDb();
      const clean = queryText.trim();
      if (!clean) return { results: [], total: 0 };

      const cleanDigits = clean.replace(/\D/g, "");
      const normPhone = cleanDigits.startsWith("221") && cleanDigits.length === 12 ? cleanDigits.slice(3) : cleanDigits;
      const term = `%${clean}%`;
      const phoneTerm = normPhone ? `%${normPhone}%` : term;

      // Executed concurrently on indexed columns
      const [users, orders, certs, quotes, bookings, invoices, products] = await Promise.all([
        sql`
          SELECT id, full_name, email, phone, role FROM sat_users
          WHERE full_name ILIKE ${term} 
             OR email ILIKE ${term} 
             OR phone ILIKE ${phoneTerm}
             OR id ILIKE ${term}
          LIMIT 10;
        `,
        sql`
          SELECT id, customer_name, customer_phone, total_fcfa, payment_status, created_at FROM sat_orders
          WHERE id ILIKE ${term}
             OR customer_name ILIKE ${term}
             OR customer_phone ILIKE ${phoneTerm}
          LIMIT 10;
        `,
        sql`
          SELECT id, certificate_number, student_name, course_title, qr_verification_code FROM sat_certificates
          WHERE certificate_number ILIKE ${term}
             OR id ILIKE ${term}
             OR student_name ILIKE ${term}
             OR student_phone ILIKE ${phoneTerm}
             OR qr_verification_code ILIKE ${term}
          LIMIT 10;
        `,
        sql`
          SELECT id, user_name, user_phone, pole, service_title, budget_fcfa, status FROM sat_quotes
          WHERE id ILIKE ${term}
             OR user_name ILIKE ${term}
             OR user_phone ILIKE ${phoneTerm}
          LIMIT 10;
        `,
        sql`
          SELECT id, client_name, client_phone, pro_name, pro_category, status FROM sat_bookings
          WHERE id ILIKE ${term}
             OR client_name ILIKE ${term}
             OR client_phone ILIKE ${phoneTerm}
          LIMIT 10;
        `,
        sql`
          SELECT id, invoice_number, order_id, client_name, client_phone, amount_fcfa, status FROM sat_invoices
          WHERE invoice_number ILIKE ${term}
             OR id ILIKE ${term}
             OR order_id ILIKE ${term}
             OR client_name ILIKE ${term}
             OR client_phone ILIKE ${phoneTerm}
          LIMIT 10;
        `,
        sql`
          SELECT id, name, category, brand, price_fcfa FROM sat_products
          WHERE name ILIKE ${term}
             OR category ILIKE ${term}
             OR brand ILIKE ${term}
          LIMIT 10;
        `
      ]);

      const formattedResults = [
        ...users.map((u: any) => ({ type: "USER", id: u.id, title: u.full_name, subtitle: `${u.phone} • ${u.email || 'Sans email'} (${u.role})`, data: u })),
        ...orders.map((o: any) => ({ type: "ORDER", id: o.id, title: `Commande ${o.id}`, subtitle: `${o.customer_name} • ${Number(o.total_fcfa).toLocaleString()} FCFA (${o.payment_status})`, data: o })),
        ...certs.map((c: any) => ({ type: "CERTIFICATE", id: c.id, title: `Certificat ${c.certificate_number || c.id}`, subtitle: `${c.student_name} — ${c.course_title}`, data: c })),
        ...quotes.map((q: any) => ({ type: "QUOTE", id: q.id, title: `Devis ${q.id} (${q.pole})`, subtitle: `${q.user_name} • ${q.service_title} (${q.status})`, data: q })),
        ...bookings.map((b: any) => ({ type: "BOOKING", id: b.id, title: `Réservation ${b.id}`, subtitle: `${b.client_name} -> Pro: ${b.pro_name} (${b.status})`, data: b })),
        ...invoices.map((i: any) => ({ type: "INVOICE", id: i.id, title: `Facture ${i.invoice_number || i.id}`, subtitle: `${i.client_name} • ${Number(i.amount_fcfa).toLocaleString()} FCFA (${i.status})`, data: i })),
        ...products.map((p: any) => ({ type: "PRODUCT", id: p.id, title: p.name, subtitle: `${p.category} • ${Number(p.price_fcfa).toLocaleString()} FCFA`, data: p })),
      ];

      return {
        query: clean,
        total: formattedResults.length,
        results: formattedResults,
      };
    } catch (e) {
      console.error("Neon searchFast error:", e);
      return { query: queryText, total: 0, results: [] };
    }
  },

  // === 5. PRODUITS & MATÉRIELS TECH (BOUTIQUE) ===
  async getAllProducts() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_products ORDER BY price_fcfa DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        brand: r.brand,
        priceFCFA: Number(r.price_fcfa) || 0,
        oldPriceFCFA: r.old_price_fcfa ? Number(r.old_price_fcfa) : undefined,
        stock: r.stock,
        rating: Number(r.rating) || 4.9,
        imageUrl: r.image_url,
        shortDesc: r.short_desc,
        badge: r.badge,
        specs: r.specs,
      }));
    } catch (e) {
      console.error("Neon getAllProducts error:", e);
      return [];
    }
  },

  async saveProduct(p: any) {
    try {
      await this.ensureDb();
      const imageUrl = p.imageUrl || p.image_url || p.image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80";
      const name = p.name || p.title || "Produit SEN AURA";
      const category = p.category || "Matériels Tech";
      const brand = p.brand || "SEN AURA";
      const price = Number(p.priceFCFA || p.price_fcfa || p.price || 0);
      const oldPrice = p.oldPriceFCFA || p.old_price_fcfa || null;
      const stock = p.stock !== undefined ? p.stock : 10;
      const rating = Number(p.rating) || 4.9;
      const shortDesc = p.shortDesc || p.short_desc || p.description || "";
      const badge = p.badge || (p.featured ? "Recommandé" : null);
      const specs = p.specs || {};

      const result = await sql`
        INSERT INTO sat_products (id, name, category, brand, price_fcfa, old_price_fcfa, stock, rating, image_url, short_desc, badge, specs)
        VALUES (
          ${p.id},
          ${name},
          ${category},
          ${brand},
          ${price},
          ${oldPrice},
          ${stock},
          ${rating},
          ${imageUrl},
          ${shortDesc},
          ${badge},
          ${JSON.stringify(specs)}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          brand = EXCLUDED.brand,
          price_fcfa = EXCLUDED.price_fcfa,
          stock = EXCLUDED.stock,
          image_url = EXCLUDED.image_url,
          short_desc = EXCLUDED.short_desc,
          badge = EXCLUDED.badge,
          specs = EXCLUDED.specs
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveProduct error:", e);
      return null;
    }
  },

  async deleteProduct(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_products WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteProduct error:", e);
      return false;
    }
  },

  async updateProduct(id: string, updates: any) {
    try {
      await this.ensureDb();
      const existing = await sql`SELECT * FROM sat_products WHERE id = ${id} LIMIT 1;`;
      if (!existing || existing.length === 0) return null;

      const e = existing[0];
      const name = updates.name !== undefined ? updates.name : (updates.title !== undefined ? updates.title : e.name);
      const category = updates.category !== undefined ? updates.category : e.category;
      const brand = updates.brand !== undefined ? updates.brand : e.brand;
      const price = updates.priceFCFA !== undefined ? updates.priceFCFA : (updates.price_fcfa !== undefined ? updates.price_fcfa : (updates.price !== undefined ? updates.price : e.price_fcfa));
      const oldPrice = updates.oldPriceFCFA !== undefined ? updates.oldPriceFCFA : (updates.old_price_fcfa !== undefined ? updates.old_price_fcfa : e.old_price_fcfa);
      const stock = updates.stock !== undefined ? updates.stock : e.stock;
      const rating = updates.rating !== undefined ? updates.rating : e.rating;
      const shortDesc = updates.shortDesc !== undefined ? updates.shortDesc : (updates.short_desc !== undefined ? updates.short_desc : (updates.description !== undefined ? updates.description : e.short_desc));
      const badge = updates.badge !== undefined ? updates.badge : e.badge;
      const imageUrl = updates.imageUrl !== undefined ? updates.imageUrl : (updates.image_url !== undefined ? updates.image_url : (updates.image !== undefined ? updates.image : e.image_url));
      
      const existingSpecs = (e.specs && typeof e.specs === 'object') ? e.specs : {};
      const specs = updates.specs !== undefined ? { ...existingSpecs, ...updates.specs } : existingSpecs;

      const result = await sql`
        UPDATE sat_products SET
          name = ${name},
          category = ${category},
          brand = ${brand},
          price_fcfa = ${Number(price) || 0},
          old_price_fcfa = ${oldPrice ? Number(oldPrice) : null},
          stock = ${Number(stock) || 0},
          rating = ${Number(rating) || 4.9},
          short_desc = ${shortDesc},
          badge = ${badge},
          image_url = ${imageUrl},
          specs = ${JSON.stringify(specs)},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon updateProduct error:", e);
      return null;
    }
  },

  // === 6. FORMATIONS & CERTIFICATIONS (ACADEMY) ===
  async getAllCourses() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_courses ORDER BY students_count DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        instructor: r.instructor,
        instructorRole: r.instructor_role,
        duration: r.duration,
        priceFCFA: Number(r.price_fcfa) || 0,
        rating: Number(r.rating) || 4.9,
        studentsCount: r.students_count,
        thumbnail: r.thumbnail,
        videoUrl: r.video_url,
        curriculum: r.curriculum,
      }));
    } catch (e) {
      console.error("Neon getAllCourses error:", e);
      return [];
    }
  },

  async saveCourse(c: any) {
    try {
      await this.ensureDb();
      const title = c.title || c.name || "Formation SEN AURA Academy";
      const category = c.category || "Informatique & Dev";
      const instructor = c.instructor || c.instructorName || c.instructor_name || "Expert SEN AURA";
      const instructorRole = c.instructorRole || c.instructor_role || c.instructorAvatar || "Formateur Certifié";
      const duration = c.duration || (c.durationHours ? `${c.durationHours}h` : "4 semaines");
      const price = Number(c.priceFCFA || c.price_fcfa || c.price || 0);
      const rating = Number(c.rating) || 4.9;
      const studentsCount = Number(c.studentsCount || c.students_count || c.studentsEnrolled || 0);
      const thumbnail = c.thumbnail || c.image || c.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80";
      const videoUrl = c.videoUrl || c.video_url || "";
      const curriculum = c.curriculum || [];

      const result = await sql`
        INSERT INTO sat_courses (id, title, category, instructor, instructor_role, duration, price_fcfa, rating, students_count, thumbnail, video_url, curriculum)
        VALUES (
          ${c.id},
          ${title},
          ${category},
          ${instructor},
          ${instructorRole},
          ${duration},
          ${price},
          ${rating},
          ${studentsCount},
          ${thumbnail},
          ${videoUrl},
          ${JSON.stringify(curriculum)}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          instructor = EXCLUDED.instructor,
          instructor_role = EXCLUDED.instructor_role,
          duration = EXCLUDED.duration,
          price_fcfa = EXCLUDED.price_fcfa,
          thumbnail = EXCLUDED.thumbnail,
          curriculum = EXCLUDED.curriculum
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveCourse error:", e);
      return null;
    }
  },

  async updateCourse(id: string, updates: any) {
    try {
      await this.ensureDb();
      const existing = await sql`SELECT * FROM sat_courses WHERE id = ${id} LIMIT 1;`;
      if (!existing || existing.length === 0) return null;

      const e = existing[0];
      const title = updates.title !== undefined ? updates.title : (updates.name !== undefined ? updates.name : e.title);
      const category = updates.category !== undefined ? updates.category : e.category;
      const instructor = updates.instructor !== undefined ? updates.instructor : (updates.instructorName !== undefined ? updates.instructorName : e.instructor);
      const instructorRole = updates.instructorRole !== undefined ? updates.instructorRole : (updates.instructor_role !== undefined ? updates.instructor_role : e.instructor_role);
      const duration = updates.duration !== undefined ? updates.duration : (updates.durationHours ? `${updates.durationHours}h` : e.duration);
      const price = updates.priceFCFA !== undefined ? updates.priceFCFA : (updates.price_fcfa !== undefined ? updates.price_fcfa : (updates.price !== undefined ? updates.price : e.price_fcfa));
      const rating = updates.rating !== undefined ? updates.rating : e.rating;
      const studentsCount = updates.studentsCount !== undefined ? updates.studentsCount : (updates.students_count !== undefined ? updates.students_count : e.students_count);
      const thumbnail = updates.thumbnail !== undefined ? updates.thumbnail : (updates.image !== undefined ? updates.image : (updates.imageUrl !== undefined ? updates.imageUrl : e.thumbnail));
      const videoUrl = updates.videoUrl !== undefined ? updates.videoUrl : (updates.video_url !== undefined ? updates.video_url : e.video_url);
      
      const existingCurriculum = Array.isArray(e.curriculum) ? e.curriculum : [];
      const curriculum = updates.curriculum !== undefined ? updates.curriculum : existingCurriculum;

      const result = await sql`
        UPDATE sat_courses SET
          title = ${title},
          category = ${category},
          instructor = ${instructor},
          instructor_role = ${instructorRole},
          duration = ${duration},
          price_fcfa = ${Number(price) || 0},
          rating = ${Number(rating) || 4.9},
          students_count = ${Number(studentsCount) || 0},
          thumbnail = ${thumbnail},
          video_url = ${videoUrl},
          curriculum = ${JSON.stringify(curriculum)},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon updateCourse error:", e);
      return null;
    }
  },

  // === 7. PRESTATAIRES & PROS CERTIFIÉS ===
  async getAllProviders() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_providers ORDER BY rating DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        location: r.location,
        hourlyRateFCFA: Number(r.hourly_rate_fcfa) || 0,
        rating: Number(r.rating) || 4.9,
        completedJobs: r.completed_jobs,
        verified: r.verified,
        phone: r.phone,
        avatar: r.avatar,
        skills: r.skills,
      }));
    } catch (e) {
      console.error("Neon getAllProviders error:", e);
      return [];
    }
  },

  async saveProvider(p: any) {
    try {
      await this.ensureDb();
      const name = p.name || p.fullName || p.full_name || "Prestataire Pro";
      const category = p.category || "Technicien Tech";
      const location = p.location || p.region || "Dakar";
      const hourlyRate = Number(p.hourlyRateFCFA || p.hourly_rate_fcfa || p.hourlyRate || 15000);
      const rating = Number(p.rating) || 4.9;
      const completedJobs = Number(p.completedJobs || p.completed_jobs || 0);
      const verified = p.verified !== undefined ? p.verified : true;
      const phone = p.phone || "+221 77 000 00 00";
      const avatar = p.avatar || p.image || "";
      const skills = p.skills || [];

      const result = await sql`
        INSERT INTO sat_providers (id, name, category, location, hourly_rate_fcfa, rating, completed_jobs, verified, phone, avatar, skills)
        VALUES (
          ${p.id},
          ${name},
          ${category},
          ${location},
          ${hourlyRate},
          ${rating},
          ${completedJobs},
          ${verified},
          ${phone},
          ${avatar},
          ${JSON.stringify(skills)}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          location = EXCLUDED.location,
          hourly_rate_fcfa = EXCLUDED.hourly_rate_fcfa,
          rating = EXCLUDED.rating,
          phone = EXCLUDED.phone,
          avatar = EXCLUDED.avatar,
          skills = EXCLUDED.skills
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveProvider error:", e);
      return null;
    }
  },

  // === 8. ÉQUIPE & DIRIGEANTS (LEADERSHIP) ===
  async getLeadership() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_leadership ORDER BY order_num ASC, created_at ASC;`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        focus: r.focus,
        phone: r.phone,
        email: r.email,
        photoUrl: r.photo_url,
        active: r.active,
        orderNum: r.order_num,
      }));
    } catch (e) {
      console.error("Neon getLeadership error:", e);
      return [];
    }
  },

  async saveLeadershipMember(m: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_leadership (id, name, role, focus, phone, email, photo_url, active, order_num)
        VALUES (
          ${m.id},
          ${m.name},
          ${m.role},
          ${m.focus || ""},
          ${m.phone || ""},
          ${m.email || ""},
          ${m.photoUrl || m.photo_url || ""},
          ${m.active !== undefined ? m.active : true},
          ${m.orderNum || m.order_num || 0}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          focus = EXCLUDED.focus,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          photo_url = EXCLUDED.photo_url,
          active = EXCLUDED.active,
          order_num = EXCLUDED.order_num
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveLeadershipMember error:", e);
      return null;
    }
  },

  // === 9. CONFIGURATION GLOBALE DU SYSTÈME ===
  async getSystemConfig(key: string = "default") {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT config_json FROM sat_system_config WHERE key = ${key} LIMIT 1;`;
      if (rows.length > 0) {
        return rows[0].config_json;
      }
      return null;
    } catch (e) {
      console.error("Neon getSystemConfig error:", e);
      return null;
    }
  },

  async saveSystemConfig(config: any, key: string = "default") {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_system_config (key, config_json, updated_at)
        VALUES (${key}, ${JSON.stringify(config)}, NOW())
        ON CONFLICT (key) DO UPDATE SET
          config_json = EXCLUDED.config_json,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveSystemConfig error:", e);
      return null;
    }
  },

  // === 10. SUPPRESSIONS PERMANENTES (NeonDB) ===
  async deleteQuote(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_quotes WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteQuote error:", e);
      return false;
    }
  },

  // Full update of a quote (status, budget, description, extra fields via JSONB)
  async updateQuote(id: string, updates: Record<string, any>) {
    try {
      await this.ensureDb();
      const status = updates.status || undefined;
      const budget = updates.budgetFCFA !== undefined ? Number(updates.budgetFCFA) : undefined;
      const description = updates.description !== undefined ? updates.description : undefined;

      // Build the extra data payload (proposal, decision, notes, etc.)
      const extra: Record<string, any> = {};
      const extraKeys = ["clientDecision", "clientNotes", "proposalText", "proposalAmountFCFA", "proposalDetails", "notes"];
      for (const k of extraKeys) {
        if (updates[k] !== undefined) extra[k] = updates[k];
      }

      // Fetch existing data to merge
      const existing = await sql`SELECT data, status, budget_fcfa, description FROM sat_quotes WHERE id = ${id} LIMIT 1;`;
      if (!existing || existing.length === 0) return null;

      const existingData = (existing[0].data && typeof existing[0].data === "object") ? existing[0].data : {};
      const mergedData = { ...existingData, ...extra };

      const newStatus = status || existing[0].status;
      const newBudget = budget !== undefined ? budget : Number(existing[0].budget_fcfa);
      const newDesc = description !== undefined ? description : existing[0].description;

      const result = await sql`
        UPDATE sat_quotes SET
          status      = ${newStatus},
          budget_fcfa = ${newBudget},
          description = ${newDesc},
          data        = ${JSON.stringify(mergedData)},
          updated_at  = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result || result.length === 0) return null;
      const r = result[0];
      return {
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userPhone: r.user_phone,
        pole: r.pole,
        serviceTitle: r.service_title,
        description: r.description,
        budgetFCFA: Number(r.budget_fcfa) || 0,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        ...(r.data || {}),
      };
    } catch (e) {
      console.error("Neon updateQuote error:", e);
      return null;
    }
  },

  async deleteCourse(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_courses WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteCourse error:", e);
      return false;
    }
  },

  async deleteUser(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_users WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteUser error:", e);
      return false;
    }
  },

  async deleteOrder(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_orders WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteOrder error:", e);
      return false;
    }
  },

  async updateOrderStatus(id: string, status: string) {
    try {
      await this.ensureDb();
      await sql`
        UPDATE sat_orders 
        SET status = ${status}, updated_at = NOW() 
        WHERE id = ${id};
      `;
      return true;
    } catch (e) {
      console.error("Neon updateOrderStatus error:", e);
      return false;
    }
  },

  async updateQuoteStatus(id: string, updates: Record<string, any>) {
    try {
      await this.ensureDb();
      const status = updates.status || "EN_ATTENTE";
      await sql`
        UPDATE sat_quotes SET status = ${status}, updated_at = NOW() WHERE id = ${id};
      `;
      return true;
    } catch (e) {
      console.error("Neon updateQuoteStatus error:", e);
      return false;
    }
  },

  async updateCourseStatus(id: string, updates: Record<string, any>) {
    try {
      await this.ensureDb();
      const status = updates.status || "Publié";
      await sql`
        UPDATE sat_courses SET updated_at = NOW() WHERE id = ${id};
      `;
      return true;
    } catch (e) {
      console.error("Neon updateCourseStatus error:", e);
      return false;
    }
  },

  async updateUserRole(id: string, role: string) {
    try {
      await this.ensureDb();
      await sql`
        UPDATE sat_users SET role = ${role}, updated_at = NOW() WHERE id = ${id};
      `;
      return true;
    } catch (e) {
      console.error("Neon updateUserRole error:", e);
      return false;
    }
  },

  // === 10. PARTENAIRES ===
  async getAllPartners() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_partners ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        domain: r.domain,
        city: r.city || "Dakar",
        projectsCount: r.projects_count || 0,
        satisfaction: Number(r.satisfaction) || 98.5,
        logoUrl: r.logo_url,
        status: r.status || "EN_ATTENTE",
        data: r.data || {},
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllPartners error:", e);
      return [];
    }
  },

  async savePartner(partner: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_partners (id, name, domain, city, projects_count, satisfaction, logo_url, status, data)
        VALUES (
          ${partner.id},
          ${partner.name || partner.fullName || "Partenaire"},
          ${partner.domain || "Général"},
          ${partner.city || "Dakar"},
          ${Number(partner.projectsCount || partner.projects_count || 0)},
          ${Number(partner.satisfaction || 98.5)},
          ${partner.logoUrl || partner.logo_url || null},
          ${partner.status || "EN_ATTENTE"},
          ${JSON.stringify(partner.data || partner)}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          domain = EXCLUDED.domain,
          city = EXCLUDED.city,
          projects_count = EXCLUDED.projects_count,
          satisfaction = EXCLUDED.satisfaction,
          logo_url = EXCLUDED.logo_url,
          status = EXCLUDED.status,
          data = EXCLUDED.data,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon savePartner error:", e);
      return null;
    }
  },

  async deletePartner(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_partners WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deletePartner error:", e);
      return false;
    }
  },

  // === 11. STATISTIQUES GLOBALES (DASHBOARD ADMIN) ===
  async getGlobalAdminStats() {
    try {
      await this.ensureDb();
      
      const [
        ordersResult,
        quotesResult,
        productsResult,
        coursesResult,
        usersResult,
        partnersResult
      ] = await Promise.all([
        sql`SELECT COUNT(*) as count, SUM(total_fcfa) as revenue FROM sat_orders;`,
        sql`
          SELECT 
            COUNT(*) as count, 
            COUNT(*) FILTER (WHERE status = 'EN_ATTENTE') as pending_count,
            COUNT(*) FILTER (WHERE status = 'VALIDE' OR status = 'ACCEPTE') as validated_count,
            SUM(budget_fcfa) FILTER (WHERE status = 'VALIDE' OR status = 'ACCEPTE') as validated_revenue
          FROM sat_quotes;
        `,
        sql`SELECT COUNT(*) as count FROM sat_products;`,
        sql`SELECT COUNT(*) as count, SUM(students_count) as students FROM sat_courses;`,
        sql`SELECT COUNT(*) as count FROM sat_users;`,
        sql`SELECT COUNT(*) as count FROM sat_partners;`
      ]);

      const ordersCount = Number(ordersResult[0]?.count || 0);
      const ordersRevenue = Number(ordersResult[0]?.revenue || 0);

      const quotesCount = Number(quotesResult[0]?.count || 0);
      const quotesPending = Number(quotesResult[0]?.pending_count || 0);
      const quotesValidated = Number(quotesResult[0]?.validated_count || 0);
      const quotesRevenue = Number(quotesResult[0]?.validated_revenue || 0);

      const productsCount = Number(productsResult[0]?.count || 0);
      
      const coursesCount = Number(coursesResult[0]?.count || 0);
      const studentsEnrolled = Number(coursesResult[0]?.students || 0);
      
      const usersCount = Number(usersResult[0]?.count || 0);
      
      // partners might fail if table doesn't exist yet, we wrap it softly
      const partnersCount = partnersResult ? Number(partnersResult[0]?.count || 0) : 0;

      const totalRevenueFCFA = ordersRevenue + quotesRevenue;

      return {
        totalRevenueFCFA,
        quotesCount,
        quotesPending,
        quotesValidated,
        ordersCount,
        productsCount,
        coursesCount,
        studentsEnrolled,
        usersCount,
        partnersCount
      };
    } catch (e) {
      console.error("Neon getGlobalAdminStats error:", e);
      return null;
    }
  },

  // === 12. GESTION DES LOGS D'AUDIT ===
  async saveLog(log: any) {
    try {
      await this.ensureDb();
      // Ensure table exists safely
      await sql`
        CREATE TABLE IF NOT EXISTS sat_logs (
          id VARCHAR(100) PRIMARY KEY,
          action VARCHAR(255) NOT NULL,
          description TEXT,
          user_name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      const id = log.id || `LOG-${Date.now()}`;
      const action = log.action || "UNKNOWN";
      const description = log.description || "";
      const user = log.user || "System";
      
      const result = await sql`
        INSERT INTO sat_logs (id, action, description, user_name, created_at)
        VALUES (${id}, ${action}, ${description}, ${user}, NOW())
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveLog error:", e);
      return null;
    }
  },

  async getAllLogs() {
    try {
      await this.ensureDb();
      // Only select if table exists
      const rows = await sql`SELECT * FROM sat_logs ORDER BY created_at DESC LIMIT 200;`;
      return rows.map((r: any) => ({
        id: r.id,
        action: r.action,
        description: r.description,
        user: r.user_name,
        timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));
    } catch (e) {
      console.error("Neon getAllLogs error:", e);
      return [];
    }
  },

  // === 13. GENERIC RECORDS (NoSQL-like Collections) ===
  async getRecords(collection: string) {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_records WHERE collection = ${collection} ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({ id: r.id, ...r.data, createdAt: r.created_at }));
    } catch (e) {
      console.error(`Neon getRecords(${collection}) error:`, e);
      return [];
    }
  },

  async saveRecord(collection: string, id: string, data: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_records (id, collection, data)
        VALUES (${id}, ${collection}, ${JSON.stringify(data)})
        ON CONFLICT (id) DO UPDATE SET
          data = sat_records.data || EXCLUDED.data,
          updated_at = NOW()
        RETURNING *;
      `;
      return { id: result[0].id, ...result[0].data };
    } catch (e) {
      console.error(`Neon saveRecord(${collection}) error:`, e);
      return null;
    }
  },

  async updateRecord(id: string, data: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        UPDATE sat_records SET
          data = data || ${JSON.stringify(data)},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result || result.length === 0) return null;
      return { id: result[0].id, ...result[0].data };
    } catch (e) {
      console.error(`Neon updateRecord(${id}) error:`, e);
      return null;
    }
  },

  async deleteRecord(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_records WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error(`Neon deleteRecord(${id}) error:`, e);
      return false;
    }
  },

  // === 14. PRO PORTFOLIO / RÉALISATIONS CHANTIERS ===
  async getProPortfolio(proId?: string) {
    try {
      await this.ensureDb();
      if (proId) {
        const rows = await sql`SELECT * FROM sat_pro_portfolio WHERE pro_id = ${proId} ORDER BY created_at DESC;`;
        return rows.map((r: any) => ({
          id: r.id,
          proId: r.pro_id,
          proName: r.pro_name,
          title: r.title,
          specialty: r.specialty,
          location: r.location,
          estimatedCostFCFA: r.estimated_cost_fcfa,
          executionTime: r.execution_time,
          description: r.description,
          guaranteePeriod: r.guarantee_period,
          mainMediaUrl: r.main_media_url,
          mainMediaType: r.main_media_type,
          galleryImages: r.gallery_images || [],
          verifiedBadge: r.verified_badge,
          rating: r.rating,
          viewsCount: r.views_count,
          contactsCount: r.contacts_count,
          isActive: r.is_active,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
      }
      const rows = await sql`SELECT * FROM sat_pro_portfolio ORDER BY created_at DESC LIMIT 200;`;
      return rows.map((r: any) => ({
        id: r.id,
        proId: r.pro_id,
        proName: r.pro_name,
        title: r.title,
        specialty: r.specialty,
        location: r.location,
        estimatedCostFCFA: r.estimated_cost_fcfa,
        executionTime: r.execution_time,
        description: r.description,
        guaranteePeriod: r.guarantee_period,
        mainMediaUrl: r.main_media_url,
        mainMediaType: r.main_media_type,
        galleryImages: r.gallery_images || [],
        verifiedBadge: r.verified_badge,
        rating: r.rating,
        viewsCount: r.views_count,
        contactsCount: r.contacts_count,
        isActive: r.is_active,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error("Neon getProPortfolio error:", e);
      return [];
    }
  },

  async createProPortfolio(data: any) {
    try {
      await this.ensureDb();
      const id = data.id || `PRT-${Date.now()}`;
      const result = await sql`
        INSERT INTO sat_pro_portfolio (
          id, pro_id, pro_name, title, specialty, location, estimated_cost_fcfa,
          execution_time, description, guarantee_period, main_media_url, main_media_type,
          gallery_images, verified_badge, rating, views_count, contacts_count, is_active
        ) VALUES (
          ${id}, ${data.proId}, ${data.proName}, ${data.title}, ${data.specialty}, ${data.location}, ${data.estimatedCostFCFA || 0},
          ${data.executionTime || ""}, ${data.description || ""}, ${data.guaranteePeriod || ""}, ${data.mainMediaUrl}, ${data.mainMediaType || "image"},
          ${data.galleryImages || []}, ${data.verifiedBadge ?? true}, ${data.rating || 5.0}, 0, 0, true
        )
        RETURNING *;
      `;
      if (!result || result.length === 0) return null;
      const r = result[0];
      return {
        id: r.id,
        proId: r.pro_id,
        proName: r.pro_name,
        title: r.title,
        specialty: r.specialty,
        location: r.location,
        estimatedCostFCFA: r.estimated_cost_fcfa,
        executionTime: r.execution_time,
        description: r.description,
        guaranteePeriod: r.guarantee_period,
        mainMediaUrl: r.main_media_url,
        mainMediaType: r.main_media_type,
        galleryImages: r.gallery_images || [],
        verifiedBadge: r.verified_badge,
        rating: r.rating,
        viewsCount: r.views_count,
        contactsCount: r.contacts_count,
        isActive: r.is_active,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch (e) {
      console.error("Neon createProPortfolio error:", e);
      return null;
    }
  },

  async updateProPortfolio(id: string, data: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        UPDATE sat_pro_portfolio SET
          title = COALESCE(${data.title}, title),
          specialty = COALESCE(${data.specialty}, specialty),
          location = COALESCE(${data.location}, location),
          estimated_cost_fcfa = COALESCE(${data.estimatedCostFCFA}, estimated_cost_fcfa),
          execution_time = COALESCE(${data.executionTime}, execution_time),
          description = COALESCE(${data.description}, description),
          guarantee_period = COALESCE(${data.guaranteePeriod}, guarantee_period),
          main_media_url = COALESCE(${data.mainMediaUrl}, main_media_url),
          main_media_type = COALESCE(${data.mainMediaType}, main_media_type),
          gallery_images = COALESCE(${data.galleryImages}, gallery_images),
          is_active = COALESCE(${data.isActive}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result || result.length === 0) return null;
      const r = result[0];
      return {
        id: r.id,
        proId: r.pro_id,
        proName: r.pro_name,
        title: r.title,
        specialty: r.specialty,
        location: r.location,
        estimatedCostFCFA: r.estimated_cost_fcfa,
        executionTime: r.execution_time,
        description: r.description,
        guaranteePeriod: r.guarantee_period,
        mainMediaUrl: r.main_media_url,
        mainMediaType: r.main_media_type,
        galleryImages: r.gallery_images || [],
        verifiedBadge: r.verified_badge,
        rating: r.rating,
        viewsCount: r.views_count,
        contactsCount: r.contacts_count,
        isActive: r.is_active,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch (e) {
      console.error("Neon updateProPortfolio error:", e);
      return null;
    }
  },

  async deleteProPortfolio(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_pro_portfolio WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteProPortfolio error:", e);
      return false;
    }
  },

  // === 15. PROGRAMS / INITIATIVES / FLAGSHIP ===
  async getAllPrograms() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_programs ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category: r.category,
        status: r.status || "ACTIF",
        isFlagship: r.is_flagship || false,
        isDraft: r.is_draft || false,
        sprintDurationDays: r.sprint_duration_days || 7,
        startDate: r.start_date ? new Date(r.start_date).toISOString() : undefined,
        endDate: r.end_date ? new Date(r.end_date).toISOString() : undefined,
        metadata: r.metadata || {},
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllPrograms error:", e);
      return [];
    }
  },

  async saveProgram(program: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_programs (id, title, slug, description, category, status, is_flagship, is_draft, sprint_duration_days, start_date, end_date, metadata)
        VALUES (
          ${program.id},
          ${program.title},
          ${program.slug || null},
          ${program.description || null},
          ${program.category || null},
          ${program.status || "ACTIF"},
          ${program.isFlagship || program.is_flagship || false},
          ${program.isDraft || program.is_draft || false},
          ${program.sprintDurationDays || program.sprint_duration_days || 7},
          ${program.startDate ? new Date(program.startDate) : null},
          ${program.endDate ? new Date(program.endDate) : null},
          ${JSON.stringify(program.metadata || {})}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          is_flagship = EXCLUDED.is_flagship,
          is_draft = EXCLUDED.is_draft,
          sprint_duration_days = EXCLUDED.sprint_duration_days,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveProgram error:", e);
      return null;
    }
  },

  async deleteProgram(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_programs WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteProgram error:", e);
      return false;
    }
  },

  // === 15. SOLUTIONS ===
  async getAllSolutions() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_solutions ORDER BY sprint_number ASC, created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        programId: r.program_id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category: r.category,
        status: r.status || "LIVRE",
        sprintNumber: r.sprint_number || 0,
        impactMetric: r.impact_metric || null,
        metrics: r.metrics || {},
        stackTech: r.stack_tech || [],
        imageUrl: r.image_url,
        demoUrl: r.demo_url,
        isPublished: r.is_published !== false,
        isDraft: r.is_draft || false,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllSolutions error:", e);
      return [];
    }
  },

  async saveSolution(solution: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_solutions (id, program_id, title, slug, description, category, status, sprint_number, impact_metric, metrics, stack_tech, image_url, demo_url, is_published, is_draft)
        VALUES (
          ${solution.id},
          ${solution.programId || null},
          ${solution.title},
          ${solution.slug || null},
          ${solution.description || null},
          ${solution.category || null},
          ${solution.status || "LIVRE"},
          ${solution.sprintNumber || 0},
          ${solution.impactMetric || null},
          ${JSON.stringify(solution.metrics || {})},
          ${JSON.stringify(solution.stackTech || [])},
          ${solution.imageUrl || null},
          ${solution.demoUrl || null},
          ${solution.isPublished !== false},
          ${solution.isDraft || false}
        )
        ON CONFLICT (id) DO UPDATE SET
          program_id = EXCLUDED.program_id,
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          sprint_number = EXCLUDED.sprint_number,
          impact_metric = EXCLUDED.impact_metric,
          metrics = EXCLUDED.metrics,
          stack_tech = EXCLUDED.stack_tech,
          image_url = EXCLUDED.image_url,
          demo_url = EXCLUDED.demo_url,
          is_published = EXCLUDED.is_published,
          is_draft = EXCLUDED.is_draft,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveSolution error:", e);
      return null;
    }
  },

  async deleteSolution(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_solutions WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteSolution error:", e);
      return false;
    }
  },

  // === 16. CHALLENGES / IDEES ===
  async getAllChallenges() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_challenges ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        submittedByName: r.submitted_by_name,
        submittedByEmail: r.submitted_by_email,
        submittedByPhone: r.submitted_by_phone,
        sector: r.sector,
        city: r.city,
        estimatedBudgetFCFA: Number(r.estimated_budget_fcfa) || 0,
        status: r.status || "EN_ATTENTE",
        isPublished: r.is_published || false,
        metadata: r.metadata || {},
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllChallenges error:", e);
      return [];
    }
  },

  async saveChallenge(challenge: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_challenges (id, title, description, submitted_by_name, submitted_by_email, submitted_by_phone, sector, city, estimated_budget_fcfa, status, is_published, metadata)
        VALUES (
          ${challenge.id},
          ${challenge.title},
          ${challenge.description || null},
          ${challenge.submittedByName || null},
          ${challenge.submittedByEmail || null},
          ${challenge.submittedByPhone || null},
          ${challenge.sector || null},
          ${challenge.city || null},
          ${Number(challenge.estimatedBudgetFCFA || 0)},
          ${challenge.status || "EN_ATTENTE"},
          ${challenge.isPublished || false},
          ${JSON.stringify(challenge.metadata || {})}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          submitted_by_name = EXCLUDED.submitted_by_name,
          submitted_by_email = EXCLUDED.submitted_by_email,
          submitted_by_phone = EXCLUDED.submitted_by_phone,
          sector = EXCLUDED.sector,
          city = EXCLUDED.city,
          estimated_budget_fcfa = EXCLUDED.estimated_budget_fcfa,
          status = EXCLUDED.status,
          is_published = EXCLUDED.is_published,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon saveChallenge error:", e);
      return null;
    }
  },

  async deleteChallenge(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_challenges WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deleteChallenge error:", e);
      return false;
    }
  },

  // === 17. PUBLICATIONS / ADS ===
  async getAllPublications() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_publications ORDER BY published_at DESC, created_at DESC;`;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        type: r.type || "SOLUTION",
        programId: r.program_id,
        solutionId: r.solution_id,
        challengeId: r.challenge_id,
        mediaUrl: r.media_url,
        mediaType: r.media_type,
        callToAction: r.call_to_action,
        targetUrl: r.target_url,
        isActive: r.is_active !== false,
        isDraft: r.is_draft || false,
        publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (e) {
      console.error("Neon getAllPublications error:", e);
      return [];
    }
  },

  async savePublication(publication: any) {
    try {
      await this.ensureDb();
      const result = await sql`
        INSERT INTO sat_publications (id, title, body, type, program_id, solution_id, challenge_id, media_url, media_type, call_to_action, target_url, is_active, is_draft, published_at)
        VALUES (
          ${publication.id},
          ${publication.title},
          ${publication.body || null},
          ${publication.type || "SOLUTION"},
          ${publication.programId || null},
          ${publication.solutionId || null},
          ${publication.challengeId || null},
          ${publication.mediaUrl || null},
          ${publication.mediaType || null},
          ${publication.callToAction || null},
          ${publication.targetUrl || null},
          ${publication.isActive !== false},
          ${publication.isDraft || false},
          ${publication.publishedAt ? new Date(publication.publishedAt) : new Date()}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          type = EXCLUDED.type,
          program_id = EXCLUDED.program_id,
          solution_id = EXCLUDED.solution_id,
          challenge_id = EXCLUDED.challenge_id,
          media_url = EXCLUDED.media_url,
          media_type = EXCLUDED.media_type,
          call_to_action = EXCLUDED.call_to_action,
          target_url = EXCLUDED.target_url,
          is_active = EXCLUDED.is_active,
          is_draft = EXCLUDED.is_draft,
          published_at = EXCLUDED.published_at,
          updated_at = NOW()
        RETURNING *;
      `;
      return result[0];
    } catch (e) {
      console.error("Neon savePublication error:", e);
      return null;
    }
  },

  async deletePublication(id: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_publications WHERE id = ${id};`;
      return true;
    } catch (e) {
      console.error("Neon deletePublication error:", e);
      return false;
    }
  },

  // === 13. SÉCURITÉ & PARE-FEU ===
  async getSecuritySettings() {
    try {
      await this.ensureDb();
      const res = await sql`SELECT config_json FROM sat_system_config WHERE key = 'security_settings' LIMIT 1;`;
      if (res && res.length > 0) {
        return res[0].config_json;
      }
      return { maxAttempts: 3, lockDurationMinutes: 15 };
    } catch {
      return { maxAttempts: 3, lockDurationMinutes: 15 };
    }
  },

  async updateSecuritySettings(settings: { maxAttempts: number, lockDurationMinutes: number }) {
    try {
      await this.ensureDb();
      await sql`
        INSERT INTO sat_system_config (key, config_json) 
        VALUES ('security_settings', ${JSON.stringify(settings)})
        ON CONFLICT (key) DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW();
      `;
      return true;
    } catch {
      return false;
    }
  },

  async getSecurityStatus(ip: string) {
    try {
      await this.ensureDb();
      const res = await sql`SELECT * FROM sat_blocked_ips WHERE ip_address = ${ip} LIMIT 1;`;
      if (res && res.length > 0) {
        const record = res[0];
        if (record.status === 'BLOCKED') {
          if (record.unlocks_at && new Date(record.unlocks_at) < new Date()) {
            await sql`DELETE FROM sat_blocked_ips WHERE ip_address = ${ip};`;
            return { blocked: false, attempts: 0 };
          }
          return { blocked: true, attempts: record.attempts, unlocksAt: record.unlocks_at };
        }
        return { blocked: false, attempts: record.attempts };
      }
      return { blocked: false, attempts: 0 };
    } catch {
      return { blocked: false, attempts: 0 };
    }
  },

  async recordFailedAttempt(ip: string, phone: string) {
    try {
      await this.ensureDb();
      const settings = await this.getSecuritySettings();
      const maxAttempts = settings.maxAttempts || 3;
      const lockMinutes = settings.lockDurationMinutes || 15;

      const status = await this.getSecurityStatus(ip);
      const newAttempts = status.attempts + 1;
      let newStatus = 'WARNING';
      let unlocksAt = null;

      if (newAttempts >= maxAttempts) {
        newStatus = 'BLOCKED';
        unlocksAt = new Date(Date.now() + lockMinutes * 60000).toISOString();
      }

      await sql`
        INSERT INTO sat_blocked_ips (ip_address, reason, attempts, status, unlocks_at)
        VALUES (${ip}, ${'Échec PIN: ' + phone}, ${newAttempts}, ${newStatus}, ${unlocksAt})
        ON CONFLICT (ip_address) DO UPDATE SET 
          attempts = EXCLUDED.attempts, 
          status = EXCLUDED.status, 
          unlocks_at = EXCLUDED.unlocks_at,
          reason = EXCLUDED.reason;
      `;
      return { blocked: newStatus === 'BLOCKED', attempts: newAttempts, unlocksAt };
    } catch (e) {
      console.warn("Neon recordFailedAttempt warning:", e);
      return { blocked: false, attempts: 1 };
    }
  },

  async resetFailedAttempts(ip: string) {
    try {
      await this.ensureDb();
      await sql`DELETE FROM sat_blocked_ips WHERE ip_address = ${ip};`;
    } catch {}
  },

  async unblockIp(ip: string) {
    return this.resetFailedAttempts(ip);
  },

  async getAllBlockedIps() {
    try {
      await this.ensureDb();
      const rows = await sql`SELECT * FROM sat_blocked_ips ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        ipAddress: r.ip_address,
        reason: r.reason,
        attempts: r.attempts,
        status: r.status,
        unlocksAt: r.unlocks_at ? new Date(r.unlocks_at).toISOString() : null,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
};
