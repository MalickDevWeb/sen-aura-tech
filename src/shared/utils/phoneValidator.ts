import type React from "react";

/**
 * Utilitaire de Validation et Formatage des Numéros de Téléphone du Sénégal
 * SEN AURA TECH - Normes ARTP Sénégal
 */

export interface SenegalPhoneValidation {
  isValid: boolean;
  error?: string;
  digits: string;           // 9 chiffres bruts (ex: 771234567)
  formatted: string;        // Format local aéré (ex: 77 123 45 67)
  international: string;    // Format international (ex: +221 77 123 45 67)
  carrier?: string;         // Orange, Free, Expresso, Promobile, Ligne Fixe
  carrierColor?: string;
}

// Préfixes autorisés au Sénégal (Mobiles & Fixes)
export const SENEGAL_PREFIXES = {
  ORANGE: ['77', '78'],
  FREE: ['76'],
  EXPRESSO: ['70'],
  PROMOBILE: ['75'],
  FIXE: ['33', '30', '32', '36', '71', '72'],
};

/**
 * Nettoie la saisie en temps réel :
 * - Refuse strictement TOUTES les lettres et caractères spéciaux
 * - Retire l'indicatif +221 / 00221 s'il a été collé
 * - Limite à 9 chiffres maximum
 */
export function sanitizeSenegalPhoneInput(input: string): string {
  if (!input) return '';

  // 1. Extraire uniquement les chiffres (0-9) - rejette instantanément toutes les lettres
  let digits = input.replace(/\D/g, '');

  // 2. Si l'utilisateur colle +221 ou 00221, supprimer l'indicatif pays
  if (digits.startsWith('00221')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('221') && digits.length > 9) {
    digits = digits.slice(3);
  }

  // 3. Bloquer à 9 chiffres max
  return digits.slice(0, 9);
}

/**
 * Formate une suite de chiffres au standard sénégalais : XX XXX XX XX (ex: 77 123 45 67)
 */
export function formatSenegalPhone(digitsOrRaw: string): string {
  const clean = sanitizeSenegalPhoneInput(digitsOrRaw);
  if (!clean) return '';

  const part1 = clean.slice(0, 2);
  const part2 = clean.slice(2, 5);
  const part3 = clean.slice(5, 7);
  const part4 = clean.slice(7, 9);

  return [part1, part2, part3, part4].filter(Boolean).join(' ');
}

/**
 * Identifie l'opérateur sénégalais à partir des 2 premiers chiffres
 */
export function detectSenegalCarrier(digits: string): { name: string; color: string; bg: string } | null {
  if (digits.length < 2) return null;
  const prefix = digits.slice(0, 2);

  if (SENEGAL_PREFIXES.ORANGE.includes(prefix)) {
    return { name: 'Orange', color: '#FF7900', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
  }
  if (SENEGAL_PREFIXES.FREE.includes(prefix)) {
    return { name: 'Free', color: '#E2001A', bg: 'bg-red-500/10 text-red-400 border-red-500/30' };
  }
  if (SENEGAL_PREFIXES.EXPRESSO.includes(prefix)) {
    return { name: 'Expresso', color: '#0097D8', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
  }
  if (SENEGAL_PREFIXES.PROMOBILE.includes(prefix)) {
    return { name: 'Promobile', color: '#782b90', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  }
  if (SENEGAL_PREFIXES.FIXE.includes(prefix)) {
    return { name: 'Fixe Sonatel', color: '#008751', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }

  return null;
}

/**
 * Valide rigoureusement si un numéro est un numéro sénégalais conforme
 */
export function validateSenegalPhone(input: string): SenegalPhoneValidation {
  const digits = sanitizeSenegalPhoneInput(input);
  const formatted = formatSenegalPhone(digits);
  const international = digits ? `+221 ${formatted}` : '';
  const carrier = detectSenegalCarrier(digits);

  if (!digits) {
    return {
      isValid: false,
      error: 'Veuillez saisir un numéro de téléphone.',
      digits: '',
      formatted: '',
      international: '',
    };
  }

  if (digits.length < 9) {
    return {
      isValid: false,
      error: `Numéro incomplet (${digits.length}/9 chiffres). Format requis: 77 123 45 67`,
      digits,
      formatted,
      international,
      carrier: carrier?.name,
      carrierColor: carrier?.color,
    };
  }

  // Vérifier le préfixe
  const prefix = digits.slice(0, 2);
  const allPrefixes = [
    ...SENEGAL_PREFIXES.ORANGE,
    ...SENEGAL_PREFIXES.FREE,
    ...SENEGAL_PREFIXES.EXPRESSO,
    ...SENEGAL_PREFIXES.PROMOBILE,
    ...SENEGAL_PREFIXES.FIXE,
  ];

  if (!allPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: `Préfixe "${prefix}" non reconnu au Sénégal. Utilisez 77, 78, 76, 70, 75 ou 33.`,
      digits,
      formatted,
      international,
    };
  }

  return {
    isValid: true,
    digits,
    formatted,
    international,
    carrier: carrier?.name,
    carrierColor: carrier?.color,
  };
}

/**
 * Gestionnaire d'événement prêt à l'emploi pour les balises <input>
 * Bloque la frappe des lettres et formate instantanément en XX XXX XX XX
 */
export function handlePhoneInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  onChangeFormatted: (formatted: string, rawDigits: string) => void
) {
  const rawValue = e.target.value;
  const digits = sanitizeSenegalPhoneInput(rawValue);
  const formatted = formatSenegalPhone(digits);
  onChangeFormatted(formatted, digits);
}
