#!/bin/bash

# Script de démarrage en mode production local
# Usage: ./start-production.sh

echo "🚀 Démarrage en mode PRODUCTION local..."
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
  echo ""
fi

echo "🔨 Build de l'application..."
npm run build
echo ""

echo "✅ Serveur de production démarré sur http://localhost:3000"
echo ""
npm start

