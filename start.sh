#!/bin/bash

# Script de démarrage pour Qatar Financial Simulator
# Usage: ./start.sh

echo "🚀 Démarrage de Qatar Financial Simulator..."
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
  echo ""
fi

# Vérifier si .next existe (build)
if [ ! -d ".next" ]; then
  echo "🔨 Build de l'application..."
  npm run build
  echo ""
fi

echo "✅ Démarrage du serveur sur http://localhost:3000"
echo ""
npm run dev

