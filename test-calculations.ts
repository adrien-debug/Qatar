// Script de test pour valider les calculs financiers
// Teste 10 fois avec différents paramètres

import {
  calculateDealA,
  calculateDealB,
  calculateMonthlyBTC,
  calculateHearstPowerResaleRevenue,
  defaultMiningParams,
  defaultPhases,
  defaultHardwareCosts,
  calculateOPEXMonthly,
  calculateCAPEX,
  DealAInputs,
  DealBInputs,
} from './lib/financial-calculations';

interface TestResult {
  testNumber: number;
  passed: boolean;
  errors: string[];
  details: any;
}

function runTest(testNumber: number, params: any): TestResult {
  const errors: string[] = [];
  const details: any = {};

  try {
    // Test 1: Calcul BTC mensuel selon formule du glossaire
    const mw = params.mw || 25;
    const hashratePerMW = params.hashratePerMW || 1.5;
    const networkDifficulty = params.networkDifficulty || 100;
    const uptime = params.uptime || 90;
    const poolFee = params.poolFee || 1;
    const blockReward = params.blockReward || 3.125;
    const btcPrice = params.btcPrice || 60000;

    // Calcul selon formule: network_share_batch = theorical_batch_hashrate / instant_btc_network_hashrate
    const theoricalBatchHashrate = mw * hashratePerMW; // PH
    const instantBtcNetworkHashrate = networkDifficulty * 6000; // PH
    const networkShareBatch = theoricalBatchHashrate / instantBtcNetworkHashrate;
    details.networkShareBatch = networkShareBatch;

    // Calcul selon formule: current_theorical_btc_mined_daily = (Total_btc_available_daily_minable + Total_btc_available_daily_minable_fees) * network_share_batch
    const blocksPerDay = 144;
    const totalBtcAvailableDailyMinable = blocksPerDay * blockReward;
    const currentTheoricalBtcMinedDaily = totalBtcAvailableDailyMinable * networkShareBatch * (uptime / 100) * (1 - poolFee / 100);
    details.dailyBTC = currentTheoricalBtcMinedDaily;

    // Calcul selon formule: current_theorical_btc_mined_monthly = current_theorical_btc_mined_daily * 365 / 12
    const currentTheoricalBtcMinedMonthly = currentTheoricalBtcMinedDaily * 365 / 12;
    details.monthlyBTCFormula = currentTheoricalBtcMinedMonthly;

    // Calcul avec fonction
    const monthlyBTC = calculateMonthlyBTC(mw, hashratePerMW, networkDifficulty, uptime, poolFee, blockReward);
    details.monthlyBTCCalculated = monthlyBTC;

    // Vérification: différence < 0.0001 BTC
    const diffBTC = Math.abs(monthlyBTC - currentTheoricalBtcMinedMonthly);
    if (diffBTC > 0.0001) {
      errors.push(`Test BTC mensuel: différence de ${diffBTC.toFixed(6)} BTC`);
    }

    // Test 2: Calcul revente électricité - 5.5 cents/kWh à 90% uptime
    const mwAllocated = params.mwAllocated || 12;
    const resellPricePerKwh = 0.055; // 5.5 cents = 0.055 $
    const uptimeRatio = 0.90; // 90%

    const powerResale = calculateHearstPowerResaleRevenue(mwAllocated, resellPricePerKwh, uptimeRatio);
    details.powerResale = powerResale;

    // Vérification manuelle: MW * 1000 kW * 8760 heures/an * 0.90 * 0.055 $/kWh
    const expectedYearly = mwAllocated * 1000 * 8760 * 0.90 * 0.055;
    const expectedMonthly = expectedYearly / 12;
    details.expectedPowerResale = { yearly: expectedYearly, monthly: expectedMonthly };

    const diffYearly = Math.abs(powerResale.yearly - expectedYearly);
    const diffMonthly = Math.abs(powerResale.monthly - expectedMonthly);
    if (diffYearly > 1) {
      errors.push(`Test revente annuelle: différence de $${diffYearly.toFixed(2)}`);
    }
    if (diffMonthly > 0.1) {
      errors.push(`Test revente mensuelle: différence de $${diffMonthly.toFixed(2)}`);
    }

    // Test 3: Calcul Deal A
    const miningParams = {
      btcPrice,
      networkDifficulty,
      hashratePerMW,
      blockReward,
      uptime,
      poolFee,
    };

    const opexMonthly = calculateOPEXMonthly(mw, 2.5, calculateCAPEX(mw, defaultHardwareCosts, 1), 2, 75000, 1000);
    const dealAInputs: DealAInputs = {
      phase: 1,
      mw,
      revenueSharePercent: 8,
      miningParams,
      opexMonthly,
      hearstResellPricePerKwh: 0.055,
      mwAllocatedToHearst: mwAllocated,
    };

    const dealAResult = calculateDealA(dealAInputs);
    details.dealA = {
      hearstMonthlyBTC: dealAResult.hearstMonthlyBTC,
      qatarMonthlyBTC: dealAResult.qatarMonthlyBTC,
      hearstPowerRevenueMonthly: dealAResult.hearstPowerRevenueMonthly,
      hearstTotalRevenueMonthly: dealAResult.hearstTotalRevenueMonthly,
    };

    // Vérification: Revenue HEARST = BTC revenue + power revenue
    const expectedHearstTotalMonthly = dealAResult.hearstBtcRevenueMonthly + dealAResult.hearstPowerRevenueMonthly;
    const diffTotal = Math.abs(dealAResult.hearstTotalRevenueMonthly - expectedHearstTotalMonthly);
    if (diffTotal > 0.01) {
      errors.push(`Test Deal A revenue total: différence de $${diffTotal.toFixed(2)}`);
    }

    // Test 4: Calcul Deal B
    const dealBInputs: DealBInputs = {
      phase: 1,
      totalMW: mw,
      mwSharePercent: 12,
      miningParams,
      opexPerMW: opexMonthly / mw,
      energyRate: 2.5,
    };

    const dealBResult = calculateDealB(dealBInputs);
    details.dealB = {
      hearstMW: dealBResult.hearstMW,
      qatarMW: dealBResult.qatarMW,
      hearstAnnualProfit: dealBResult.hearstAnnualProfit,
      qatarAnnualProfit: dealBResult.qatarAnnualProfit,
    };

    // Vérification: MW total = HEARST + Qatar
    const totalMWCheck = dealBResult.hearstMW + dealBResult.qatarMW;
    if (Math.abs(totalMWCheck - mw) > 0.01) {
      errors.push(`Test Deal B MW total: ${totalMWCheck} au lieu de ${mw}`);
    }

  } catch (error: any) {
    errors.push(`Erreur lors du test: ${error.message}`);
  }

  return {
    testNumber,
    passed: errors.length === 0,
    errors,
    details,
  };
}

// Exécuter 10 tests avec différents paramètres
console.log('🧪 Démarrage des tests de calculs financiers...\n');

const testResults: TestResult[] = [];

for (let i = 1; i <= 10; i++) {
  const params = {
    mw: 25 + (i * 5), // 30, 35, 40, ..., 75
    hashratePerMW: 1.0 + (i * 0.1), // 1.1, 1.2, ..., 2.0
    networkDifficulty: 80 + (i * 5), // 85, 90, ..., 130
    uptime: 85 + (i * 0.5), // 85.5, 86, ..., 90
    poolFee: 0.5 + (i * 0.1), // 0.6, 0.7, ..., 1.5
    blockReward: 3.125,
    btcPrice: 50000 + (i * 5000), // 55000, 60000, ..., 95000
    mwAllocated: 10 + (i * 2), // 12, 14, ..., 28
  };

  const result = runTest(i, params);
  testResults.push(result);

  console.log(`Test ${i}: ${result.passed ? '✅ PASSÉ' : '❌ ÉCHOUÉ'}`);
  if (result.errors.length > 0) {
    console.log(`  Erreurs:`);
    result.errors.forEach(err => console.log(`    - ${err}`));
  }
}

// Résumé
const passed = testResults.filter(r => r.passed).length;
const failed = testResults.filter(r => !r.passed).length;

console.log(`\n📊 Résumé des tests:`);
console.log(`  ✅ Réussis: ${passed}/10`);
console.log(`  ❌ Échoués: ${failed}/10`);

if (failed === 0) {
  console.log(`\n🎉 Tous les tests sont passés ! Les calculs sont corrects.`);
} else {
  console.log(`\n⚠️  ${failed} test(s) ont échoué. Vérifiez les erreurs ci-dessus.`);
}

export { testResults };


