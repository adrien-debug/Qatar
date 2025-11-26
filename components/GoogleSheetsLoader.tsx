"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";
import {
  loadDealConfigFromGoogleSheets,
  DealSpreadsheetConfig,
  defaultDealConfig,
  calculateHearstFigures,
  HearstFiguresCalculationParams,
} from "@/lib/google-sheets-loader";
import { defaultHardwareCosts, defaultPhases } from "@/lib/financial-calculations";
import { RefreshCw, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from "lucide-react";

interface GoogleSheetsLoaderProps {
  onConfigLoaded?: (config: DealSpreadsheetConfig) => void;
  spreadsheetUrl?: string;
  // Paramètres optionnels pour calculer dynamiquement les Hearst Figures (si fournis)
  mw?: number;
  phase?: number;
  qatarRevenueYearly?: number; // Pour calculer SPV revenue
  dealType?: 'revenue' | 'mw';
  revenueSharePercent?: number;
  mwAllocatedPercent?: number;
  // Si true, masque la section "Hearst Figures" (pour la page Settings)
  hideHearstFigures?: boolean;
}

const DEFAULT_SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1l5g4q3d5z9tQOiEgRjP2DL9HcCDXSazcGG4GqyD2l3o/edit?gid=1844894831#gid=1844894831";

export default function GoogleSheetsLoader({
  onConfigLoaded,
  spreadsheetUrl = DEFAULT_SPREADSHEET_URL,
  mw,
  phase,
  qatarRevenueYearly,
  dealType,
  revenueSharePercent,
  mwAllocatedPercent,
  hideHearstFigures = false,
}: GoogleSheetsLoaderProps) {
  const [config, setConfig] = useState<DealSpreadsheetConfig>(defaultDealConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [customUrl, setCustomUrl] = useState(spreadsheetUrl);

  // Charger la config depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qatar-deal-spreadsheet-config");
      if (saved) {
        try {
          const savedConfig = JSON.parse(saved);
          setConfig(savedConfig);
          if (onConfigLoaded) {
            onConfigLoaded(savedConfig);
          }
        } catch (e) {
          console.error("Erreur lors du chargement de la config:", e);
        }
      }

      const lastLoadedStr = localStorage.getItem("qatar-deal-spreadsheet-last-loaded");
      if (lastLoadedStr) {
        setLastLoaded(new Date(lastLoadedStr));
      }
    }
  }, [onConfigLoaded]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedConfig = await loadDealConfigFromGoogleSheets(customUrl);
      setConfig(loadedConfig);
      setLastLoaded(new Date());

      // Sauvegarder dans localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(loadedConfig));
        localStorage.setItem("qatar-deal-spreadsheet-last-loaded", new Date().toISOString());
        localStorage.setItem("qatar-deal-spreadsheet-url", customUrl);
      }

      if (onConfigLoaded) {
        onConfigLoaded(loadedConfig);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue lors du chargement";
      setError(errorMessage);
      console.error("Erreur lors du chargement du Google Sheets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger automatiquement au montage si pas de config sauvegardée
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qatar-deal-spreadsheet-config");
      if (!saved) {
        loadConfig();
      }
    }
  }, []);

  const formatCurrency = (value: number | undefined | null): string => {
    if (!value || isNaN(value)) return "$0";
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number | undefined | null): string => {
    if (!value || isNaN(value)) return "0%";
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="border-2 border-hearst-green/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-hearst-green/20 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Configuration du Deal</h3>
            <p className="text-sm text-hearst-text-secondary">
              Chargée depuis Google Sheets
              {lastLoaded && (
                <span className="ml-2">
                  • Dernière mise à jour: {lastLoaded.toLocaleTimeString("fr-FR")}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={loadConfig}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Recharger
            </>
          )}
        </Button>
      </div>

      {/* URL personnalisée */}
      <div className="mb-6 p-4 bg-hearst-dark/60 rounded-xl border border-hearst-grey-100/30">
        <label className="block text-sm font-medium text-hearst-text-secondary mb-2">
          URL du Google Sheets
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded-lg text-white placeholder-hearst-text-secondary focus:outline-none focus:ring-2 focus:ring-hearst-green/50"
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-medium mb-1">Erreur de chargement</p>
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-red-300 text-xs mt-2">
              Assurez-vous que le Google Sheets est publiquement accessible en lecture.
            </p>
          </div>
        </div>
      )}

      {/* Paramètres - Modifiables */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">Paramètres du Deal (Modifiables)</h4>
          <div className="text-xs text-hearst-text-secondary px-3 py-1 bg-hearst-green/10 border border-hearst-green/30 rounded-full">
            ✏️ Éditez directement les valeurs ci-dessous
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-hearst-dark/60 rounded-xl border border-hearst-grey-100/30">
            <label className="block text-sm text-hearst-text-secondary mb-2">
              Margin on Hardware
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.marginOnHardware}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const updatedConfig = { ...config, marginOnHardware: newValue };
                  setConfig(updatedConfig);
                  if (onConfigLoaded) {
                    onConfigLoaded(updatedConfig);
                  }
                  // Sauvegarder dans localStorage
                  if (typeof window !== "undefined") {
                    localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(updatedConfig));
                  }
                }}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-hearst-green/50"
              />
              <span className="absolute right-4 top-2 text-hearst-green font-bold">%</span>
            </div>
            <div className="text-xs text-hearst-text-secondary mt-1">
              Pourcentage de marge sur le contrat hardware
            </div>
          </div>

          <div className="p-4 bg-hearst-dark/60 rounded-xl border border-hearst-grey-100/30">
            <label className="block text-sm text-hearst-text-secondary mb-2">
              Share Electricity
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.shareElectricity}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const updatedConfig = { ...config, shareElectricity: newValue };
                  setConfig(updatedConfig);
                  if (onConfigLoaded) {
                    onConfigLoaded(updatedConfig);
                  }
                  if (typeof window !== "undefined") {
                    localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(updatedConfig));
                  }
                }}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-hearst-green/50"
              />
              <span className="absolute right-4 top-2 text-hearst-green font-bold">%</span>
            </div>
            <div className="text-xs text-hearst-text-secondary mt-1">
              Partage des coûts d&apos;électricité
            </div>
          </div>

          <div className="p-4 bg-hearst-dark/60 rounded-xl border border-hearst-grey-100/30">
            <label className="block text-sm text-hearst-text-secondary mb-2">
              Share SPV
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.shareSPV}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const updatedConfig = { ...config, shareSPV: newValue };
                  setConfig(updatedConfig);
                  if (onConfigLoaded) {
                    onConfigLoaded(updatedConfig);
                  }
                  if (typeof window !== "undefined") {
                    localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(updatedConfig));
                  }
                }}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-hearst-green/50"
              />
              <span className="absolute right-4 top-2 text-hearst-green font-bold">%</span>
            </div>
            <div className="text-xs text-hearst-text-secondary mt-1">
              Partage des revenus SPV
            </div>
          </div>

          <div className="p-4 bg-hearst-dark/60 rounded-xl border border-hearst-grey-100/30">
            <label className="block text-sm text-hearst-text-secondary mb-2">
              Elec Cost
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-hearst-green font-bold">$</span>
              <input
                type="number"
                value={config.elecCost}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const updatedConfig = { ...config, elecCost: newValue };
                  setConfig(updatedConfig);
                  if (onConfigLoaded) {
                    onConfigLoaded(updatedConfig);
                  }
                  if (typeof window !== "undefined") {
                    localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(updatedConfig));
                  }
                }}
                step="0.001"
                min="0"
                max="1"
                className="w-full pl-8 pr-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-hearst-green/50"
              />
            </div>
            <div className="text-xs text-hearst-text-secondary mt-1">
              Coût par kWh
            </div>
          </div>
        </div>
        
        {/* Bouton de réinitialisation */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-hearst-text-secondary">
            💡 Les valeurs sont sauvegardées automatiquement et utilisées dans tous les calculs
          </div>
          <Button
            onClick={() => {
              const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les valeurs aux paramètres par défaut ?");
              if (confirmed) {
                setConfig(defaultDealConfig);
                if (onConfigLoaded) {
                  onConfigLoaded(defaultDealConfig);
                }
                if (typeof window !== "undefined") {
                  localStorage.setItem("qatar-deal-spreadsheet-config", JSON.stringify(defaultDealConfig));
                }
              }
            }}
            className="text-sm"
            variant="secondary"
          >
            Réinitialiser aux valeurs par défaut
          </Button>
        </div>
      </div>

      {/* Revenus HEARST calculés dynamiquement (seulement si les paramètres sont fournis) */}
      {!hideHearstFigures && mw !== undefined && phase !== undefined && (
      <div className="mt-6 pt-6 border-t border-hearst-grey-100/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-white">Hearst Figures</h4>
            <p className="text-xs text-hearst-text-secondary mt-1">
              Calculées dynamiquement en fonction des paramètres du projet
            </p>
          </div>
          <div className="text-right text-xs text-hearst-text-secondary">
            <div>Basées sur {mw} MW</div>
            <div>Phase {phase}</div>
            {dealType && (
              <div className="mt-1 px-2 py-1 bg-hearst-green/20 rounded text-hearst-green text-xs">
                Deal {dealType === 'revenue' ? 'A' : 'B'}
              </div>
            )}
          </div>
        </div>
        
        {/* Calculer les valeurs dynamiquement */}
        {(() => {
          // Le hardware cost pour le contrat = ASIC + Infrastructure (sans cooling et networking)
          // C'est ce qui constitue le "contrat hardware" sur lequel la margin est calculée
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
          );
        })()}
      </div>
      )}

      {/* Statut */}
      {!error && !loading && (
        <div className="mt-4 flex items-center gap-2 text-hearst-green text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Configuration chargée avec succès</span>
        </div>
      )}
    </Card>
  );
}

