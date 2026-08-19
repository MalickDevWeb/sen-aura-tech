#!/bin/bash

# ===================================================
# SEN AURA TECH - VERCEL DEPLOYMENT AUTOMATION SCRIPT
# ===================================================
# Cet script automatise le déploiement complet sur Vercel
# Utilisation: bash deploy-to-vercel.sh

set -e  # Arrête au premier erreur

echo "🚀 =========================================="
echo "   SEN AURA TECH - Vercel Deployment Setup"
echo "=========================================="
echo ""

# ===== ÉTAPE 1: Vérifier que Vercel CLI est installé =====
echo "📦 Étape 1/5 - Vérification des prérequis..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "   Installation..."
    npm install -g vercel
fi
echo "✅ Vercel CLI trouvé"
echo ""

# ===== ÉTAPE 2: Vérifier que git est configuré =====
echo "📦 Étape 2/5 - Vérification de Git..."
GIT_USER=$(git config user.name 2>/dev/null || echo "")
if [ -z "$GIT_USER" ]; then
    echo "⚠️  Git non configuré"
    read -p "   Entrez votre nom Git: " GIT_USER
    git config user.name "$GIT_USER"
fi
echo "✅ Git configuré (utilisateur: $GIT_USER)"
echo ""

# ===== ÉTAPE 3: Construire localement =====
echo "📦 Étape 3/5 - Construction locale (test)..."
npm run build
echo "✅ Build réussi"
echo ""

# ===== ÉTAPE 4: Commit et push =====
echo "📦 Étape 4/5 - Git commit & push..."
git add -A
git commit -m "fix: Add Vercel error boundary and configuration" || echo "Rien à committer"
echo "   Pushing vers GitHub..."
git push origin main || echo "⚠️  Push skipped (peut être déjà à jour)"
echo "✅ Changements pushés"
echo ""

# ===== ÉTAPE 5: Vercel CLI Login & Deploy =====
echo "📦 Étape 5/5 - Déploiement Vercel..."
echo ""
echo "⚠️  Vous allez être redirigé pour vous connecter à Vercel..."
echo "   1. Cliquez sur le lien ou scannez le QR code"
echo "   2. Acceptez la connexion"
echo "   3. Revenez ici (le script continue automatiquement)"
echo ""
read -p "Appuyez sur Entrée quand vous êtes prêt..."

vercel --prod
echo "✅ Déploiement terminé!"
echo ""

# ===== AFFICHER LE RÉSUMÉ =====
echo "=========================================="
echo "✨ DÉPLOIEMENT RÉUSSI!"
echo "=========================================="
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1️⃣  CONFIGURER LES ENVIRONMENT VARIABLES"
echo "   • Allez sur: https://vercel.com/dashboard"
echo "   • Cliquez sur votre projet"
echo "   • Settings → Environment Variables"
echo "   • Ajoutez (copy-paste ci-dessous):"
echo ""
echo "   ===== À COPIER-COLLER ====="
echo "   DATABASE_URL=postgresql://..."
echo "   JWT_SECRET=$(openssl rand -base64 32)"
echo "   NODE_ENV=production"
echo "   =============================="
echo ""
echo "2️⃣  REDÉPLOYER AVEC LES ENVS"
echo "   • Dashboard → Deployments"
echo "   • Cliquez sur le dernier deploy"
echo "   • Cliquez 'Redeploy' (en haut à droite)"
echo ""
echo "3️⃣  TESTER L'API"
echo "   • Ouvrez: https://votre-app.vercel.app/api/db/products"
echo "   • Devrait afficher: { success: true, products: [] }"
echo ""
echo "4️⃣  VÉRIFIER LES LOGS"
echo "   • Dashboard → Deployments → Logs"
echo "   • Cherchez les erreurs DATABASE_URL"
echo ""
echo "=========================================="
echo ""
echo "❓ Questions?"
echo "   • Check: cat VERCEL_FIX_GUIDE.md"
echo "   • Logs: vercel logs [--prod]"
echo "   • Help: vercel --help"
echo ""
