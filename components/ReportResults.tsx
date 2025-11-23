import { TrendingUp, Coins, DollarSign, Activity, Calendar, Zap } from "lucide-react";
import { DealAResult, DealBResult } from "@/lib/financial-calculations";

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toFixed(decimals);
};

const formatCurrency = (value: number | undefined | null): string => {
  const num = value ?? 0;
  if (isNaN(num) || num === 0) return "$0";
  
  if (Math.abs(num) >= 1000000) {
    const millions = num / 1000000;
    return `$${safeToFixed(millions, millions >= 10 ? 1 : 2)}M`;
  } else if (Math.abs(num) >= 1000) {
    const thousands = num / 1000;
    return `$${safeToFixed(thousands, thousands >= 10 ? 1 : 2)}K`;
  } else {
    return `$${safeToFixed(num, 2)}`;
  }
};

interface ReportResultsProps {
  dealAResult?: DealAResult | null;
  dealBResult?: DealBResult | null;
  dealType: "revenue" | "mw";
}

export default function ReportResults({ dealAResult, dealBResult, dealType }: ReportResultsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 pdf-avoid-break">
      {/* Résultats HEARST */}
      <div>
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
          <h4 className="text-lg print:text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="w-5 h-5 print:w-4 print:h-4 text-hearst-green" />
            Résultats HEARST
          </h4>
        </div>
        <div className="space-y-2 print:space-y-1.5">
          {dealAResult ? (
            <>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase">Total Investment</div>
                <div className="text-base print:text-sm font-bold text-white">{formatCurrency(dealAResult.hearstTotalInvestment)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 print:w-2 print:h-2" />
                  Volume BTC Mensuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealAResult.hearstMonthlyBTC, 4)} BTC</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 print:w-2 print:h-2" />
                  Revenue Total Annuel
                </div>
                <div className="text-base print:text-sm font-bold text-hearst-green">{formatCurrency(dealAResult.hearstTotalRevenueYearly)}</div>
              </div>
              {dealAResult.hearstPowerRevenueYearly > 0 && (
                <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                  <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 print:w-2 print:h-2" />
                    Revenue Électricité Annuel
                  </div>
                  <div className="text-base print:text-sm font-bold text-hearst-green">{formatCurrency(dealAResult.hearstPowerRevenueYearly)}</div>
                </div>
              )}
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 print:w-2 print:h-2" />
                  OPEX Annuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{formatCurrency(dealAResult.hearstOpexYearly)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase">Net Profit Annuel</div>
                <div className="text-base print:text-sm font-bold text-white">{formatCurrency(dealAResult.hearstNetProfit)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border-2 border-hearst-green/50 print:border-hearst-green/70 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 print:w-2 print:h-2" />
                  ROI
                </div>
                <div className="text-lg print:text-base font-bold text-hearst-green">{safeToFixed(dealAResult.hearstRoi, 1)}%</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 print:w-2 print:h-2" />
                  Time to Breakeven
                </div>
                <div className="text-base print:text-sm font-bold text-white">
                  {dealAResult.hearstBreakevenMonths !== Infinity ? `${safeToFixed(dealAResult.hearstBreakevenMonths, 1)} mois` : "∞"}
                </div>
              </div>
            </>
          ) : dealBResult ? (
            <>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 print:w-2 print:h-2" />
                  MW Alloués
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealBResult.hearstMW, 1)} MW</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 print:w-2 print:h-2" />
                  Volume BTC Mensuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealBResult.hearstMonthlyBTC, 4)} BTC</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 print:w-2 print:h-2" />
                  Profit Annuel
                </div>
                <div className="text-base print:text-sm font-bold text-hearst-green">{formatCurrency(dealBResult.hearstAnnualProfit)}</div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Résultats Qatar */}
      <div>
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-qatar-red/40 print:border-qatar-red/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
          <h4 className="text-lg print:text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="w-5 h-5 print:w-4 print:h-4 text-qatar-red" />
            Résultats Qatar
          </h4>
        </div>
        <div className="space-y-2 print:space-y-1.5">
          {dealAResult ? (
            <>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase">Total Investment</div>
                <div className="text-base print:text-sm font-bold text-white">{formatCurrency(dealAResult.qatarTotalInvestment)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 print:w-2 print:h-2" />
                  Volume BTC Mensuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealAResult.qatarMonthlyBTC, 4)} BTC</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 print:w-2 print:h-2" />
                  Revenue BTC Annuel
                </div>
                <div className="text-base print:text-sm font-bold text-qatar-red">{formatCurrency(dealAResult.qatarBtcRevenueYearly)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 print:w-2 print:h-2" />
                  OPEX Annuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{formatCurrency(dealAResult.qatarOpexYearly)}</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase">Net Profit Annuel</div>
                <div className={`text-base print:text-sm font-bold ${dealAResult.qatarNetProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(dealAResult.qatarNetProfit)}
                </div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border-2 border-qatar-red/50 print:border-qatar-red/70 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 print:w-2 print:h-2" />
                  ROI
                </div>
                <div className="text-lg print:text-base font-bold text-qatar-red">{safeToFixed(dealAResult.qatarRoi, 1)}%</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 print:w-2 print:h-2" />
                  Time to Breakeven
                </div>
                <div className="text-base print:text-sm font-bold text-white">
                  {dealAResult.qatarBreakevenMonths !== Infinity ? `${safeToFixed(dealAResult.qatarBreakevenMonths, 1)} mois` : "∞"}
                </div>
              </div>
            </>
          ) : dealBResult ? (
            <>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 print:w-2 print:h-2" />
                  MW Restants
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealBResult.qatarMW, 1)} MW</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 print:w-2 print:h-2" />
                  Volume BTC Mensuel
                </div>
                <div className="text-base print:text-sm font-bold text-white">{safeToFixed(dealBResult.qatarMonthlyBTC, 4)} BTC</div>
              </div>
              <div className="bg-gray-800 print:bg-gray-700/50 border border-qatar-red/30 print:border-qatar-red/50 p-3 print:p-2 rounded">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 print:w-2 print:h-2" />
                  Profit Annuel
                </div>
                <div className={`text-base print:text-sm font-bold ${dealBResult.qatarAnnualProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(dealBResult.qatarAnnualProfit)}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

