# 🚀 Guide de Configuration - Hosting Local

## Installation Rapide

### Option 1: Installation automatique
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Installation manuelle

1. **Installer les dépendances**
```bash
npm install
```

2. **Lancer en mode développement**
```bash
npm run dev
```

3. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## Mode Production Local

Pour tester en mode production localement :

```bash
chmod +x start-production.sh
./start-production.sh
```

Ou manuellement :
```bash
npm run build
npm start
```

## Configuration

### Port
Le serveur démarre par défaut sur le port **3000**.

Pour changer le port, modifiez les scripts dans `package.json` :
```json
"dev": "next dev -p 8080"
```

### Variables d'environnement
Copiez `.env.local.example` en `.env.local` et modifiez si nécessaire :
```bash
cp .env.local.example .env.local
```

## Structure des URLs

- **Accueil**: http://localhost:3000/
- **Deal A**: http://localhost:3000/deal-a
- **Deal B**: http://localhost:3000/deal-b
- **Comparaison**: http://localhost:3000/comparison

## Dépannage

### Port déjà utilisé
Si le port 3000 est occupé, Next.js vous proposera automatiquement le port 3001.

### Erreurs de build
```bash
rm -rf .next
npm run build
```

### Réinstallation complète
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Linter
npm run lint

# Setup complet
npm run setup
```


