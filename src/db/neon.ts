import { Pool, neon } from "@neondatabase/serverless";

// Neon PostgreSQL Connection String
export const DATABASE_URL = process.env.DATABASE_URL || "";

function missingDatabaseUrlError() {
  return new Error("DATABASE_URL environment variable is required");
}

export const sql = DATABASE_URL
  ? neon(DATABASE_URL)
  : (async () => {
      throw missingDatabaseUrlError();
    }) as ReturnType<typeof neon>;

export const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL })
  : null;

let initPromise: Promise<void> | null = null;

/**
 * Helper to ensure all necessary Neon PostgreSQL tables exist before queries
 */
export async function initializeDatabase(): Promise<void> {
  if (!DATABASE_URL) {
    throw missingDatabaseUrlError();
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // 0. Create Sequences for guaranteed unique, incrementing IDs
        await sql`CREATE SEQUENCE IF NOT EXISTS sat_quotes_seq START 1;`;
        await sql`CREATE SEQUENCE IF NOT EXISTS sat_orders_seq START 1;`;

        // 1. Users with unique constraints on phone & email
        await sql`
          CREATE TABLE IF NOT EXISTS sat_users (
            id VARCHAR(100) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'CLIENT',
            region VARCHAR(100) DEFAULT 'Dakar',
            pin VARCHAR(20) DEFAULT '1234',
            verified BOOLEAN DEFAULT false,
            status VARCHAR(50) DEFAULT 'ACTIF',
            data JSONB,
            password_hash TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await sql`ALTER TABLE sat_users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIF';`;
        } catch (_) { /* ignore */ }

        // Clean up duplicate emails (keep latest updated/created) before creating index if needed
        try {
          await sql`
            DELETE FROM sat_users a USING sat_users b
            WHERE a.id < b.id 
              AND LOWER(TRIM(a.email)) = LOWER(TRIM(b.email))
              AND a.email IS NOT NULL 
              AND TRIM(a.email) != '';
          `;
        } catch (cleanupErr) {
          // Table might be empty or query not supported
        }

        // Clean up duplicate phones (keep latest updated/created) before index
        try {
          await sql`
            DELETE FROM sat_users a USING sat_users b
            WHERE a.id < b.id 
              AND a.phone = b.phone
              AND a.phone IS NOT NULL;
          `;
        } catch (cleanupErr) {
          // Table might be empty
        }

        // Create Unique Indexes for phone and email safely
        try {
          await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sat_users_phone_unique_idx 
            ON sat_users (phone);
          `;
        } catch (idxErr) {
          console.warn("Notice: sat_users_phone_unique_idx could not be created directly:", idxErr);
        }

        try {
          await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS sat_users_email_unique_idx 
            ON sat_users (LOWER(TRIM(email))) 
            WHERE email IS NOT NULL AND TRIM(email) != '';
          `;
        } catch (idxErr) {
          console.warn("Notice: sat_users_email_unique_idx already exists or handled:", idxErr);
        }

        // 2. Quotes
        await sql`
          CREATE TABLE IF NOT EXISTS sat_quotes (
            id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100),
            user_name VARCHAR(255),
            user_phone VARCHAR(50),
            pole VARCHAR(100) NOT NULL,
            service_title VARCHAR(255) NOT NULL,
            description TEXT,
            budget_fcfa NUMERIC DEFAULT 0,
            status VARCHAR(50) DEFAULT 'EN_ATTENTE',
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        // Add updated_at column if it doesn't exist yet (for existing DBs)
        try {
          await sql`ALTER TABLE sat_quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
        } catch (_) { /* ignore */ }

        // 3. Bookings
        await sql`
          CREATE TABLE IF NOT EXISTS sat_bookings (
            id VARCHAR(100) PRIMARY KEY,
            client_name VARCHAR(255),
            client_phone VARCHAR(50),
            pro_name VARCHAR(255),
            pro_category VARCHAR(100),
            location VARCHAR(255),
            status VARCHAR(50) DEFAULT 'CONFIRME',
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 4. Orders
        await sql`
          CREATE TABLE IF NOT EXISTS sat_orders (
            id VARCHAR(100) PRIMARY KEY,
            customer_name VARCHAR(255),
            customer_phone VARCHAR(50),
            customer_email VARCHAR(255),
            items_json JSONB,
            total_fcfa NUMERIC DEFAULT 0,
            payment_method VARCHAR(50) DEFAULT 'WAVE',
            payment_status VARCHAR(50) DEFAULT 'EN_ATTENTE',
            payment_proof_url TEXT,
            status VARCHAR(50) DEFAULT 'EN_ATTENTE',
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await sql`ALTER TABLE sat_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'EN_ATTENTE';`;
        } catch (_) { /* ignore */ }

        // 4b. Certificates (Diplômes & Attestations Officiels)
        await sql`
          CREATE TABLE IF NOT EXISTS sat_certificates (
            id VARCHAR(100) PRIMARY KEY,
            certificate_number VARCHAR(100) UNIQUE NOT NULL,
            student_name VARCHAR(255) NOT NULL,
            student_email VARCHAR(255),
            student_phone VARCHAR(50),
            course_id VARCHAR(100),
            course_title VARCHAR(255) NOT NULL,
            score_or_mention VARCHAR(100) DEFAULT 'Validation Pratique (Mention Excellent)',
            badge_title VARCHAR(100) DEFAULT 'Certified Specialist',
            instructor_name VARCHAR(255) DEFAULT 'Dr. Amadou Ba',
            hours_count INT DEFAULT 40,
            issue_date VARCHAR(100),
            qr_verification_code VARCHAR(255) UNIQUE,
            status VARCHAR(50) DEFAULT 'OFFICIEL',
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 4c. Invoices (Factures Officielles Normalisées)
        await sql`
          CREATE TABLE IF NOT EXISTS sat_invoices (
            id VARCHAR(100) PRIMARY KEY,
            invoice_number VARCHAR(100) UNIQUE NOT NULL,
            order_id VARCHAR(100),
            client_name VARCHAR(255) NOT NULL,
            client_phone VARCHAR(50),
            client_email VARCHAR(255),
            amount_fcfa NUMERIC DEFAULT 0,
            status VARCHAR(50) DEFAULT 'PAYEE',
            payment_method VARCHAR(50) DEFAULT 'WAVE',
            items_json JSONB,
            issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 5. Products (Boutique & Matériels Tech)
        await sql`
          CREATE TABLE IF NOT EXISTS sat_products (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) DEFAULT 'Produit SEN AURA',
            category VARCHAR(100) DEFAULT 'Matériels Tech',
            brand VARCHAR(100) DEFAULT 'SEN AURA',
            price_fcfa NUMERIC DEFAULT 0,
            old_price_fcfa NUMERIC,
            stock INT DEFAULT 10,
            rating NUMERIC(3,2) DEFAULT 4.9,
            image_url TEXT DEFAULT '',
            short_desc TEXT,
            badge VARCHAR(100),
            specs JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        try {
          await sql`ALTER TABLE sat_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
        } catch (_) { /* ignore */ }

        // 6. Courses & Formations Academy
        await sql`
          CREATE TABLE IF NOT EXISTS sat_courses (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) DEFAULT 'Formation SEN AURA Academy',
            category VARCHAR(100) DEFAULT 'Informatique & Dev',
            instructor VARCHAR(255) DEFAULT 'Expert SEN AURA',
            instructor_role VARCHAR(255),
            duration VARCHAR(100) DEFAULT '4 semaines',
            price_fcfa NUMERIC DEFAULT 0,
            rating NUMERIC(3,2) DEFAULT 4.9,
            students_count INT DEFAULT 0,
            thumbnail TEXT DEFAULT '',
            video_url TEXT,
            curriculum JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        try {
          await sql`ALTER TABLE sat_courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
        } catch (_) { /* ignore */ }

        // 7. Providers & Pros Certifiés
        await sql`
          CREATE TABLE IF NOT EXISTS sat_providers (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) DEFAULT 'Prestataire Pro',
            category VARCHAR(100) DEFAULT 'Technicien Tech',
            location VARCHAR(100) DEFAULT 'Dakar',
            hourly_rate_fcfa NUMERIC DEFAULT 15000,
            rating NUMERIC(3,2) DEFAULT 4.9,
            completed_jobs INT DEFAULT 0,
            verified BOOLEAN DEFAULT true,
            phone VARCHAR(50) DEFAULT '+221 77 000 00 00',
            avatar TEXT DEFAULT '',
            skills JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 8. Services & Pôles Solutions
        await sql`
          CREATE TABLE IF NOT EXISTS sat_services (
            id VARCHAR(100) PRIMARY KEY,
            pole VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price_fcfa NUMERIC DEFAULT 0,
            features JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 9. Partners & Ambassadeurs
        await sql`
          CREATE TABLE IF NOT EXISTS sat_partners (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            domain VARCHAR(100) NOT NULL,
            city VARCHAR(100) DEFAULT 'Dakar',
            projects_count INT DEFAULT 0,
            satisfaction NUMERIC(4,1) DEFAULT 98.5,
            logo_url TEXT,
            status VARCHAR(50) DEFAULT 'EN_ATTENTE',
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await sql`ALTER TABLE sat_partners ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'EN_ATTENTE';`;
          await sql`ALTER TABLE sat_partners ADD COLUMN IF NOT EXISTS data JSONB;`;
          await sql`ALTER TABLE sat_partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
        } catch (_) { /* ignore */ }

        await sql`
          CREATE TABLE IF NOT EXISTS sat_ambassadors (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            region VARCHAR(100) NOT NULL,
            points INT DEFAULT 0,
            earnings_fcfa NUMERIC DEFAULT 0,
            signed_clients INT DEFAULT 0,
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10. Generic Records (Assignments, Certificates, Payouts, Schedules)
        await sql`
          CREATE TABLE IF NOT EXISTS sat_records (
            id VARCHAR(100) PRIMARY KEY,
            collection VARCHAR(100) NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10b. Programs / Initiatives / Flagship
        await sql`
          CREATE TABLE IF NOT EXISTS sat_programs (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE,
            description TEXT,
            category VARCHAR(100),
            status VARCHAR(50) DEFAULT 'ACTIF',
            is_flagship BOOLEAN DEFAULT false,
            is_draft BOOLEAN DEFAULT false,
            sprint_duration_days INT DEFAULT 7,
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10c. Solutions delivered by programs
        await sql`
          CREATE TABLE IF NOT EXISTS sat_solutions (
            id VARCHAR(100) PRIMARY KEY,
            program_id VARCHAR(100),
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE,
            description TEXT,
            category VARCHAR(100),
            status VARCHAR(50) DEFAULT 'LIVRE',
            sprint_number INT,
            impact_metric VARCHAR(255),
            metrics JSONB,
            stack_tech JSONB,
            image_url TEXT,
            demo_url TEXT,
            is_published BOOLEAN DEFAULT true,
            is_draft BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10d. Community challenges / ideas submitted
        await sql`
          CREATE TABLE IF NOT EXISTS sat_challenges (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            submitted_by_name VARCHAR(255),
            submitted_by_email VARCHAR(255),
            submitted_by_phone VARCHAR(50),
            sector VARCHAR(100),
            city VARCHAR(100),
            estimated_budget_fcfa NUMERIC DEFAULT 0,
            status VARCHAR(50) DEFAULT 'EN_ATTENTE',
            is_published BOOLEAN DEFAULT false,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10e. Publications / ads for programs and solutions
        await sql`
          CREATE TABLE IF NOT EXISTS sat_publications (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT,
            type VARCHAR(50) DEFAULT 'SOLUTION',
            program_id VARCHAR(100),
            solution_id VARCHAR(100),
            challenge_id VARCHAR(100),
            media_url TEXT,
            media_type VARCHAR(50),
            call_to_action VARCHAR(255),
            target_url VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            is_draft BOOLEAN DEFAULT false,
            published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 10. Leadership & Dirigeants
        await sql`
          CREATE TABLE IF NOT EXISTS sat_leadership (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            focus VARCHAR(255),
            phone VARCHAR(50),
            email VARCHAR(255),
            photo_url TEXT,
            active BOOLEAN DEFAULT true,
            order_num INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 11. Tickets Support & Contact
        await sql`
          CREATE TABLE IF NOT EXISTS sat_tickets (
            id VARCHAR(100) PRIMARY KEY,
            user_name VARCHAR(255) NOT NULL,
            user_phone VARCHAR(50) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'OUVERT',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 12. System Configuration
        await sql`
          CREATE TABLE IF NOT EXISTS sat_system_config (
            key VARCHAR(100) PRIMARY KEY,
            config_json JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 13. Security & Pare-Feu (IP Blocklist)
        await sql`
          CREATE TABLE IF NOT EXISTS sat_blocked_ips (
            ip_address VARCHAR(100) PRIMARY KEY,
            reason VARCHAR(255),
            attempts INT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'BLOCKED',
            unlocks_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // 14. Portfolio Pro / Réalisations Chantiers
        await sql`
          CREATE TABLE IF NOT EXISTS sat_pro_portfolio (
            id VARCHAR(100) PRIMARY KEY,
            pro_id VARCHAR(100) NOT NULL,
            pro_name VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            specialty VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            estimated_cost_fcfa INT DEFAULT 0,
            execution_time VARCHAR(100),
            description TEXT,
            guarantee_period VARCHAR(100),
            main_media_url TEXT NOT NULL,
            main_media_type VARCHAR(50) DEFAULT 'image',
            gallery_images TEXT[] DEFAULT '{}',
            verified_badge BOOLEAN DEFAULT true,
            rating DECIMAL(3,2) DEFAULT 5.0,
            views_count INT DEFAULT 0,
            contacts_count INT DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // === CREATION OF PERFORMANCE INDEXES FOR RAPID SEARCH & RETRIEVAL ===
        const indexQueries = [
          // Users
          `CREATE INDEX IF NOT EXISTS sat_users_role_idx ON sat_users (role);`,
          `CREATE INDEX IF NOT EXISTS sat_users_name_idx ON sat_users (full_name);`,
          // Orders (ID / Order Number, Phone, Email, Status, Date)
          `CREATE INDEX IF NOT EXISTS sat_orders_phone_idx ON sat_orders (customer_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_orders_email_idx ON sat_orders (customer_email);`,
          `CREATE INDEX IF NOT EXISTS sat_orders_status_idx ON sat_orders (payment_status);`,
          `CREATE INDEX IF NOT EXISTS sat_orders_date_idx ON sat_orders (created_at DESC);`,
          // Certificates (Certificate Number, Student Phone, Student Email, Student Name, QR Code)
          `CREATE INDEX IF NOT EXISTS sat_certs_number_idx ON sat_certificates (certificate_number);`,
          `CREATE INDEX IF NOT EXISTS sat_certs_phone_idx ON sat_certificates (student_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_certs_email_idx ON sat_certificates (student_email);`,
          `CREATE INDEX IF NOT EXISTS sat_certs_name_idx ON sat_certificates (student_name);`,
          `CREATE INDEX IF NOT EXISTS sat_certs_qrcode_idx ON sat_certificates (qr_verification_code);`,
          // Invoices (Invoice Number, Order ID, Client Phone, Client Email)
          `CREATE INDEX IF NOT EXISTS sat_invoices_num_idx ON sat_invoices (invoice_number);`,
          `CREATE INDEX IF NOT EXISTS sat_invoices_order_idx ON sat_invoices (order_id);`,
          `CREATE INDEX IF NOT EXISTS sat_invoices_phone_idx ON sat_invoices (client_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_invoices_email_idx ON sat_invoices (client_email);`,
          // Quotes (User Phone, Pole, Status, Date)
          `CREATE INDEX IF NOT EXISTS sat_quotes_phone_idx ON sat_quotes (user_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_quotes_pole_idx ON sat_quotes (pole);`,
          `CREATE INDEX IF NOT EXISTS sat_quotes_status_idx ON sat_quotes (status);`,
          `CREATE INDEX IF NOT EXISTS sat_quotes_date_idx ON sat_quotes (created_at DESC);`,
          // Bookings (Client Phone, Pro Name, Status, Date)
          `CREATE INDEX IF NOT EXISTS sat_bookings_phone_idx ON sat_bookings (client_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_bookings_pro_idx ON sat_bookings (pro_name);`,
          `CREATE INDEX IF NOT EXISTS sat_bookings_status_idx ON sat_bookings (status);`,
          // Products (Category, Name, Price)
          `CREATE INDEX IF NOT EXISTS sat_products_cat_idx ON sat_products (category);`,
          `CREATE INDEX IF NOT EXISTS sat_products_name_idx ON sat_products (name);`,
          // Courses (Category, Title)
          `CREATE INDEX IF NOT EXISTS sat_courses_cat_idx ON sat_courses (category);`,
          `CREATE INDEX IF NOT EXISTS sat_courses_title_idx ON sat_courses (title);`,
          // Providers (Phone, Category, Location)
          `CREATE INDEX IF NOT EXISTS sat_providers_phone_idx ON sat_providers (phone);`,
          `CREATE INDEX IF NOT EXISTS sat_providers_cat_idx ON sat_providers (category);`,
          // Tickets (User Phone, Status)
          `CREATE INDEX IF NOT EXISTS sat_tickets_phone_idx ON sat_tickets (user_phone);`,
          `CREATE INDEX IF NOT EXISTS sat_tickets_status_idx ON sat_tickets (status);`,
          // Programs (Status, Flagship, Draft, Category)
          `CREATE INDEX IF NOT EXISTS sat_programs_status_idx ON sat_programs (status);`,
          `CREATE INDEX IF NOT EXISTS sat_programs_slug_idx ON sat_programs (slug);`,
          `CREATE INDEX IF NOT EXISTS sat_programs_category_idx ON sat_programs (category);`,
          // Solutions (Program, Status, Published, Sprint)
          `CREATE INDEX IF NOT EXISTS sat_solutions_program_id_idx ON sat_solutions (program_id);`,
          `CREATE INDEX IF NOT EXISTS sat_solutions_status_idx ON sat_solutions (status);`,
          `CREATE INDEX IF NOT EXISTS sat_solutions_category_idx ON sat_solutions (category);`,
          // Challenges (Status, Published, Sector)
          `CREATE INDEX IF NOT EXISTS sat_challenges_status_idx ON sat_challenges (status);`,
          `CREATE INDEX IF NOT EXISTS sat_challenges_sector_idx ON sat_challenges (sector);`,
          // Publications (Type, Active, Draft, Program/Solution/Challenge)
          `CREATE INDEX IF NOT EXISTS sat_publications_type_idx ON sat_publications (type);`,
          `CREATE INDEX IF NOT EXISTS sat_publications_is_active_idx ON sat_publications (is_active);`,
          // Pro Portfolio (Pro ID, Specialty, Active, Created)
          `CREATE INDEX IF NOT EXISTS sat_pro_portfolio_pro_id_idx ON sat_pro_portfolio (pro_id);`,
          `CREATE INDEX IF NOT EXISTS sat_pro_portfolio_specialty_idx ON sat_pro_portfolio (specialty);`,
          `CREATE INDEX IF NOT EXISTS sat_pro_portfolio_active_idx ON sat_pro_portfolio (is_active);`,
          `CREATE INDEX IF NOT EXISTS sat_pro_portfolio_created_idx ON sat_pro_portfolio (created_at DESC);`
        ];

        for (const q of indexQueries) {
          try {
            await (sql as any)([q]);
          } catch (idxError) {
            // Index might already exist or is non-critical
          }
        }

        console.log("✅ Neon PostgreSQL complete schema and fast search indexes verified & initialized successfully.");
      } catch (error) {
        console.error("⚠️ Neon PostgreSQL initialization notice:", error);
        initPromise = null;
        throw error;
      }
    })();
  }
  return initPromise;
}
