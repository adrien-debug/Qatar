# Mapping Setup - Guide de Vérification

## Structure des 4 Cards

### CARD 1: "Parameters" (Colonne gauche, haut)
| Label | Chemin dans baseSetup | Valeur actuelle | Format |
|-------|----------------------|-----------------|--------|
| Margin on Hardware | `setup.parameters.marginOnHardwarePercent` | 8 | 8.00% |
| Share Electricity | `setup.parameters.shareElectricityPercent` | 15 | 15.00% |
| Share SPV | `setup.parameters.shareSpvPercent` | 10 | 10.00% |
| Elec cost | `setup.parameters.elecCostUSDPerKwh` | 0.025 | $0.03 |

### CARD 2: "Project data" (Colonne gauche, bas)
| Label | Chemin dans baseSetup | Valeur actuelle | Format |
|-------|----------------------|-----------------|--------|
| Total Capex | `setup.projectData.totalCapexUSD` | 34600778 | $34,600,778 |
| Hardware Capex | `setup.projectData.hardwareCapexUSD` | 32829306 | $32,829,306 |
| Infra Capex | `setup.projectData.infraCapexUSD` | 6250000 | $6,250,000 |
| Total Power Project (Mw) | `setup.projectData.totalPowerMw` | 25 | 25 |

### CARD 3: "QATAR Figures" (Colonne droite, haut)
| Label | Chemin dans baseSetup | Valeur actuelle | Format |
|-------|----------------------|-----------------|--------|
| Annualize net revenues | `setup.qatarFigures.annualizedNetRevenuesUSD` | 29065454 | $29,065,454 |
| Annualize net profits | `setup.qatarFigures.annualizedNetProfitsUSD` | 12162378 | $12,162,378 |
| ROI | `setup.qatarFigures.roiPercent` | 50.63 | 50.63% |
| Cost 1 BTC | `setup.qatarFigures.costPerBtcUSD` | 58840.87 | $58,840.87 |

### CARD 4: "HEARST Figures" (Colonne droite, bas)
| Label | Chemin dans baseSetup | Valeur actuelle | Format |
|-------|----------------------|-----------------|--------|
| Margin on Hardware (Contract) | `setup.hearstFigures.marginOnHardwareUSD` | 2626344 | $2,626,344 |
| Share Electricity (Yearly) | `setup.hearstFigures.shareElectricityYearlyUSD` | 1806750 | $1,806,750 |
| Share SPV (Yearly) | `setup.hearstFigures.shareSpvYearlyUSD` | 2906545 | $2,906,545 |

## Comment vérifier

1. Ouvrez la page `/setup` dans votre navigateur
2. Pour chaque valeur que vous voyez dans Excel, dites-moi :
   - Le label exact (ex: "Margin on Hardware")
   - La valeur exacte (ex: 8 ou 8%)
   - Dans quelle card elle doit apparaître
3. Je vérifierai le mapping et corrigerai si nécessaire

## Fichiers à modifier

- **Données** : `lib/setup-data.ts` → Modifier les valeurs dans `baseSetup`
- **Mapping** : `app/setup/page.tsx` → Modifier `setupCardsConfig` pour changer les labels ou l'ordre
- **Formatage** : `app/setup/page.tsx` → Modifier les fonctions `formatUSD`, `formatPercent`, etc.

