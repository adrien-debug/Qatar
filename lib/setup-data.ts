/**
 * ============================================
 * VALEURS ÉDITABLES - MODIFIEZ ICI
 * ============================================
 * 
 * Ce fichier contient toutes les valeurs statiques affichées dans :
 * - La page Setup (/setup)
 * - Les boxes Qatar de la page Projection (Annualize net revenues, Annualize net profits, ROI, Cost 1 BTC)
 * - Les boxes HEARST de la page Projection (Margin on hardware, Share Electricity, Share Revenu)
 * 
 * 📍 LOCALISATION : lib/setup-data.ts
 * 
 * Pour modifier les valeurs :
 * 1. Ouvrez le fichier lib/setup-data.ts
 * 2. Modifiez les valeurs dans l'objet baseSetup ci-dessous
 * 3. Les changements seront automatiquement reflétés dans l'application
 * 
 * ============================================
 */

export interface SetupParameters {
  marginOnHardwarePercent: number;  // 8 = 8%
  shareElectricityPercent: number;  // 15 = 15%
  shareSpvPercent: number;          // 10 = 10%
  elecCostUSDPerKwh: number;        // 0.025 = $0.025
}

export interface SetupProjectData {
  totalCapexUSD: number;             // $34,600,778
  hardwareCapexUSD: number;          // $32,829,306
  infraCapexUSD: number;            // $6,250,000
  totalPowerMw: number;             // 25 MW
}

export interface SetupQatarFigures {
  annualizedNetRevenuesUSD: number; // $29,065,454
  annualizedNetProfitsUSD: number;  // $12,162,378
  roiPercent: number;                // 50.63 = 50.63%
  costPerBtcUSD: number;            // $58,840.87
}

export interface SetupHearstFigures {
  marginOnHardwareUSD: number;      // $2,626,344
  shareElectricityYearlyUSD: number; // $1,806,750
  shareSpvYearlyUSD: number;        // $2,906,545
}

export interface BaseSetup {
  parameters: SetupParameters;
  projectData: SetupProjectData;
  qatarFigures: SetupQatarFigures;
  hearstFigures: SetupHearstFigures;
}

/**
 * Interface pour un scénario
 */
export interface Scenario {
  id: string;
  name: string;
  data: BaseSetup;
  createdAt: string;
  updatedAt: string;
}

/**
 * Structure de stockage des scénarios dans localStorage
 */
interface ScenariosStorage {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  activeSubScenarioId: string | null; // Nouveau : sous-scénario sélectionné
}

/**
 * Scénario de base toujours actif
 * Contient : 200 MW, phases SPV, phases share electricity
 */
const BASE_ACTIVE_SCENARIO: Partial<BaseSetup> = {
  projectData: {
    totalPowerMw: 200, // 200 MW toujours actif
    totalCapexUSD: 0, // Sera remplacé par le sous-scénario
    hardwareCapexUSD: 0,
    infraCapexUSD: 0,
  },
  parameters: {
    shareSpvPercent: 10, // Phases SPV toujours actives
    shareElectricityPercent: 15, // Phases share electricity toujours actives
    marginOnHardwarePercent: 0, // Sera remplacé par le sous-scénario
    elecCostUSDPerKwh: 0,
  },
};

/**
 * ============================================
 * VALEURS ÉDITABLES - MODIFIEZ ICI ⬇️
 * ============================================
 * 
 * Modifiez les valeurs ci-dessous pour changer ce qui s'affiche dans l'application.
 * 
 * IMPORTANT :
 * - Les montants sont en USD bruts (sans M$ ou k$)
 * - Les % sont stockés en valeurs "humaines" (8 = 8%, 15 = 15%)
 * - Pas besoin de redémarrer le serveur, les changements sont automatiques
 */
export const baseSetup: BaseSetup = {
  // ========== PARAMETERS ==========
  // Affichés dans : Page Setup → Card "Parameters"
  parameters: {
    marginOnHardwarePercent: 8,       // ← MODIFIABLE : 8 = 8%
    shareElectricityPercent: 15,      // ← MODIFIABLE : 15 = 15%
    shareSpvPercent: 10,              // ← MODIFIABLE : 10 = 10%
    elecCostUSDPerKwh: 0.025          // ← MODIFIABLE : $0.025
  },
  
  // ========== PROJECT DATA ==========
  // Affichés dans : Page Setup → Card "Project data"
  projectData: {
    totalCapexUSD: 34600778,          // ← MODIFIABLE : $34,600,778
    hardwareCapexUSD: 32829306,       // ← MODIFIABLE : $32,829,306
    infraCapexUSD: 6250000,           // ← MODIFIABLE : $6,250,000
    totalPowerMw: 25                  // ← MODIFIABLE : 25 MW
  },
  
  // ========== QATAR FIGURES ==========
  // Affichés dans :
  // - Page Setup → Card "QATAR Figures"
  // - Page Projection → Boxes Qatar (Annualize net revenues, Annualize net profits, ROI, Cost 1 BTC)
  qatarFigures: {
    annualizedNetRevenuesUSD: 29065454,   // ← MODIFIABLE : $29,065,454
    annualizedNetProfitsUSD: 12162378,    // ← MODIFIABLE : $12,162,378
    roiPercent: 50.63,                    // ← MODIFIABLE : 50.63 = 50.63%
    costPerBtcUSD: 58840.87               // ← MODIFIABLE : $58,840.87
  },
  
  // ========== HEARST FIGURES ==========
  // Affichés dans :
  // - Page Setup → Card "HEARST Figures"
  // - Page Projection → Boxes HEARST (Margin on hardware, Share Electricity, Share Revenu)
  hearstFigures: {
    marginOnHardwareUSD: 2626344,         // ← MODIFIABLE : $2,626,344
    shareElectricityYearlyUSD: 1806750,   // ← MODIFIABLE : $1,806,750
    shareSpvYearlyUSD: 2906545           // ← MODIFIABLE : $2,906,545
  }
};

/**
 * Fonctions de gestion des scénarios
 */
const SCENARIOS_STORAGE_KEY = "qatar-scenarios";
const LEGACY_SETUP_KEY = "qatar-edited-setup"; // Ancienne clé pour compatibilité

/**
 * Récupère tous les scénarios depuis localStorage
 */
export function getScenarios(): Scenario[] {
  if (typeof window === "undefined") return [];
  
  try {
    const storage = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (storage) {
      const parsed = JSON.parse(storage) as ScenariosStorage;
      return parsed.scenarios || [];
    }
  } catch (e) {
    console.error("Error loading scenarios:", e);
  }
  
  return [];
}

/**
 * Sauvegarde tous les scénarios dans localStorage
 */
export function saveScenarios(scenarios: Scenario[]): void {
  if (typeof window === "undefined") return;
  
  try {
    const current = getScenariosStorage();
    const storage: ScenariosStorage = {
      ...current,
      scenarios,
    };
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error("Error saving scenarios:", e);
  }
}

/**
 * Récupère le scénario actif (déprécié - utilisez getActiveSubScenarioId)
 */
export function getActiveScenarioId(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const storage = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (storage) {
      const parsed = JSON.parse(storage) as ScenariosStorage;
      return parsed.activeScenarioId || null;
    }
  } catch (e) {
    console.error("Error loading active scenario:", e);
  }
  
  return null;
}

/**
 * Récupère le sous-scénario actif (les données des tableaux)
 */
export function getActiveSubScenarioId(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const storage = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (storage) {
      const parsed = JSON.parse(storage) as ScenariosStorage;
      return parsed.activeSubScenarioId || null;
    }
  } catch (e) {
    console.error("Error loading active sub-scenario:", e);
  }
  
  return null;
}

/**
 * Définit le scénario actif (déprécié - utilisez setActiveSubScenarioId)
 */
export function setActiveScenarioId(scenarioId: string | null): void {
  if (typeof window === "undefined") return;
  
  try {
    const current = getScenariosStorage();
    const storage: ScenariosStorage = {
      ...current,
      activeScenarioId: scenarioId,
    };
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error("Error saving active scenario:", e);
  }
}

/**
 * Définit le sous-scénario actif (les données des tableaux)
 */
export function setActiveSubScenarioId(subScenarioId: string | null): void {
  if (typeof window === "undefined") return;
  
  try {
    const current = getScenariosStorage();
    const storage: ScenariosStorage = {
      ...current,
      activeSubScenarioId: subScenarioId,
    };
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error("Error saving active sub-scenario:", e);
  }
}

/**
 * Récupère la structure complète de stockage
 */
function getScenariosStorage(): ScenariosStorage {
  if (typeof window === "undefined") {
    return { scenarios: [], activeScenarioId: null, activeSubScenarioId: null };
  }
  
  try {
    const storage = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (storage) {
      const parsed = JSON.parse(storage) as ScenariosStorage;
      // Migration : si activeSubScenarioId n'existe pas, utiliser activeScenarioId
      if (parsed.activeSubScenarioId === undefined && parsed.activeScenarioId) {
        parsed.activeSubScenarioId = parsed.activeScenarioId;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error loading scenarios storage:", e);
  }
  
  return { scenarios: [], activeScenarioId: null, activeSubScenarioId: null };
}

/**
 * Crée un nouveau scénario
 */
export function createScenario(name: string, data: BaseSetup): Scenario {
  const scenario: Scenario = {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    data: JSON.parse(JSON.stringify(data)), // Deep copy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const scenarios = getScenarios();
  scenarios.push(scenario);
  saveScenarios(scenarios);
  
  return scenario;
}

/**
 * Met à jour un scénario existant
 */
export function updateScenario(scenarioId: string, updates: Partial<Scenario>): Scenario | null {
  const scenarios = getScenarios();
  const index = scenarios.findIndex(s => s.id === scenarioId);
  
  if (index === -1) return null;
  
  scenarios[index] = {
    ...scenarios[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveScenarios(scenarios);
  return scenarios[index];
}

/**
 * Supprime un scénario
 */
export function deleteScenario(scenarioId: string): boolean {
  const scenarios = getScenarios();
  const filtered = scenarios.filter(s => s.id !== scenarioId);
  
  if (filtered.length === scenarios.length) return false;
  
  saveScenarios(filtered);
  
  // Si le scénario supprimé était actif, réinitialiser
  const activeId = getActiveScenarioId();
  if (activeId === scenarioId) {
    setActiveScenarioId(null);
  }
  
  return true;
}

/**
 * Récupère un scénario par son ID
 */
export function getScenarioById(scenarioId: string): Scenario | null {
  const scenarios = getScenarios();
  return scenarios.find(s => s.id === scenarioId) || null;
}

/**
 * Met à jour les valeurs shareElectricityPercent et shareSpvPercent
 * Ces valeurs sont toujours actives dans le scénario de base, donc on les met à jour directement
 * dans BASE_ACTIVE_SCENARIO (mais comme c'est une constante, on les stocke dans localStorage)
 */
export function updateActiveScenarioShares(shareElectricityPercent: number, shareSpvPercent: number): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    // Stocker les valeurs de base dans localStorage
    const baseValuesKey = "qatar-base-active-scenario";
    const baseValues = {
      shareSpvPercent,
      shareElectricityPercent,
      totalPowerMw: 200, // Toujours 200 MW
    };
    localStorage.setItem(baseValuesKey, JSON.stringify(baseValues));
    return true;
  } catch (e) {
    console.error("Error updating active scenario shares:", e);
    return false;
  }
}

/**
 * Hook pour récupérer le setup actuel
 * 
 * Fusionne le scénario de base toujours actif (200 MW, SPV, Electricity)
 * avec le sous-scénario sélectionné (données des tableaux).
 * 
 * Note: Ce hook doit être utilisé uniquement dans des composants React.
 */
export function useCurrentSetup(): BaseSetup {
  if (typeof window === "undefined") {
    return baseSetup;
  }
  
  // 1. Récupérer les valeurs de base depuis localStorage (ou utiliser les valeurs par défaut)
  let baseValues = {
    shareSpvPercent: BASE_ACTIVE_SCENARIO.parameters?.shareSpvPercent ?? 10,
    shareElectricityPercent: BASE_ACTIVE_SCENARIO.parameters?.shareElectricityPercent ?? 15,
    totalPowerMw: BASE_ACTIVE_SCENARIO.projectData?.totalPowerMw ?? 200,
  };
  
  try {
    const baseValuesKey = "qatar-base-active-scenario";
    const saved = localStorage.getItem(baseValuesKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.shareSpvPercent !== undefined) baseValues.shareSpvPercent = parsed.shareSpvPercent;
      if (parsed.shareElectricityPercent !== undefined) baseValues.shareElectricityPercent = parsed.shareElectricityPercent;
      if (parsed.totalPowerMw !== undefined) baseValues.totalPowerMw = parsed.totalPowerMw;
    }
  } catch (e) {
    console.error("Error loading base values:", e);
  }
  
  // 2. Récupérer le sous-scénario actif (données des tableaux)
  const activeSubScenarioId = getActiveSubScenarioId();
  let subScenarioData: BaseSetup | null = null;
  
  if (activeSubScenarioId) {
    const scenario = getScenarioById(activeSubScenarioId);
    if (scenario) {
      subScenarioData = scenario.data;
    }
  }
  
  // 3. Si pas de sous-scénario, vérifier l'ancienne clé pour compatibilité
  if (!subScenarioData) {
    const saved = localStorage.getItem(LEGACY_SETUP_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Valider que la structure est correcte
        if (
          parsed.parameters &&
          parsed.projectData &&
          parsed.qatarFigures &&
          parsed.hearstFigures
        ) {
          subScenarioData = parsed as BaseSetup;
        }
      } catch (e) {
        console.error("Error loading saved setup:", e);
      }
    }
  }
  
  // 4. Fusionner le scénario de base (toujours actif) avec le sous-scénario
  const merged: BaseSetup = {
    parameters: {
      // Valeurs de base toujours actives (depuis localStorage ou valeurs par défaut)
      shareSpvPercent: baseValues.shareSpvPercent,
      shareElectricityPercent: baseValues.shareElectricityPercent,
      // Valeurs du sous-scénario (ou baseSetup par défaut)
      marginOnHardwarePercent: subScenarioData?.parameters.marginOnHardwarePercent ?? baseSetup.parameters.marginOnHardwarePercent,
      elecCostUSDPerKwh: subScenarioData?.parameters.elecCostUSDPerKwh ?? baseSetup.parameters.elecCostUSDPerKwh,
    },
    projectData: {
      // Valeur de base toujours active : 200 MW (depuis localStorage ou valeur par défaut)
      totalPowerMw: baseValues.totalPowerMw,
      // Valeurs du sous-scénario (ou baseSetup par défaut)
      totalCapexUSD: subScenarioData?.projectData.totalCapexUSD ?? baseSetup.projectData.totalCapexUSD,
      hardwareCapexUSD: subScenarioData?.projectData.hardwareCapexUSD ?? baseSetup.projectData.hardwareCapexUSD,
      infraCapexUSD: subScenarioData?.projectData.infraCapexUSD ?? baseSetup.projectData.infraCapexUSD,
    },
    qatarFigures: subScenarioData?.qatarFigures ?? baseSetup.qatarFigures,
    hearstFigures: subScenarioData?.hearstFigures ?? baseSetup.hearstFigures,
  };
  
  return merged;
}

