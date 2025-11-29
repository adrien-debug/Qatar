# 🚀 Guide de Déploiement - Qatar Financial Simulator

## ✅ État actuel

- ✅ Git initialisé
- ✅ Commit initial créé
- ✅ Tous les fichiers ajoutés

## 📦 Option 1 : Déploiement avec Vercel CLI (Recommandé)

### Installation de Vercel CLI (si pas déjà installé)

```bash
npm i -g vercel
```

### Déploiement direct

```bash
cd /Users/adrienbeyondcrypto/Desktop/Qatar
vercel
```

Suivez les instructions :
- Connectez-vous avec votre compte Vercel
- Choisissez votre projet ou créez-en un nouveau
- Vercel détectera automatiquement Next.js et configurera tout

### Pour déployer en production

```bash
vercel --prod
```

---

## 📦 Option 2 : Déploiement via GitHub + Vercel

### 1. Créer un repository GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository : `qatar-financial-simulator`
3. **Ne pas** initialiser avec README, .gitignore ou licence

### 2. Ajouter le remote et pousser

```bash
cd /Users/adrienbeyondcrypto/Desktop/Qatar

# Remplacez USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/USERNAME/qatar-financial-simulator.git

# Pousser vers GitHub
git push -u origin main
```

### 3. Connecter à Vercel

1. Allez sur https://vercel.com/new
2. Importez le repository GitHub que vous venez de créer
3. Vercel détectera automatiquement Next.js
4. Cliquez sur "Deploy"

---

## 🔧 Configuration Vercel

Vercel devrait détecter automatiquement :
- ✅ Framework : Next.js
- ✅ Build Command : `next build`
- ✅ Output Directory : `.next`
- ✅ Install Command : `npm install`

### Variables d'environnement (si nécessaire)

Si votre projet utilise des variables d'environnement :
1. Dans le dashboard Vercel → Settings → Environment Variables
2. Ajoutez vos variables (ex: `NEXT_PUBLIC_API_URL`, etc.)

---

## 📝 Commandes utiles

```bash
# Voir les logs de déploiement
vercel logs

# Lister les déploiements
vercel ls

# Ouvrir le dashboard
vercel dashboard

# Voir les domaines
vercel domains
```

---

## ✅ Vérification post-déploiement

1. ✅ Le site est accessible sur l'URL fournie par Vercel
2. ✅ Toutes les pages fonctionnent (`/`, `/deal-a`, `/deal-b`, `/comparison`)
3. ✅ Les calculs financiers fonctionnent correctement
4. ✅ Le composant `DealBCalculator` fonctionne (correction appliquée)

---

## 🐛 Dépannage

### Erreur de build

Si le build échoue sur Vercel :
```bash
# Testez localement d'abord
npm run build
```

### Erreur "Module not found"

Vérifiez que tous les imports sont corrects :
- `@/lib/...` pour les fichiers dans `lib/`
- `@/components/...` pour les composants

### Erreur de syntaxe

Si vous voyez des erreurs de syntaxe :
```bash
# Vérifiez avec le linter
npm run lint

# Vérifiez TypeScript
npx tsc --noEmit
```

---

## 🎉 Prêt à déployer !

Choisissez l'option 1 (Vercel CLI) pour un déploiement rapide, ou l'option 2 (GitHub) pour un workflow avec version control.


