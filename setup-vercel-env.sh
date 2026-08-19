#!/bin/bash

# ===================================================
# SEN AURA TECH - VERCEL ENV VARIABLES SETUP
# ===================================================
# Configure automatiquement les variables d'environnement Vercel
# Utilisation: bash setup-vercel-env.sh

set -e

echo "🔐 =========================================="
echo "   Configuration des Variables Vercel"
echo "=========================================="
echo ""

# Vérifier que vercel CLI est disponible
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "   Installez d'abord: npm install -g vercel"
    exit 1
fi

# Vérifier que nous sommes connectés
echo "📋 Vérification de la connexion Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Vercel"
    echo "   Veuillez vous connecter..."
    vercel login
fi

echo ""
echo "✅ Connecté à Vercel"
echo ""

# ===== ÉTAPE 1: DATABASE_URL =====
echo "🔑 Étape 1/4 - Configuration DATABASE_URL"
echo ""
echo "Vous devez avoir votre URL Neon PostgreSQL"
echo "Format: postgresql://[user]:[password]@[host]/[database]"
echo ""
read -p "Entrez votre DATABASE_URL (Neon): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL ne peut pas être vide"
    exit 1
fi

echo "   Ajout de DATABASE_URL à Vercel..."
vercel env add DATABASE_URL --production <<< "$DATABASE_URL" 2>/dev/null || true
echo "✅ DATABASE_URL configurée"
echo ""

# ===== ÉTAPE 2: JWT_SECRET =====
echo "🔑 Étape 2/4 - Configuration JWT_SECRET"
JWT_SECRET=$(openssl rand -base64 32)
echo "   Secret généré: $JWT_SECRET"
echo "   Ajout de JWT_SECRET à Vercel..."
vercel env add JWT_SECRET --production <<< "$JWT_SECRET" 2>/dev/null || true
echo "✅ JWT_SECRET configurée"
echo ""

# ===== ÉTAPE 3: NODE_ENV =====
echo "🔑 Étape 3/4 - Configuration NODE_ENV"
echo "   Ajout de NODE_ENV=production..."
vercel env add NODE_ENV --production <<< "production" 2>/dev/null || true
echo "✅ NODE_ENV configurée"
echo ""

# ===== ÉTAPE 4: Optionnel - GOOGLE_GENAI_KEY =====
echo "🔑 Étape 4/4 - Configuration GOOGLE_GENAI_KEY (optionnel)"
read -p "Avez-vous une clé Google GenAI? (y/N): " HAS_GOOGLE_KEY

if [ "$HAS_GOOGLE_KEY" = "y" ] || [ "$HAS_GOOGLE_KEY" = "Y" ]; then
    read -p "Entrez votre GOOGLE_GENAI_KEY: " GOOGLE_GENAI_KEY
    echo "   Ajout de GOOGLE_GENAI_KEY à Vercel..."
    vercel env add GOOGLE_GENAI_KEY --production <<< "$GOOGLE_GENAI_KEY" 2>/dev/null || true
    echo "✅ GOOGLE_GENAI_KEY configurée"
else
    echo "⏭️  GOOGLE_GENAI_KEY skipped"
fi

echo ""
echo "=========================================="
echo "✨ VARIABLES D'ENVIRONNEMENT CONFIGURÉES!"
echo "=========================================="
echo ""
echo "📝 Résumé des variables ajoutées:"
echo "   • DATABASE_URL ✅"
echo "   • JWT_SECRET ✅"
echo "   • NODE_ENV ✅"
if [ "$HAS_GOOGLE_KEY" = "y" ] || [ "$HAS_GOOGLE_KEY" = "Y" ]; then
    echo "   • GOOGLE_GENAI_KEY ✅"
fi
echo ""
echo "🚀 PROCHAINE ÉTAPE: Redéployer"
echo "   Exécutez: vercel --prod"
echo ""
echo "📊 Vérifier la configuration:"
echo "   vercel env list --production"
echo ""
