// Financial calculation logic for Qatar Mining Project

export interface PhaseConfig {
  mw: number;
  timeline: string;
  status: string;
}

export interface HardwareCosts {
  asicPerMW: number;
  infrastructurePerMW: number;
  coolingPerMW: number;
  networkingPerMW: number;
}

export interface EnergyConfig {
  qatarRate: number; // cents per kWh
  resaleRate: number; // cents per kWh
  premiumResaleRate: number; // cents per kWh
}

export interface MiningParams {
  btcPrice: number;
  networkDifficulty: number; // in T (terahash)
  hashratePerMW: number; // PH per MW
  blockReward: number;
  uptime: number; // percentage (default: 90%)
  poolFee: number; // percentage
}

export interface DealConfig {
  mwCapexCost?: number; // Coût MW côté client (peut être 0 si Qatar finance)
  hearstResellPricePerKwh?: number; // Prix de revente électricité HEARST (default: 0.055)
  mwAllocatedToHearst?: number; // MW alloués à HEARST pour revente
  // Paramètres depuis le Google Sheets
  marginOnHardware?: number; // % (ex: 8%)
  shareElectricity?: number; // % (ex: 15%)
  shareSPV?: number; // % (ex: 8%)
  elecCost?: number; // $/kWh (ex: 0.025)
}

export interface DealAInputs {
  phase: number;
  mw: number;
  revenueSharePercent: number;
  miningParams: MiningParams;
  opexMonthly: number;
  mwCapexCost?: number; // Coût MW (peut être 0)
  hearstResellPricePerKwh?: number; // Prix revente électricité (default: 0.055)
  mwAllocatedToHearst?: number; // MW alloués à HEARST
  // Paramètres depuis le Google Sheets
  marginOnHardware?: number; // % (ex: 8%)
  shareElectricity?: number; // % (ex: 15%)
  shareSPV?: number; // % (ex: 8%)
  elecCost?: number; // $/kWh (ex: 0.025)
}

export interface DealBInputs {
  phase: number;
  totalMW: number;
  mwSharePercent: number;
  miningParams: MiningParams;
  opexPerMW: number;
  energyRate?: number; // Taux d'énergie (cents/kWh) - optionnel pour compatibilité
  // Paramètres depuis le Google Sheets
  marginOnHardware?: number; // % (ex: 8%)
  shareElectricity?: number; // % (ex: 15%)
  shareSPV?: number; // % (ex: 8%)
  elecCost?: number; // $/kWh (ex: 0.025)
}

export interface DealAResult {
  totalMonthlyBTC: number; // Volume BTC mensuel total
  hearstMonthlyBTC: number; // Volume BTC mensuel HEARST (après répartition)
  qatarMonthlyBTC: number; // Volume BTC mensuel Qatar (après répartition)
  monthlyRevenue: number; // Revenu mensuel total
  hearstBtcRevenueMonthly: number; // Revenu BTC mensuel HEARST
  qatarBtcRevenueMonthly: number; // Revenu BTC mensuel Qatar
  hearstBtcRevenueYearly: number; // Revenu BTC annuel HEARST
  qatarBtcRevenueYearly: number; // Revenu BTC annuel Qatar
  hearstPowerRevenueMonthly: number; // Revenu revente électricité mensuel HEARST
  hearstPowerRevenueYearly: number; // Revenu revente électricité annuel HEARST
  // Revenus supplémentaires depuis le spreadsheet
  hearstMarginOnHardwareYearly?: number; // Margin on Hardware annuel HEARST
  hearstShareElectricityYearly?: number; // Share Electricity annuel HEARST
  hearstShareSPVYearly?: number; // Share SPV annuel HEARST
  hearstTotalRevenueMonthly: number; // Revenu total mensuel HEARST (BTC + électricité + autres)
  hearstTotalRevenueYearly: number; // Revenu total annuel HEARST (BTC + électricité + autres)
  hearstRevenue: number; // Alias pour compatibilité
  qatarRevenue: number; // Alias pour compatibilité
  hearstAnnual: number; // Alias pour compatibilité
  qatarAnnual: number; // Alias pour compatibilité
  opexAnnual: number;
  hearstOpexYearly: number; // OPEX annuel HEARST
  qatarOpexYearly: number; // OPEX annuel Qatar
  hearstNetProfit: number; // Net Profit annuel HEARST
  qatarNetProfit: number; // Net Profit annuel Qatar
  hearstTotalInvestment: number; // Total Investment HEARST
  qatarTotalInvestment: number; // Total Investment Qatar
  hearstRoi: number; // ROI HEARST en %
  qatarRoi: number; // ROI Qatar en %
  hearstBreakevenMonths: number; // Time to breakeven HEARST (mois)
  qatarBreakevenMonths: number; // Time to breakeven Qatar (mois)
}

export interface DealBResult {
  hearstMW: number;
  qatarMW: number;
  hearstMonthlyBTC: number;
  qatarMonthlyBTC: number;
  hearstMonthlyRevenue: number;
  qatarMonthlyRevenue: number;
  hearstAnnualProfit: number;
  qatarAnnualProfit: number;
  hearstElectricityCost: number; // Always 0
  qatarElectricityCost: number;
  resaleRevenue?: number; // Optional energy resale
  // Revenus supplémentaires depuis le spreadsheet
  hearstMarginOnHardwareYearly?: number;
  hearstShareElectricityYearly?: number;
  hearstShareSPVYearly?: number;
  hearstTotalRevenueYearly?: number; // Total incluant les revenus supplémentaires
}

// Calculate monthly BTC production
export function calculateMonthlyBTC(
  mw: number,
  hashratePerMW: number,
  networkDifficulty: number,
  uptime: number,
  poolFee: number,
  blockReward: number // Ajout du paramètre blockReward
): number {
  // Garde-fous pour éviter les divisions par zéro
  if (!mw || !hashratePerMW || !networkDifficulty || !uptime || !blockReward) {
    return 0;
  }
  
  // Convert MW to hashrate (PH = Petahash)
  const totalHashratePH = mw * hashratePerMW;
  
  // Network difficulty to hashrate conversion
  // Bitcoin network hashrate ≈ difficulty * 2^32 / 600 seconds
  // Simplified: network hashrate (EH) ≈ difficulty (T) * 0.0000017
  // Then convert EH to PH: 1 EH = 1000 PH
  // So: network hashrate (PH) ≈ difficulty (T) * 1.7
  // But for more realistic values, we use: network hashrate (PH) ≈ difficulty (T) * 5-6
  // Current network is ~600 EH = 600,000 PH, difficulty ~100T
  // So ratio is approximately: 600,000 / 100 = 6,000 PH per T of difficulty
  const networkHashratePH = networkDifficulty * 6000; // Realistic conversion
  
  // Éviter la division par zéro
  if (networkHashratePH === 0) {
    return 0;
  }
  
  // Calculate hashrate share (our hashrate / total network hashrate)
  const hashrateShare = totalHashratePH / networkHashratePH;
  
  // Bitcoin network parameters
  const blocksPerDay = 144; // 6 blocks per hour * 24 hours
  const btcPerBlock = blockReward; // Utilise le blockReward du scénario
  const dailyBTCIssued = blocksPerDay * btcPerBlock; // ~450 BTC per day
  
  // Daily BTC production = hashrate share * daily BTC issued * uptime * (1 - pool fee)
  // Selon formule: current_theorical_btc_mined_daily = (Total_btc_available_daily_minable + Total_btc_available_daily_minable_fees) * network_share_batch
  // Ici dailyBTCIssued = Total_btc_available_daily_minable + Total_btc_available_daily_minable_fees
  const dailyBTCProduction = hashrateShare * dailyBTCIssued * (uptime / 100) * (1 - poolFee / 100);
  
  // Monthly BTC production selon formule: current_theorical_btc_mined_monthly = current_theorical_btc_mined_daily * 365 / 12
  const monthlyBTC = dailyBTCProduction * 365 / 12;
  
  return Math.max(0, monthlyBTC); // Ensure non-negative
}

// Calculate CAPEX for a phase
export function calculateCAPEX(
  mw: number,
  hardwareCosts: HardwareCosts,
  phase: number
): number {
  const totalPerMW = 
    hardwareCosts.asicPerMW +
    hardwareCosts.infrastructurePerMW +
    hardwareCosts.coolingPerMW +
    hardwareCosts.networkingPerMW;
  
  let discount = 0;
  if (phase === 2) discount = 0.05;
  if (phase === 3) discount = 0.10;
  
  return totalPerMW * mw * (1 - discount);
}

// Calculate OPEX monthly
export function calculateOPEXMonthly(
  mw: number,
  energyRate: number,
  capex: number,
  maintenancePercent: number = 2, // % du CAPEX (défaut: 2)
  fixedCostsBase: number = 75000, // Coûts fixes de base (défaut: 75000)
  fixedCostsPerMW: number = 1000 // Coûts fixes par MW (défaut: 1000)
): number {
  // Garde-fous pour éviter les NaN
  if (!mw || isNaN(mw)) return 0;
  if (isNaN(energyRate)) energyRate = 0;
  if (isNaN(maintenancePercent)) maintenancePercent = 0;
  if (isNaN(capex)) capex = 0;
  if (isNaN(fixedCostsBase)) fixedCostsBase = 0;
  if (isNaN(fixedCostsPerMW)) fixedCostsPerMW = 0;
  
  const electricity = mw * 1000 * 720 * (energyRate / 100); // kW * hours * rate
  const maintenance = (capex * (maintenancePercent / 100)) / 12; // % CAPEX annually, monthly
  const fixed = fixedCostsBase + (mw * fixedCostsPerMW); // Base + per MW
  
  const result = electricity + maintenance + fixed;
  return isNaN(result) ? 0 : result;
}

// Calculate electricity resale revenue for HEARST
export function calculateHearstPowerResaleRevenue(
  mwAllocated: number,
  resellPricePerKwh: number,
  uptimeRatio: number
): { monthly: number; yearly: number } {
  if (!mwAllocated || mwAllocated <= 0 || !resellPricePerKwh || resellPricePerKwh <= 0) {
    return { monthly: 0, yearly: 0 };
  }
  
  const hoursPerYear = 8760;
  const hearstKwhYear = mwAllocated * 1000 * hoursPerYear * uptimeRatio;
  const hearstPowerRevenueYearly = hearstKwhYear * resellPricePerKwh;
  const hearstPowerRevenueMonthly = hearstPowerRevenueYearly / 12;
  
  return {
    monthly: hearstPowerRevenueMonthly,
    yearly: hearstPowerRevenueYearly,
  };
}

// Calculate CAPEX breakdown
export function calculateCAPEXBreakdown(
  mw: number,
  hardwareCosts: HardwareCosts,
  phase: number,
  mwCapexCost?: number
): {
  infrastructure: number;
  hardware: number;
  cooling: number;
  networking: number;
  total: number;
} {
  let discount = 0;
  if (phase === 2) discount = 0.05;
  if (phase === 3) discount = 0.10;
  
  const infrastructure = (hardwareCosts.infrastructurePerMW * mw * (1 - discount)) || (mwCapexCost || 0);
  const hardware = hardwareCosts.asicPerMW * mw * (1 - discount);
  const cooling = hardwareCosts.coolingPerMW * mw * (1 - discount);
  const networking = hardwareCosts.networkingPerMW * mw * (1 - discount);
  const total = infrastructure + hardware + cooling + networking;
  
  return { infrastructure, hardware, cooling, networking, total };
}

// Deal A: Revenue Share Model
export function calculateDealA(inputs: DealAInputs): DealAResult {
  // Calculer le volume BTC mensuel total
  const totalMonthlyBTC = calculateMonthlyBTC(
    inputs.mw,
    inputs.miningParams.hashratePerMW,
    inputs.miningParams.networkDifficulty,
    inputs.miningParams.uptime,
    inputs.miningParams.poolFee,
    inputs.miningParams.blockReward
  );
  
  // Répartition BTC selon % share
  const hearstSharePct = inputs.revenueSharePercent / 100;
  const qatarSharePct = 1 - hearstSharePct;
  
  const hearstMonthlyBTC = totalMonthlyBTC * hearstSharePct;
  const qatarMonthlyBTC = totalMonthlyBTC * qatarSharePct;
  
  // Revenus BTC
  const hearstBtcRevenueMonthly = hearstMonthlyBTC * inputs.miningParams.btcPrice;
  const qatarBtcRevenueMonthly = qatarMonthlyBTC * inputs.miningParams.btcPrice;
  const hearstBtcRevenueYearly = hearstBtcRevenueMonthly * 12;
  const qatarBtcRevenueYearly = qatarBtcRevenueMonthly * 12;
  
  // Revenu revente électricité HEARST
  const resellPrice = inputs.hearstResellPricePerKwh ?? 0.055;
  const mwAllocated = inputs.mwAllocatedToHearst ?? 0;
  const uptimeRatio = (inputs.miningParams.uptime || 90) / 100;
  const powerResale = calculateHearstPowerResaleRevenue(mwAllocated, resellPrice, uptimeRatio);
  
  // Revenus supplémentaires depuis le Google Sheets (si fournis)
  // Calculer les valeurs du contrat hardware
  const capexBreakdown = calculateCAPEXBreakdown(
    inputs.mw,
    defaultHardwareCosts,
    inputs.phase,
    inputs.mwCapexCost
  );
  const totalHardwareContractValue = capexBreakdown.hardware;
  
  // Calculer les coûts d'électricité totaux annuels
  const totalElectricityCostYearly = inputs.mw * 1000 * 8760 * ((inputs.elecCost ?? 0.025) || 0.025);
  
  // Pour SPV, on utilise un pourcentage des revenus BTC (à ajuster selon le modèle métier)
  const totalSPVRevenueYearly = qatarBtcRevenueYearly * (inputs.shareSPV ? inputs.shareSPV / 100 : 0);
  
  // Revenus HEARST depuis le spreadsheet
  const marginOnHardwarePct = inputs.marginOnHardware ?? 8.0;
  const shareElectricityPct = inputs.shareElectricity ?? 15.0;
  const shareSPVPct = inputs.shareSPV ?? 8.0;
  
  const hearstMarginOnHardwareYearly = totalHardwareContractValue * (marginOnHardwarePct / 100);
  const hearstShareElectricityYearly = totalElectricityCostYearly * (shareElectricityPct / 100);
  const hearstShareSPVYearly = totalSPVRevenueYearly * (shareSPVPct / 100);
  
  // Revenus totaux HEARST (BTC + électricité + margin hardware + share electricity + share SPV)
  const hearstAdditionalRevenueYearly = hearstMarginOnHardwareYearly + hearstShareElectricityYearly + hearstShareSPVYearly;
  const hearstTotalRevenueMonthly = hearstBtcRevenueMonthly + powerResale.monthly + (hearstAdditionalRevenueYearly / 12);
  const hearstTotalRevenueYearly = hearstBtcRevenueYearly + powerResale.yearly + hearstAdditionalRevenueYearly;
  
  // OPEX
  const opexAnnual = inputs.opexMonthly * 12;
  // Dans Deal A, HEARST ne paie pas d'OPEX, Qatar paie tout
  const hearstOpexYearly = 0;
  const qatarOpexYearly = opexAnnual;
  
  // Net Profit
  const hearstNetProfit = hearstTotalRevenueYearly - hearstOpexYearly;
  const qatarNetProfit = qatarBtcRevenueYearly - qatarOpexYearly;
  
  // CAPEX Breakdown (déjà calculé ci-dessus)
  const mwCapexCost = inputs.mwCapexCost ?? 0;
  
  // Total Investment (pour simplifier, on utilise le CAPEX total)
  // Dans Deal A, on peut avoir mwCapexCost = 0 si Qatar finance
  const hearstTotalInvestment = mwCapexCost > 0 ? capexBreakdown.total : 0;
  const qatarTotalInvestment = mwCapexCost === 0 ? capexBreakdown.total : (capexBreakdown.total - hearstTotalInvestment);
  
  // ROI
  const hearstRoi = hearstTotalInvestment > 0 ? (hearstNetProfit / hearstTotalInvestment) * 100 : 0;
  const qatarRoi = qatarTotalInvestment > 0 ? (qatarNetProfit / qatarTotalInvestment) * 100 : 0;
  
  // Breakeven
  const hearstNetProfitMonthly = hearstNetProfit / 12;
  const qatarNetProfitMonthly = qatarNetProfit / 12;
  const hearstBreakevenMonths = hearstNetProfitMonthly > 0 ? hearstTotalInvestment / hearstNetProfitMonthly : Infinity;
  const qatarBreakevenMonths = qatarNetProfitMonthly > 0 ? qatarTotalInvestment / qatarNetProfitMonthly : Infinity;
  
  return {
    totalMonthlyBTC,
    hearstMonthlyBTC,
    qatarMonthlyBTC,
    monthlyRevenue: totalMonthlyBTC * inputs.miningParams.btcPrice,
    hearstBtcRevenueMonthly,
    qatarBtcRevenueMonthly,
    hearstBtcRevenueYearly,
    qatarBtcRevenueYearly,
    hearstPowerRevenueMonthly: powerResale.monthly,
    hearstPowerRevenueYearly: powerResale.yearly,
    // Revenus supplémentaires depuis le spreadsheet
    hearstMarginOnHardwareYearly,
    hearstShareElectricityYearly,
    hearstShareSPVYearly,
    hearstTotalRevenueMonthly,
    hearstTotalRevenueYearly,
    // Aliases pour compatibilité
    hearstRevenue: hearstBtcRevenueMonthly,
    qatarRevenue: qatarBtcRevenueMonthly,
    hearstAnnual: hearstBtcRevenueYearly,
    qatarAnnual: qatarBtcRevenueYearly,
    opexAnnual,
    hearstOpexYearly,
    qatarOpexYearly,
    hearstNetProfit,
    qatarNetProfit,
    hearstTotalInvestment,
    qatarTotalInvestment,
    hearstRoi,
    qatarRoi,
    hearstBreakevenMonths,
    qatarBreakevenMonths,
  };
}

// Deal B: MW Allocation Model
export function calculateDealB(inputs: DealBInputs): DealBResult {
  const hearstMW = inputs.totalMW * (inputs.mwSharePercent / 100);
  const qatarMW = inputs.totalMW - hearstMW;
  
  const hearstMonthlyBTC = calculateMonthlyBTC(
    hearstMW,
    inputs.miningParams.hashratePerMW,
    inputs.miningParams.networkDifficulty,
    inputs.miningParams.uptime,
    inputs.miningParams.poolFee,
    inputs.miningParams.blockReward // Utilise blockReward du scénario
  );
  
  const qatarMonthlyBTC = calculateMonthlyBTC(
    qatarMW,
    inputs.miningParams.hashratePerMW,
    inputs.miningParams.networkDifficulty,
    inputs.miningParams.uptime,
    inputs.miningParams.poolFee,
    inputs.miningParams.blockReward // Utilise blockReward du scénario
  );
  
  const hearstMonthlyRevenue = hearstMonthlyBTC * inputs.miningParams.btcPrice;
  const qatarMonthlyRevenue = qatarMonthlyBTC * inputs.miningParams.btcPrice;
  
  // Revenus supplémentaires depuis le Google Sheets (si fournis)
  // Pour Deal B, les revenus sont proportionnels aux MW alloués
  const mwSharePct = inputs.mwSharePercent / 100;
  const capexBreakdown = calculateCAPEXBreakdown(
    inputs.totalMW,
    defaultHardwareCosts,
    inputs.phase,
    undefined
  );
  const totalHardwareContractValue = capexBreakdown.hardware;
  
  // Calculer les coûts d'électricité totaux annuels
  const elecCostPerKwh = inputs.elecCost ?? 0.025;
  const totalElectricityCostYearly = inputs.totalMW * 1000 * 8760 * elecCostPerKwh;
  
  // Pour SPV, on utilise un pourcentage des revenus BTC totaux
  const totalSPVRevenueYearly = (hearstMonthlyRevenue + qatarMonthlyRevenue) * 12;
  
  // Revenus HEARST depuis le spreadsheet (proportionnels aux MW alloués)
  const marginOnHardwarePct = inputs.marginOnHardware ?? 8.0;
  const shareElectricityPct = inputs.shareElectricity ?? 15.0;
  const shareSPVPct = inputs.shareSPV ?? 8.0;
  
  // Les revenus sont calculés sur la base totale mais proportionnels aux MW alloués
  const hearstMarginOnHardwareYearly = totalHardwareContractValue * (marginOnHardwarePct / 100) * mwSharePct;
  const hearstShareElectricityYearly = totalElectricityCostYearly * (shareElectricityPct / 100) * mwSharePct;
  const hearstShareSPVYearly = totalSPVRevenueYearly * (shareSPVPct / 100) * mwSharePct;
  
  // HEARST pays no electricity, only fixed OPEX
  const hearstOPEX = inputs.opexPerMW * hearstMW;
  const hearstBtcRevenueAnnual = hearstMonthlyRevenue * 12;
  
  // Optional resale revenue - Utilise la même fonction que Deal A avec 5.5 cents/kWh et 90% uptime
  const uptimeRatio = (inputs.miningParams.uptime || 90) / 100;
  const resellPrice = 0.055; // 5.5 cents per kWh
  const powerResale = calculateHearstPowerResaleRevenue(hearstMW, resellPrice, uptimeRatio);
  const resaleRevenue = powerResale.yearly;
  
  // Revenus totaux HEARST (BTC + revente électricité + margin hardware + share electricity + share SPV)
  const hearstAdditionalRevenueYearly = hearstMarginOnHardwareYearly + hearstShareElectricityYearly + hearstShareSPVYearly;
  const hearstTotalRevenueYearly = hearstBtcRevenueAnnual + resaleRevenue + hearstAdditionalRevenueYearly;
  const hearstAnnualProfit = hearstTotalRevenueYearly - (hearstOPEX * 12);
  
  // Qatar pays electricity + OPEX
  const qatarOPEX = inputs.opexPerMW * qatarMW;
  const energyRate = inputs.energyRate ?? 2.5; // Utilise energyRate du scénario ou défaut 2.5
  const qatarElectricityCost = qatarMW * 1000 * 720 * (energyRate / 100); // Utilise le taux d'énergie du scénario
  const qatarAnnualProfit = (qatarMonthlyRevenue - qatarOPEX - qatarElectricityCost) * 12;
  
  return {
    hearstMW,
    qatarMW,
    hearstMonthlyBTC,
    qatarMonthlyBTC,
    hearstMonthlyRevenue,
    qatarMonthlyRevenue,
    hearstAnnualProfit,
    qatarAnnualProfit,
    hearstElectricityCost: 0,
    qatarElectricityCost,
    resaleRevenue,
    // Revenus supplémentaires depuis le spreadsheet
    hearstMarginOnHardwareYearly,
    hearstShareElectricityYearly,
    hearstShareSPVYearly,
    hearstTotalRevenueYearly,
  };
}

// Default configurations
export const defaultPhases: PhaseConfig[] = [
  { mw: 200, timeline: "M19-M36", status: "Full Scale" },
];

export const defaultHardwareCosts: HardwareCosts = {
  asicPerMW: 450000,
  infrastructurePerMW: 180000,
  coolingPerMW: 90000,
  networkingPerMW: 30000,
};

export const defaultEnergyConfig: EnergyConfig = {
  qatarRate: 2.5,
  resaleRate: 5.5,
  premiumResaleRate: 6.0,
};

export const defaultMiningParams: MiningParams = {
  btcPrice: 0,
  networkDifficulty: 0, // T
  hashratePerMW: 0, // PH
  blockReward: 0,
  uptime: 90, // Default: 90%
  poolFee: 0,
};

