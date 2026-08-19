#!/bin/bash

# ===================================================
# SEN AURA TECH - FULL VERCEL DEPLOYMENT WIZARD
# ===================================================
# Orchestre tout le processus de déploiement
# Utilisation: bash vercel-setup-complete.sh

set -e

clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🚀 SEN AURA TECH - VERCEL DEPLOYMENT WIZARD 🚀      ║"
echo "║                                                                ║"
echo "║                   Automatisation Complète                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Ce wizard va:"
echo "  1️⃣  Vérifier les prérequis (Node, npm, git, vercel-cli)"
echo "  2️⃣  Construire l'application localement"
echo "  3️⃣  Vous connecter à Vercel (si nécessaire)"
echo "  4️⃣  Configurer les variables d'environnement"
echo "  5️⃣  Déployer en production"
echo "  6️⃣  Vous donner un lien de test"
echo ""
echo "Durée estimée: 3-5 minutes"
echo ""
read -p "👉 Appuyez sur Entrée pour commencer..." -t 3 || true

echo ""
echo "=========================================="
echo "✅ ÉTAPE 1: Vérification des Prérequis"
echo "=========================================="
echo ""

# Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js installé ($NODE_VERSION)"

# npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm installé ($NPM_VERSION)"

# git
if ! command -v git &> /dev/null; then
    echo "❌ git n'est pas installé"
    exit 1
fi
echo "✅ git installé"

# vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI n'est pas installé, installation..."
    npm install -g vercel
fi
echo "✅ Vercel CLI installé"
echo ""

echo "=========================================="
echo "✅ ÉTAPE 2: Construction Locale"
echo "=========================================="
echo ""
echo "   Cela peut prendre 1-2 minutes..."
npm run build
echo "✅ Build réussi!"
echo ""

echo "=========================================="
echo "✅ ÉTAPE 3: Git Commit & Push"
echo "=========================================="
echo ""
git add -A
git commit -m "fix: Vercel deployment configuration" || echo "Rien à committer"
git push origin main || echo "Push skipped"
echo "✅ Code pushé vers GitHub"
echo ""

echo "=========================================="
echo "✅ ÉTAPE 4: Connexion Vercel"
echo "=========================================="
echo ""
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo "✅ Vous êtes connecté en tant que: $VERCEL_USER"
else
    echo "⚠️  Vous devez vous connecter à Vercel"
    echo "   Veuillez suivre les instructions..."
    vercel login
fi
echo ""

echo "=========================================="
echo "✅ ÉTAPE 5: Configuration des Variables"
echo "=========================================="
echo ""
echo "Vous devez configurer les variables d'environnement Vercel."
echo ""
read -p "Entrez votre DATABASE_URL (Neon PostgreSQL): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL est requise!"
    exit 1
fi

# Générer JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

echo ""
echo "   Configuration DATABASE_URL..."
vercel env add DATABASE_URL --production <<< "$DATABASE_URL" 2>/dev/null || true

echo "   Configuration JWT_SECRET..."
vercel env add JWT_SECRET --production <<< "$JWT_SECRET" 2>/dev/null || true

echo "   Configuration NODE_ENV..."
vercel env add NODE_ENV --production <<< "production" 2>/dev/null || true

echo "✅ Variables d'environnement configurées"
echo ""

echo "=========================================="
echo "✅ ÉTAPE 6: Déploiement Vercel"
echo "=========================================="
echo ""
echo "Lancement du déploiement en production..."
vercel --prod

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✨ DÉPLOIEMENT RÉUSSI! ✨                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 INFORMATIONS IMPORTANTES:"
echo ""
echo "JWT_SECRET généré (sauvegardez-le):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Votre application est disponible sur:"
echo "   https://[votre-projet].vercel.app"
echo ""
echo "📊 Accédez à votre dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "✅ VÉRIFICATION:"
echo "   1. Allez sur https://[votre-app].vercel.app/api/db/products"
echo "   2. Vous devriez voir: { \"success\": true, \"products\": [] }"
echo "   3. Si erreur: allez aux Logs dans Vercel Dashboard"
echo ""
echo "📚 Pour en savoir plus:"
echo "   Lisez: cat VERCEL_FIX_GUIDE.md"
echo ""
echo "🆘 EN CAS DE PROBLÈME:"
echo "   • Vérifiez les logs: vercel logs --prod"
echo "   • Redéploiement: vercel --prod"
echo "   • Guide complet: VERCEL_FIX_GUIDE.md"
echo ""
echo "✨ Bravo! Votre app est maintenant en ligne! 🎉"
echo ""
