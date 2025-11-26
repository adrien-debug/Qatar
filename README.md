# Qatar Financial Simulator - Platform Next.js

Plateforme dynamique de modélisation financière pour le partenariat de mining Bitcoin au Qatar.

## 🚀 Démarrage Rapide (Hosting Local)

### Option 1: Script automatique (Recommandé)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Installation manuelle
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

### Option 3: Mode production local
```bash
chmod +x start-production.sh
./start-production.sh
```

L'application sera accessible sur **http://localhost:3000**

> 📖 Pour plus de détails, consultez [SETUP.md](./SETUP.md)

## 📦 Structure du Projet

```
/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── deal-a/            # Simulateur Deal A
│   ├── deal-b/            # Simulateur Deal B
│   └── comparison/        # Page de comparaison
├── components/            # Composants React
│   ├── DealACalculator.tsx
│   ├── DealBCalculator.tsx
│   ├── ComparisonTable.tsx
│   ├── InputPanel.tsx
│   ├── PhaseSelector.tsx
│   └── Navigation.tsx
├── lib/                   # Logique métier
│   └── financial-calculations.ts
└── public/                # Assets statiques
```

## 🎨 Design

- **Couleur principale**: `#8afd81` (vert HEARST)
- **Police**: Inter (Google Fonts)
- **Style**: Minimaliste, niveau gouvernemental
- **Framework**: Tailwind CSS

## 📊 Fonctionnalités

- ✅ Simulateur Deal A (Revenue Share)
- ✅ Simulateur Deal B (MW Allocation)
- ✅ Comparaison automatique
- ✅ Graphiques interactifs (Recharts)
- ✅ Analyse de sensibilité
- ✅ Interface responsive

## 🛠️ Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React (icons)

## 📝 Notes

Les calculs financiers sont basés sur:
- 3 phases de déploiement (25MW, 100MW, 200MW)
- Prix Bitcoin variable
- Difficulté réseau ajustable
- Coûts énergétiques Qatar (2.5¢/kWh)


