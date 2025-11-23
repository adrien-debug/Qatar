import { Activity } from "lucide-react";
import { Scenario } from "./ScenarioManager";

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toFixed(decimals);
};

interface ReportParamsProps {
  activeScenario: Scenario | null;
  energyRate: number;
  maintenancePercent: number;
  fixedCostsBase: number;
  fixedCostsPerMW: number;
}

export default function ReportParams({
  activeScenario,
  energyRate,
  maintenancePercent,
  fixedCostsBase,
  fixedCostsPerMW,
}: ReportParamsProps) {
  return (
    <div className="pdf-avoid-break">
      {/* Paramètres du Scénario */}
      {activeScenario && (
        <div className="mb-6 print:mb-4">
          <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
            <h3 className="text-xl print:text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-5 h-5 print:w-4 print:h-4 text-hearst-green" />
              Paramètres du Scénario
            </h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 print:gap-1.5">
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Prix BTC</div>
              <div className="text-sm print:text-xs font-bold text-white">${safeToFixed(activeScenario.btcPrice, 0)}</div>
            </div>
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Difficulté</div>
              <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(activeScenario.networkDifficulty, 1)} T</div>
            </div>
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Hashrate/MW</div>
              <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(activeScenario.hashratePerMW, 1)} PH</div>
            </div>
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Block Reward</div>
              <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(activeScenario.blockReward, 3)} BTC</div>
            </div>
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Uptime</div>
              <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(activeScenario.uptime, 1)}%</div>
            </div>
            <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
              <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Pool Fee</div>
              <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(activeScenario.poolFee, 1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Paramètres OPEX */}
      <div>
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
          <h3 className="text-xl print:text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <Activity className="w-5 h-5 print:w-4 print:h-4 text-hearst-green" />
            Paramètres OPEX
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 print:gap-1.5">
          <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
            <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Taux Énergie</div>
            <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(energyRate, 2)} ¢/kWh</div>
          </div>
          <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
            <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Maintenance</div>
            <div className="text-sm print:text-xs font-bold text-white">{safeToFixed(maintenancePercent, 1)}% CAPEX</div>
          </div>
          <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
            <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Coûts Fixes Base</div>
            <div className="text-sm print:text-xs font-bold text-white">${safeToFixed(fixedCostsBase, 0)}</div>
          </div>
          <div className="bg-gray-800 print:bg-gray-700/50 border border-hearst-green/30 print:border-hearst-green/50 p-2 print:p-1.5 rounded">
            <div className="text-[10px] print:text-[8px] text-gray-400 mb-0.5 uppercase">Coûts Fixes/MW</div>
            <div className="text-sm print:text-xs font-bold text-white">${safeToFixed(fixedCostsPerMW, 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

