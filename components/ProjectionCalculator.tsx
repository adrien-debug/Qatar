"use client";

import { useState, useEffect, useRef } from "react";
import {
  calculateDealA,
  calculateDealB,
  DealAInputs,
  DealBInputs,
  MiningParams,
  defaultMiningParams,
  defaultPhases,
  calculateOPEXMonthly,
  calculateCAPEX,
  defaultHardwareCosts,
} from "@/lib/financial-calculations";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Scenario } from "@/components/ScenarioManager";
import { Bitcoin, TrendingUp, Zap, Activity, Percent, Settings2, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight, Coins, Calendar, BarChart3, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper function pour formater les nombres et éviter NaN
const safeNumber = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return value;
};

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  const num = safeNumber(value);
  return isNaN(num) ? "0" : num.toFixed(decimals);
};

// Formatter pour afficher les nombres en M$ ou K$
const formatCurrency = (value: number | undefined | null): string => {
  const num = safeNumber(value);
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

export default function ProjectionCalculator() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dealType, setDealType] = useState<"revenue" | "mw">("revenue");
  const [revenueShare, setRevenueShare] = useState(8);
  const [mwAllocated, setMwAllocated] = useState(12);
  const [selectedPhase, setSelectedPhase] = useState(3);
  
  // Valeurs min/max pour les sliders
  const revenueShareMin = 0;
  const revenueShareMax = 50;
  const mwAllocatedMin = 0;
  const mwAllocatedMax = 50;
  const revenueSliderRef = useRef<HTMLInputElement>(null);
  const mwSliderRef = useRef<HTMLInputElement>(null);
  
  // Marquer comme monté après le premier rendu côté client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Mettre à jour la partie remplie en vert pour les sliders (uniquement après montage)
  useEffect(() => {
    if (!mounted) return;
    const updateSliderProgress = (slider: HTMLInputElement | null, value: number, min: number, max: number) => {
      if (slider) {
        const percent = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--range-progress', `${percent}%`);
      }
    };
    
    updateSliderProgress(revenueSliderRef.current, revenueShare, revenueShareMin, revenueShareMax);
    updateSliderProgress(mwSliderRef.current, mwAllocated, mwAllocatedMin, mwAllocatedMax);
  }, [revenueShare, mwAllocated, mounted]);

  // Sauvegarder les paramètres dans localStorage pour le rapport (uniquement après montage)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    localStorage.setItem("qatar-deal-type", dealType);
    localStorage.setItem("qatar-revenue-share", revenueShare.toString());
    localStorage.setItem("qatar-mw-allocated", mwAllocated.toString());
    localStorage.setItem("qatar-selected-phase", selectedPhase.toString());
  }, [dealType, revenueShare, mwAllocated, selectedPhase, mounted]);
  
  // Charger le scénario actif depuis localStorage
  const loadActiveScenario = (): { params: MiningParams; scenario: Scenario | null } => {
    // Vérifier que nous sommes côté client
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

  // Paramètres miniers et scénario actif - Toujours initialiser avec les valeurs par défaut
  const [activeScenarioData, setActiveScenarioData] = useState<{ params: MiningParams; scenario: Scenario | null }>({
    params: defaultMiningParams,
    scenario: null,
  });
  const miningParams = activeScenarioData.params;
  const activeScenario = activeScenarioData.scenario;
  
  // Charger les scénarios disponibles
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  
  // Charger les données depuis localStorage uniquement après le montage côté client
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Charger les paramètres depuis localStorage
    const savedDealType = localStorage.getItem("qatar-deal-type");
    if (savedDealType && (savedDealType === "revenue" || savedDealType === "mw")) {
      setDealType(savedDealType);
    }
    const savedRevenueShare = localStorage.getItem("qatar-revenue-share");
    if (savedRevenueShare) {
      const parsed = parseFloat(savedRevenueShare);
      if (!isNaN(parsed)) setRevenueShare(parsed);
    }
    const savedMwAllocated = localStorage.getItem("qatar-mw-allocated");
    if (savedMwAllocated) {
      const parsed = parseFloat(savedMwAllocated);
      if (!isNaN(parsed)) setMwAllocated(parsed);
    }
    const savedPhase = localStorage.getItem("qatar-selected-phase");
    if (savedPhase) {
      const parsed = parseInt(savedPhase);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 3) setSelectedPhase(parsed);
    }
    
    const loadScenarios = () => {
      const saved = localStorage.getItem("qatar-scenarios");
      if (saved) {
        try {
          const loadedScenarios = JSON.parse(saved);
          setScenarios(loadedScenarios);
          
          // Vérifier si un scénario actif existe
          const activeScenario = localStorage.getItem("qatar-active-scenario");
          if (activeScenario) {
            const active = JSON.parse(activeScenario);
            const found = loadedScenarios.find((s: Scenario) => s.id === active.id);
            if (found) {
              setSelectedScenarioId(found.id);
              setActiveScenarioData(loadActiveScenario());
            }
          }
        } catch (e) {
          console.error("Error loading scenarios:", e);
        }
      }
    };
    
    loadScenarios();
    
    // Écouter les changements de scénarios (uniquement côté client)
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

  const phase = defaultPhases[selectedPhase - 1];
  
  // Utiliser les paramètres du scénario actif ou les valeurs par défaut
  const energyRate = activeScenario?.energyRate ?? 2.5;
  const maintenancePercent = activeScenario?.maintenancePercent ?? 2;
  const fixedCostsBase = activeScenario?.fixedCostsBase ?? 75000;
  const fixedCostsPerMW = activeScenario?.fixedCostsPerMW ?? 1000;
  const mwCapexCost = activeScenario?.mwCapexCost ?? 0; // Coût MW (peut être 0)
  const hearstResellPricePerKwh = activeScenario?.hearstResellPricePerKwh ?? 0.055;
  const mwAllocatedToHearst = activeScenario?.mwAllocatedToHearst ?? (dealType === "mw" ? (phase.mw * mwAllocated / 100) : 0);
  
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, selectedPhase) + (mwCapexCost * phase.mw);
  const opexMonthly = calculateOPEXMonthly(phase.mw, energyRate, capex, maintenancePercent, fixedCostsBase, fixedCostsPerMW);

  // Calculs selon le type de deal
  let dealAResult = null;
  let dealBResult = null;

  if (dealType === "revenue") {
    const dealAInputs: DealAInputs = {
      phase: selectedPhase,
      mw: phase.mw,
      revenueSharePercent: revenueShare,
      miningParams,
      opexMonthly,
      mwCapexCost,
      hearstResellPricePerKwh,
      mwAllocatedToHearst,
    };
    dealAResult = calculateDealA(dealAInputs);
  } else {
    const opexPerMW = phase.mw > 0 ? opexMonthly / phase.mw : 0;
    const dealBInputs: DealBInputs = {
      phase: selectedPhase,
      totalMW: phase.mw,
      mwSharePercent: mwAllocated,
      miningParams,
      opexPerMW,
      energyRate: energyRate, // Passe le taux d'énergie du scénario
    };
    dealBResult = calculateDealB(dealBInputs);
  }

  // Projections sur 5 ans
  const projectionYears = [1, 2, 3, 4, 5];
  let projectionData: any[] = [];
  
  try {
    projectionData = projectionYears.map((year) => {
      // Garde-fous pour éviter NaN
      const baseBTCPrice = miningParams?.btcPrice || 0;
      const baseDifficulty = miningParams?.networkDifficulty || 0;
      const yearBTCPrice = baseBTCPrice * (1 + 0.1 * (year - 1)); // +10% par an
      const yearDifficulty = baseDifficulty * (1 + 0.08 * (year - 1)); // +8% par an
    
      const yearMiningParams = {
        ...miningParams,
        btcPrice: yearBTCPrice,
        networkDifficulty: yearDifficulty,
      };

      if (dealType === "revenue") {
        const inputs: DealAInputs = {
          phase: selectedPhase,
          mw: phase.mw,
          revenueSharePercent: revenueShare,
          miningParams: yearMiningParams,
          opexMonthly,
        };
        const result = calculateDealA(inputs);
        return {
          year: `Année ${year}`,
          hearst: safeNumber(result.hearstAnnual) / 1000000,
          qatar: safeNumber(result.qatarNetProfit) / 1000000,
          total: (safeNumber(result.hearstAnnual) + safeNumber(result.qatarNetProfit)) / 1000000,
          btcPrice: safeNumber(yearBTCPrice) / 1000,
        };
      } else {
        const opexPerMW = phase.mw > 0 ? opexMonthly / phase.mw : 0;
        const inputs: DealBInputs = {
          phase: selectedPhase,
          totalMW: phase.mw,
          mwSharePercent: mwAllocated,
          miningParams: yearMiningParams,
          opexPerMW,
          energyRate: energyRate, // Passe le taux d'énergie du scénario
        };
        const result = calculateDealB(inputs);
        return {
          year: `Année ${year}`,
          hearst: safeNumber(result.hearstAnnualProfit) / 1000000,
          qatar: safeNumber(result.qatarAnnualProfit) / 1000000,
          total: (safeNumber(result.hearstAnnualProfit) + safeNumber(result.qatarAnnualProfit)) / 1000000,
          btcPrice: safeNumber(yearBTCPrice) / 1000,
        };
      }
    });
  } catch (e) {
    console.error("Error calculating projections:", e);
    projectionData = [];
  }

  // Utiliser directement le nom du scénario actif depuis activeScenario
  const activeScenarioName = activeScenario?.name || null;

  return (
    <div className="space-y-8">
      {/* Header Ultra Premium */}
      <div className="relative">
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-8 md:p-10 border-2 border-hearst-green/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center border-2 border-hearst-green/50">
                  <BarChart3 className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-hearst-green/90 to-white bg-clip-text text-transparent">
                    Projection Financière
                  </h1>
                  <p className="text-lg text-gray-300">Configurez votre deal et visualisez les projections sur 5 ans</p>
                </div>
              </div>
            </div>
            {activeScenarioName && (
              <div 
                onClick={() => handleScenarioChange("")}
                className="bg-gradient-to-br from-hearst-green/20 to-hearst-green/10 border-2 border-hearst-green/50 rounded-xl px-6 py-4 cursor-pointer"
                title="Cliquer pour désactiver le scénario"
              >
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-hearst-green rounded-full animate-pulse"></div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Scénario actif</div>
                  </div>
                  <div className="text-lg font-bold text-hearst-green">{activeScenarioName}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration du Deal - Ultra Premium */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-hearst-green/5 to-transparent blur-2xl"></div>
        <Card className="relative border-2 border-hearst-green/30 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-secondary to-hearst-bg-tertiary shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-xl flex items-center justify-center border-2 border-hearst-green/50">
              <Settings2 className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Configuration du Deal</h2>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Jauge Share Revenu - Ultra Premium */}
          <div 
            onClick={() => setDealType("revenue")}
              className={`
                relative cursor-pointer rounded-2xl p-8 border-2 overflow-hidden
              ${dealType === "revenue" 
                  ? "border-hearst-green bg-gradient-to-br from-hearst-green/20 via-hearst-bg-secondary to-hearst-bg-secondary" 
                  : "border-hearst-grey-100 bg-hearst-bg-secondary"
                }
              `}
            >
              <div className="relative z-10 text-center">
                <div className="text-sm font-semibold text-hearst-text-secondary mb-6 uppercase tracking-wider">
                Share Revenu
              </div>
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-40 h-40 relative z-10">
                  <circle
                      cx="80"
                      cy="80"
                      r="70"
                    stroke="currentColor"
                      strokeWidth="10"
                    fill="none"
                      className="text-hearst-grey-100/30"
                  />
                  <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#revenueGradient)"
                      strokeWidth="10"
                    fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - (revenueShare - revenueShareMin) / (revenueShareMax - revenueShareMin))}`}
                    strokeLinecap="round"
                      className="transition-all duration-500 drop-shadow-lg"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(138, 253, 129, 0.5))' }}
                    />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8afd81" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6fdc66" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                </svg>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white">{revenueShare}</div>
                      <div className="text-sm text-hearst-text-secondary font-semibold">%</div>
                  </div>
                </div>
              </div>
                <div className={`text-xs font-semibold ${dealType === "revenue" ? "text-hearst-green" : "text-hearst-text-secondary"}`}>
                {dealType === "revenue" ? "✓ Actif" : "Cliquez pour activer"}
              </div>
            </div>
          </div>

            {/* Jauge MW Allocated - Ultra Premium */}
          <div 
            onClick={() => setDealType("mw")}
              className={`
                relative cursor-pointer rounded-2xl p-8 border-2 overflow-hidden
              ${dealType === "mw" 
                  ? "border-hearst-green bg-gradient-to-br from-hearst-green/20 via-hearst-bg-secondary to-hearst-bg-secondary" 
                  : "border-hearst-grey-100 bg-hearst-bg-secondary"
                }
              `}
            >
              <div className="relative z-10 text-center">
                <div className="text-sm font-semibold text-hearst-text-secondary mb-6 uppercase tracking-wider">
                MW Allocated
              </div>
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-40 h-40 relative z-10">
                  <circle
                      cx="80"
                      cy="80"
                      r="70"
                    stroke="currentColor"
                      strokeWidth="10"
                    fill="none"
                      className="text-hearst-grey-100/30"
                  />
                  <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#mwGradient)"
                      strokeWidth="10"
                    fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - (mwAllocated - mwAllocatedMin) / (mwAllocatedMax - mwAllocatedMin))}`}
                    strokeLinecap="round"
                      className="transition-all duration-500 drop-shadow-lg"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(138, 253, 129, 0.5))' }}
                    />
                    <defs>
                      <linearGradient id="mwGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8afd81" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6fdc66" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                </svg>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white">{mwAllocated}</div>
                      <div className="text-sm text-hearst-text-secondary font-semibold">%</div>
                  </div>
                </div>
              </div>
                <div className={`text-xs font-semibold transition-all ${dealType === "mw" ? "text-hearst-green" : "text-hearst-text-secondary"}`}>
                {dealType === "mw" ? "✓ Actif" : "Cliquez pour activer"}
              </div>
            </div>
          </div>
        </div>

        {/* Phase de Déploiement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-hearst-text-secondary mb-3">
            Phase de Déploiement
          </label>
          <div className="grid grid-cols-3 gap-3">
            {defaultPhases.map((phase, index) => (
              <button
                key={index}
                onClick={() => setSelectedPhase(index + 1)}
                className={`
                  px-4 py-3 rounded-lg font-medium text-sm
                    ${
                      selectedPhase === index + 1
                        ? "bg-hearst-green text-black font-bold border-2 border-hearst-green"
                        : "bg-hearst-bg-secondary text-hearst-text-secondary border-2 border-hearst-grey-100"
                    }
                `}
              >
                <div className="font-bold text-base mb-1">{phase.mw}MW</div>
                <div className="text-xs opacity-90">{phase.timeline}</div>
                <div className="text-xs opacity-75 mt-1">({phase.status})</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dealType === "revenue" ? (
            <div>
              <label className="block text-sm font-medium text-hearst-text-secondary mb-2">
                Type Share Revenu - Editable (%)
              </label>
              <div className="flex items-center gap-4">
                <div className="slider-wrapper flex-1" style={{
                  '--slider-progress': `${((revenueShare - revenueShareMin) / (revenueShareMax - revenueShareMin)) * 100}%`
                } as React.CSSProperties}>
                  <input
                    ref={revenueSliderRef}
                    type="range"
                    min={revenueShareMin}
                    max={revenueShareMax}
                    step="1"
                    value={revenueShare}
                    onChange={(e) => setRevenueShare(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={revenueShareMin}
                    max={revenueShareMax}
                    value={revenueShare}
                    onChange={(e) => setRevenueShare(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border-2 border-hearst-grey-100 bg-hearst-bg-secondary rounded-lg text-center font-bold text-hearst-text focus:border-hearst-green"
                  />
                  <span className="text-lg font-bold text-hearst-green">%</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-hearst-text-secondary mb-2">
                Type MW Allocated - Editable (%)
              </label>
              <div className="flex items-center gap-4">
                <div className="slider-wrapper flex-1" style={{
                  '--slider-progress': `${((mwAllocated - mwAllocatedMin) / (mwAllocatedMax - mwAllocatedMin)) * 100}%`
                } as React.CSSProperties}>
                  <input
                    ref={mwSliderRef}
                    type="range"
                    min={mwAllocatedMin}
                    max={mwAllocatedMax}
                    step="1"
                    value={mwAllocated}
                    onChange={(e) => setMwAllocated(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={mwAllocatedMin}
                    max={mwAllocatedMax}
                    value={mwAllocated}
                    onChange={(e) => setMwAllocated(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border-2 border-hearst-grey-100 bg-hearst-bg-secondary rounded-lg text-center font-bold text-hearst-text focus:border-hearst-green"
                  />
                  <span className="text-lg font-bold text-hearst-green">%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>

      {/* Paramètres Financiers - Ultra Premium */}
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

      {/* Résultats Actuels - Premium avec tous les détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte HEARST Premium */}
        <Card className="border-2 border-hearst-green bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white">HEARST</h3>
              <div className="w-12 h-12 bg-hearst-green/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
              </div>
            </div>
          {dealType === "revenue" && dealAResult ? (
              <div className="space-y-4">
                {/* Total Investment */}
                <div className="relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border-2 border-hearst-green/30">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-hearst-green/20 rounded-xl flex items-center justify-center border border-hearst-green/40 group-hover/item:bg-hearst-green/30 transition-all">
                        <DollarSign className="w-5 h-5 text-hearst-green" />
                </div>
                      <div className="text-base font-bold text-hearst-green uppercase tracking-wider">Total Investment</div>
              </div>
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstTotalInvestment)}
                    </div>
                  </div>
                </div>
                {/* Total Investment */}
                <div className="relative p-6 bg-gradient-to-br from-hearst-bg-tertiary/90 to-hearst-bg-secondary/90 rounded-2xl border-2 border-hearst-green/30">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-hearst-green/20 rounded-xl flex items-center justify-center border border-hearst-green/40">
                        <DollarSign className="w-5 h-5 text-hearst-green" />
                      </div>
                      <div className="text-base font-bold text-hearst-green uppercase tracking-wider">Total Investment</div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstTotalInvestment)}
                    </div>
                  </div>
                </div>
                
                {/* Volume BTC Mensuel */}
                <div className="relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                        <Coins className="w-4 h-4 text-hearst-green" />
                      </div>
                      <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">Volume BTC Mensuel</div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {safeToFixed(dealAResult.hearstMonthlyBTC, 4)} BTC
                    </div>
                  </div>
                </div>
                
                {/* Revenue BTC Mensuel */}
                <div className="group/item relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30 backdrop-blur-md hover:border-hearst-green/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-hearst-green/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                        <Calendar className="w-4 h-4 text-hearst-green" />
                      </div>
                      <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">Revenue BTC Mensuel</div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstBtcRevenueMonthly)}
                    </div>
                  </div>
                </div>

                {/* Revenue Électricité Mensuel */}
                {dealAResult.hearstPowerRevenueMonthly > 0 && (
                  <div className="group/item relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30 backdrop-blur-md hover:border-hearst-green/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-hearst-green/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                          <Zap className="w-4 h-4 text-hearst-green" />
                        </div>
                        <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">Revenue Électricité Mensuel</div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {formatCurrency(dealAResult.hearstPowerRevenueMonthly)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Revenue Total Mensuel */}
                <div className="group/item relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30 backdrop-blur-md hover:border-hearst-green/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-hearst-green/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                        <DollarSign className="w-4 h-4 text-hearst-green" />
                      </div>
                      <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">Revenue Total Mensuel</div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstTotalRevenueMonthly)}
                    </div>
                  </div>
                </div>

                {/* Revenue Total Annuel */}
                <div className="relative p-6 bg-gradient-to-br from-hearst-bg-tertiary/90 to-hearst-bg-secondary/90 rounded-2xl border-2 border-hearst-green/40">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-hearst-green/30 rounded-xl flex items-center justify-center border border-hearst-green/50">
                        <DollarSign className="w-5 h-5 text-hearst-green" />
                      </div>
                      <div className="text-base font-bold text-hearst-green uppercase tracking-wider">Revenue Total Annuel</div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstTotalRevenueYearly)}
                    </div>
                  </div>
                </div>

                {/* OPEX Annuel */}
                <div className="group/item relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30 backdrop-blur-md hover:border-hearst-green/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                        <Activity className="w-4 h-4 text-hearst-green" />
                      </div>
                      <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">OPEX Annuel</div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {formatCurrency(dealAResult.hearstOpexYearly)}
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="relative p-6 bg-gradient-to-br from-hearst-bg-tertiary/90 to-hearst-bg-secondary/90 rounded-2xl border-2 border-hearst-green/40">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${dealAResult.hearstNetProfit >= 0 ? 'bg-hearst-green/30 border-hearst-green/50' : 'bg-red-500/30 border-red-500/50'}`}>
                        {dealAResult.hearstNetProfit >= 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-hearst-green" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="text-base font-bold text-hearst-green uppercase tracking-wider">Net Profit</div>
                    </div>
                    <div className={`text-4xl md:text-5xl font-bold ${dealAResult.hearstNetProfit >= 0 ? 'text-white' : 'text-red-400'} drop-shadow-lg`}>
                      {formatCurrency(dealAResult.hearstNetProfit)}
                    </div>
                  </div>
                </div>

                {/* ROI */}
                <div className="relative p-6 bg-gradient-to-br from-hearst-green/20 via-hearst-bg-tertiary/90 to-hearst-bg-secondary/90 rounded-2xl border-2 border-hearst-green/60">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-hearst-green/40 rounded-xl flex items-center justify-center border-2 border-hearst-green/60">
                        <TrendingUp className="w-5 h-5 text-hearst-green" />
                      </div>
                      <div className="text-base font-bold text-hearst-green uppercase tracking-wider">ROI</div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {safeToFixed(dealAResult.hearstRoi, 1)}%
                    </div>
                  </div>
                </div>

                {/* Time to Breakeven */}
                <div className="group/item relative p-5 bg-gradient-to-br from-hearst-bg-tertiary/80 to-hearst-bg-secondary/80 rounded-2xl border border-hearst-green/30 backdrop-blur-md hover:border-hearst-green/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/40">
                        <Calendar className="w-4 h-4 text-hearst-green" />
                      </div>
                      <div className="text-sm font-bold text-hearst-green uppercase tracking-wide">Time to Breakeven</div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {dealAResult.hearstBreakevenMonths !== Infinity ? `${safeToFixed(dealAResult.hearstBreakevenMonths, 1)} mois` : "∞"}
                    </div>
                </div>
              </div>
            </div>
          ) : dealBResult ? (
              <div className="space-y-4">
                {/* Total Investment */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Total Investment</div>
                </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    $0.00M
              </div>
                </div>
                {/* MW Allocated */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">MW Allocated</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {safeToFixed(dealBResult.hearstMW, 1)} MW
                  </div>
                </div>

                {/* Volume BTC Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Volume BTC Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {safeToFixed(dealBResult.hearstMonthlyBTC, 4)} BTC
                  </div>
                </div>

                {/* Revenue Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Revenue Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${safeToFixed(dealBResult.hearstMonthlyRevenue / 1000, 2)}K
                  </div>
                </div>

                {/* Coût Électricité Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Coût Électricité Annuel</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${safeToFixed(dealBResult.hearstElectricityCost / 1000000, 2)}M
                  </div>
                </div>

                {/* Profit Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Profit Annuel</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    ${safeToFixed(dealBResult.hearstAnnualProfit / 1000000, 2)}M
                  </div>
                </div>

                {/* ROI */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">ROI</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {capex > 0 ? safeToFixed((dealBResult.hearstAnnualProfit / capex) * 100, 1) : "0"}%
                  </div>
                </div>

                {/* Time to Breakeven */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-hearst-green/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-hearst-green" />
                    <div className="text-lg font-semibold text-hearst-green uppercase tracking-wide">Time to Breakeven</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {dealBResult.hearstMonthlyRevenue > 0 ? safeToFixed(capex / dealBResult.hearstMonthlyRevenue, 1) : "∞"} mois
                  </div>
              </div>
            </div>
          ) : null}
          </div>
        </Card>

        {/* Carte Qatar Premium */}
        <Card className="border-2 border-qatar-red bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Qatar</h3>
              <div className="w-12 h-12 bg-qatar-red/20 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-qatar-red" strokeWidth={2.5} />
              </div>
            </div>
          {dealType === "revenue" && dealAResult ? (
              <div className="space-y-4">
                {/* Total Investment */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Total Investment</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {formatCurrency(dealAResult.qatarTotalInvestment)}
                  </div>
                </div>
                {/* Volume BTC Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Volume BTC Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {safeToFixed(dealAResult.qatarMonthlyBTC, 4)} BTC
                  </div>
                </div>

                {/* Revenue BTC Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Revenue BTC Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(dealAResult.qatarBtcRevenueMonthly)}
                  </div>
                </div>

                {/* Revenue BTC Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Revenue BTC Annuel</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {formatCurrency(dealAResult.qatarBtcRevenueYearly)}
                  </div>
                </div>

                {/* OPEX Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">OPEX Annuel</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(dealAResult.qatarOpexYearly)}
                  </div>
                </div>

                {/* Net Profit */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {dealAResult.qatarNetProfit >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-qatar-red" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-qatar-red" />
                    )}
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Net Profit</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {formatCurrency(dealAResult.qatarNetProfit)}
                  </div>
                </div>

                {/* ROI */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border-2 border-qatar-red/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">ROI</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {safeToFixed(dealAResult.qatarRoi, 1)}%
                  </div>
                </div>

                {/* Time to Breakeven */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Time to Breakeven</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {dealAResult.qatarBreakevenMonths !== Infinity ? safeToFixed(dealAResult.qatarBreakevenMonths, 1) : "∞"} mois
                  </div>
                </div>
              </div>
            ) : dealBResult ? (
              <div className="space-y-4">
                {/* Total Investment */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Total Investment</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    ${safeToFixed(capex / 1000000, 2)}M
                  </div>
                </div>
                {/* MW Retained */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">MW Retained</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {safeToFixed(dealBResult.qatarMW, 1)} MW
                  </div>
                </div>

                {/* Volume BTC Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Volume BTC Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {safeToFixed(dealBResult.qatarMonthlyBTC, 4)} BTC
                  </div>
                </div>

                {/* Revenue Mensuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Revenue Mensuel</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${safeToFixed(dealBResult.qatarMonthlyRevenue / 1000, 2)}K
                  </div>
                </div>

                {/* Coût Électricité Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Coût Électricité Annuel</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${safeToFixed(dealBResult.qatarElectricityCost / 1000000, 2)}M
                  </div>
                </div>

                {/* Profit Annuel */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Profit Annuel</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    ${safeToFixed(dealBResult.qatarAnnualProfit / 1000000, 2)}M
                  </div>
                </div>

                {/* ROI */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">ROI</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {capex > 0 ? safeToFixed((dealBResult.qatarAnnualProfit / capex) * 100, 1) : "0"}%
                  </div>
                </div>

                {/* Time to Breakeven */}
                <div className="p-4 bg-hearst-grey-200 rounded-xl border border-qatar-red/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-qatar-red" />
                    <div className="text-lg font-semibold text-qatar-red uppercase tracking-wide">Time to Breakeven</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {dealBResult.qatarMonthlyRevenue > 0 ? safeToFixed(capex / dealBResult.qatarMonthlyRevenue, 1) : "∞"} mois
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Tableau de projection - Premium */}
      <Card className="overflow-x-auto border-2 border-hearst-green/20 bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">
          Détails des Projections
        </h2>
        <div className="rounded-xl overflow-hidden border border-hearst-grey-100/30">
          <table className="w-full">
            <thead>
              <tr className="bg-hearst-bg-tertiary border-b-2 border-hearst-grey-100">
                <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Année</th>
                <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Prix BTC (k$)</th>
                <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-green">HEARST (M$)</th>
                <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-qatar-red">Qatar (M$)</th>
                <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Total (M$)</th>
              </tr>
            </thead>
            <tbody>
              {projectionData && projectionData.length > 0 ? (
                projectionData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-hearst-grey-100/30"
                  >
                    <td className="py-5 px-6 font-semibold text-white">{row.year}</td>
                    <td className="py-5 px-6 text-center font-medium text-white">${safeToFixed(row.btcPrice, 0)}k</td>
                    <td className="py-5 px-6 text-center text-hearst-green font-bold text-lg">
                      ${safeToFixed(row.hearst, 2)}M
                    </td>
                    <td className="py-5 px-6 text-center text-qatar-red font-bold text-lg">${safeToFixed(row.qatar, 2)}M</td>
                    <td className="py-5 px-6 text-center text-hearst-text-secondary font-semibold">
                      ${safeToFixed(row.total, 2)}M
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-hearst-text-secondary">
                    Aucune donnée de projection disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Investment - Décomposition */}
        <div className="mt-8 pt-8 border-t-2 border-hearst-green/30">
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-hearst-green" />
            Total Investment - Décomposition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Infrastructure */}
            <div className="p-5 bg-hearst-bg-tertiary/50 rounded-xl border-2 border-hearst-green/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
                </div>
              <div>
                  <div className="text-xs font-semibold text-hearst-green uppercase tracking-wide">Infrastructure</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                ${safeToFixed((defaultHardwareCosts.infrastructurePerMW + defaultHardwareCosts.coolingPerMW + defaultHardwareCosts.networkingPerMW) * phase.mw / 1000000, 2)}M
              </div>
            </div>

            {/* Hardware */}
            <div className="p-5 bg-hearst-bg-tertiary/50 rounded-xl border-2 border-hearst-green/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <div>
                  <div className="text-xs font-semibold text-hearst-green uppercase tracking-wide">Hardware</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                ${safeToFixed(defaultHardwareCosts.asicPerMW * phase.mw / 1000000, 2)}M
            </div>
            </div>

            {/* OPEX Deployment */}
            <div className="p-5 bg-hearst-bg-tertiary/50 rounded-xl border-2 border-hearst-green/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
                </div>
              <div>
                  <div className="text-xs font-semibold text-hearst-green uppercase tracking-wide">OPEX Deployment</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                ${safeToFixed(opexMonthly * 3 / 1000000, 2)}M
              </div>
              <div className="text-xs text-hearst-text-secondary mt-1">(3 mois initiaux)</div>
            </div>

            {/* Total */}
            <div className="p-5 bg-hearst-green/20 rounded-xl border-2 border-hearst-green">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-hearst-green/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <div>
                  <div className="text-xs font-semibold text-hearst-green uppercase tracking-wide">Total Investment</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                ${safeToFixed(capex / 1000000, 2)}M
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Projections sur 5 ans - Premium */}
      <Card className="border-2 border-hearst-green/20 bg-hearst-bg-secondary">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">
          Projections sur 5 Ans
        </h2>
        <div className="bg-gray-800/50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="year" stroke="#E2E8F0" />
              <YAxis label={{ value: "Revenue/Profit (M$)", angle: -90, position: "insideLeft" }} stroke="#E2E8F0" />
              <Tooltip 
                formatter={(value: number) => `$${safeToFixed(value, 2)}M`}
                contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', borderRadius: '8px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Legend wrapperStyle={{ color: '#E2E8F0' }} />
            <Line
              type="monotone"
              dataKey="hearst"
              stroke="#A3FF8B"
              strokeWidth={3}
              name="HEARST"
            />
            <Line
              type="monotone"
              dataKey="qatar"
                stroke="#E6396F"
              strokeWidth={3}
              name="Qatar"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#A3FF8B"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </Card>

      {/* Bouton Premium pour Générer le Rapport */}
      <Card className="border-2 border-hearst-green/20 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-hearst-green/20 rounded-2xl flex items-center justify-center border-2 border-hearst-green/30">
                <FileText className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Rapport Financier
                </h3>
                <p className="text-hearst-text-secondary">
                  Générez un rapport PDF premium avec toutes les données financières
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/report")}
              className="px-8 py-4 bg-hearst-green text-black rounded-xl font-bold text-lg flex items-center gap-3"
            >
              <Download className="w-6 h-6" />
              Générer le Rapport
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

