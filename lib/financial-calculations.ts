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
  uptime: number; // percentage
  poolFee: number; // percentage
}

export interface DealAInputs {
  phase: number;
  mw: number;
  revenueSharePercent: number;
  miningParams: MiningParams;
  opexMonthly: number;
}

export interface DealBInputs {
  phase: number;
  totalMW: number;
  mwSharePercent: number;
  miningParams: MiningParams;
  opexPerMW: number;
}

export interface DealAResult {
  monthlyBTC: number;
  monthlyRevenue: number;
  hearstRevenue: number;
  qatarRevenue: number;
  hearstAnnual: number;
  qatarAnnual: number;
  opexAnnual: number;
  hearstNetProfit: number;
  qatarNetProfit: number;
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
}

// Calculate monthly BTC production
export function calculateMonthlyBTC(
  mw: number,
  hashratePerMW: number,
  networkDifficulty: number,
  uptime: number,
  poolFee: number
): number {
  // Convert MW to hashrate (PH = Petahash)
  const totalHashratePH = mw * hashratePerMW;
  
  // Network difficulty in T (Terahash), convert to PH
  const networkHashratePH = networkDifficulty / 1000;
  
  // Calculate hashrate share
  const hashrateShare = totalHashratePH / networkHashratePH;
  
  // Bitcoin network parameters
  const blocksPerDay = 144; // 6 blocks per hour * 24 hours
  const btcPerBlock = 3.125; // Current block reward
  
  // Daily BTC production = hashrate share * blocks per day * BTC per block * uptime * (1 - pool fee)
  const dailyBTCProduction = hashrateShare * blocksPerDay * btcPerBlock * (uptime / 100) * (1 - poolFee / 100);
  
  // Monthly BTC production
  const monthlyBTC = dailyBTCProduction * 30;
  
  return monthlyBTC;
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
  capex: number
): number {
  const electricity = mw * 1000 * 720 * (energyRate / 100); // kW * hours * rate
  const maintenance = (capex * 0.02) / 12; // 2% CAPEX annually, monthly
  const fixed = 75000 + (mw * 1000); // Base + per MW
  
  return electricity + maintenance + fixed;
}

// Deal A: Revenue Share Model
export function calculateDealA(inputs: DealAInputs): DealAResult {
  const monthlyBTC = calculateMonthlyBTC(
    inputs.mw,
    inputs.miningParams.hashratePerMW,
    inputs.miningParams.networkDifficulty,
    inputs.miningParams.uptime,
    inputs.miningParams.poolFee
  );
  
  const monthlyRevenue = monthlyBTC * inputs.miningParams.btcPrice;
  const hearstRevenue = monthlyRevenue * (inputs.revenueSharePercent / 100);
  const qatarRevenue = monthlyRevenue - hearstRevenue;
  
  const hearstAnnual = hearstRevenue * 12;
  const qatarAnnual = qatarRevenue * 12;
  const opexAnnual = inputs.opexMonthly * 12;
  
  return {
    monthlyBTC,
    monthlyRevenue,
    hearstRevenue,
    qatarRevenue,
    hearstAnnual,
    qatarAnnual,
    opexAnnual,
    hearstNetProfit: hearstAnnual - (opexAnnual * 0), // HEARST doesn't pay OPEX in Deal A
    qatarNetProfit: qatarAnnual - opexAnnual,
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
    inputs.miningParams.poolFee
  );
  
  const qatarMonthlyBTC = calculateMonthlyBTC(
    qatarMW,
    inputs.miningParams.hashratePerMW,
    inputs.miningParams.networkDifficulty,
    inputs.miningParams.uptime,
    inputs.miningParams.poolFee
  );
  
  const hearstMonthlyRevenue = hearstMonthlyBTC * inputs.miningParams.btcPrice;
  const qatarMonthlyRevenue = qatarMonthlyBTC * inputs.miningParams.btcPrice;
  
  // HEARST pays no electricity, only fixed OPEX
  const hearstOPEX = inputs.opexPerMW * hearstMW;
  const hearstAnnualProfit = (hearstMonthlyRevenue - hearstOPEX) * 12;
  
  // Qatar pays electricity + OPEX
  const qatarOPEX = inputs.opexPerMW * qatarMW;
  const qatarElectricityCost = qatarMW * 1000 * 720 * 0.025; // 2.5 cents per kWh
  const qatarAnnualProfit = (qatarMonthlyRevenue - qatarOPEX - qatarElectricityCost) * 12;
  
  // Optional resale revenue
  const resaleRevenue = hearstMW * 1000 * 720 * 0.055 * 12; // 5.5 cents per kWh
  
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
  };
}

// Default configurations
export const defaultPhases: PhaseConfig[] = [
  { mw: 25, timeline: "M1-M6", status: "Launch" },
  { mw: 100, timeline: "M7-M18", status: "Expansion" },
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
  btcPrice: 140000,
  networkDifficulty: 105, // T
  hashratePerMW: 3.5, // PH
  blockReward: 3.125,
  uptime: 98.5,
  poolFee: 0.8,
};

