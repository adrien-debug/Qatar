#!/bin/bash

# Script d'initialisation Git et déploiement pour le projet Qatar
# Usage: ./INIT_AND_DEPLOY.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Initialisation et déploiement du projet Qatar${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    exit 1
fi

# Vérifier si Git est déjà initialisé
if [ -d ".git" ]; then
    echo -e "${YELLOW}ℹ️  Git est déjà initialisé${NC}"
else
    echo -e "${BLUE}📦 Initialisation de Git...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialisé${NC}"
fi

# Vérifier si .gitignore existe
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}📝 Création du .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
    echo -e "${GREEN}✅ .gitignore créé${NC}"
fi

# Ajouter tous les fichiers
echo -e "${BLUE}📦 Ajout des fichiers...${NC}"
git add -A

# Vérifier s'il y a déjà des commits
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo -e "${YELLOW}📝 Création du commit avec les changements...${NC}"
    git commit -m "fix: Correction de l'erreur de syntaxe dans DealBCalculator.tsx" || {
        echo -e "${YELLOW}⚠️  Aucun nouveau changement à committer${NC}"
    }
else
    echo -e "${BLUE}📝 Création du commit initial...${NC}"
    git commit -m "feat: Initial commit - Qatar Financial Simulator"
    echo -e "${GREEN}✅ Commit initial créé${NC}"
fi

# Vérifier si un remote est configuré
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Aucun remote GitHub configuré${NC}"
    echo ""
    echo "📋 Options:"
    echo "   1. Configurer le remote maintenant"
    echo "   2. Pousser manuellement plus tard"
    echo ""
    echo -e "${BLUE}💡 Pour configurer le remote, exécutez:${NC}"
    echo "   git remote add origin https://github.com/USERNAME/qatar-financial-simulator.git"
    echo "   git push -u origin main"
    echo ""
    echo "📦 Après avoir configuré le remote, vous pouvez:"
    echo "   - Connecter le repo à Vercel pour déploiement automatique"
    echo "   - Ou déployer manuellement: vercel --prod"
    echo ""
else
    echo -e "${GREEN}✅ Remote configuré: ${REMOTE_URL}${NC}"
    echo ""
    
    # Détecter la branche principale
    BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    if [ -z "$BRANCH" ] || [ "$BRANCH" = "" ]; then
        BRANCH="main"
        git checkout -b main 2>/dev/null || true
    fi
    
    echo -e "${BLUE}⬆️  Push vers GitHub (${BRANCH})...${NC}"
    git push -u origin "$BRANCH" || {
        echo -e "${YELLOW}⚠️  Push échoué, peut-être que la branche distante n'existe pas${NC}"
        echo -e "${BLUE}💡 Essayez: git push -u origin ${BRANCH}${NC}"
    }
    
    echo ""
    echo -e "${GREEN}✅ Déploiement terminé!${NC}"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifier le repo GitHub: ${REMOTE_URL}"
    echo "   2. Si Vercel est connecté, le déploiement devrait démarrer automatiquement"
    echo "   3. Sinon, connectez le repo à Vercel depuis le dashboard"
    echo ""
fi

echo -e "${GREEN}🎉 Terminé!${NC}"
echo ""

