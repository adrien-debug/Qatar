# Prompt pour Claude - Implémentation des Formules de Calcul

## Contexte du Projet

Ce projet est une application Next.js de calculatrice financière pour des projections de minage de Bitcoin. L'application calcule les projections sur 10 ans pour deux entités : **Qatar** et **Hearst**.

## Structure des Tableaux

### Tableau Qatar (Décomposition)
Le tableau Qatar affiche 6 colonnes pour chaque année de projection (1 à 10) :

1. **Année** - L'année de projection (1, 2, 3, ..., 10)
2. **Prix BTC (k$)** - Le prix du Bitcoin en milliers de dollars (déjà calculé : `row.btcPrice`)
3. **Revenues** - Les revenus annuels Qatar en millions de dollars
4. **Profit** - Le profit annuel Qatar en millions de dollars
5. **ROI** - Le retour sur investissement en pourcentage
6. **Price per BTC** - Le prix par BTC en millions de dollars

**Ligne Total** : Une ligne de totalisation en bas du tableau avec un voile marron Qatar (`bg-[#8A1538]/10`)

### Tableau Hearst (Décomposition)
Le tableau Hearst affiche 4 colonnes pour chaque année de projection (1 à 10) :

1. **Année** - L'année de projection (1, 2, 3, ..., 10)
2. **Margin** - La marge sur hardware en pourcentage
3. **Electricity** - La part d'électricité en millions de dollars
4. **Share revenu** - La part de revenu en millions de dollars

**Ligne Total** : Une ligne de totalisation en bas du tableau avec un voile vert Hearst (`bg-hearst-green/10`)

## Données Disponibles

Les données de projection sont stockées dans `projectionData`, un tableau d'objets contenant pour chaque année :

```typescript
{
  year: number,                    // Année (1-10)
  btcPrice: number,                // Prix BTC en k$ (déjà calculé)
  hearst: number,                  // Profit/revenue annuel Hearst en M$
  qatar: number,                   // Profit/revenue annuel Qatar en M$
  hearstMonthlyBTC: number,         // BTC mensuel Hearst
  qatarMonthlyBTC: number,         // BTC mensuel Qatar
  hearstRevenueMonthly: number,    // Revenue mensuel Hearst en M$
  qatarRevenueMonthly: number,     // Revenue mensuel Qatar en M$
  hearstOpexYearly: number,        // OPEX annuel Hearst en M$
  qatarOpexYearly: number,         // OPEX annuel Qatar en M$
  difficulty: number,               // Difficulté du réseau
  total: number                     // Total (hearst + qatar)
}
```

**Variables globales disponibles :**
- `capex` : Le CAPEX total en dollars (non divisé par 1M)
- `capexInM` : Le CAPEX en millions de dollars (`capex / 1000000`)
- `phase.mw` : La puissance en MW de la phase sélectionnée
- `dealType` : Le type de deal ("revenue" ou "mw")

## Tâches à Effectuer

### 1. Tableau Qatar - Calcul des Colonnes

#### Colonne "Revenues"
**À calculer :** Revenus annuels Qatar
- **Formule :** `qatarRevenueAnnual = (row.qatarRevenueMonthly || 0) * 12`
- **Unité :** Millions de dollars (M$)
- **Format d'affichage :** `${safeToFixed(qatarRevenueAnnual, 2)}M`

#### Colonne "Profit"
**À calculer :** Profit annuel Qatar
- **Formule :** `qatarProfit = row.qatar || 0`
- **Unité :** Millions de dollars (M$)
- **Format d'affichage :** `${safeToFixed(qatarProfit, 2)}M`

#### Colonne "ROI"
**À calculer :** Retour sur investissement
- **Formule :** `roi = capexInM > 0 ? (qatarProfit / capexInM) * 100 : 0`
- **Unité :** Pourcentage (%)
- **Format d'affichage :** `{safeToFixed(roi, 1)}%`

#### Colonne "Price per BTC"
**À calculer :** Prix par BTC
- **Formule :** 
  - `qatarBTCAnnual = (row.qatarMonthlyBTC || 0) * 12`
  - `pricePerBTC = qatarBTCAnnual > 0 ? capexInM / qatarBTCAnnual : 0`
- **Unité :** Millions de dollars (M$)
- **Format d'affichage :** `${safeToFixed(pricePerBTC, 2)}M`

#### Ligne Total Qatar
**À calculer :** Totaux pour toutes les colonnes
- **Total Revenues :** `totalRevenue = sum de toutes les qatarRevenueAnnual`
- **Total Profit :** `totalProfit = sum de toutes les qatarProfit`
- **Total ROI :** `totalROI = capexInM > 0 ? (totalProfit / capexInM) * 100 : 0`
- **Avg Price per BTC :** `avgPricePerBTC = totalBTC > 0 ? capexInM / totalBTC : 0` où `totalBTC = sum de toutes les qatarBTCAnnual`
- **Avg Prix BTC :** `avgBTCPrice = moyenne de tous les row.btcPrice`

### 2. Tableau Hearst - Calcul des Colonnes

#### Colonne "Margin"
**À calculer :** Marge sur hardware
- **Formule :** 
  - `hearstRevenueAnnual = (row.hearstRevenueMonthly || 0) * 12`
  - `hearstProfit = row.hearst || 0`
  - `margin = hearstRevenueAnnual > 0 ? (hearstProfit / hearstRevenueAnnual) * 100 : 0`
- **Unité :** Pourcentage (%)
- **Format d'affichage :** `{safeToFixed(margin, 1)}%`

#### Colonne "Electricity"
**À calculer :** Part d'électricité
- **Formule :** `electricity = row.hearstOpexYearly || 0`
- **Unité :** Millions de dollars (M$)
- **Format d'affichage :** `${safeToFixed(electricity, 2)}M`

#### Colonne "Share revenu"
**À calculer :** Part de revenu
- **Formule :** `shareRevenu = (row.hearstRevenueMonthly || 0) * 12`
- **Unité :** Millions de dollars (M$)
- **Format d'affichage :** `${safeToFixed(shareRevenu, 2)}M`

#### Ligne Total Hearst
**À calculer :** Totaux pour toutes les colonnes
- **Total Margin :** `totalMargin = moyenne de toutes les margin`
- **Total Electricity :** `totalElectricity = sum de toutes les electricity`
- **Total Share revenu :** `totalShareRevenu = sum de toutes les shareRevenu`

## Fichier à Modifier

**Fichier :** `components/ProjectionCalculator.tsx`

**Localisation des sections à modifier :**

1. **Tableau Qatar** : Lignes ~838-890
   - Section `projectionData.map((row, index) => { ... })`
   - Section ligne Total (dans le même `map`)

2. **Tableau Hearst** : Lignes ~1061-1110
   - Section `projectionData.map((row, index) => { ... })`
   - Section ligne Total (dans le même `map`)

## Instructions Spécifiques

1. **Remplacer les valeurs à 0** par les vraies formules de calcul
2. **Utiliser les données disponibles** dans `row` et les variables globales (`capex`, `capexInM`, etc.)
3. **Respecter les formats d'affichage** avec `safeToFixed()` pour les nombres
4. **Gérer les cas d'erreur** (division par zéro, valeurs nulles) avec des conditions ternaires
5. **Maintenir la structure existante** du code (classes CSS, structure HTML)
6. **Tester les calculs** pour s'assurer qu'ils sont corrects

## Notes Importantes

- Tous les montants sont en **millions de dollars (M$)** sauf indication contraire
- Le CAPEX est disponible en dollars bruts (`capex`) et en millions (`capexInM = capex / 1000000`)
- Les revenus mensuels doivent être multipliés par 12 pour obtenir les revenus annuels
- Les pourcentages doivent être multipliés par 100 pour l'affichage
- Utiliser `safeToFixed(value, decimals)` pour formater les nombres avec le bon nombre de décimales

## Exemple de Code à Remplacer

**Avant (valeurs à 0) :**
```typescript
const qatarRevenueAnnual = 0; // TODO: Calculer les revenues annuelles Qatar
```

**Après (avec vraie formule) :**
```typescript
const qatarRevenueAnnual = (row.qatarRevenueMonthly || 0) * 12;
```

## Validation

Après implémentation, vérifier que :
- Les valeurs calculées sont cohérentes
- Les totaux correspondent à la somme des valeurs individuelles
- Les pourcentages sont entre 0 et 100 (ou peuvent être négatifs si nécessaire)
- Les montants sont positifs ou négatifs selon la logique métier
- Le format d'affichage est correct (M$ pour millions, % pour pourcentages)

