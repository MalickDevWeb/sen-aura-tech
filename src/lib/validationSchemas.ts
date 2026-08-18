import { z } from "zod";
import { validateSenegalPhone, sanitizeSenegalPhoneInput } from "../shared/utils/phoneValidator";

/**
 * Custom Zod validator for Senegalese phone numbers
 */
export const senegalPhoneZod = z
  .string()
  .min(1, { message: "Le numéro de téléphone est obligatoire." })
  .refine(
    (val) => {
      const result = validateSenegalPhone(val);
      return result.isValid;
    },
    {
      message: "Numéro invalide. Préfixes autorisés : 77, 78, 76, 70, 75 ou 33 (9 chiffres).",
    }
  );

/**
 * Custom Zod validator for 4-digit security PIN
 */
export const pinCodeZod = z
  .string()
  .min(1, { message: "Le code PIN secret est obligatoire." })
  .regex(/^\d{4}$/, { message: "Le code PIN doit comporter exactement 4 chiffres numériques." });

/**
 * Auth Login Schema
 */
export const authLoginSchema = z.object({
  phone: senegalPhoneZod,
  pin: pinCodeZod,
});

/**
 * Auth Register Schema
 */
export const authRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Le nom complet doit contenir au moins 2 caractères." })
      .max(60, { message: "Le nom complet ne peut pas dépasser 60 caractères." }),
    phone: senegalPhoneZod,
    email: z
      .string()
      .trim()
      .email({ message: "Veuillez saisir une adresse email valide (ex: contact@domaine.sn)." })
      .optional()
      .or(z.literal("")),
    pin: pinCodeZod,
    confirmPin: z.string().min(1, { message: "Veuillez confirmer votre code PIN." }),
    role: z.enum(["CLIENT", "PROFESSIONAL", "FORMATEUR", "VENDEUR", "AMBASSADOR", "SUPERADMIN"]).default("CLIENT"),
    region: z.string().min(1, { message: "Veuillez sélectionner votre région." }).default("Dakar"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "Les deux codes PIN ne correspondent pas.",
    path: ["confirmPin"],
  });

/**
 * Quote Request Schema
 */
export const quoteRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Veuillez renseigner votre nom complet (au moins 2 caractères)." }),
  phone: senegalPhoneZod,
  email: z
    .string()
    .trim()
    .email({ message: "Veuillez saisir une adresse email valide." })
    .optional()
    .or(z.literal("")),
  pole: z.string().min(1, { message: "Veuillez sélectionner un pôle d'expertise." }),
  projectDetails: z
    .string()
    .trim()
    .min(5, { message: "Veuillez décrire brièvement votre besoin (au moins 5 caractères)." }),
  region: z.string().min(1, { message: "Veuillez sélectionner votre région." }),
  budgetFCFA: z.number().nonnegative().optional(),
});

/**
 * Booking / Reservation Schema
 */
export const bookingSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, { message: "Le nom du client est requis (au moins 2 caractères)." }),
  clientPhone: senegalPhoneZod,
  serviceName: z.string().min(1, { message: "Le service ou la prestation est obligatoire." }),
  date: z.string().min(1, { message: "Veuillez sélectionner une date d'intervention." }),
  time: z.string().min(1, { message: "Veuillez sélectionner un horaire." }),
  address: z.string().trim().min(3, { message: "Veuillez préciser l'adresse ou la ville d'intervention." }),
});

/**
 * Change PIN / Security Schema
 */
export const changePinSchema = z.object({
  newPin: pinCodeZod,
});

export const fullChangePinSchema = z
  .object({
    oldPin: pinCodeZod,
    newPin: pinCodeZod,
    confirmNewPin: z.string().min(1, { message: "Veuillez confirmer le nouveau code PIN." }),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "La confirmation du nouveau code PIN ne correspond pas.",
    path: ["confirmNewPin"],
  });

export interface ValidationSuccess<T> {
  success: true;
  data: T;
  errors: Record<string, string>;
  firstError: string;
}

export interface ValidationFailure {
  success: false;
  data: null;
  errors: Record<string, string>;
  firstError: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Utility helper to validate any form using Zod schemas
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: {}, firstError: "" };
  }

  const errors: Record<string, string> = {};
  let firstError = "Formulaire invalide. Veuillez vérifier les champs.";

  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "form";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  if (result.error.issues.length > 0) {
    firstError = result.error.issues[0].message;
  }

  return { success: false, data: null, errors, firstError };
}

