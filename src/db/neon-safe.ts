import { sql, initializeDatabase, DATABASE_URL } from "./neon";

/**
 * Safely wraps database operations with:
 * - Lazy initialization (only when first called)
 * - Error boundary for missing DATABASE_URL
 * - Graceful fallback responses
 */

let isDbInitialized = false;
let initError: Error | null = null;

async function safeInitDb() {
  if (isDbInitialized || initError) {
    if (initError) throw initError;
    return;
  }

  if (!DATABASE_URL) {
    initError = new Error("DATABASE_URL environment variable is required");
    throw initError;
  }

  try {
    await initializeDatabase();
    isDbInitialized = true;
  } catch (e) {
    initError = e as Error;
    throw initError;
  }
}

/**
 * Wraps any database call with initialization and error handling
 */
export async function withDb<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    await safeInitDb();
    return await fn();
  } catch (err) {
    console.error("[DB Error]", err);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export { sql, initializeDatabase };
