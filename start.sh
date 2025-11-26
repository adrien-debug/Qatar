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

# Récupérer l'adresse IP locale
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "✅ Démarrage du serveur..."
echo ""
echo "📍 Accès local:    http://localhost:3001"
if [ ! -z "$LOCAL_IP" ]; then
  echo "📍 Accès réseau:   http://$LOCAL_IP:3001"
fi
echo ""
npm run dev

