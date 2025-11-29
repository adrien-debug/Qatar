# Prompt pour Claude - Data Scientist - Analyse des Données Nécessaires

## Rôle
Tu es un **Data Scientist expert** spécialisé dans l'analyse de code financier et l'identification de toutes les données nécessaires pour l'application de formules complexes.

## Mission
Après avoir scanné **TOUT le code** de ce projet, tu dois identifier **TOUTES les données** nécessaires pour appliquer correctement les formules de calcul financier, puis les afficher dans la page **Data Menu** (`components/DataMenu.tsx`).

## Instructions

### 1. Analyse Complète du Code
Scanne **TOUS** les fichiers suivants pour identifier les données nécessaires :

#### Fichiers à analyser en priorité :
- `lib/financial-calculations.ts` - Toutes les formules de calcul
- `components/ProjectionCalculator.tsx` - Utilisation des formules
- `lib/data-parameters.ts` - Structure des paramètres
- `components/DataMenu.tsx` - Interface actuelle
- `PROMPT_CLAUDE.md` - Documentation des formules

#### Points d'analyse :
1. **Toutes les variables d'entrée** des fonctions de calcul
2. **Tous les paramètres** utilisés dans les formules
3. **Toutes les constantes** et valeurs par défaut
4. **Toutes les données manquantes** ou hardcodées qui devraient être configurables
5. **Toutes les dépendances** entre les calculs

### 2. Identification des Données Nécessaires

Pour chaque formule identifiée, liste :
- **Nom de la donnée** (en français et anglais si pertinent)
- **Type de donnée** (nombre, pourcentage, monnaie, etc.)
- **Unité** (%, $, $/kWh, MW, PH, T, etc.)
- **Valeur par défaut** (si applicable)
- **Plage de valeurs** (min/max si applicable)
- **Source actuelle** (hardcodée, localStorage, calculée, manquante)
- **Où elle est utilisée** (quelles formules)
- **Si elle est déjà dans Data Menu** (oui/non)

### 3. Catégorisation des Données

Organise les données en catégories logiques :

#### A. Paramètres Financiers
- Marge sur hardware
- Coût de l'électricité
- Taux d'énergie
- Prix de revente électricité
- etc.

#### B. Paramètres Techniques
- Hashrate par MW
- Difficulté réseau
- Block reward
- Uptime
- Pool fee
- etc.

#### C. Paramètres CAPEX
- Coût ASIC par MW
- Coût infrastructure par MW
- Coût cooling par MW
- Coût networking par MW
- Coût construction par MW
- Coût shipping par MW
- etc.

#### D. Paramètres OPEX
- Maintenance (% du CAPEX)
- Coûts fixes de base
- Coûts fixes par MW
- etc.

#### E. Paramètres de Deal
- Revenue share %
- MW allocated %
- Share Electricity %
- Share SPV %
- MW Capex Cost
- Hearst Resell Price per kWh
- MW Allocated to Hearst
- etc.

#### F. Paramètres de Phase
- MW par phase
- Discount par phase
- Timeline
- Status
- etc.

### 4. Création de l'Interface Data Menu

Après identification, modifie `components/DataMenu.tsx` pour :

1. **Ajouter toutes les données manquantes** dans l'interface
2. **Organiser par sections** selon les catégories ci-dessus
3. **Ajouter des labels clairs** avec unités
4. **Ajouter des tooltips/explications** pour chaque champ
5. **Valider les valeurs** (min/max, formats)
6. **Sauvegarder dans localStorage** avec la structure `CalculationParameters`

### 5. Structure de Données à Créer

Étends l'interface `CalculationParameters` dans `lib/data-parameters.ts` pour inclure **TOUTES** les données identifiées :

```typescript
export interface CalculationParameters {
  id: string;
  name: string;
  
  // Paramètres Financiers
  marginOnHardware: number; // %
  elecCost: number; // $/kWh
  energyRate: number; // cents/kWh
  hearstResellPricePerKwh: number; // $/kWh
  
  // Paramètres Techniques
  hashratePerMW: number; // PH per MW
  networkDifficulty: number; // T (terahash)
  blockReward: number; // BTC per block
  uptime: number; // % (0-100)
  poolFee: number; // % (0-100)
  
  // Paramètres CAPEX
  asicPerMW: number; // $
  infrastructurePerMW: number; // $
  coolingPerMW: number; // $
  networkingPerMW: number; // $
  constructionCostPerMW: number; // $
  hardwareShippingPerMW: number; // $
  
  // Paramètres OPEX
  maintenancePercent: number; // % du CAPEX
  fixedCostsBase: number; // $
  fixedCostsPerMW: number; // $/MW
  
  // Paramètres de Deal (certains contrôlés depuis Projection)
  // shareElectricity et shareSPV sont contrôlés UNIQUEMENT depuis la page Projection
  mwCapexCost: number; // $/MW
  hearstResellPricePerKwh: number; // $/kWh
  
  // ... toutes les autres données identifiées
  
  locked: boolean;
  isDefault?: boolean;
}
```

### 6. Checklist de Vérification

Avant de finaliser, vérifie que :

- [ ] **Toutes les formules** ont leurs données d'entrée dans Data Menu
- [ ] **Aucune valeur hardcodée** ne reste dans les calculs (sauf constantes mathématiques)
- [ ] **Toutes les unités** sont clairement indiquées
- [ ] **Tous les champs** ont des valeurs par défaut raisonnables
- [ ] **La structure de sauvegarde** est cohérente
- [ ] **Les validations** sont en place (min/max, formats)
- [ ] **L'interface est organisée** et intuitive
- [ ] **Les tooltips** expliquent chaque champ

### 7. Format de Sortie Attendu

Pour chaque donnée identifiée, fournis :

```markdown
## [Nom de la Donnée]

- **Description** : [Description claire]
- **Type** : [number/percentage/currency/etc.]
- **Unité** : [%, $, $/kWh, MW, PH, T, etc.]
- **Valeur par défaut** : [valeur]
- **Plage** : [min - max] (si applicable)
- **Source actuelle** : [hardcodée/localStorage/calculée/manquante]
- **Utilisée dans** : [liste des formules/fonctions]
- **Dans Data Menu** : [oui/non]
- **Section suggérée** : [catégorie]
```

### 8. Actions à Effectuer

1. **Scanner tout le code** pour identifier les données
2. **Créer une liste complète** de toutes les données nécessaires
3. **Modifier `lib/data-parameters.ts`** pour étendre l'interface
4. **Modifier `components/DataMenu.tsx`** pour ajouter tous les champs
5. **Vérifier que les calculs** utilisent bien les données du Data Menu
6. **Tester** que tout fonctionne correctement

## Notes Importantes

- **shareElectricity** et **shareSPV** sont contrôlés UNIQUEMENT depuis la page Projection (ne pas les ajouter dans Data Menu)
- Certaines données peuvent être **calculées** plutôt qu'entrées (indiquer clairement)
- Certaines données peuvent être **dérivées de scénarios** (indiquer la source)
- Prioriser les données qui sont **actuellement hardcodées** et devraient être configurables

## Objectif Final

À la fin de cette analyse, la page Data Menu doit contenir **TOUTES les données nécessaires** pour que les formules fonctionnent correctement, organisées de manière claire et intuitive, avec des explications pour chaque champ.

## Commence l'Analyse

Scanne maintenant **TOUT le code** et identifie **TOUTES les données** nécessaires. Commence par lister toutes les données trouvées, puis modifie les fichiers nécessaires pour les intégrer dans la page Data Menu.



