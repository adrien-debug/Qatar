// Service pour charger et parser les données du Google Sheets
// Le spreadsheet doit être publiquement accessible ou partagé avec accès en lecture

export interface DealSpreadsheetConfig {
  marginOnHardware: number; // % (ex: 8%)
  shareElectricity: number; // % (ex: 15%)
  shareSPV: number; // % (ex: 8%)
  elecCost: number; // $/kWh (ex: 0.025)
  // Revenus calculés annuels HEARST
  hearstMarginOnHardwareYearly?: number;
  hearstShareElectricityYearly?: number;
  hearstShareSPVYearly?: number;
  // Résultats calculés
  annualizeNetRevenues?: number;
  annualizeNetProfits?: number;
  roi?: number;
  cost1BTC?: number;
}

// Valeurs par défaut basées sur le spreadsheet
export const defaultDealConfig: DealSpreadsheetConfig = {
  marginOnHardware: 20.0,
  shareElectricity: 14.0,
  shareSPV: 20.0,
  elecCost: 0.03,
};

// Fonction pour parser une valeur numérique depuis le Google Sheets
function parseValue(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Retirer les symboles $ et % et convertir
  const cleaned = String(value).replace(/[$,%]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Fonction pour charger le Google Sheets via son export CSV
export async function loadDealConfigFromGoogleSheets(
  spreadsheetUrl: string
): Promise<DealSpreadsheetConfig> {
  try {
    // Convertir l'URL Google Sheets en URL CSV
    // Format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={GID}
    // CSV: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={GID}
    
    const urlMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = spreadsheetUrl.match(/[#&]gid=([0-9]+)/);
    
    if (!urlMatch) {
      console.warn('URL Google Sheets invalide, utilisation des valeurs par défaut');
      return defaultDealConfig;
    }
    
    const spreadsheetId = urlMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement du spreadsheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Parser le CSV (format simplifié)
    const config: DealSpreadsheetConfig = { ...defaultDealConfig };
    
    for (const line of lines) {
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      // Chercher les valeurs dans les colonnes A et B
      const label = columns[0]?.toLowerCase() || '';
      const value = columns[1];
      
      if (label.includes('margin on hardware')) {
        config.marginOnHardware = parseValue(value);
      } else if (label.includes('share electricity')) {
        config.shareElectricity = parseValue(value);
      } else if (label.includes('share spv')) {
        config.shareSPV = parseValue(value);
      } else if (label.includes('elec cost') || label.includes('electricity cost')) {
        config.elecCost = parseValue(value);
      } else if (label.includes('margin on hardware (contract)')) {
        config.hearstMarginOnHardwareYearly = parseValue(value);
      } else if (label.includes('share electricity (yearly)')) {
        config.hearstShareElectricityYearly = parseValue(value);
      } else if (label.includes('share spv (yearly)')) {
        config.hearstShareSPVYearly = parseValue(value);
      } else if (label.includes('annualize net revenues')) {
        config.annualizeNetRevenues = parseValue(value);
      } else if (label.includes('annualize net profits') || label.includes('anualize net profits')) {
        config.annualizeNetProfits = parseValue(value);
      } else if (label.includes('roi')) {
        config.roi = parseValue(value);
      } else if (label.includes('cost 1 btc') || label.includes('cost 1btc')) {
        config.cost1BTC = parseValue(value);
      }
    }
    
    return config;
  } catch (error) {
    console.error('Erreur lors du chargement du Google Sheets:', error);
    return defaultDealConfig;
  }
}

// Fonction pour charger depuis un JSON statique (fallback)
export async function loadDealConfigFromJSON(
  jsonData: Partial<DealSpreadsheetConfig>
): Promise<DealSpreadsheetConfig> {
  return {
    ...defaultDealConfig,
    ...jsonData,
  };
}

// Interface pour les paramètres de calcul dynamique
export interface HearstFiguresCalculationParams {
  mw: number;
  phase: number;
  elecCost: number; // $/kWh
  hardwareCostPerMW: number; // Coût hardware par MW
  totalSPVRevenue?: number; // Revenus SPV totaux (optionnel, sera calculé si non fourni)
  qatarRevenueYearly?: number; // Revenus Qatar annuels pour calculer SPV (optionnel)
  dealType?: 'revenue' | 'mw';
  revenueSharePercent?: number;
  mwAllocatedPercent?: number;
}

// Calculer dynamiquement les "Hearst Figures" basées sur les paramètres du projet
export function calculateHearstFigures(
  config: DealSpreadsheetConfig,
  params: HearstFiguresCalculationParams
): {
  marginOnHardwareContract: number;
  shareElectricityYearly: number;
  shareSPVYearly: number;
  total: number;
} {
  const { mw, phase, elecCost, hardwareCostPerMW, totalSPVRevenue, qatarRevenueYearly, dealType, revenueSharePercent, mwAllocatedPercent } = params;
  
  // Calculer le coût total du hardware avec discount selon la phase
  // Le hardware cost total inclut ASIC + Infrastructure (ce qui constitue le contrat hardware)
  let discount = 0;
  if (phase === 2) discount = 0.05;
  if (phase === 3) discount = 0.10;
  
  // Le hardwareCostPerMW devrait déjà inclure ASIC + Infrastructure
  // Mais pour être sûr, on calcule le contrat hardware total
  const totalHardwareContractValue = hardwareCostPerMW * mw * (1 - discount);
  
  // Calculer le coût total d'électricité annuel
  const hoursPerYear = 8760;
  const totalElectricityCostYearly = mw * 1000 * hoursPerYear * elecCost;
  
  // Calculer les revenus SPV (si non fournis, utiliser un % des revenus Qatar)
  let spvRevenueToUse = totalSPVRevenue;
  if (!spvRevenueToUse && qatarRevenueYearly) {
    // Si SPV revenue n'est pas fourni, utiliser les revenus Qatar comme base
    spvRevenueToUse = qatarRevenueYearly;
  } else if (!spvRevenueToUse) {
    spvRevenueToUse = 0;
  }
  
  // Calculer les valeurs HEARST
  let marginOnHardwareContract = totalHardwareContractValue * (config.marginOnHardware / 100);
  let shareElectricityYearly = totalElectricityCostYearly * (config.shareElectricity / 100);
  let shareSPVYearly = spvRevenueToUse * (config.shareSPV / 100);
  
  // Si Deal B avec allocation de MW, appliquer la proportion
  if (dealType === 'mw' && mwAllocatedPercent !== undefined) {
    const mwSharePct = mwAllocatedPercent / 100;
    marginOnHardwareContract = marginOnHardwareContract * mwSharePct;
    shareElectricityYearly = shareElectricityYearly * mwSharePct;
    shareSPVYearly = shareSPVYearly * mwSharePct;
  }
  
  return {
    marginOnHardwareContract,
    shareElectricityYearly,
    shareSPVYearly,
    total: marginOnHardwareContract + shareElectricityYearly + shareSPVYearly,
  };
}

// Calculer les revenus HEARST basés sur le deal config et les paramètres dynamiques
export function calculateHearstRevenues(
  config: DealSpreadsheetConfig,
  dealType: 'revenue' | 'mw',
  revenueSharePercent: number,
  mwAllocatedPercent: number,
  totalHardwareContractValue: number,
  totalElectricityCost: number,
  totalSPVRevenue: number,
  totalMW: number
): {
  marginOnHardware: number;
  shareElectricity: number;
  shareSPV: number;
  total: number;
} {
  let marginOnHardware = 0;
  let shareElectricity = 0;
  let shareSPV = 0;
  
  if (dealType === 'revenue') {
    // Deal A: Revenue Share
    // Margin on Hardware = % du contrat hardware
    marginOnHardware = totalHardwareContractValue * (config.marginOnHardware / 100);
    // Share Electricity = % des coûts d'électricité
    shareElectricity = totalElectricityCost * (config.shareElectricity / 100);
    // Share SPV = % des revenus SPV
    shareSPV = totalSPVRevenue * (config.shareSPV / 100);
  } else {
    // Deal B: MW Allocation
    // Les revenus sont calculés différemment selon l'allocation de MW
    const mwAllocatedToHearst = totalMW * (mwAllocatedPercent / 100);
    // Margin on Hardware proportionnel aux MW alloués
    marginOnHardware = totalHardwareContractValue * (config.marginOnHardware / 100) * (mwAllocatedPercent / 100);
    // Share Electricity proportionnel aux MW alloués
    shareElectricity = totalElectricityCost * (config.shareElectricity / 100) * (mwAllocatedPercent / 100);
    // Share SPV proportionnel aux MW alloués
    shareSPV = totalSPVRevenue * (config.shareSPV / 100) * (mwAllocatedPercent / 100);
  }
  
  return {
    marginOnHardware,
    shareElectricity,
    shareSPV,
    total: marginOnHardware + shareElectricity + shareSPV,
  };
}

