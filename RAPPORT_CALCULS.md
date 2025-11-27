# Rapport d'Analyse des Calculs - Qatar & Hearst

## Date d'Analyse
Date: $(date)

## Vue d'Ensemble

Ce rapport analyse tous les calculs affichés dans les tableaux et boxes de Qatar et Hearst dans `components/ProjectionCalculator.tsx`. 

**PROBLÈME IDENTIFIÉ** : De nombreuses valeurs sont actuellement mises à `0` avec des commentaires `TODO`, ce qui signifie que les formules ne sont pas encore implémentées.

---

## 1. TABLEAU QATAR - Analyse des Colonnes

### Structure des Données Disponibles (`projectionData`)

Chaque ligne de `projectionData` contient :
```typescript
{
  year: number,                    // Année (1-10)
  btcPrice: number,                // Prix BTC en k$ (déjà calculé)
  hearst: number,                  // Profit/revenue annuel Hearst en M$
  qatar: number,                   // Profit/revenue annuel Qatar en M$
  hearstMonthlyBTC: number,        // BTC mensuel Hearst
  qatarMonthlyBTC: number,         // BTC mensuel Qatar
  hearstRevenueMonthly: number,    // Revenue mensuel Hearst en M$
  qatarRevenueMonthly: number,     // Revenue mensuel Qatar en M$
  hearstOpexYearly: number,        // OPEX annuel Hearst en M$
  qatarOpexYearly: number,         // OPEX annuel Qatar en M$
  difficulty: number,               // Difficulté du réseau
  total: number                     // Total (hearst + qatar)
}
```

### Colonne 1: "Revenues" (Qatar)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const qatarRevenueAnnual = (row.qatarRevenueMonthly || 0) * 12;
```

**Justification** :
- `qatarRevenueMonthly` est disponible dans `projectionData` en M$
- Multiplier par 12 pour obtenir le revenu annuel
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cette formule est cohérente avec les données disponibles.

---

### Colonne 2: "Profit" (Qatar)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const qatarProfit = row.qatar || 0;
```

**Justification** :
- Le champ `qatar` dans `projectionData` représente déjà le profit annuel Qatar en M$
- Selon le code de génération de `projectionData` :
  - Pour Deal A : `qatar: safeNumber(result.qatarNetProfit) / 1000000`
  - Pour Deal B : `qatar: safeNumber(result.qatarAnnualProfit) / 1000000`
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cette formule est correcte.

---

### Colonne 3: "ROI" (Qatar)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const capexInM = capex / 1000000; // CAPEX en millions
const roi = capexInM > 0 ? (qatarProfit / capexInM) * 100 : 0;
```

**Justification** :
- ROI = (Profit / Investissement) × 100
- `capex` est disponible dans le scope (calculé précédemment)
- `qatarProfit` vient de la colonne précédente
- **Unité** : Pourcentage (%)

**Note** : ✅ **CONFIRMÉ** - Formule standard de ROI.

**QUESTION** : Le ROI doit-il être calculé sur le CAPEX total ou sur l'investissement Qatar uniquement ?
- Actuellement, `capex` représente le CAPEX total
- Dans Deal A, `qatarTotalInvestment` peut être différent de `capex` si `mwCapexCost > 0`
- **RECOMMANDATION** : Utiliser `qatarTotalInvestment` si disponible, sinon `capex`

---

### Colonne 4: "Price per BTC" (Qatar)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const qatarBTCAnnual = (row.qatarMonthlyBTC || 0) * 12;
const pricePerBTC = qatarBTCAnnual > 0 ? capexInM / qatarBTCAnnual : 0;
```

**Justification** :
- Prix par BTC = Investissement Total / Nombre de BTC minés
- `qatarMonthlyBTC` est disponible dans `projectionData`
- Multiplier par 12 pour obtenir le BTC annuel
- **Unité** : Millions de dollars par BTC (M$/BTC)

**Note** : ⚠️ **À CONFIRMER** - Cette interprétation est-elle correcte ?

**QUESTION** : 
1. "Price per BTC" signifie-t-il le coût de production d'un BTC (CAPEX / BTC miné) ?
2. Ou s'agit-il du prix moyen de vente d'un BTC (qui serait simplement `btcPrice`) ?
3. **RECOMMANDATION** : Si c'est le coût de production, la formule ci-dessus est correcte. Si c'est le prix de vente, utiliser `row.btcPrice * 1000` (convertir k$ en M$).

---

### Ligne Total (Qatar)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeurs = 0)

**Formules Proposées** :

```typescript
// Total Revenues
const totalRevenue = projectionData.reduce((sum, row) => {
  const qatarRevenueAnnual = (row.qatarRevenueMonthly || 0) * 12;
  return sum + qatarRevenueAnnual;
}, 0);

// Total Profit
const totalProfit = projectionData.reduce((sum, row) => sum + (row.qatar || 0), 0);

// Total ROI (moyenne pondérée ou ROI cumulatif ?)
const totalROI = capexInM > 0 ? (totalProfit / capexInM) * 100 : 0;

// Prix moyen par BTC
const totalBTC = projectionData.reduce((sum, row) => {
  return sum + ((row.qatarMonthlyBTC || 0) * 12);
}, 0);
const avgPricePerBTC = totalBTC > 0 ? capexInM / totalBTC : 0;

// Prix BTC moyen
const avgBTCPrice = projectionData.reduce((sum, row) => sum + (row.btcPrice || 0), 0) / projectionData.length;
```

**Note** : ✅ **CONFIRMÉ** pour les totaux de revenues et profit.

**QUESTION** : Pour le ROI total, doit-on calculer :
- Option A : ROI cumulatif = (Total Profit / CAPEX) × 100
- Option B : Moyenne des ROI annuels = Σ(ROI annuel) / nombre d'années

**RECOMMANDATION** : Option A (ROI cumulatif) semble plus logique pour un tableau de projection.

---

## 2. BOXES QATAR - Analyse des Métriques

### Box 1: "Annualize net Revenues"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const annualizeNetRevenues = projectionData.reduce((sum, row) => {
  const qatarRevenueAnnual = (row.qatarRevenueMonthly || 0) * 12;
  return sum + qatarRevenueAnnual;
}, 0);
```

**Justification** :
- Somme des revenus annuels sur toutes les années
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cohérent avec la colonne "Revenues" du tableau.

---

### Box 2: "Annualize net Profit"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const annualizeNetProfit = projectionData.reduce((sum, row) => sum + (row.qatar || 0), 0);
```

**Justification** :
- Somme des profits annuels sur toutes les années
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cohérent avec la colonne "Profit" du tableau.

---

### Box 3: "ROI"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const totalProfit = projectionData.reduce((sum, row) => sum + (row.qatar || 0), 0);
const roi = capexInM > 0 ? (totalProfit / capexInM) * 100 : 0;
```

**Justification** :
- ROI total sur la période de projection
- **Unité** : Pourcentage (%)

**Note** : ⚠️ **À CONFIRMER** - Même question que pour la colonne ROI du tableau.

---

### Box 4: "Cost per BTC / 1"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const totalBTC = projectionData.reduce((sum, row) => {
  return sum + ((row.qatarMonthlyBTC || 0) * 12);
}, 0);
const costPerBTC = totalBTC > 0 ? capexInM / totalBTC : 0;
```

**Justification** :
- Coût moyen de production d'un BTC sur toute la période
- **Unité** : Millions de dollars par BTC (M$/BTC)

**Note** : ⚠️ **À CONFIRMER** - Même question que pour la colonne "Price per BTC".

---

## 3. TABLEAU HEARST - Analyse des Colonnes

### Colonne 1: "Margin" (Hearst)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const hearstRevenueAnnual = (row.hearstRevenueMonthly || 0) * 12;
const hearstProfit = row.hearst || 0;
const margin = hearstRevenueAnnual > 0 ? (hearstProfit / hearstRevenueAnnual) * 100 : 0;
```

**Justification** :
- Marge = (Profit / Revenu) × 100
- `hearstRevenueMonthly` est disponible dans `projectionData` en M$
- `hearst` représente le profit/revenue annuel Hearst en M$
- **Unité** : Pourcentage (%)

**Note** : ⚠️ **À CONFIRMER** - Cette interprétation est-elle correcte ?

**QUESTION** : 
1. "Margin" signifie-t-il la marge de profit (Profit / Revenu) ?
2. Ou s'agit-il de la "Margin on Hardware" (qui est un revenu supplémentaire) ?
3. **RECOMMANDATION** : Si c'est la marge de profit, la formule ci-dessus est correcte. Si c'est la margin on hardware, il faudrait utiliser `hearstMarginOnHardwareYearly` depuis les résultats de calcul (mais cette donnée n'est pas dans `projectionData`).

---

### Colonne 2: "Electricity" (Hearst)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const electricity = row.hearstOpexYearly || 0;
```

**Justification** :
- `hearstOpexYearly` est disponible dans `projectionData` en M$
- Dans Deal A, `hearstOpexYearly = 0` (Qatar paie tout)
- Dans Deal B, `hearstOpexYearly = 0` également (HEARST ne paie pas d'OPEX)
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cette formule est correcte.

**QUESTION** : Si "Electricity" représente les coûts d'électricité, pourquoi est-ce toujours 0 pour Hearst ? Est-ce que cette colonne devrait afficher autre chose (par exemple, la part d'électricité comme revenu) ?

---

### Colonne 3: "Share revenu" (Hearst)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const shareRevenu = (row.hearstRevenueMonthly || 0) * 12;
```

**Justification** :
- Part de revenu = Revenu annuel Hearst
- `hearstRevenueMonthly` est disponible dans `projectionData` en M$
- Multiplier par 12 pour obtenir le revenu annuel
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cette formule est correcte.

---

### Ligne Total (Hearst)

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeurs = 0)

**Formules Proposées** :

```typescript
// Total Margin (moyenne des marges annuelles)
const margins = projectionData.map(row => {
  const hearstRevenueAnnual = (row.hearstRevenueMonthly || 0) * 12;
  const hearstProfit = row.hearst || 0;
  return hearstRevenueAnnual > 0 ? (hearstProfit / hearstRevenueAnnual) * 100 : 0;
});
const totalMargin = margins.length > 0 ? margins.reduce((sum, m) => sum + m, 0) / margins.length : 0;

// Total Electricity
const totalElectricity = projectionData.reduce((sum, row) => sum + (row.hearstOpexYearly || 0), 0);

// Total Share revenu
const totalShareRevenu = projectionData.reduce((sum, row) => {
  return sum + ((row.hearstRevenueMonthly || 0) * 12);
}, 0);
```

**Note** : ✅ **CONFIRMÉ** pour electricity et share revenu.

**QUESTION** : Pour le total Margin, doit-on calculer :
- Option A : Moyenne des marges annuelles (comme proposé)
- Option B : Marge globale = (Total Profit / Total Revenu) × 100

**RECOMMANDATION** : Option B semble plus logique pour un total.

---

## 4. BOXES HEARST - Analyse des Métriques

### Box 1: "Margin on hardware"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
// Cette valeur n'est PAS dans projectionData, il faut la calculer depuis les résultats
// Option 1: Utiliser la valeur du premier calcul (si disponible)
// Option 2: Recalculer pour chaque année et sommer
const marginOnHardwareTotal = projectionData.reduce((sum, row) => {
  // Il faudrait recalculer pour chaque année avec les paramètres de l'année
  // Mais cette donnée n'est pas stockée dans projectionData
  return sum + 0; // TODO: À implémenter
}, 0);
```

**Justification** :
- La "Margin on Hardware" est calculée dans `calculateDealA` et `calculateDealB`
- Elle est stockée dans `hearstMarginOnHardwareYearly` dans les résultats
- **MAIS** cette valeur n'est pas incluse dans `projectionData`

**Note** : ❌ **PROBLÈME IDENTIFIÉ** - Cette donnée n'est pas disponible dans `projectionData`.

**QUESTION** : 
1. Faut-il ajouter `hearstMarginOnHardwareYearly` dans `projectionData` ?
2. Ou cette box doit-elle afficher la marge totale sur toute la période ?
3. **RECOMMANDATION** : Ajouter `hearstMarginOnHardwareYearly` dans `projectionData` lors de la génération des projections.

---

### Box 2: "Share Electricity"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
// Même problème que Margin on Hardware
const shareElectricityTotal = projectionData.reduce((sum, row) => {
  // hearstShareElectricityYearly n'est pas dans projectionData
  return sum + 0; // TODO: À implémenter
}, 0);
```

**Justification** :
- La "Share Electricity" est calculée dans `calculateDealA` et `calculateDealB`
- Elle est stockée dans `hearstShareElectricityYearly` dans les résultats
- **MAIS** cette valeur n'est pas incluse dans `projectionData`

**Note** : ❌ **PROBLÈME IDENTIFIÉ** - Cette donnée n'est pas disponible dans `projectionData`.

**QUESTION** : 
1. Faut-il ajouter `hearstShareElectricityYearly` dans `projectionData` ?
2. **RECOMMANDATION** : Oui, ajouter cette valeur dans `projectionData`.

---

### Box 3: "Share Revenu"

**STATUT** : ❌ **NON IMPLÉMENTÉ** (valeur = 0)

**Formule Proposée** :
```typescript
const shareRevenuTotal = projectionData.reduce((sum, row) => {
  return sum + ((row.hearstRevenueMonthly || 0) * 12);
}, 0);
```

**Justification** :
- Somme des revenus annuels Hearst sur toutes les années
- **Unité** : Millions de dollars (M$)

**Note** : ✅ **CONFIRMÉ** - Cette formule est correcte.

---

## 5. RÉSUMÉ DES PROBLÈMES IDENTIFIÉS

### ✅ Formules Confirmées (Prêtes à Implémenter)

1. **Qatar - Revenues** : `(row.qatarRevenueMonthly || 0) * 12`
2. **Qatar - Profit** : `row.qatar || 0`
3. **Qatar - Total Revenues** : Somme des revenues annuels
4. **Qatar - Total Profit** : Somme des profits annuels
5. **Qatar - Annualize net Revenues** : Somme des revenues annuels
6. **Qatar - Annualize net Profit** : Somme des profits annuels
7. **Hearst - Electricity** : `row.hearstOpexYearly || 0`
8. **Hearst - Share revenu** : `(row.hearstRevenueMonthly || 0) * 12`
9. **Hearst - Total Share revenu** : Somme des revenus annuels

### ⚠️ Formules à Confirmer (Questions à Résoudre)

1. **Qatar - ROI** : Utiliser `capex` ou `qatarTotalInvestment` ?
2. **Qatar - Price per BTC** : Coût de production ou prix de vente ?
3. **Qatar - ROI Total** : ROI cumulatif ou moyenne des ROI annuels ?
4. **Hearst - Margin** : Marge de profit ou Margin on Hardware ?
5. **Hearst - Total Margin** : Moyenne ou marge globale ?

### ❌ Données Manquantes dans `projectionData`

1. **Hearst - Margin on Hardware** : `hearstMarginOnHardwareYearly` n'est pas dans `projectionData`
2. **Hearst - Share Electricity** : `hearstShareElectricityYearly` n'est pas dans `projectionData`
3. **Hearst - Share SPV** : `hearstShareSPVYearly` n'est pas dans `projectionData` (si nécessaire)

---

## 6. RECOMMANDATIONS

### Actions Immédiates

1. **Implémenter les formules confirmées** dans le tableau Qatar et Hearst
2. **Ajouter les données manquantes** dans `projectionData` :
   ```typescript
   hearstMarginOnHardwareYearly: safeNumber(result.hearstMarginOnHardwareYearly) / 1000000,
   hearstShareElectricityYearly: safeNumber(result.hearstShareElectricityYearly) / 1000000,
   hearstShareSPVYearly: safeNumber(result.hearstShareSPVYearly) / 1000000,
   ```

### Questions à Résoudre

1. **ROI Qatar** : Utiliser `capex` ou `qatarTotalInvestment` ?
2. **Price per BTC** : Signification exacte (coût de production vs prix de vente) ?
3. **Margin Hearst** : Signification exacte (marge de profit vs margin on hardware) ?
4. **Total Margin** : Calcul (moyenne vs globale) ?

### Prochaines Étapes

1. Obtenir les clarifications sur les questions identifiées
2. Implémenter les formules confirmées
3. Ajouter les données manquantes dans `projectionData`
4. Implémenter les formules pour les boxes Hearst (Margin on Hardware, Share Electricity)
5. Tester tous les calculs avec des données réelles

---

## 7. NOTES DE CALCUL DÉTAILLÉES

### Calcul du ROI

**Formule Standard** :
```
ROI = (Profit / Investissement) × 100
```

**Pour Qatar** :
- Profit : `row.qatar` (en M$)
- Investissement : `capex / 1000000` ou `qatarTotalInvestment / 1000000` (en M$)
- **QUESTION** : Quel investissement utiliser ?

### Calcul du Price per BTC

**Interprétation 1 - Coût de Production** :
```
Price per BTC = Investissement Total / BTC Minés
```

**Interprétation 2 - Prix de Vente** :
```
Price per BTC = Prix BTC du marché
```

**Pour Qatar** :
- Investissement : `capex / 1000000` (en M$)
- BTC Minés : `(row.qatarMonthlyBTC || 0) * 12` (BTC annuel)
- Prix BTC : `row.btcPrice * 1000` (convertir k$ en M$)
- **QUESTION** : Quelle interprétation est correcte ?

### Calcul de la Margin (Hearst)

**Interprétation 1 - Marge de Profit** :
```
Margin = (Profit / Revenu) × 100
```

**Interprétation 2 - Margin on Hardware** :
```
Margin = hearstMarginOnHardwareYearly (revenu supplémentaire)
```

**Pour Hearst** :
- Profit : `row.hearst` (en M$)
- Revenu : `(row.hearstRevenueMonthly || 0) * 12` (en M$)
- Margin on Hardware : Non disponible dans `projectionData`
- **QUESTION** : Quelle interprétation est correcte ?

---

## 8. CONCLUSION

**État Actuel** : La plupart des calculs ne sont pas implémentés (valeurs à 0).

**Formules Prêtes** : 9 formules sont confirmées et prêtes à être implémentées.

**Questions Ouvertes** : 5 questions nécessitent des clarifications avant implémentation.

**Données Manquantes** : 3 champs doivent être ajoutés dans `projectionData`.

**Prochaine Action** : Obtenir les réponses aux questions identifiées, puis implémenter toutes les formules.

---

**Fin du Rapport**

