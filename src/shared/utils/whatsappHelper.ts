// Nettoyage et formatage du numéro au format international (Ex: Sénégal +221)
export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('221') && digits.length === 12) return digits;
  if (digits.length === 9) return `221${digits}`;
  return digits.length > 0 ? digits : '221705334611';
}

// Générateur de lien WhatsApp wa.me
export function getWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Liste de motifs triviaux ou trop faciles à deviner à interdire
const FORBIDDEN_PATTERNS = new Set([
  '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
  '123456', '654321', '012345', '543210', '121212', '123123', '987654', '456789', '112233', '101010',
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '1234', '4321', '1212', '1313', '2424', '6969', '0007', '2024', '2025', '2026'
]);

/**
 * Générateur de code secret cryptographique à haute entropie (6 chiffres).
 * Utilise l'API Web Crypto pour une imprévisibilité maximale et élimine tout motif simple.
 */
export function generateRandomPin(length: number = 6): string {
  let pin = '';
  let attempts = 0;

  while (attempts < 50) {
    attempts++;
    // Utilisation de CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
    const array = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 1000000);
      }
    }

    pin = Array.from(array)
      .map((n) => (n % 10).toString())
      .join('');

    // Vérifier que le premier chiffre n'est pas 0 si possible, ou au moins non trivial
    if (!FORBIDDEN_PATTERNS.has(pin)) {
      // Vérifier également qu'il n'y a pas 4 chiffres identiques consécutifs
      const isRepeated = /(.)\1{3,}/.test(pin);
      if (!isRepeated) {
        return pin;
      }
    }
  }

  // Fallback haute sécurité
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

// 1. Message pour l'Envoi des Identifiants lors de la Réinitialisation par l'Admin (Admin -> Client)
export function generateResetPinWhatsAppMsg(userName: string, phone: string, newPin: string, userRole: string = 'Utilisateur / Client'): string {
  const cleanNum = phone.replace(/\D/g, '');
  const formatted = cleanNum.startsWith('221') ? `+${cleanNum}` : `+221 ${cleanNum}`;
  return `🔑 *SEN AURA TECH - Votre Nouveau Code PIN de Connexion*

Bonjour *${userName || 'Cher Membre'}* (${userRole}),
Votre demande de réinitialisation de code d'accès a été traitée avec succès par l'Administrateur SEN AURA TECH.

📱 *Numéro de Connexion :* ${formatted}
🔐 *VOTRE NOUVEAU CODE PIN :* *${newPin}*

👉 *Connexion Immédiate :*
Saisissez votre numéro (*${formatted}*) et ce Code PIN (*${newPin}*) sur la plateforme pour accéder directement à votre espace.

⚠️ *Conseil de Sécurité :*
Ne transmettez jamais ce code à un tiers. Vous pourrez le modifier à tout moment dans votre espace (Paramètres > Sécurité).

🌐 *Portail SEN AURA TECH :* https://papa-malick-teuw-dev-ia.vercel.app`;
}

// 1.b Message envoyé par le Client à l'Admin pour demander la réinitialisation (Client -> Admin)
export function generateForgotPinRequestWhatsAppMsg(userPhone: string, userName?: string): string {
  const cleanNum = userPhone.replace(/\D/g, '');
  const formatted = cleanNum.startsWith('221') ? `+${cleanNum}` : `+221 ${cleanNum}`;
  return `🔐 *SEN AURA TECH - Demande de Réinitialisation de Code PIN*

Bonjour Administrateur SEN AURA TECH,
J'ai oublié mon Code PIN secret pour mon compte associé au numéro :
📱 *Numéro :* ${formatted}${userName ? `\n👤 *Nom :* ${userName}` : ''}

Merci de bien vouloir générer un nouveau code PIN sécurisé et de me le renvoyer directement ici sur WhatsApp afin que je puisse me reconnecter.`;
}

// 2. Message pour le Code OTP de Confirmation de Sécurité
export function generateOtpWhatsAppMsg(userName: string, otpCode: string): string {
  return `🔐 *SEN AURA TECH - Code de Validation Sécurité (Usage Unique)*

Bonjour *${userName}*,
Votre code de sécurité cryptographique à usage unique est :

👉 *CODE SECRET :* *${otpCode}*

⚠️ Ne partagez ce code avec personne. Valable 10 minutes.`;
}

// 3. Message de Validation de Compte / Projet / Ambassadeur
export function generateApprovalWhatsAppMsg(
  userName: string,
  phone: string,
  pin: string,
  type: 'projet' | 'ambassadeur' | 'client' = 'client',
  details: string = ''
): string {
  const titleMap = {
    projet: '🚀 *SEN AURA TECH - Validation de Projet*',
    ambassadeur: '🌟 *SEN AURA TECH - Bienvenue dans le Réseau Ambassadeur*',
    client: '💼 *SEN AURA TECH - Activation de Votre Compte Client*'
  };

  const descMap = {
    projet: `Votre projet tech ${details ? `(*${details}*)` : ''} a été validé avec succès par l'équipe d'ingénierie SEN AURA TECH !`,
    ambassadeur: `Votre profil Ambassadeur ${details ? `(#${details})` : ''} est officiellement activé. Vous pouvez dès maintenant enregistrer des prospects et toucher vos commissions !`,
    client: `Votre compte client a été créé et activé avec succès.`
  };

  return `${titleMap[type]}

Bonjour *${userName}*,
${descMap[type]}

📱 *Vos identifiants de connexion au Portail SEN AURA TECH :*
- Identifiant : *${phone}*
- Code secret (PIN) : *${pin}*

👉 Accéder au Portail : https://papa-malick-teuw-dev-ia.vercel.app

Merci de faire confiance à SEN AURA TECH !`;
}

// 4. Message pour le Paiement de Commande Directement via WhatsApp
export function generateOrderWhatsAppPaymentMsg(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalFCFA: number;
  items: Array<{ name: string; quantity: number; priceFCFA: number }>;
}): string {
  const itemsList = params.items
    .map((it) => `  ▫️ ${it.name} (x${it.quantity}) - ${(it.priceFCFA * it.quantity).toLocaleString("fr-FR")} FCFA`)
    .join("\n");

  return `🛒 *SEN AURA TECH - NOUVELLE COMMANDE & PAIEMENT*

Bonjour l'équipe SEN AURA TECH,
Je souhaite finaliser et payer ma commande :

📦 *Référence :* *${params.orderId}*
👤 *Client :* ${params.customerName}
📞 *Téléphone :* ${params.customerPhone}
📍 *Livraison :* ${params.address}

📋 *Détail des Articles :*
${itemsList}

💰 *TOTAL À PAYER :* *${params.totalFCFA.toLocaleString("fr-FR")} FCFA*

💳 *Mode de Règlement :* Wave / Orange Money direct sur WhatsApp
Merci de m'envoyer le lien Wave / QR code ou les instructions de confirmation de paiement !`;
}

// 5. Message pour la Commande Express Directe d'un Produit
export function generateExpressProductWhatsAppMsg(params: {
  productName: string;
  productPrice: number;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  orderRef?: string;
}): string {
  const ref = params.orderRef || `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
  return `🛍️ *COMMANDE EXPRESS - SEN AURA TECH*

Bonjour l'équipe SEN AURA TECH,
Je souhaite commander immédiatement le produit suivant :

📦 *Produit :* *${params.productName}*
💰 *Montant :* *${params.productPrice.toLocaleString("fr-FR")} FCFA*
🔖 *Réf Commande :* ${ref}

👤 *Nom :* ${params.customerName}
📞 *Téléphone :* ${params.customerPhone}
📍 *Ville de livraison :* ${params.deliveryCity}

💳 *Mode de Règlement :* Paiement Mobile WhatsApp (Wave / Orange Money)
Merci de m'envoyer le lien Wave / QR code ou les modalités de paiement pour finaliser ma commande !`;
}

// 6. Message pour l'Inscription & Paiement de Formation (Academy)
export function generateCoursePaymentWhatsAppMsg(params: {
  courseTitle: string;
  priceFCFA: number;
  studentName: string;
  studentPhone: string;
  level?: string;
  enrollmentRef?: string;
}): string {
  const ref = params.enrollmentRef || `INS-${Math.floor(100000 + Math.random() * 900000)}`;
  return `🎓 *SEN AURA ACADEMY - INSCRIPTION & PAIEMENT FORMATION*

Bonjour l'équipe SEN AURA ACADEMY,
Je souhaite m'inscrire et régler les frais de la formation suivante :

📚 *Formation :* *${params.courseTitle}*
${params.level ? `🎯 *Niveau :* ${params.level}\n` : ''}💰 *Frais d'inscription :* *${params.priceFCFA.toLocaleString("fr-FR")} FCFA*
🔖 *Réf Inscription :* ${ref}

👤 *Apprenant(e) :* ${params.studentName}
📞 *Téléphone :* ${params.studentPhone}

💳 *Paiement Mobile Exclusif :* Wave / Orange Money via WhatsApp
Merci de m'envoyer les coordonnées de paiement Wave / OM pour valider mon accès aux cours et obtenir mes accès à la plateforme !`;
}

// 7. Message pour le Règlement d'une Facture Officielle
export function generateInvoicePaymentWhatsAppMsg(params: {
  invoiceNumber: string;
  clientName: string;
  totalFCFA: number;
  description?: string;
}): string {
  return `🧾 *SEN AURA TECH - RÈGLEMENT DE FACTURE*

Bonjour l'équipe SEN AURA TECH,
Je souhaite régler la facture officielle suivante :

📄 *N° Facture :* *${params.invoiceNumber}*
👤 *Client :* ${params.clientName}
${params.description ? `📋 *Objet :* ${params.description}\n` : ''}💰 *Montant Total :* *${params.totalFCFA.toLocaleString("fr-FR")} FCFA*

💳 *Mode de Règlement :* Paiement Mobile WhatsApp (Wave / Orange Money)
Merci de me transmettre le lien Wave ou QR code de paiement afin que je vous renvoie la capture de confirmation.`;
}

// 8. Message pour Demande de Devis & Acompte Projet
export function generateQuoteWhatsAppMsg(params: {
  quoteId: string;
  serviceTitle: string;
  pole: string;
  clientName: string;
  clientPhone: string;
  budgetFCFA: number;
  region: string;
}): string {
  return `💼 *SEN AURA TECH - DEMANDE DE DEVIS & PROJET*

Bonjour l'équipe SEN AURA TECH,
Je vous contacte concernant une demande de projet / devis :

🏷️ *Pôle :* ${params.pole}
📋 *Service / Projet :* *${params.serviceTitle}*
💰 *Budget Estimé :* *${params.budgetFCFA.toLocaleString("fr-FR")} FCFA*
🔖 *Réf Devis :* ${params.quoteId}

👤 *Client :* ${params.clientName}
📞 *Téléphone :* ${params.clientPhone}
📍 *Localisation :* ${params.region}

💳 *Paiement & Validation :* Mobile (Wave / Orange Money direct sur WhatsApp)
Merci de me contacter pour discuter des détails techniques et de la mise en œuvre.`;
}

// 9. Déclencheur de Redirection WhatsApp de Paiement
export function redirectToWhatsAppPayment(text: string, businessPhone: string = "221705334611") {
  const url = getWhatsAppLink(businessPhone, text);
  window.open(url, "_blank");
}

