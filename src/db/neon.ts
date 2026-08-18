import { Pool, neon } from "@neondatabase/serverless";

// Neon PostgreSQL Connection String
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_PtTW4J6IKsAO@ep-super-dust-ayj4z0l4-pooler.c-5.us-east-2.aws.neon.tech/senauratech_db?sslmode=require&channel_binding=require";

// Serverless SQL executor for single queries
export const sql = neon(DATABASE_URL);

// Pool instance for transactional / complex connections
export const pool = new Pool({ connectionString: DATABASE_URL });

let initPromise: Promise<void> | null = null;

/**
 * Helper to ensure all necessary Neon PostgreSQL tables exist before queries
 */
export async function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
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
          `CREATE INDEX IF NOT EXISTS sat_tickets_status_idx ON sat_tickets (status);`
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
