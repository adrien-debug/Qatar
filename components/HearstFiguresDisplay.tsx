"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import { formatCurrency } from "@/lib/utils";
import {
  DealSpreadsheetConfig,
  defaultDealConfig,
  calculateHearstFigures,
  HearstFiguresCalculationParams,
} from "@/lib/google-sheets-loader";
import { defaultHardwareCosts } from "@/lib/financial-calculations";

interface HearstFiguresDisplayProps {
  mw: number;
  phase: number;
  qatarRevenueYearly?: number;
  dealType?: 'revenue' | 'mw';
  revenueSharePercent?: number;
  mwAllocatedPercent?: number;
}

export default function HearstFiguresDisplay({
  mw,
  phase,
  qatarRevenueYearly,
  dealType,
  revenueSharePercent,
  mwAllocatedPercent,
}: HearstFiguresDisplayProps) {
  const [config, setConfig] = useState<DealSpreadsheetConfig>(defaultDealConfig);

  // Charger la config depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qatar-deal-spreadsheet-config");
      if (saved) {
        try {
          const savedConfig = JSON.parse(saved);
          setConfig(savedConfig);
        } catch (e) {
          console.error("Erreur lors du chargement de la config:", e);
        }
      }
    }
  }, []);

  // Écouter les changements de config depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        const saved = localStorage.getItem("qatar-deal-spreadsheet-config");
        if (saved) {
          try {
            const savedConfig = JSON.parse(saved);
            setConfig(savedConfig);
          } catch (e) {
            console.error("Erreur lors du chargement de la config:", e);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);


  const formatPercent = (value: number | undefined | null): string => {
    if (!value || isNaN(value)) return "0%";
    return `${value.toFixed(2)}%`;
  };

  // Calculer les valeurs dynamiquement
  const hardwareCostPerMW = defaultHardwareCosts.asicPerMW + defaultHardwareCosts.infrastructurePerMW;
  const calculationParams: HearstFiguresCalculationParams = {
    mw,
    phase,
    elecCost: config.elecCost,
    hardwareCostPerMW,
    qatarRevenueYearly: qatarRevenueYearly || 0,
    dealType,
    revenueSharePercent,
    mwAllocatedPercent,
  };

  const hearstFigures = calculateHearstFigures(config, calculationParams);

  return (
    <Card className="border-2 border-hearst-green/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Hearst Figures</h3>
          <p className="text-sm text-hearst-text-secondary">
            Calculées dynamiquement en fonction des paramètres du projet
          </p>
        </div>
        <div className="text-right text-xs text-hearst-text-secondary">
          <div>{mw} MW • Phase {phase}</div>
          {dealType && (
            <div className="mt-1 px-2 py-1 bg-hearst-green/20 rounded text-hearst-green text-xs">
              Deal {dealType === 'revenue' ? 'A' : 'B'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-hearst-green/10 rounded-xl border border-hearst-green/30">
          <div className="text-sm text-hearst-text-secondary mb-1">
            Margin on Hardware (Contract)
          </div>
          <div className="text-xl font-bold text-hearst-green">
            {formatCurrency(hearstFigures.marginOnHardwareContract)}
          </div>
          <div className="text-xs text-hearst-text-secondary mt-1">
            {formatPercent(config.marginOnHardware)} du contrat hardware
          </div>
        </div>

        <div className="p-4 bg-hearst-green/10 rounded-xl border border-hearst-green/30">
          <div className="text-sm text-hearst-text-secondary mb-1">
            Share Electricity (Yearly)
          </div>
          <div className="text-xl font-bold text-hearst-green">
            {formatCurrency(hearstFigures.shareElectricityYearly)}
          </div>
          <div className="text-xs text-hearst-text-secondary mt-1">
            {formatPercent(config.shareElectricity)} des coûts électricité
          </div>
        </div>

        <div className="p-4 bg-hearst-green/10 rounded-xl border border-hearst-green/30">
          <div className="text-sm text-hearst-text-secondary mb-1">
            Share SPV (Yearly)
          </div>
          <div className="text-xl font-bold text-hearst-green">
            {formatCurrency(hearstFigures.shareSPVYearly)}
          </div>
          <div className="text-xs text-hearst-text-secondary mt-1">
            {formatPercent(config.shareSPV)} des revenus SPV
          </div>
        </div>

        {/* Total */}
        <div className="p-4 bg-gradient-to-br from-hearst-green/20 to-hearst-green/10 rounded-xl border-2 border-hearst-green/50 col-span-full md:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-hearst-text-secondary mb-1">
                Total Revenus HEARST (Annuel)
              </div>
              <div className="text-2xl font-bold text-hearst-green">
                {formatCurrency(hearstFigures.total)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-hearst-text-secondary">
                Incluant tous les revenus
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}




