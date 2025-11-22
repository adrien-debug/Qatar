#!/bin/bash

# Script de déploiement pour le projet Qatar
# Usage: ./DEPLOY.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement du projet Qatar${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    echo "💡 Assurez-vous d'être dans le répertoire du projet Qatar"
    exit 1
fi

# Vérifier les changements
echo -e "${YELLOW}📋 Vérification des changements...${NC}"
CHANGES=$(git status --porcelain 2>/dev/null || echo "")
if [ -z "$CHANGES" ]; then
    echo -e "${YELLOW}⚠️  Aucun changement détecté${NC}"
    echo "💡 Voulez-vous quand même pousser vers GitHub? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Déploiement annulé"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Changements détectés:${NC}"
    git status --short | head -10
fi
echo ""

# Vérifier la branche
BRANCH=$(git branch --show-current)
echo -e "${YELLOW}🌿 Branche actuelle: ${BRANCH}${NC}"
echo ""

# Ajouter tous les fichiers modifiés
echo -e "${YELLOW}📦 Ajout des fichiers...${NC}"
git add -A

# Message de commit
COMMIT_MESSAGE="fix: Correction de l'erreur de syntaxe dans DealBCalculator.tsx"

# Créer le commit
echo -e "${YELLOW}📝 Création du commit...${NC}"
git commit -m "$COMMIT_MESSAGE" || {
    echo -e "${YELLOW}⚠️  Aucun nouveau changement à committer${NC}"
}

# Vérifier le remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
    echo -e "${RED}❌ Erreur: Remote 'origin' non configuré${NC}"
    echo "💡 Configurez d'abord le remote avec: git remote add origin <url>"
    exit 1
fi

echo -e "${YELLOW}🔗 Remote: ${REMOTE}${NC}"
echo ""

# Pousser vers GitHub
echo -e "${YELLOW}⬆️  Push vers GitHub (${BRANCH})...${NC}"
git push origin "$BRANCH" || {
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo "💡 Vérifiez vos permissions et votre connexion"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier le build sur Vercel (si configuré)"
echo "   2. Vérifier que le site est en ligne"
echo "   3. Tester les fonctionnalités"
echo ""
echo "💡 Si Vercel est configuré, le déploiement devrait démarrer automatiquement"
echo ""

