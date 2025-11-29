# 📝 Valeurs Éditables - Guide Rapide

## 📍 Localisation

**Fichier à modifier :** `lib/setup-data.ts`

Toutes les valeurs statiques affichées dans l'application proviennent de ce fichier.

---

## 🎯 Où sont affichées ces valeurs ?

### 1. Page Setup (`/setup`)
- **Card "Parameters"** : `baseSetup.parameters.*`
- **Card "Project data"** : `baseSetup.projectData.*`
- **Card "QATAR Figures"** : `baseSetup.qatarFigures.*`
- **Card "HEARST Figures"** : `baseSetup.hearstFigures.*`

### 2. Page Projection (`/projection`)
- **Boxes Qatar** (4 boxes) : `baseSetup.qatarFigures.*`
  - Annualize net Revenues
  - Annualize net Profit
  - ROI
  - Cost per BTC / 1

- **Boxes HEARST** (3 boxes) : `baseSetup.hearstFigures.*`
  - Margin on hardware
  - Share Electricity
  - Share Revenu

---

## ✏️ Comment modifier les valeurs

1. **Ouvrez le fichier** : `lib/setup-data.ts`

2. **Trouvez l'objet** `baseSetup` (ligne ~45)

3. **Modifiez les valeurs** directement dans l'objet :

```typescript
export const baseSetup: BaseSetup = {
  parameters: {
    marginOnHardwarePercent: 8,       // ← Changez ici
    shareElectricityPercent: 15,       // ← Changez ici
    shareSpvPercent: 10,               // ← Changez ici
    elecCostUSDPerKwh: 0.025           // ← Changez ici
  },
  // ... etc
};
```

4. **Sauvegardez** le fichier

5. **Rafraîchissez** la page dans le navigateur (les changements sont automatiques)

---

## 📊 Format des valeurs

### Montants USD
- **Format** : Valeur brute en USD (sans séparateurs)
- **Exemple** : `34600778` = $34,600,778 (affiché automatiquement avec formatage)

### Pourcentages
- **Format** : Valeur "humaine" (8 = 8%, 15 = 15%)
- **Exemple** : `50.63` = 50.63% (affiché automatiquement avec %)

### Petits montants
- **Format** : Valeur décimale
- **Exemple** : `0.025` = $0.025 (affiché automatiquement avec formatage)

---

## 🔄 Exemple de modification

**Avant :**
```typescript
qatarFigures: {
  annualizedNetRevenuesUSD: 29065454,   // $29,065,454
  // ...
}
```

**Après modification :**
```typescript
qatarFigures: {
  annualizedNetRevenuesUSD: 35000000,   // $35,000,000
  // ...
}
```

**Résultat** : La box "Annualize net Revenues" affichera maintenant `$35.00M` au lieu de `$29.07M`

---

## ⚠️ Notes importantes

- ✅ Les valeurs sont **statiques** (pas de calculs)
- ✅ Les modifications sont **immédiates** (pas besoin de redémarrer)
- ✅ Le formatage est **automatique** (vous entrez juste les nombres bruts)
- ✅ Toutes les valeurs sont **centralisées** dans un seul fichier

---

## 📂 Structure complète

```
lib/setup-data.ts
├── baseSetup
│   ├── parameters (4 valeurs)
│   ├── projectData (4 valeurs)
│   ├── qatarFigures (4 valeurs)
│   └── hearstFigures (3 valeurs)
```

**Total : 15 valeurs éditables**



