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
import { Bitcoin, TrendingUp, Zap, Activity, Percent, Settings2, DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight, Coins, Calendar, BarChart3, FileText, Download, ChevronDown, ChevronUp, X } from "lucide-react";
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
  const revenueShareMax = 30;
  const mwAllocatedMin = 0;
  const mwAllocatedMax = 30;
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
  const [qatarTableOpen, setQatarTableOpen] = useState(false);
  const [hearstTableOpen, setHearstTableOpen] = useState(false);
  const [detailsProjectionsOpen, setDetailsProjectionsOpen] = useState(false);
  const [projections5AnsOpen, setProjections5AnsOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [resultsReady, setResultsReady] = useState(false);
  const [showGlobalProjection, setShowGlobalProjection] = useState(false);
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  
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

  // Fonction pour lancer les calculs avec barre de progression fluide
  const handleCalculate = async () => {
    setIsCalculating(true);
    setCalculationProgress(0);
    setResultsReady(false);

    // Progression fluide et continue sur 1.5 secondes
    const totalDuration = 1500; // 1.5 secondes
    const updateInterval = 16; // ~60fps pour une animation fluide
    const totalSteps = totalDuration / updateInterval;
    const progressIncrement = 100 / totalSteps;

    // Animation fluide de 0 à 100%
    const startTime = Date.now();
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setCalculationProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(animateProgress);
      }
    };

    // Démarrer l'animation
    requestAnimationFrame(animateProgress);

    // Attendre la fin de l'animation
    await new Promise(resolve => setTimeout(resolve, totalDuration));
    
    setIsCalculating(false);
    setResultsReady(true);
    setShowGlobalProjection(false);
    
    // Fermer tous les menus déroulants quand les résultats sont affichés
    setQatarTableOpen(false);
    setHearstTableOpen(false);
    setDetailsProjectionsOpen(false);
    setProjections5AnsOpen(false);

    // Notification sonore et visuelle quand le calcul est terminé
    if (typeof window !== 'undefined') {
      // Notification du navigateur
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Calcul terminé', {
          body: 'Les projections sont prêtes !',
          icon: '/icon.svg'
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Calcul terminé', {
              body: 'Les projections sont prêtes !',
              icon: '/icon.svg'
            });
          }
        });
      }
    }

    // Scroll automatique vers le haut de la page pour voir les résultats Qatar/Hearst
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  // S'assurer que selectedPhase est valide (entre 1 et la longueur de defaultPhases)
  const validPhaseIndex = Math.max(1, Math.min(selectedPhase, defaultPhases.length));
  const phase = defaultPhases[validPhaseIndex - 1];
  
  // Utiliser les paramètres du scénario actif ou les valeurs par défaut
  const energyRate = activeScenario?.energyRate ?? 2.5;
  const maintenancePercent = activeScenario?.maintenancePercent ?? 2;
  const fixedCostsBase = activeScenario?.fixedCostsBase ?? 75000;
  const fixedCostsPerMW = activeScenario?.fixedCostsPerMW ?? 1000;
  const mwCapexCost = activeScenario?.mwCapexCost ?? 0; // Coût MW (peut être 0)
  const hearstResellPricePerKwh = activeScenario?.hearstResellPricePerKwh ?? 0.055;
  const mwAllocatedToHearst = activeScenario?.mwAllocatedToHearst ?? (dealType === "mw" ? (phase.mw * mwAllocated / 100) : 0);
  
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, validPhaseIndex) + (mwCapexCost * phase.mw);
  const opexMonthly = calculateOPEXMonthly(phase.mw, energyRate, capex, maintenancePercent, fixedCostsBase, fixedCostsPerMW);

  // Calculs selon le type de deal
  let dealAResult = null;
  let dealBResult = null;

  if (dealType === "revenue") {
    const dealAInputs: DealAInputs = {
      phase: validPhaseIndex,
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
      phase: validPhaseIndex,
      totalMW: phase.mw,
      mwSharePercent: mwAllocated,
      miningParams,
      opexPerMW,
      energyRate: energyRate, // Passe le taux d'énergie du scénario
    };
    dealBResult = calculateDealB(dealBInputs);
  }

  // Projections sur 10 ans
  const projectionYears = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
          phase: validPhaseIndex,
          mw: phase.mw,
          revenueSharePercent: revenueShare,
          miningParams: yearMiningParams,
          opexMonthly,
          mwCapexCost,
          hearstResellPricePerKwh,
          mwAllocatedToHearst,
        };
        const result = calculateDealA(inputs);
        return {
          year: year,
          hearst: safeNumber(result.hearstTotalRevenueYearly) / 1000000,
          qatar: safeNumber(result.qatarNetProfit) / 1000000,
          total: (safeNumber(result.hearstTotalRevenueYearly) + safeNumber(result.qatarNetProfit)) / 1000000,
          btcPrice: safeNumber(yearBTCPrice) / 1000,
          difficulty: safeNumber(yearDifficulty),
          hearstMonthlyBTC: safeNumber(result.hearstMonthlyBTC),
          qatarMonthlyBTC: safeNumber(result.qatarMonthlyBTC),
          hearstRevenueMonthly: safeNumber(result.hearstTotalRevenueMonthly) / 1000000,
          qatarRevenueMonthly: safeNumber(result.qatarBtcRevenueMonthly) / 1000000,
          hearstOpexYearly: safeNumber(result.hearstOpexYearly) / 1000000,
          qatarOpexYearly: safeNumber(result.qatarOpexYearly) / 1000000,
        };
      } else {
        const opexPerMW = phase.mw > 0 ? opexMonthly / phase.mw : 0;
        const inputs: DealBInputs = {
          phase: validPhaseIndex,
          totalMW: phase.mw,
          mwSharePercent: mwAllocated,
          miningParams: yearMiningParams,
          opexPerMW,
          energyRate: energyRate, // Passe le taux d'énergie du scénario
        };
        const result = calculateDealB(inputs);
        const hearstOpexYearly = 0; // HEARST n'a pas d'OPEX dans DealB
        const qatarOpexYearly = (opexPerMW * result.qatarMW * 12) / 1000000;
        return {
          year: year,
          hearst: safeNumber(result.hearstAnnualProfit) / 1000000,
          qatar: safeNumber(result.qatarAnnualProfit) / 1000000,
          total: (safeNumber(result.hearstAnnualProfit) + safeNumber(result.qatarAnnualProfit)) / 1000000,
          btcPrice: safeNumber(yearBTCPrice) / 1000,
          difficulty: safeNumber(yearDifficulty),
          hearstMonthlyBTC: safeNumber(result.hearstMonthlyBTC),
          qatarMonthlyBTC: safeNumber(result.qatarMonthlyBTC),
          hearstRevenueMonthly: safeNumber(result.hearstMonthlyRevenue) / 1000000,
          qatarRevenueMonthly: safeNumber(result.qatarMonthlyRevenue) / 1000000,
          hearstOpexYearly: hearstOpexYearly,
          qatarOpexYearly: qatarOpexYearly,
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
    <div className="space-y-12">
      {/* Header Ultra Premium - Caché quand les résultats sont prêts */}
      {!resultsReady && (
        <div className="relative">
          <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-8 md:p-10">
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
      )}

      {/* Configuration du Deal - Ultra Premium - Caché quand les résultats sont prêts */}
      {!resultsReady && (
      <div className="relative">
        <Card className="relative bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-secondary to-hearst-bg-tertiary shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center mb-0 mt-6">
            <div className="flex items-center justify-center gap-4 w-full mb-2">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                Configuration du Deal
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-white to-transparent"></div>
            </div>
          </div>
        
          {/* Grille harmonisée : Jauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 mt-10">
            {/* Jauge Share Revenu - Ultra Premium */}
            <div 
              onClick={() => setDealType("revenue")}
              className={`
                relative cursor-pointer rounded-2xl p-6 overflow-hidden flex flex-col items-center justify-center h-full min-h-[260px] transition-all duration-300 bg-hearst-bg-secondary
              `}
            >
              {/* Premium Sidebar Right - Visible when selected */}
              <div className={`
                absolute -right-1 top-0 bottom-0 w-1.5 transition-all duration-500 ease-in-out z-0
                ${dealType === "revenue" 
                  ? "bg-gradient-to-b from-transparent via-white to-transparent opacity-60 shadow-[0_0_15px_rgba(255,255,255,0.4)] blur-[1px]" 
                  : "opacity-0"
                }
              `}></div>
              
              <div className="relative z-10 text-center w-full flex flex-col items-center justify-center">
                <div className="text-base font-semibold text-hearst-text-secondary mb-6 uppercase tracking-wider">
                  Share Revenu
                </div>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-48 h-48 relative z-10" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#8A1538"
                      strokeWidth="6"
                      fill="none"
                      className="opacity-100"
                      style={{ filter: 'drop-shadow(0 0 2px rgba(138, 21, 56, 0.2))' }}
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#7CFF5A"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - (revenueShare - revenueShareMin) / (revenueShareMax - revenueShareMin))}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                      style={{ filter: 'drop-shadow(0 0 2px rgba(124, 255, 90, 0.2))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white">{revenueShare}</div>
                      <div className="text-base text-hearst-text-secondary font-semibold">%</div>
                    </div>
                  </div>
                </div>
                <div className={`text-base font-semibold ${dealType === "revenue" ? "text-white" : "text-hearst-text-secondary"}`}>
                  {dealType === "revenue" ? "✓ Actif" : "Cliquez pour activer"}
                </div>
              </div>
            </div>

            {/* Jauge MW Allocated - Ultra Premium */}
            <div 
              onClick={() => setDealType("mw")}
              className={`
                relative cursor-pointer rounded-2xl p-6 overflow-hidden flex flex-col items-center justify-center h-full min-h-[260px] transition-all duration-300 bg-hearst-bg-secondary
              `}
            >
              {/* Premium Sidebar Left - Visible when selected */}
              <div className={`
                absolute -left-1 top-0 bottom-0 w-1.5 transition-all duration-500 ease-in-out z-0
                ${dealType === "mw" 
                  ? "bg-gradient-to-b from-transparent via-white to-transparent opacity-60 shadow-[0_0_15px_rgba(255,255,255,0.4)] blur-[1px]" 
                  : "opacity-0"
                }
              `}></div>
              
              {/* Premium Sidebar Right - Visible when selected */}
              <div className={`
                absolute -right-1 top-0 bottom-0 w-1.5 transition-all duration-500 ease-in-out z-0
                ${dealType === "mw" 
                  ? "bg-gradient-to-b from-transparent via-white to-transparent opacity-60 shadow-[0_0_15px_rgba(255,255,255,0.4)] blur-[1px]" 
                  : "opacity-0"
                }
              `}></div>
              
              <div className="relative z-10 text-center w-full flex flex-col items-center justify-center">
                <div className="text-base font-semibold text-hearst-text-secondary mb-6 uppercase tracking-wider">
                  MW Allocated
                </div>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-48 h-48 relative z-10" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#8A1538"
                      strokeWidth="6"
                      fill="none"
                      className="opacity-100"
                      style={{ filter: 'drop-shadow(0 0 2px rgba(138, 21, 56, 0.2))' }}
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#7CFF5A"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - (mwAllocated - mwAllocatedMin) / (mwAllocatedMax - mwAllocatedMin))}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                      style={{ filter: 'drop-shadow(0 0 2px rgba(124, 255, 90, 0.2))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white">{mwAllocated}</div>
                      <div className="text-base text-hearst-text-secondary font-semibold">%</div>
                    </div>
                  </div>
                </div>
                <div className={`text-base font-semibold transition-all ${dealType === "mw" ? "text-white" : "text-hearst-text-secondary"}`}>
                  {dealType === "mw" ? "✓ Actif" : "Cliquez pour activer"}
                </div>
              </div>
            </div>

          </div>

        {/* Sliders - Harmonisés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 mb-10">
          {dealType === "revenue" ? (
            <div className="md:col-span-2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">0%</span>
                  <div className="slider-wrapper flex-1" style={{
                    '--slider-progress': `${((revenueShare - revenueShareMin) / (revenueShareMax - revenueShareMin)) * 100}%`,
                    'background': '#8A1538'
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
                  <span className="text-white text-sm font-semibold">30%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 flex justify-center">
              <div className="w-full max-w-md">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-semibold">0%</span>
                  <div className="slider-wrapper flex-1" style={{
                    '--slider-progress': `${((mwAllocated - mwAllocatedMin) / (mwAllocatedMax - mwAllocatedMin)) * 100}%`,
                    'background': '#8A1538'
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
                  <span className="text-white text-sm font-semibold">30%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="border-t border-hearst-grey-100/30 my-10"></div>

        {/* Récapitulatif */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Type de Deal */}
          <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 ease-in-out"></div>
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                <Percent className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white uppercase tracking-wide">Type de Deal</div>
              <div className="text-2xl font-bold text-white mt-4">
                {dealType === "revenue" ? "Share Revenu" : "MW Allocated"}
              </div>
            </div>
          </div>

          {/* Valeur du Deal */}
          <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 ease-in-out"></div>
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white uppercase tracking-wide">{dealType === "revenue" ? "Share Revenu" : "MW Allocated"}</div>
              <div className="text-2xl font-bold text-white mt-4">
                {dealType === "revenue" ? `${revenueShare}%` : `${mwAllocated}%`}
              </div>
            </div>
          </div>

          {/* Scénario Actif */}
          <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white uppercase tracking-wide">Scénario</div>
              <div className="text-2xl font-bold text-white mt-4">
                {activeScenario?.name || "Par défaut"}
              </div>
              {activeScenario && (
                <div className="text-lg text-white mt-1 opacity-75">
                  BTC: ${safeToFixed(miningParams.btcPrice, 0)}k
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bouton Lancer le Calcul */}
        <div className="flex justify-center mt-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="group relative bg-transparent text-white font-semibold text-3xl hover:opacity-80 transition-all duration-300 flex items-center gap-4 w-full px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
            <div className="flex items-center gap-4">
              <Activity className="w-10 h-10" strokeWidth={2.5} />
              <span>{isCalculating ? "Calcul en cours..." : "Lancer le Calcul"}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-white to-transparent"></div>
          </button>
        </div>

        {/* Barre de progression fluide */}
        {isCalculating && (
          <div className="mt-6 mb-6 px-8">
            <div className="relative w-full h-4 bg-hearst-bg-tertiary/50 rounded-full overflow-hidden border-2 border-hearst-green/40 shadow-inner">
              {/* Barre de progression animée */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-hearst-green via-[#A3FF8B] to-hearst-green rounded-full shadow-lg"
                style={{ 
                  width: `${calculationProgress}%`,
                  transition: 'width 0.05s linear'
                }}
              >
                {/* Effet de brillance animé */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                {/* Particules animées */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </div>
              </div>
              {/* Texte du pourcentage */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {Math.round(Math.max(0, Math.min(100, calculationProgress)))}%
                </span>
              </div>
            </div>
            {/* Message de progression */}
            <div className="text-center text-hearst-text-secondary text-sm mt-3 font-medium">
              {calculationProgress < 100 ? "Calcul en cours..." : "Terminé !"}
            </div>
          </div>
        )}

        <div className="pb-[49px]"></div>
      </Card>
      </div>
      )}

      {/* Tableau de projection - Premium - Qatar uniquement */}
      {resultsReady && (
      <div id="projection-results" className="mt-[150px]">
        <Card className="overflow-x-auto bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary overflow-hidden relative">
          <div id="qatar-table"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent z-10"></div>
          <div className="flex flex-col items-center justify-center mb-0 mt-6">
            <button
              onClick={() => setQatarTableOpen(!qatarTableOpen)}
              className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
            >
              <div className="flex items-center justify-center gap-4 w-full mb-2">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Qatar
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-[#8A1538] to-transparent"></div>
              </div>
              <div className="flex items-center justify-between w-full px-6">
                {/* Total Investment - Décomposition */}
                <div className="flex items-center gap-3">
                  <span className="text-[38.4px]">🇶🇦</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Total Investment - Décomposition
                  </h3>
                </div>
                <div className="flex items-center justify-center">
                  {qatarTableOpen ? (
                    <ChevronUp className="w-16 h-16 text-[#8A1538]" />
                  ) : (
                    <ChevronDown className="w-16 h-16 text-[#8A1538]" />
                  )}
                </div>
              </div>
            </button>
          </div>
        
        {qatarTableOpen && (
        <div className="rounded-xl overflow-hidden border border-hearst-grey-100/30">
          <div className="max-h-[350px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-hearst-bg-tertiary border-b-2 border-hearst-grey-100">
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Année</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Prix BTC (k$)</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-white">Revenues</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-white">Profit</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-white">ROI</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Price per BTC</th>
                </tr>
              </thead>
              <tbody>
                {projectionData && projectionData.length > 0 ? (
                  <>
                    {projectionData.map((row, index) => {
                      // Valeurs temporairement mises à 0 - à remplacer par les vraies formules
                      const qatarRevenueAnnual = 0; // TODO: Calculer les revenues annuelles Qatar
                      const qatarProfit = 0; // TODO: Calculer le profit annuel Qatar
                      const capexInM = capex / 1000000;
                      const roi = 0; // TODO: Calculer le ROI
                      const pricePerBTC = 0; // TODO: Calculer le prix par BTC
                      
                      return (
                        <tr
                          key={index}
                          className="border-b border-hearst-grey-100/30"
                        >
                          <td className="py-5 px-6 text-center font-semibold text-white">{typeof row.year === 'string' ? row.year : `Année ${row.year}`}</td>
                          <td className="py-5 px-6 text-center font-medium text-white">${safeToFixed(row.btcPrice, 0)}k</td>
                          <td className="py-5 px-6 text-center text-white font-semibold">
                            ${safeToFixed(qatarRevenueAnnual, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-white font-semibold">
                            ${safeToFixed(qatarProfit, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-white font-semibold">
                            {safeToFixed(roi, 1)}%
                          </td>
                          <td className="py-5 px-6 text-center text-hearst-text-secondary font-semibold">
                            ${safeToFixed(pricePerBTC, 2)}M
                          </td>
                        </tr>
                      );
                    })}
                    {/* Ligne Total */}
                    {(() => {
                      // Valeurs temporairement mises à 0 - à remplacer par les vraies formules
                      const totalRevenue = 0; // TODO: Calculer le total des revenues
                      const totalProfit = 0; // TODO: Calculer le total des profits
                      const totalROI = 0; // TODO: Calculer le ROI total
                      const avgPricePerBTC = 0; // TODO: Calculer le prix moyen par BTC
                      const avgBTCPrice = projectionData.reduce((sum, row) => sum + (row.btcPrice || 0), 0) / projectionData.length;
                      
                      return (
                        <tr className="border-t-2 border-hearst-grey-100 bg-[#8A1538]/10">
                          <td className="py-5 px-6 text-center font-bold text-white">Total</td>
                          <td className="py-5 px-6 text-center font-medium text-white">${safeToFixed(avgBTCPrice, 0)}k</td>
                          <td className="py-5 px-6 text-center text-white font-bold">
                            ${safeToFixed(totalRevenue, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-white font-bold">
                            ${safeToFixed(totalProfit, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-white font-bold">
                            {safeToFixed(totalROI, 1)}%
                          </td>
                          <td className="py-5 px-6 text-center text-hearst-text-secondary font-bold">
                            ${safeToFixed(avgPricePerBTC, 2)}M
                          </td>
                        </tr>
                      );
                    })()}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-hearst-text-secondary">
                      Aucune donnée de projection disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Total Investment - Décomposition */}
        <div className="mt-0 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-[36px]">
            {/* Annualize net Revenues */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-[calc(50%+10px)] transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <Zap className="w-10 h-10 text-[#8A1538]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Annualize net Revenues</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("qatar-annualize-net-revenues")}
                  className="text-sm text-[#8A1538] hover:text-[#8A1538]/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>

            {/* Annualize net Profit */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-[calc(50%+10px)] transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <Activity className="w-10 h-10 text-[#8A1538]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Annualize net Profit</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("qatar-annualize-net-profit")}
                  className="text-sm text-[#8A1538] hover:text-[#8A1538]/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>

            {/* ROI */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-[calc(50%+10px)] transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-[#8A1538]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">ROI</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("qatar-roi")}
                  className="text-sm text-[#8A1538] hover:text-[#8A1538]/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>

            {/* Cost per BTC / 1 */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8A1538] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-[calc(50%+10px)] transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <DollarSign className="w-10 h-10 text-[#8A1538]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Cost per BTC / 1</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("qatar-cost-per-btc")}
                  className="text-sm text-[#8A1538] hover:text-[#8A1538]/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      </div>
      )}

      {/* Tableau Hearst */}
      {resultsReady && (
      <Card className="overflow-x-auto bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary mt-[88px] overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hearst-green to-transparent z-10"></div>
        <div className="flex flex-col items-center justify-center mb-0 mt-6">
          <button
            onClick={() => setHearstTableOpen(!hearstTableOpen)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
          >
            <div className="flex items-center justify-center gap-4 w-full mb-2">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-hearst-green to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                Hearst
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-hearst-green to-transparent"></div>
            </div>
            <div className="flex items-center justify-between w-full px-6">
              {/* Total Investment - Décomposition */}
              <div className="flex items-center gap-3">
                <DollarSign className="w-[25.6px] h-[25.6px] text-hearst-green" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Total Investment - Décomposition
                </h3>
              </div>
              <div className="flex items-center justify-center">
                {hearstTableOpen ? (
                  <ChevronUp className="w-16 h-16 text-hearst-green" />
                ) : (
                  <ChevronDown className="w-16 h-16 text-hearst-green" />
                )}
              </div>
            </div>
          </button>
        </div>
        
        {hearstTableOpen && (
        <div className="rounded-xl overflow-hidden border border-hearst-grey-100/30">
          <div className="max-h-[350px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-hearst-bg-tertiary border-b-2 border-hearst-grey-100">
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Année</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-white">Margin</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-white">Electricity</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-hearst-text-secondary">Share revenu</th>
                </tr>
              </thead>
              <tbody>
                {projectionData && projectionData.length > 0 ? (
                  <>
                    {projectionData.map((row, index) => {
                      // Valeurs temporairement mises à 0 - à remplacer par les vraies formules
                      const margin = 0; // TODO: Calculer la marge sur hardware
                      const electricity = 0; // TODO: Calculer la part d'électricité
                      const shareRevenu = 0; // TODO: Calculer la part de revenu
                      
                      return (
                        <tr
                          key={index}
                          className="border-b border-hearst-grey-100/30"
                        >
                          <td className="py-5 px-6 text-center font-semibold text-white">{typeof row.year === 'string' ? row.year : `Année ${row.year}`}</td>
                          <td className="py-5 px-6 text-center text-white font-semibold">
                            {safeToFixed(margin, 1)}%
                          </td>
                          <td className="py-5 px-6 text-center text-white font-semibold">
                            ${safeToFixed(electricity, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-hearst-text-secondary font-semibold">
                            ${safeToFixed(shareRevenu, 2)}M
                          </td>
                        </tr>
                      );
                    })}
                    {/* Ligne Total */}
                    {(() => {
                      // Valeurs temporairement mises à 0 - à remplacer par les vraies formules
                      const totalMargin = 0; // TODO: Calculer la marge totale
                      const totalElectricity = 0; // TODO: Calculer l'électricité totale
                      const totalShareRevenu = 0; // TODO: Calculer le total des revenus
                      
                      return (
                        <tr className="border-t-2 border-hearst-grey-100 bg-hearst-green/10">
                          <td className="py-5 px-6 text-center font-bold text-white">Total</td>
                          <td className="py-5 px-6 text-center text-white font-bold">
                            {safeToFixed(totalMargin, 1)}%
                          </td>
                          <td className="py-5 px-6 text-center text-white font-bold">
                            ${safeToFixed(totalElectricity, 2)}M
                          </td>
                          <td className="py-5 px-6 text-center text-hearst-text-secondary font-bold">
                            ${safeToFixed(totalShareRevenu, 2)}M
                          </td>
                        </tr>
                      );
                    })()}
                  </>
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-hearst-text-secondary">
                      Aucune donnée de projection disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Total Investment - Décomposition */}
        <div className="mt-0 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Margin on hardware */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-hearst-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <Zap className="w-10 h-10 text-hearst-green" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Margin on hardware</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("hearst-margin-on-hardware")}
                  className="text-sm text-hearst-green hover:text-hearst-green/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>

            {/* Share Electricity */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-hearst-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <Activity className="w-10 h-10 text-hearst-green" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Share Electricity</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("hearst-share-electricity")}
                  className="text-sm text-hearst-green hover:text-hearst-green/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>

            {/* Share Revenu */}
            <div className="p-5 bg-transparent rounded-xl border-2 border-transparent transition-all duration-300 cursor-pointer relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-hearst-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-20 h-20 bg-transparent rounded-lg flex items-center justify-center">
                  <DollarSign className="w-10 h-10 text-hearst-green" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white uppercase tracking-wide">Share Revenu</div>
                <div className="text-2xl font-bold text-white mt-4">
                  ${safeToFixed(0, 2)}M
                </div>
                <button 
                  onClick={() => setOpenPopup("hearst-share-revenu")}
                  className="text-sm text-hearst-green hover:text-hearst-green/80 underline mt-2 transition-colors"
                >
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* Flèche de navigation vers Global Projection - Affichée seulement après les résultats Qatar/Hearst */}
      {resultsReady && !showGlobalProjection && (
        <div className="flex justify-center items-center py-8">
          <button
            onClick={() => {
              setShowGlobalProjection(true);
              setTimeout(() => {
                const globalProjectionTitle = document.getElementById("global-projection-title");
                if (globalProjectionTitle) {
                  globalProjectionTitle.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            className="flex flex-col items-center gap-2 text-white hover:text-hearst-green transition-colors duration-300 animate-bounce"
          >
            <ChevronDown className="w-8 h-8" strokeWidth={2.5} />
            <span className="text-sm font-semibold">Global Projection</span>
          </button>
        </div>
      )}

      {/* Titre Global Projection */}
      {resultsReady && showGlobalProjection && (
      <div id="global-projection-title" className="mt-36 mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
          Global Projection
        </h1>
      </div>
      )}

      {/* Projections sur 5 ans - Premium */}
      {resultsReady && showGlobalProjection && (
      <Card className="overflow-x-auto bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary mt-0 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3498db] to-transparent z-10"></div>
        <div className="flex flex-col items-center justify-center mb-0 mt-6">
          <button
            onClick={() => setProjections5AnsOpen(!projections5AnsOpen)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
          >
            <div className="flex items-center justify-center gap-4 w-full mb-2">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#3498db] to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                Projections sur 5 Ans
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-[#3498db] to-transparent"></div>
            </div>
            <div className="flex items-center justify-center">
              {projections5AnsOpen ? (
                <ChevronUp className="w-16 h-16 text-[#3498db]" />
              ) : (
                <ChevronDown className="w-16 h-16 text-[#3498db]" />
              )}
            </div>
          </button>
        </div>
        
        {projections5AnsOpen && (
        <div className="bg-gray-800/50 rounded-lg p-6 mt-6">
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
                dataKey="total"
                stroke="#A3FF8B"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </Card>
      )}

      {/* Tableau Détails des Projections - Premium */}
      {resultsReady && showGlobalProjection && (
      <Card className="overflow-x-auto bg-gradient-to-br from-hearst-bg-secondary to-hearst-bg-tertiary mt-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3498db] to-transparent z-10"></div>
        <div className="flex flex-col items-center justify-center mb-0 mt-6">
          <button
            onClick={() => setDetailsProjectionsOpen(!detailsProjectionsOpen)}
            className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
          >
            <div className="flex items-center justify-center gap-4 w-full mb-2">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#3498db] to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                Détails des Projections
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-[#3498db] to-transparent"></div>
            </div>
            <div className="flex items-center justify-center">
              {detailsProjectionsOpen ? (
                <ChevronUp className="w-16 h-16 text-[#3498db]" />
              ) : (
                <ChevronDown className="w-16 h-16 text-[#3498db]" />
              )}
            </div>
          </button>
        </div>
        
        {detailsProjectionsOpen && (
        <div className="rounded-xl overflow-hidden border border-hearst-grey-100/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-hearst-bg-tertiary border-b-2 border-hearst-grey-100">
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Année</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Prix BTC</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Difficulté</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">BTC/Mois HEARST</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">BTC/Mois Qatar</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Revenue/Mois HEARST</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Revenue/Mois Qatar</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">OPEX/An HEARST</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">OPEX/An Qatar</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Profit/An HEARST</th>
                <th className="text-center py-4 px-4 font-bold text-xs uppercase tracking-wider text-white">Profit/An Qatar</th>
              </tr>
            </thead>
            <tbody>
              {projectionData && projectionData.length > 0 ? (
                projectionData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-hearst-grey-100/30 ${index % 2 === 0 ? "bg-hearst-bg-secondary/50" : "bg-hearst-bg-tertiary/50"}`}
                  >
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      {typeof row.year === 'string' ? row.year : `Année ${row.year}`}
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-white">
                      ${safeToFixed(row.btcPrice, 0)}k
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-white">
                      {safeToFixed(row.difficulty || 0, 1)} T
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      {safeToFixed(row.hearstMonthlyBTC || 0, 4)}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      {safeToFixed(row.qatarMonthlyBTC || 0, 4)}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      ${safeToFixed(row.hearstRevenueMonthly || 0, 2)}M
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      ${safeToFixed(row.qatarRevenueMonthly || 0, 2)}M
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      ${safeToFixed(row.hearstOpexYearly || 0, 2)}M
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-white">
                      ${safeToFixed(row.qatarOpexYearly || 0, 2)}M
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-white text-lg">
                      ${safeToFixed(row.hearst, 2)}M
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-white text-lg">
                      ${safeToFixed(row.qatar || 0, 2)}M
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-white">
                    Aucune donnée de projection disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </Card>
      )}

      {/* Bouton Premium pour Générer le Rapport */}
      {resultsReady && showGlobalProjection && (
      <Card className="bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary relative overflow-hidden mt-12">
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <FileText className="w-10 h-10 text-[#3498db]" strokeWidth={2.5} />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Rapport Financier
                </h3>
                <p className="text-hearst-text-secondary text-sm">
                  Générez un rapport PDF premium avec toutes les données financières
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/report")}
              className="px-6 py-3 bg-[#3498db] text-white rounded-lg font-semibold text-base flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Générer le Rapport
            </button>
          </div>
        </div>
      </Card>
      )}

      {/* Popup Modal Premium Ultra Luxe */}
      {openPopup && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setOpenPopup(null)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className={`relative rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl ${
              openPopup.startsWith("qatar") 
                ? "bg-gradient-to-br from-hearst-dark via-[#1a0f14] to-hearst-dark border-2 border-[#8A1538]/60 shadow-[#8A1538]/30" 
                : "bg-gradient-to-br from-hearst-dark via-hearst-bg-secondary to-hearst-dark border-2 border-hearst-green/50 shadow-hearst-green/20"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.4s ease-out' }}
          >
            {/* Sidebars Premium - Gauche et Droite */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ease-in-out z-0 ${
              openPopup.startsWith("qatar")
                ? "bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-80 shadow-[0_0_20px_rgba(138,21,56,0.6)] blur-[1px]"
                : "bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-80 shadow-[0_0_20px_rgba(124,255,90,0.6)] blur-[1px]"
            }`}></div>
            <div className={`absolute right-0 top-0 bottom-0 w-1.5 transition-all duration-500 ease-in-out z-0 ${
              openPopup.startsWith("qatar")
                ? "bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-80 shadow-[0_0_20px_rgba(138,21,56,0.6)] blur-[1px]"
                : "bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-80 shadow-[0_0_20px_rgba(124,255,90,0.6)] blur-[1px]"
            }`}></div>
            
            {/* Effets de lumière premium */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              openPopup.startsWith("qatar")
                ? "bg-gradient-to-r from-transparent via-[#8A1538] to-transparent opacity-70"
                : "bg-gradient-to-r from-transparent via-hearst-green to-transparent opacity-70"
            }`}></div>
            <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 ${
              openPopup.startsWith("qatar") ? "bg-[#8A1538]/15" : "bg-hearst-green/10"
            }`}></div>
            <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 ${
              openPopup.startsWith("qatar") ? "bg-[#8A1538]/8" : "bg-hearst-green/5"
            }`}></div>
            
            {/* Header Premium Ultra Luxe */}
            <div className={`relative sticky top-0 backdrop-blur-2xl border-b-2 p-8 flex items-center justify-between z-10 ${
              openPopup.startsWith("qatar")
                ? "bg-gradient-to-r from-hearst-dark/98 via-[#1a0f14]/98 to-hearst-dark/98 border-[#8A1538]/40"
                : "bg-gradient-to-r from-hearst-dark/98 via-hearst-bg-secondary/98 to-hearst-dark/98 border-hearst-green/40"
            }`}>
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-2xl ${
                  openPopup.startsWith("qatar")
                    ? "bg-gradient-to-br from-[#8A1538]/40 to-[#8A1538]/20 border-[#8A1538]/50"
                    : "bg-gradient-to-br from-hearst-green/40 to-hearst-green/20 border-hearst-green/50"
                }`}>
                  {openPopup.startsWith("qatar") ? (
                    <span className="text-3xl">🇶🇦</span>
                  ) : (
                    <DollarSign className={`w-8 h-8 ${openPopup.startsWith("qatar") ? "text-[#8A1538]" : "text-hearst-green"}`} strokeWidth={2.5} />
                  )}
                </div>
                <h3 className="text-4xl font-bold text-white tracking-tight">
                  {openPopup === "qatar-annualize-net-revenues" && "Annualize net Revenues"}
                  {openPopup === "qatar-annualize-net-profit" && "Annualize net Profit"}
                  {openPopup === "qatar-roi" && "ROI"}
                  {openPopup === "qatar-cost-per-btc" && "Cost per BTC / 1"}
                  {openPopup === "hearst-margin-on-hardware" && "Margin on hardware"}
                  {openPopup === "hearst-share-electricity" && "Share Electricity"}
                  {openPopup === "hearst-share-revenu" && "Share Revenu"}
                </h3>
              </div>
              <button
                onClick={() => setOpenPopup(null)}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 border-2 group ${
                  openPopup.startsWith("qatar")
                    ? "hover:bg-[#8A1538]/20 border-[#8A1538]/40 hover:border-[#8A1538]/70"
                    : "hover:bg-hearst-green/20 border-hearst-green/40 hover:border-hearst-green/70"
                }`}
              >
                <X className={`w-7 h-7 transition-colors ${openPopup.startsWith("qatar") ? "text-white group-hover:text-[#8A1538]" : "text-white group-hover:text-hearst-green"}`} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Content Premium Ultra Luxe */}
            <div className="relative p-10 space-y-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              {openPopup === "qatar-annualize-net-revenues" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    {/* Sidebars pour section Qatar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        Les revenus annuels nets représentent le revenu total généré sur une année, après déduction des coûts opérationnels. Cette métrique reflète la performance financière réelle du projet de mining Bitcoin et permet d'évaluer la viabilité économique à long terme.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    {/* Sidebars pour section Qatar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-[#8A1538]/30 font-mono text-base space-y-4">
                        <div className="text-[#8A1538] font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Infrastructure = (Infrastructure/MW + Cooling/MW + Networking/MW) × MW</p>
                        <div className="pt-4 border-t-2 border-[#8A1538]/30">
                          <div className="text-[#8A1538] font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed((defaultHardwareCosts.infrastructurePerMW + defaultHardwareCosts.coolingPerMW + defaultHardwareCosts.networkingPerMW) * phase.mw / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "qatar-annualize-net-profit" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        Le profit net annuel représente le bénéfice réel après déduction de tous les coûts, incluant les coûts d'infrastructure, d'exploitation et de maintenance. C'est la métrique clé pour évaluer la rentabilité du projet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-[#8A1538]/30 font-mono text-base space-y-4">
                        <div className="text-[#8A1538] font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Hardware = ASIC/MW × MW</p>
                        <div className="pt-4 border-t-2 border-[#8A1538]/30">
                          <div className="text-[#8A1538] font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed(defaultHardwareCosts.asicPerMW * phase.mw / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "qatar-roi" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        Le ROI (Return on Investment) représente le retour sur investissement, calculé sur la base des coûts de déploiement OPEX sur 3 mois. Cette métrique permet d'évaluer l'efficacité de l'investissement initial.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-[#8A1538]/30 font-mono text-base space-y-4">
                        <div className="text-[#8A1538] font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">OPEX Deployment = OPEX Mensuel × 3</p>
                        <div className="pt-4 border-t-2 border-[#8A1538]/30">
                          <div className="text-[#8A1538] font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed(opexMonthly * 3 / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "qatar-cost-per-btc" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        Le coût par BTC représente le coût total d'investissement divisé par le nombre de BTC minés, donnant le coût unitaire de production d'un Bitcoin. Cette métrique est essentielle pour évaluer la compétitivité du projet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-[#1a0f14]/80 via-[#2a1520]/60 to-[#1a0f14]/80 rounded-3xl border-2 border-[#8A1538]/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#8A1538] to-transparent opacity-70 shadow-[0_0_15px_rgba(138,21,56,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#8A1538]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8A1538]/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#8A1538] rounded-full shadow-lg shadow-[#8A1538]/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-[#8A1538]/30 font-mono text-base space-y-4">
                        <div className="text-[#8A1538] font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Total Investment = CAPEX Total</p>
                        <div className="pt-4 border-t-2 border-[#8A1538]/30">
                          <div className="text-[#8A1538] font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed(capex / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "hearst-margin-on-hardware" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        La marge sur le hardware représente la différence entre le prix de vente et le coût d'achat du matériel minier, incluant l'infrastructure, le refroidissement et le réseau. Cette marge reflète la valeur ajoutée de HEARST dans le projet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-hearst-green/30 font-mono text-base space-y-4">
                        <div className="text-hearst-green font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Infrastructure = (Infrastructure/MW + Cooling/MW + Networking/MW) × MW</p>
                        <div className="pt-4 border-t-2 border-hearst-green/30">
                          <div className="text-hearst-green font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed((defaultHardwareCosts.infrastructurePerMW + defaultHardwareCosts.coolingPerMW + defaultHardwareCosts.networkingPerMW) * phase.mw / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "hearst-share-electricity" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        La part d'électricité représente le coût total de l'électricité consommée par le matériel minier sur la durée de vie du projet. Cette métrique est cruciale pour évaluer les coûts opérationnels à long terme.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-hearst-green/30 font-mono text-base space-y-4">
                        <div className="text-hearst-green font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Hardware = ASIC/MW × MW</p>
                        <div className="pt-4 border-t-2 border-hearst-green/30">
                          <div className="text-hearst-green font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed(defaultHardwareCosts.asicPerMW * phase.mw / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {openPopup === "hearst-share-revenu" && (
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Explication
                      </h4>
                      <p className="text-hearst-text-secondary leading-relaxed text-lg">
                        La part de revenu représente le pourcentage des revenus générés par le mining qui revient à HEARST selon le type de deal sélectionné. Cette répartition est définie contractuellement et impacte directement la rentabilité.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative p-8 bg-gradient-to-br from-hearst-bg-secondary/80 via-hearst-bg-tertiary/60 to-hearst-bg-secondary/80 rounded-3xl border-2 border-hearst-green/40 backdrop-blur-xl overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-hearst-green/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-hearst-green/8 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-3 h-3 bg-hearst-green rounded-full shadow-lg shadow-hearst-green/50"></div>
                        Calcul détaillé
                      </h4>
                      <div className="bg-hearst-dark/70 backdrop-blur-md p-6 rounded-2xl border-2 border-hearst-green/30 font-mono text-base space-y-4">
                        <div className="text-hearst-green font-bold text-lg">Formule :</div>
                        <p className="text-white text-lg">Total Investment = CAPEX Total</p>
                        <div className="pt-4 border-t-2 border-hearst-green/30">
                          <div className="text-hearst-green font-bold text-lg mb-3">Résultat :</div>
                          <p className="text-3xl font-bold text-white">${safeToFixed(capex / 1000000, 2)}M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer avec détails Hearst - Caché quand les résultats sont prêts et Global Projection n'est pas affiché */}
      {(!resultsReady || showGlobalProjection) && (
      <footer className="h-[100px] bg-hearst-bg-secondary border-t border-hearst-grey-100/30 flex items-center justify-between px-8 mt-12">
        <div className="flex items-center gap-4 text-hearst-text-secondary text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-hearst-green font-bold text-sm md:text-base">HEARST</span>
            <span className="text-hearst-text-secondary">Solutions</span>
          </div>
          <span className="hidden md:block">•</span>
          <span className="hidden md:block">Bitcoin Mining Infrastructure & Financial Solutions</span>
        </div>
        <div className="text-hearst-text-secondary text-xs">
          <span>© 2024 Hearst Solutions. All rights reserved.</span>
        </div>
      </footer>
      )}
    </div>
  );
}






