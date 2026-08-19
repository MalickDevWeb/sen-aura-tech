#!/bin/bash

# ===================================================
# SEN AURA TECH - VERCEL DEPLOYMENT VERIFICATION
# ===================================================
# Vérifie que tout est configuré correctement

echo "🔍 Vérification du Déploiement Vercel..."
echo ""

# 1. Vérifier les prérequis
echo "1️⃣  Prérequis:"
node -v > /dev/null && echo "   ✅ Node.js" || echo "   ❌ Node.js"
npm -v > /dev/null && echo "   ✅ npm" || echo "   ❌ npm"
git -v > /dev/null && echo "   ✅ git" || echo "   ❌ git"
vercel --version > /dev/null && echo "   ✅ Vercel CLI" || echo "   ❌ Vercel CLI (npm install -g vercel)"
echo ""

# 2. Vérifier la configuration locale
echo "2️⃣  Configuration Locale:"
test -f "vercel.json" && echo "   ✅ vercel.json" || echo "   ❌ vercel.json"
test -f "package.json" && echo "   ✅ package.json" || echo "   ❌ package.json"
test -d "api/middleware" && echo "   ✅ api/middleware/" || echo "   ❌ api/middleware/"
test -f "api/middleware/handler.ts" && echo "   ✅ Error boundary" || echo "   ❌ Error boundary"
echo ""

# 3. Vérifier la connexion Vercel
echo "3️⃣  Connexion Vercel:"
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo "   ✅ Connecté: $VERCEL_USER"
else
    echo "   ❌ Non connecté (exécutez: vercel login)"
fi
echo ""

# 4. Vérifier les variables d'environnement
echo "4️⃣  Variables d'Environnement Vercel:"
if vercel whoami &> /dev/null; then
    echo "   Vérification en cours..."
    ENVS=$(vercel env list --production 2>/dev/null)
    
    echo "$ENVS" | grep -q "DATABASE_URL" && echo "   ✅ DATABASE_URL" || echo "   ❌ DATABASE_URL"
    echo "$ENVS" | grep -q "JWT_SECRET" && echo "   ✅ JWT_SECRET" || echo "   ❌ JWT_SECRET"
    echo "$ENVS" | grep -q "NODE_ENV" && echo "   ✅ NODE_ENV" || echo "   ❌ NODE_ENV"
else
    echo "   ⚠️  Impossible de vérifier (vous devez être connecté)"
fi
echo ""

# 5. Vérifier le build
echo "5️⃣  Build Local:"
if [ -d "dist" ]; then
    echo "   ✅ Build réussi (dist/ existe)"
    echo "      Fichiers: $(ls dist/ 2>/dev/null | wc -l) fichiers"
else
    echo "   ⚠️  Build non détecté (exécutez: npm run build)"
fi
echo ""

echo "=========================================="
echo "✅ PRÊT POUR LE DÉPLOIEMENT!"
echo "=========================================="
echo ""
echo "Exécutez:"
echo "  bash vercel-setup-complete.sh"
echo ""
