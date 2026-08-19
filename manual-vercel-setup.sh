#!/bin/bash

# ===================================================
# SEN AURA TECH - VERCEL DEPLOYMENT (Manual Setup)
# ===================================================
# Déploiement sans Vercel CLI - juste Git & GitHub

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🚀 SEN AURA TECH - DÉPLOIEMENT MANUAL 🚀            ║"
echo "║                                                                ║"
echo "║              (Git Push + Configuration Vercel Web)             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ===================================================
# ÉTAPE 1: Vérifier les prérequis
# ===================================================
echo "✅ ÉTAPE 1: Vérification des Prérequis"
echo "======================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
echo "✅ npm: $(npm -v)"

if ! command -v git &> /dev/null; then
    echo "❌ git n'est pas installé"
    exit 1
fi
echo "✅ git: $(git --version)"

echo ""
echo "✅ Tous les prérequis sont OK!"
echo ""

# ===================================================
# ÉTAPE 2: Construire l'application localement
# ===================================================
echo "🔨 ÉTAPE 2: Construire l'application"
echo "===================================="
echo ""
echo "Cela va prendre 1-2 minutes..."
echo ""

if npm run build; then
    echo ""
    echo "✅ Build réussi!"
else
    echo "❌ Le build a échoué"
    exit 1
fi

echo ""

# ===================================================
# ÉTAPE 3: Vérifier la configuration Git
# ===================================================
echo "🔗 ÉTAPE 3: Vérification Git"
echo "============================"
echo ""

if ! git remote get-url origin &> /dev/null; then
    echo "❌ Git n'est pas configuré (pas de remote 'origin')"
    exit 1
fi

GIT_REMOTE=$(git remote get-url origin)
echo "✅ Remote Git: $GIT_REMOTE"
echo ""

# Vérifier la branche
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Branche actuelle: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Attention: Vous êtes sur la branche '$CURRENT_BRANCH'"
    echo "    Vercel déploie généralement à partir de 'main' ou 'master'"
    echo ""
fi

# ===================================================
# ÉTAPE 4: Commit et Push
# ===================================================
echo "📤 ÉTAPE 4: Git Commit & Push"
echo "============================="
echo ""

CHANGES=$(git status --porcelain | wc -l)

if [ "$CHANGES" -gt 0 ]; then
    echo "📝 Changements détectés ($CHANGES fichiers)"
    git status --short
    echo ""
    
    read -p "Êtes-vous sûr de vouloir commiter et pusher? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Commit en cours..."
        git add -A
        git commit -m "Déploiement Vercel - $(date '+%Y-%m-%d %H:%M')"
        
        echo "Push en cours..."
        git push origin "$CURRENT_BRANCH"
        
        echo "✅ Push réussi!"
    else
        echo "⚠️  Push annulé par l'utilisateur"
    fi
else
    echo "ℹ️  Aucun changement détecté (déjà à jour)"
fi

echo ""

# ===================================================
# ÉTAPE 5: Configuration Vercel (Instructions)
# ===================================================
echo "🌐 ÉTAPE 5: Configuration Vercel"
echo "================================="
echo ""
echo "Puisque Vercel CLI n'est pas disponible, voici les étapes manuelles:"
echo ""
echo "1️⃣  Allez sur: https://vercel.com/dashboard"
echo "2️⃣  Cliquez sur 'Add New...' → 'Project'"
echo "3️⃣  Connectez votre dépôt GitHub"
echo "4️⃣  Sélectionnez ce projet: $GIT_REMOTE"
echo "5️⃣  Cliquez sur 'Deploy'"
echo ""
echo "6️⃣  Une fois déployé, allez à 'Settings' → 'Environment Variables'"
echo "7️⃣  Ajoutez ces variables:"
echo ""
echo "   DATABASE_URL"
echo "   └─ Valeur: [Votre Neon PostgreSQL URL]"
echo "      Format: postgresql://user:password@host:5432/database"
echo ""
echo "   JWT_SECRET"
echo "   └─ Valeur: [Générez une clé secrète]"
echo "      Exemple: $(openssl rand -base64 32)"
echo ""
echo "   NODE_ENV"
echo "   └─ Valeur: production"
echo ""
echo "   GOOGLE_GENAI_KEY (optionnel)"
echo "   └─ Valeur: [Votre clé API Google Generative AI]"
echo ""

# ===================================================
# ÉTAPE 6: Info Post-Déploiement
# ===================================================
echo ""
echo "✅ ÉTAPES SUIVANTES"
echo "==================="
echo ""
echo "1. Attendez 2-3 minutes après le push"
echo "2. Vercel va déployer automatiquement"
echo "3. Vous recevrez une notification GitHub avec le lien"
echo ""
echo "4. Testez votre application:"
echo "   → https://votre-projet.vercel.app/api/db/products"
echo "   → Cette URL doit retourner: { \"success\": true, \"products\": [] }"
echo ""
echo "5. Si vous voyez 'DATABASE_URL is required':"
echo "   → Vérifiez la variable d'environnement sur Vercel Dashboard"
echo "   → Redéployez manuellement"
echo ""
echo "6. Consultez les logs:"
echo "   → https://vercel.com/[your-project]/deployments"
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ PRÊT POUR VERCEL!                        ║"
echo "║                                                                ║"
echo "║  Rendez-vous sur: https://vercel.com/dashboard              ║"
echo "║                                                                ║"
echo "║  📖 Voir QUICK_DEPLOY.md pour plus de détails                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
