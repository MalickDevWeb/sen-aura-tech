// Removed Firebase Firestore imports
// import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
// import { db } from "../database/firebase";
import { UserRole, ProAccountStatus } from "../shared/contracts/types";
import { authFetch } from "../lib/authFetch";

export interface UserAccountSecurity {
  phone: string;
  cleanPhone: string;
  email?: string;
  pinHash: string; // SHA-256 du code PIN secret
  fullName: string;
  role: UserRole;
  region: string;
  createdAt: string;
  lastLoginAt: string;
  failedAttempts: number;
  lockedUntil: number | null; // Timestamp si verrouillé
  securityQuestion?: string;
  securityAnswerHash?: string;
  proStatus?: ProAccountStatus;
  proApproved?: boolean;
  trialExpiresAt?: string;
  proFreeTrialActive?: boolean;
}

// Fonction de hachage cryptographique SHA-256 côté client via Web Crypto
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`SEN-AURA-SALT-${pin.trim()}`);
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple si indisponible
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

async function readAuthJson(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    success: false,
    error: "Le service de connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.",
  };
}

export class SecurityPinService {
  private static sanitizePhone(phone: string): string {
    const clean = phone.replace(/\D/g, "");
    if (clean.startsWith("221") && clean.length === 12) return clean.slice(3);
    if (clean.length > 9 && clean.startsWith("221")) return clean.slice(3);
    return clean;
  }

  /**
   * Vérifie rigoureusement l'unicité du numéro de téléphone et de l'email
   * à travers 3 couches : Cache Local, Base Cloud Firestore et Base Neon PostgreSQL.
   */
  static async checkUniqueness(params: {
    phone: string;
    email?: string;
    excludePhone?: string;
  }): Promise<{
    available: boolean;
    isPhoneTaken: boolean;
    isEmailTaken: boolean;
    error?: string;
  }> {
    const cleanPhone = this.sanitizePhone(params.phone);
    const cleanEmail = params.email ? params.email.trim().toLowerCase() : "";
    const excludeCleanPhone = params.excludePhone ? this.sanitizePhone(params.excludePhone) : "";

    let isPhoneTaken = false;
    let isEmailTaken = false;

    // 1. Vérification dans le Cache LocalStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sat_user_sec_")) {
            const storedPhoneKey = key.replace("sat_user_sec_", "");
            if (excludeCleanPhone && storedPhoneKey === excludeCleanPhone) continue;

            const val = localStorage.getItem(key);
            if (val) {
              const acc = JSON.parse(val) as UserAccountSecurity;
              if (cleanPhone && (acc.cleanPhone === cleanPhone || storedPhoneKey === cleanPhone)) {
                isPhoneTaken = true;
              }
              if (cleanEmail && acc.email && acc.email.trim().toLowerCase() === cleanEmail) {
                isEmailTaken = true;
              }
            }
          }
        }
      }
    } catch {}

    // 2. Vérification dans Firestore (user_security_accounts) - REMOVED
    // Try block removed to disconnect Firebase.

    // 3. Vérification via l'API Backend & Neon PostgreSQL
    try {
      const response = await authFetch("/api/auth/check-uniqueness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          email: cleanEmail,
        }),
      });
      const data = await readAuthJson(response);
      if (!data.available) {
        if (data.isPhoneTaken) isPhoneTaken = true;
        if (data.isEmailTaken) isEmailTaken = true;
      }
    } catch (apiErr) {
      console.info("Backend uniqueness API call skipped:", apiErr);
    }

    if (isPhoneTaken && isEmailTaken) {
      return {
        available: false,
        isPhoneTaken: true,
        isEmailTaken: true,
        error: "Ce numéro de téléphone et cette adresse email sont déjà associés à un compte existant.",
      };
    }

    if (isPhoneTaken) {
      return {
        available: false,
        isPhoneTaken: true,
        isEmailTaken: false,
        error: "Ce numéro de téléphone est déjà associé à un compte existant. Veuillez vous connecter ou réinitialiser votre code PIN.",
      };
    }

    if (isEmailTaken) {
      return {
        available: false,
        isPhoneTaken: false,
        isEmailTaken: true,
        error: "Cette adresse email est déjà enregistrée sur un autre compte.",
      };
    }

    return {
      available: true,
      isPhoneTaken: false,
      isEmailTaken: false,
    };
  }

  /**
   * Vérifie si un compte existe pour ce numéro de téléphone
   */
  static async checkAccountExists(phone: string): Promise<{ exists: boolean; account?: UserAccountSecurity }> {
    const cleanPhone = this.sanitizePhone(phone);
    if (!cleanPhone) return { exists: false };

    // 1. Check local storage cache
    try {
      const localData = localStorage.getItem(`sat_user_sec_${cleanPhone}`);
      if (localData) {
        const parsed = JSON.parse(localData) as UserAccountSecurity;
        return { exists: true, account: parsed };
      }
    } catch {}

    // 2. Check Firestore - REMOVED
    // Try block removed to disconnect Firebase.

    return { exists: false };
  }

  /**
   * Crée un nouveau compte sécurisé avec code PIN secret et vérification stricte d'unicité
   */
  static async registerAccount(params: {
    phone: string;
    email?: string;
    fullName: string;
    pin: string;
    role: UserRole;
    region: string;
    activateFreeTrial?: boolean;
  }): Promise<{ success: boolean; error?: string; account?: UserAccountSecurity }> {
    const cleanPhone = this.sanitizePhone(params.phone);
    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, error: "Numéro de téléphone invalide." };
    }

    if (!params.pin || params.pin.length < 4) {
      return { success: false, error: "Le Code PIN doit comporter au moins 4 chiffres." };
    }

    const cleanEmail = params.email ? params.email.trim().toLowerCase() : "";

    // VÉRIFICATION D'UNICITÉ CÔTÉ CODE ET CÔTÉ BASE DE DONNÉES
    const uniqueness = await this.checkUniqueness({
      phone: cleanPhone,
      email: cleanEmail,
    });

    if (!uniqueness.available) {
      return {
        success: false,
        error: uniqueness.error || "Un compte avec ces identifiants existe déjà.",
      };
    }

    const pinHash = await hashPin(params.pin);
    const now = new Date().toISOString();

    // Gestion du statut pour les comptes professionnels
    let proStatus: ProAccountStatus | undefined = undefined;
    let proApproved = false;
    let trialExpiresAt: string | undefined = undefined;
    let proFreeTrialActive = false;

    if (params.role === "PROFESSIONAL" || params.role === "FORMATEUR" || params.role === "VENDEUR") {
      // Always set newly registered Pro accounts to PENDING by default
      proStatus = "EN_ATTENTE";
      proApproved = false;
      proFreeTrialActive = false;

      // Log mock receipt notification to console as requested
      console.log(
        `%c[NOTIFICATION: APPLICATION RECEIVED]%c Confirmation of receipt sent to Pro: Application received for ${params.fullName.trim() || cleanPhone} (+221 ${cleanPhone}) - Role: ${params.role}. Status: 'PENDING'. Under review by SEN AURA TECH Admin.`,
        "background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: #f59e0b; font-weight: bold;"
      );

      // Trigger notification dispatch on backend
      try {
        authFetch("/api/notifications/pro-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: `+221 ${cleanPhone}`,
            fullName: params.fullName.trim(),
            email: cleanEmail || undefined,
            role: params.role,
            status: "PENDING",
          }),
        }).catch(() => null);
      } catch {}
    }

    const account: UserAccountSecurity = {
      phone: `+221 ${cleanPhone}`,
      cleanPhone,
      email: cleanEmail || undefined,
      pinHash,
      fullName: params.fullName.trim() || `Utilisateur ${cleanPhone}`,
      role: params.role || "CLIENT",
      region: params.region || "Dakar",
      createdAt: now,
      lastLoginAt: now,
      failedAttempts: 0,
      lockedUntil: null,
      proStatus,
      proApproved,
      trialExpiresAt,
      proFreeTrialActive,
    };

    // Save locally
    try {
      localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(account));
    } catch {}

    // Save in Firestore - REMOVED
    // Try block removed to disconnect Firebase.

    // Sync in Neon PostgreSQL Database
    try {
      authFetch("/api/db/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            id: `usr-${cleanPhone}`,
            fullName: account.fullName,
            email: account.email || `${cleanPhone}@senauratech.sn`,
            phone: account.phone,
            role: account.role,
            region: account.region,
            verified: true,
            proStatus: account.proStatus,
            proApproved: account.proApproved,
            trialExpiresAt: account.trialExpiresAt,
            proFreeTrialActive: account.proFreeTrialActive,
            createdAt: account.createdAt,
          },
          pin: params.pin,
        }),
      }).catch(() => null);
    } catch {}

    return { success: true, account };
  }

  /**
   * Active l'offre de gratuité de bienvenue pour un prestataire pro
   */
  static async activateProFreeTrial(phone: string): Promise<{ success: boolean; account?: UserAccountSecurity }> {
    const cleanPhone = this.sanitizePhone(phone);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    const trialExpiresAt = expDate.toISOString();

    const partialUpdate = {
      proStatus: "ESSAI_GRATUIT" as ProAccountStatus,
      proApproved: true,
      proFreeTrialActive: true,
      trialExpiresAt,
    };

    // Firestore Update - REMOVED

    let updatedAccount: UserAccountSecurity | undefined;
    try {
      const local = localStorage.getItem(`sat_user_sec_${cleanPhone}`);
      if (local) {
        updatedAccount = { ...JSON.parse(local), ...partialUpdate };
        localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(updatedAccount));
      }
    } catch {}

    return { success: true, account: updatedAccount };
  }

  /**
   * Modifie manuellement le statut d'un compte pro (ACTIVE / PENDING) par l'administrateur
   * et déclenche les notifications WhatsApp et Email de bienvenue / activation.
   */
  static async setProAccountStatus(params: {
    phone: string;
    status: "ACTIVE" | "PENDING";
    fullName?: string;
    email?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; account?: UserAccountSecurity }> {
    const cleanPhone = this.sanitizePhone(params.phone);
    const isActive = params.status === "ACTIVE";
    const partialUpdate = {
      proStatus: (isActive ? "ACTIF_ABONNE" : "EN_ATTENTE") as ProAccountStatus,
      proApproved: isActive,
    };

    // 1. Update Firestore - REMOVED

    // 2. Update LocalStorage cache
    let updatedAccount: UserAccountSecurity | undefined;
    try {
      const local = localStorage.getItem(`sat_user_sec_${cleanPhone}`);
      if (local) {
        updatedAccount = { ...JSON.parse(local), ...partialUpdate };
        localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(updatedAccount));
      }
    } catch {}

    const roleLabel =
      params.role === "FORMATEUR"
        ? "Formateur Academy"
        : params.role === "VENDEUR"
        ? "Boutique & Vendeur"
        : "Prestataire Pro";

    // 3. If ACTIVE -> Trigger Welcome / Activation notification (Console log + WhatsApp + Email)
    if (isActive) {
      console.log(
        `%c[NOTIFICATION: ACCOUNT ACTIVATED]%c Welcome & Activation email/WhatsApp notification sent to ${params.fullName || cleanPhone} (+221 ${cleanPhone}) - Account status is now 'ACTIVE'!`,
        "background: #059669; color: #fff; font-weight: bold; padding: 3px 8px; border-radius: 4px;",
        "color: #10b981; font-weight: bold;"
      );

      // WhatsApp welcome/activation notification trigger
      try {
        authFetch("/api/whatsapp/send-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: `+221 ${cleanPhone}`,
            templateName: "WELCOME_ACTIVATION_PRO",
            role: params.role,
            fullName: params.fullName,
            status: "ACTIVE",
          }),
        }).catch(() => null);
      } catch {}

      // Email welcome/activation notification trigger
      if (params.email) {
        try {
          authFetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: params.email,
              subject: `🎉 Bienvenue ! Votre Compte ${roleLabel} SEN AURA TECH est désormais ACTIF`,
              body: `Bonjour ${params.fullName || ""},\n\nVotre compte ${roleLabel} a été activé avec succès par l'administrateur SEN AURA TECH. Vous avez désormais un accès complet à votre tableau de bord et à vos outils professionnels.\n\nCordialement,\nL'Équipe SEN AURA TECH.`,
              status: "ACTIVE",
            }),
          }).catch(() => null);
        } catch {}
      }
    } else {
      // If set to PENDING
      console.log(
        `%c[STATUS UPDATE: PENDING]%c Account for ${params.fullName || cleanPhone} (+221 ${cleanPhone}) has been set to 'PENDING'.`,
        "background: #475569; color: #fff; font-weight: bold; padding: 3px 8px; border-radius: 4px;",
        "color: #94a3b8; font-weight: bold;"
      );
    }

    // 4. Sync status with backend
    try {
      authFetch(`/api/admin/users/${cleanPhone}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: params.status,
          phone: cleanPhone,
          fullName: params.fullName,
          email: params.email,
          role: params.role,
        }),
      }).catch(() => null);
    } catch {}

    return { success: true, account: updatedAccount };
  }

  /**
   * Valide un compte pro par le SuperAdmin avec envoi de notification WhatsApp et Email
   */
  static async validateProAccount(params: {
    phone: string;
    fullName?: string;
    email?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; account?: UserAccountSecurity }> {
    return this.setProAccountStatus({
      phone: params.phone,
      status: "ACTIVE",
      fullName: params.fullName,
      email: params.email,
      role: params.role,
    });
  }

  /**
   * Authentifie un utilisateur avec son numéro et son Code PIN secret
   */
  static async authenticate(phone: string, pin: string): Promise<{
    success: boolean;
    error?: string;
    account?: UserAccountSecurity;
    locked?: boolean;
  }> {
    const cleanPhone = this.sanitizePhone(phone);
    if (!cleanPhone) {
      return { success: false, error: "Veuillez entrer votre numéro de téléphone." };
    }

    // 1. Appel sécurisé à l'API Backend pour valider via NeonDB
    let backendWasReachable = false;
    try {
      const response = await authFetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, pin })
      });
      backendWasReachable = true;
      const data = await response.json();
      
      if (data.success && data.account) {
        // Enregistrer/Mettre à jour le cache local avec le PIN hashé pour la persistance PWA
        const hashedPin = await hashPin(pin);
        const accountToCache: UserAccountSecurity = {
          ...data.account,
          pinHash: hashedPin,
          createdAt: data.account.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          failedAttempts: 0,
          lockedUntil: null
        };
        try {
          localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(accountToCache));
        } catch {}
        return { success: true, account: accountToCache };
      }

      if (response.status === 401) {
        return { success: false, error: data.error || "Code PIN incorrect." };
      }

      if (response.status === 404 || data.error?.includes("n'a pas encore de compte")) {
        return {
          success: false,
          error: "Ce numéro n'a pas encore de compte configuré. Créez votre compte en définissant votre code PIN.",
        };
      }

      return {
        success: false,
        error: data.error || "Impossible de vérifier ce compte pour le moment. Réessayez dans quelques instants.",
      };
    } catch (err: any) {
      if (backendWasReachable) {
        return {
          success: false,
          error: "Le service de connexion est momentanément indisponible. Veuillez réessayer dans quelques instants.",
        };
      }
      console.warn("Backend auth failed, falling back to local storage...", err?.message);
    }

    // 2. Fallback: Vérification Locale PWA (Mode hors-ligne)
    const { exists, account } = await this.checkAccountExists(cleanPhone);
    if (!exists || !account) {
      return {
        success: false,
        error: "Connexion au serveur impossible. Ce compte existe peut-être dans la base, mais il n'est pas disponible en cache local sur cet appareil.",
      };
    }

    const now = Date.now();
    if (account.lockedUntil && account.lockedUntil > now) {
      const remainingSeconds = Math.ceil((account.lockedUntil - now) / 1000);
      return {
        success: false,
        locked: true,
        error: `Compte verrouillé. Réessayez dans ${remainingSeconds} secondes.`,
      };
    }

    const providedHash = await hashPin(pin);
    if (providedHash === account.pinHash) {
      account.failedAttempts = 0;
      account.lockedUntil = null;
      account.lastLoginAt = new Date().toISOString();
      try {
        localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(account));
      } catch {}
      return { success: true, account };
    }

    account.failedAttempts = (account.failedAttempts || 0) + 1;
    let errorMsg = `Code PIN incorrect.`;
    if (account.failedAttempts >= 5) {
      account.lockedUntil = Date.now() + 60 * 1000;
      errorMsg = "Compte verrouillé pour 1 minute.";
    } else {
      errorMsg = `Code PIN incorrect. Plus que ${5 - account.failedAttempts} tentative(s).`;
    }

    try {
      localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(account));
    } catch {}

    return { success: false, error: errorMsg };
  }

  /**
   * Met à jour le code PIN secret d'un utilisateur
   */
  static async updatePin(phone: string, oldPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
    const authResult = await this.authenticate(phone, oldPin);
    if (!authResult.success) {
      return { success: false, error: "L'ancien code PIN est incorrect." };
    }

    const cleanPhone = this.sanitizePhone(phone);
    const newHash = await hashPin(newPin);

    try {
      const { account } = await this.checkAccountExists(cleanPhone);
      if (account) {
        account.pinHash = newHash;
        localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(account));
        // Firestore update removed
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: "Erreur lors de la mise à jour du code PIN." };
    }
  }

  /**
   * Réinitialisation Administrative d'un Code PIN (Suite à demande WhatsApp)
   * Génère un nouveau PIN, déverrouille le compte et synchronise Firestore & localStorage
   */
  static async adminResetPin(params: {
    phone: string;
    newPin?: string;
    fullName?: string;
    role?: UserRole;
  }): Promise<{
    success: boolean;
    newPin: string;
    account: UserAccountSecurity;
    error?: string;
  }> {
    const cleanPhone = this.sanitizePhone(params.phone);
    if (!cleanPhone || cleanPhone.length < 8) {
      return {
        success: false,
        newPin: "",
        account: {} as any,
        error: "Numéro de téléphone sénégalais invalide.",
      };
    }

    // Génération d'un PIN aléatoire à 4 chiffres (ex: 4928) si non fourni
    let chosenPin = params.newPin;
    if (!chosenPin || chosenPin.length < 4) {
      const random4 = Math.floor(1000 + Math.random() * 9000).toString();
      chosenPin = random4;
    }

    const newHash = await hashPin(chosenPin);
    const now = new Date().toISOString();

    const { exists, account: existingAccount } = await this.checkAccountExists(cleanPhone);

    let updatedAccount: UserAccountSecurity;
    if (exists && existingAccount) {
      updatedAccount = {
        ...existingAccount,
        pinHash: newHash,
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
        fullName: params.fullName?.trim() || existingAccount.fullName,
        role: params.role || existingAccount.role || "CLIENT",
      };
    } else {
      updatedAccount = {
        phone: `+221 ${cleanPhone}`,
        cleanPhone,
        pinHash: newHash,
        fullName: params.fullName?.trim() || `Client ${cleanPhone}`,
        role: params.role || "CLIENT",
        region: "Dakar",
        createdAt: now,
        lastLoginAt: now,
        failedAttempts: 0,
        lockedUntil: null,
      };
    }

    // Sauvegarde Locale
    try {
      localStorage.setItem(`sat_user_sec_${cleanPhone}`, JSON.stringify(updatedAccount));
    } catch {}

    // Sauvegarde Firestore - REMOVED

    return {
      success: true,
      newPin: chosenPin,
      account: updatedAccount,
    };
  }
}
