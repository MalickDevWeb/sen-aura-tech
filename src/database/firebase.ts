import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserRole } from "../shared/contracts/types";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string;
  role: UserRole;
  region: string;
  createdAt: string;
}

// AuthService for managing user authentication and profiles
export class AuthService {
  /**
   * Vérifie l'unicité de l'email et du téléphone dans Firestore (collection users)
   */
  static async checkFirestoreUniqueness(phone?: string, email?: string): Promise<{
    available: boolean;
    isPhoneTaken: boolean;
    isEmailTaken: boolean;
    error?: string;
  }> {
    let isPhoneTaken = false;
    let isEmailTaken = false;

    try {
      const usersRef = collection(db, "users");

      if (phone) {
        const cleanDigits = phone.replace(/\D/g, "");
        const normPhone = cleanDigits.startsWith("221") && cleanDigits.length === 12 ? cleanDigits.slice(3) : cleanDigits;
        
        const qPhone = query(usersRef, where("phone", "==", phone));
        const snapPhone = await getDocs(qPhone);
        if (!snapPhone.empty) isPhoneTaken = true;

        if (!isPhoneTaken && normPhone) {
          const qPhone2 = query(usersRef, where("phone", "==", `+221 ${normPhone}`));
          const snapPhone2 = await getDocs(qPhone2);
          if (!snapPhone2.empty) isPhoneTaken = true;
        }
      }

      if (email) {
        const normEmail = email.trim().toLowerCase();
        const qEmail = query(usersRef, where("email", "==", normEmail));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) isEmailTaken = true;
      }
    } catch (e) {
      console.warn("Firestore checkFirestoreUniqueness warning:", e);
    }

    if (isPhoneTaken || isEmailTaken) {
      return {
        available: false,
        isPhoneTaken,
        isEmailTaken,
        error: isPhoneTaken && isEmailTaken
          ? "Ce numéro et cet email sont déjà enregistrés."
          : isPhoneTaken
          ? "Ce numéro de téléphone est déjà associé à un compte."
          : "Cette adresse email est déjà utilisée.",
      };
    }

    return {
      available: true,
      isPhoneTaken: false,
      isEmailTaken: false,
    };
  }

  /**
   * Register a new user with email and password, and create a profile in Firestore
   */
  static async signUp(
    email: string, 
    pass: string, 
    fullName: string, 
    phone: string = "", 
    role: UserRole = "CLIENT", 
    region: string = "Dakar"
  ): Promise<UserProfile> {
    // Vérification d'unicité préalable
    const check = await this.checkFirestoreUniqueness(phone, email);
    if (!check.available) {
      throw new Error(check.error || "Un utilisateur avec ce numéro ou cet email existe déjà.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Update Auth Display Name
    await updateProfile(user, { displayName: fullName });

    // Store user metadata in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      phone,
      role,
      region,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "users", user.uid), userProfile);
    } catch (e) {
      console.warn("Could not save user profile to Firestore:", e);
    }

    return userProfile;
  }

  /**
   * Login an existing user with email and password
   */
  static async signIn(email: string, pass: string): Promise<UserProfile | null> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Fetch profile from Firestore
    return await this.getUserProfile(user.uid) || {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Utilisateur",
      role: "CLIENT",
      region: "Dakar",
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Sign in with Google Auth Provider
   */
  static async signInWithGoogle(role: UserRole = "CLIENT", region: string = "Dakar"): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if profile exists
    let profile = await this.getUserProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Utilisateur Google",
        phone: user.phoneNumber || "",
        role,
        region,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, "users", user.uid), profile);
      } catch (e) {
        console.warn("Could not save Google user profile to Firestore:", e);
      }
    }
    return profile;
  }

  /**
   * Fetch a user profile document from Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.warn("Error fetching user profile from Firestore:", e);
    }
    return null;
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /**
   * Listen to auth status changes
   */
  static onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export default app;
