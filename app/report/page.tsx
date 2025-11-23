"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
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
import { Scenario } from "@/components/ScenarioManager";
import { FileText, Download, ArrowLeft } from "lucide-react";
import ReportHeader from "@/components/ReportHeader";
import ReportSummary from "@/components/ReportSummary";
import ReportResults from "@/components/ReportResults";
import ReportProjections from "@/components/ReportProjections";
import ReportParams from "@/components/ReportParams";
import ReportFooter from "@/components/ReportFooter";

// Helper function pour formater les nombres et éviter NaN
const safeNumber = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return value;
};

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  const num = safeNumber(value);
  return isNaN(num) ? "0" : num.toFixed(decimals);
};

export default function ReportPage() {
  const router = useRouter();
  const [dealType, setDealType] = useState<"revenue" | "mw">("revenue");
  const [revenueShare, setRevenueShare] = useState(8);
  const [mwAllocated, setMwAllocated] = useState(12);
  const [selectedPhase, setSelectedPhase] = useState(3);
  const [miningParams, setMiningParams] = useState<MiningParams>(defaultMiningParams);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    // Charger le scénario actif
    const saved = localStorage.getItem("qatar-active-scenario");
    if (saved) {
      try {
        const scenario = JSON.parse(saved);
        setActiveScenario(scenario);
        setMiningParams({
          btcPrice: scenario.btcPrice || 0,
          networkDifficulty: scenario.networkDifficulty || 0,
          hashratePerMW: scenario.hashratePerMW || 0,
          blockReward: scenario.blockReward || 0,
          uptime: scenario.uptime || 0,
          poolFee: scenario.poolFee || 0,
        });
      } catch (e) {
        console.error("Error loading scenario:", e);
      }
    }

    // Charger les paramètres depuis localStorage
    const savedDealType = localStorage.getItem("qatar-deal-type");
    if (savedDealType) {
      setDealType(savedDealType as "revenue" | "mw");
    }
    const savedRevenueShare = localStorage.getItem("qatar-revenue-share");
    if (savedRevenueShare) {
      setRevenueShare(parseFloat(savedRevenueShare) || 8);
    }
    const savedMwAllocated = localStorage.getItem("qatar-mw-allocated");
    if (savedMwAllocated) {
      setMwAllocated(parseFloat(savedMwAllocated) || 12);
    }
    const savedPhase = localStorage.getItem("qatar-selected-phase");
    if (savedPhase) {
      setSelectedPhase(parseInt(savedPhase) || 3);
    }

    // Date du rapport
    setReportDate(new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  const phase = defaultPhases[selectedPhase - 1];
  
  // Utiliser les paramètres du scénario actif ou les valeurs par défaut
  const energyRate = activeScenario?.energyRate ?? 2.5;
  const maintenancePercent = activeScenario?.maintenancePercent ?? 2;
  const fixedCostsBase = activeScenario?.fixedCostsBase ?? 75000;
  const fixedCostsPerMW = activeScenario?.fixedCostsPerMW ?? 1000;
  const mwCapexCost = activeScenario?.mwCapexCost ?? 0;
  const hearstResellPricePerKwh = activeScenario?.hearstResellPricePerKwh ?? 0.055;
  const mwAllocatedToHearst = activeScenario?.mwAllocatedToHearst ?? (dealType === "mw" ? (phase.mw * mwAllocated / 100) : 0);
  
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, selectedPhase) + (mwCapexCost * phase.mw);
  const opexMonthly = calculateOPEXMonthly(phase.mw, energyRate, capex, maintenancePercent, fixedCostsBase, fixedCostsPerMW);
  const opexPerMW = phase.mw > 0 ? opexMonthly / phase.mw : 0;

  let dealAResult = null;
  let dealBResult = null;
  let projections: any[] = [];

  if (dealType === "revenue") {
    const inputs: DealAInputs = {
      phase: selectedPhase,
      mw: phase.mw,
      revenueSharePercent: revenueShare,
      miningParams,
      opexMonthly,
      mwCapexCost,
      hearstResellPricePerKwh,
      mwAllocatedToHearst,
    };
    dealAResult = calculateDealA(inputs);

    // Calculer les projections sur 5 ans
    for (let year = 1; year <= 5; year++) {
      const baseBTCPrice = miningParams.btcPrice || 0;
      const baseDifficulty = miningParams.networkDifficulty || 0;
      const yearBTCPrice = baseBTCPrice * (1 + 0.1 * (year - 1));
      const yearDifficulty = baseDifficulty * (1 + 0.08 * (year - 1));
      
      const yearMiningParams = {
        ...miningParams,
        btcPrice: yearBTCPrice,
        networkDifficulty: yearDifficulty,
      };
      
      const yearInputs: DealAInputs = {
        phase: selectedPhase,
        mw: phase.mw,
        revenueSharePercent: revenueShare,
        miningParams: yearMiningParams,
        opexMonthly,
        mwCapexCost,
        hearstResellPricePerKwh,
        mwAllocatedToHearst,
      };
      const yearResult = calculateDealA(yearInputs);
      
      projections.push({
        year,
        hearst: safeNumber(yearResult.hearstTotalRevenueYearly) / 1000000,
        qatar: safeNumber(yearResult.qatarNetProfit) / 1000000,
        total: (safeNumber(yearResult.hearstTotalRevenueYearly) + safeNumber(yearResult.qatarNetProfit)) / 1000000,
        btcPrice: safeNumber(yearBTCPrice) / 1000,
      });
    }
  } else {
    const inputs: DealBInputs = {
      phase: selectedPhase,
      totalMW: phase.mw,
      mwSharePercent: mwAllocated,
      miningParams,
      opexPerMW,
      energyRate: energyRate,
    };
    dealBResult = calculateDealB(inputs);

    // Calculer les projections sur 5 ans
    for (let year = 1; year <= 5; year++) {
      const baseBTCPrice = miningParams.btcPrice || 0;
      const baseDifficulty = miningParams.networkDifficulty || 0;
      const yearBTCPrice = baseBTCPrice * (1 + 0.1 * (year - 1));
      const yearDifficulty = baseDifficulty * (1 + 0.08 * (year - 1));
      
      const yearMiningParams = {
        ...miningParams,
        btcPrice: yearBTCPrice,
        networkDifficulty: yearDifficulty,
      };
      
      const yearInputs: DealBInputs = {
        phase: selectedPhase,
        totalMW: phase.mw,
        mwSharePercent: mwAllocated,
        miningParams: yearMiningParams,
        opexPerMW,
        energyRate: energyRate,
      };
      const yearResult = calculateDealB(yearInputs);
      
      projections.push({
        year,
        hearst: safeNumber(yearResult.hearstAnnualProfit) / 1000000,
        qatar: safeNumber(yearResult.qatarAnnualProfit) / 1000000,
        total: (safeNumber(yearResult.hearstAnnualProfit) + safeNumber(yearResult.qatarAnnualProfit)) / 1000000,
        btcPrice: safeNumber(yearBTCPrice) / 1000,
      });
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      {/* Navigation - masquée à l'impression */}
      <div className="no-print">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-hearst-bg-secondary text-white rounded-lg hover:bg-hearst-bg-tertiary transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-hearst-green text-black rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                Télécharger PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-hearst-bg-tertiary text-white rounded-lg font-semibold hover:bg-hearst-bg-hover transition-all"
              >
                <FileText className="w-5 h-5" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rapport PDF Premium avec Charte Graphique HEARST - Dark Mode */}
      <div className="bg-gray-900 print:bg-[#050608] min-h-screen">
        <div className="max-w-6xl mx-auto p-12 print:p-8 print:max-w-full">
          {/* PAGE 1 - Executive Summary */}
          <div className="pdf-page-break print:min-h-[calc(100vh-2.4cm)] print:flex print:flex-col">
            {/* En-tête */}
            <ReportHeader reportDate={reportDate} scenarioName={activeScenario?.name} />
            
            {/* Résumé Exécutif */}
            <ReportSummary
              dealType={dealType}
              revenueShare={revenueShare}
              mwAllocated={mwAllocated}
              selectedPhase={selectedPhase}
              phaseMW={phase.mw}
              phaseTimeline={phase.timeline}
              capex={capex}
              hearstMW={dealAResult ? undefined : dealBResult?.hearstMW}
              qatarMW={dealAResult ? undefined : dealBResult?.qatarMW}
            />
            
            {/* Résultats HEARST et Qatar */}
            <ReportResults
              dealAResult={dealAResult}
              dealBResult={dealBResult}
              dealType={dealType}
            />
          </div>

          {/* PAGE 2 - Détails & Paramètres */}
          <div className="print:min-h-[calc(100vh-2.4cm)] print:flex print:flex-col print:justify-between">
            <div className="flex-1">
              {/* Projections sur 5 Ans */}
              <ReportProjections projections={projections} />
              
              {/* Paramètres */}
              <ReportParams
                activeScenario={activeScenario}
                energyRate={energyRate}
                maintenancePercent={maintenancePercent}
                fixedCostsBase={fixedCostsBase}
                fixedCostsPerMW={fixedCostsPerMW}
              />
            </div>
            
            {/* Footer */}
            <div className="mt-auto">
              <ReportFooter reportDate={reportDate} />
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour l'impression - Dark Mode Premium */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Fond noir premium pour le PDF */
          body {
            background: #050608 !important;
            color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Conteneur principal */
          .max-w-6xl {
            background: #050608 !important;
          }
          
          /* Tous les éléments doivent respecter les couleurs */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            margin: 1.2cm;
            size: A4;
          }
          
          /* Éviter les sauts de page */
          .pdf-avoid-break,
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Force le saut de page pour la page 2 */
          .pdf-page-break {
            page-break-after: always;
            break-after: page;
          }
          
          /* Dernière page ne doit pas avoir de saut */
          .pdf-page-break:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          
          /* Assurer la lisibilité des textes sur fond sombre */
          h1, h2, h3, h4, h5, h6 {
            color: #FFFFFF !important;
          }
          
          /* Tableaux avec fond sombre */
          table {
            background: #0B0B0F !important;
          }
          
          thead tr {
            background: #141418 !important;
          }
          
          tbody tr {
            background: #0B0B0F !important;
          }
          
          tbody tr:nth-child(even) {
            background: #141418 !important;
          }
        }
      `}</style>
    </>
  );
}
