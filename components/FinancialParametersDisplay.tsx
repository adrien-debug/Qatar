"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import { Scenario } from "./ScenarioManager";
import { MiningParams, defaultMiningParams } from "@/lib/financial-calculations";
import { Bitcoin, TrendingUp, Zap, Activity, Percent, Settings2, Info } from "lucide-react";

// Helper function pour formater les nombres et éviter NaN
const safeNumber = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return value;
};

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  const num = safeNumber(value);
  return isNaN(num) ? "0" : num.toFixed(decimals);
};

// Composant InfoTooltip pour afficher les notes de calcul
const InfoTooltip = ({ note }: { note: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        className="w-5 h-5 rounded-full bg-hearst-green/20 border border-hearst-green/40 flex items-center justify-center cursor-help hover:bg-hearst-green/30 transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Info className="w-3 h-3 text-hearst-green" strokeWidth={2.5} />
      </div>
      {isHovered && (
        <div className="absolute z-50 right-0 top-6 w-80 p-4 bg-hearst-dark border-2 border-hearst-green/50 rounded-xl shadow-2xl text-sm text-hearst-text-secondary leading-relaxed">
          <div className="font-mono text-xs text-hearst-green mb-2 font-bold">Note de calcul:</div>
          <div className="whitespace-pre-line">{note}</div>
          <div className="absolute -top-2 right-4 w-4 h-4 bg-hearst-dark border-l-2 border-t-2 border-hearst-green/50 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default function FinancialParametersDisplay() {
  const [mounted, setMounted] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [activeScenarioData, setActiveScenarioData] = useState<{ params: MiningParams; scenario: Scenario | null }>({
    params: defaultMiningParams,
    scenario: null,
  });

  const miningParams = activeScenarioData.params;
  const activeScenario = activeScenarioData.scenario;

  // Marquer comme monté après le premier rendu côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger le scénario actif depuis localStorage
  const loadActiveScenario = (): { params: MiningParams; scenario: Scenario | null } => {
    if (typeof window === 'undefined') {
      return { params: defaultMiningParams, scenario: null };
    }
    
    const saved = localStorage.getItem("qatar-active-scenario");
    if (saved) {
      try {
        const scenario = JSON.parse(saved);
        return {
          params: {
            btcPrice: scenario.btcPrice || 0,
            networkDifficulty: scenario.networkDifficulty || 0,
            hashratePerMW: scenario.hashratePerMW || 0,
            blockReward: scenario.blockReward || 0,
            uptime: scenario.uptime || 0,
            poolFee: scenario.poolFee || 0,
          },
          scenario: scenario,
        };
      } catch (e) {
        console.error("Error loading scenario:", e);
      }
    }
    return { params: defaultMiningParams, scenario: null };
  };

  // Charger les données depuis localStorage uniquement après le montage côté client
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Charger les scénarios
    const loadScenarios = () => {
      const saved = localStorage.getItem("qatar-scenarios");
      if (saved) {
        try {
          const parsedScenarios = JSON.parse(saved);
          setScenarios(parsedScenarios);
          
          // Charger le scénario actif
          const activeData = loadActiveScenario();
          setActiveScenarioData(activeData);
          
          // Trouver l'ID du scénario actif
          if (activeData.scenario) {
            const activeId = parsedScenarios.findIndex((s: Scenario) => s.id === activeData.scenario?.id);
            if (activeId >= 0) {
              setSelectedScenarioId(activeData.scenario.id);
            }
          }
        } catch (e) {
          console.error("Error loading scenarios:", e);
        }
      }
    };
    
    loadScenarios();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      loadScenarios();
      setActiveScenarioData(loadActiveScenario());
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [mounted]);

  // Appliquer un scénario sélectionné
  const handleScenarioChange = (scenarioId: string) => {
    if (scenarioId === "") {
      // Réinitialiser aux valeurs par défaut
      setActiveScenarioData({ params: defaultMiningParams, scenario: null });
      if (typeof window !== 'undefined') {
        localStorage.removeItem("qatar-active-scenario");
      }
      setSelectedScenarioId("");
      return;
    }
    
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      const newParams: MiningParams = {
        btcPrice: scenario.btcPrice || 0,
        networkDifficulty: scenario.networkDifficulty || 0,
        hashratePerMW: scenario.hashratePerMW || 0,
        blockReward: scenario.blockReward || 0,
        uptime: scenario.uptime || 0,
        poolFee: scenario.poolFee || 0,
      };
      setActiveScenarioData({ params: newParams, scenario: scenario });
      if (typeof window !== 'undefined') {
        localStorage.setItem("qatar-active-scenario", JSON.stringify(scenario));
      }
      setSelectedScenarioId(scenarioId);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-hearst-green/5 to-transparent blur-2xl"></div>
      <Card className="relative border-2 border-hearst-green/30 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-secondary to-hearst-bg-tertiary shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center border-2 border-hearst-green/50">
            <Settings2 className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-white via-hearst-green/90 to-white bg-clip-text text-transparent">
              Paramètres Financiers
            </h2>
            <p className="text-base text-gray-300 mt-2">Configurez les paramètres de mining</p>
          </div>
        </div>
        
        {/* Sélecteur de Scénario Premium */}
        <div className="mb-8 p-4 bg-hearst-bg-tertiary rounded-xl border border-hearst-grey-100">
          <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-hearst-green" />
            Scénario
          </label>
          <div className="flex gap-3">
            <select
              value={selectedScenarioId}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-hearst-grey-100 bg-hearst-bg-secondary text-white rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green font-medium"
            >
              <option value="">Valeurs par défaut</option>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            {selectedScenarioId && (
              <div className="flex items-center gap-2 px-5 py-3 bg-hearst-green/20 border-2 border-hearst-green rounded-lg">
                <div className="w-2 h-2 bg-hearst-green rounded-full animate-pulse"></div>
                <div>
                  <div className="text-xs text-hearst-text-secondary">Actif</div>
                  <div className="text-sm font-bold text-hearst-green">
                    {scenarios.find((s) => s.id === selectedScenarioId)?.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Paramètres en Cards Premium - Lecture seule */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Prix Bitcoin */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Prix Bitcoin actuel sur le marché exprimé en USD.\n\nUtilisé pour calculer les revenus:\nRevenue = Volume BTC × Prix BTC" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <Bitcoin className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Prix Bitcoin
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">USD</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                ${parseFloat(safeToFixed(miningParams.btcPrice, 0)).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Difficulté Réseau */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Difficulté actuelle du réseau Bitcoin en Terahash.\n\nUtilisée pour calculer:\nnetwork_share_batch = theorical_batch_hashrate / (network_difficulty × 6000)\n\nPlus la difficulté est élevée, plus il est difficile de miner des BTC." />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <TrendingUp className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Difficulté Réseau
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">Terahash</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                {safeToFixed(miningParams.networkDifficulty, 1)} T
              </div>
            </div>
          </div>

          {/* Hashrate par MW */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Hashrate théorique par MW en Petahash.\n\nUtilisé pour calculer:\ntheorical_batch_hashrate = MW × Hashrate/MW\n\nReprésente la puissance de calcul théorique d'un MW d'infrastructure." />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <Zap className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Hashrate par MW
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">Petahash</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                {safeToFixed(miningParams.hashratePerMW, 1)} PH
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Uptime = Pourcentage de temps d'activité du mining (défaut: 90%)\n\nUtilisé pour calculer:\nBTC/Jour = Part × 450 × (Uptime/100) × (1 - PoolFee/100)\n\nRevenu électricité = MW × 1000 × 8760 × (Uptime/100) × 0.055 $/kWh" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <Activity className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Uptime
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">Pourcentage</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                {safeToFixed(miningParams.uptime, 1)}%
              </div>
            </div>
          </div>

          {/* Block Reward */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Block Reward = Récompense par bloc miné en BTC\n\nUtilisé pour calculer:\nTotal_btc_available_daily_minable = 144 blocs/jour × Block Reward\n\nActuellement ~3.125 BTC après le dernier halving." />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <Bitcoin className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Block Reward
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">BTC</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                {safeToFixed(miningParams.blockReward, 3)} BTC
              </div>
            </div>
          </div>

          {/* Pool Fee */}
          <div className="p-6 bg-gradient-to-br from-hearst-bg-tertiary to-hearst-bg-secondary rounded-xl border-2 border-hearst-green/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
              <InfoTooltip note="Pool Fee = Commission du pool de mining en %\n\nUtilisé pour calculer:\nBTC/Jour = Part × 450 × (Uptime/100) × (1 - PoolFee/100)\n\nLes frais de pool sont déduits du BTC miné." />
            </div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-hearst-green/30 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
                  <Percent className="w-7 h-7 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-hearst-green uppercase tracking-wide mb-1">
                    Pool Fee
                  </label>
                  <div className="text-xs text-hearst-text-secondary font-medium">Pourcentage</div>
                </div>
              </div>
              <div className="w-full px-5 py-4 bg-hearst-bg-secondary/80 border-2 border-hearst-green/40 text-white text-2xl font-bold rounded-lg">
                {safeToFixed(miningParams.poolFee, 1)}%
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}




