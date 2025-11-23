"use client";

import { useState, useEffect } from "react";
import Card from "./Card";

interface CalculationNotesProps {
  dealType: "A" | "B";
}

export default function CalculationNotes({ dealType }: CalculationNotesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const defaultNotes = {
    btcProduction: `BTC Mensuel = (MW × Hashrate/MW × 30 jours × 144 blocs/jour × 3.125 BTC/bloc × Uptime%) / (Difficulté Réseau × 6000) × (1 - Pool Fee%)`,
    revenue: `Revenue Mensuel = BTC Mensuel × Prix Bitcoin`,
    opex: `OPEX Mensuel = (MW × 1000 kW × 720h × Taux Énergie) + (CAPEX × 2% / 12) + Coûts Fixes`,
    dealA: `HEARST Revenue = Revenue Total × % Revenue Share\nQatar Revenue = Revenue Total - HEARST Revenue`,
    dealB: `HEARST MW = Total MW × % Allocation\nQatar MW = Total MW - HEARST MW\nHEARST Profit = (Revenue - OPEX) × 12 (électricité = 0)\nQatar Profit = (Revenue - OPEX - Électricité) × 12`,
    capex: `CAPEX = (ASIC + Infrastructure + Cooling + Networking) × MW × (1 - Discount Phase)`,
  };

  // Charger les notes depuis localStorage ou utiliser les valeurs par défaut
  const [notes, setNotes] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`calculation-notes-${dealType}`);
      if (saved) {
        try {
          return { ...defaultNotes, ...JSON.parse(saved) };
        } catch (e) {
          return defaultNotes;
        }
      }
    }
    return defaultNotes;
  });

  // Sauvegarder dans localStorage quand les notes changent
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`calculation-notes-${dealType}`, JSON.stringify(notes));
    }
  }, [notes, dealType]);

  const handleNoteChange = (key: keyof typeof notes, value: string) => {
    setNotes({ ...notes, [key]: value });
  };

  const resetNotes = () => {
    setNotes(defaultNotes);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`calculation-notes-${dealType}`);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-hearst-text">
          Notes de Calcul Éditables
        </h3>
        <div className="flex gap-2">
          <button
            onClick={resetNotes}
            className="px-3 py-1 text-sm text-hearst-text-secondary hover:text-white border border-hearst-grey-100 rounded-lg hover:bg-hearst-bg-hover"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-hearst-green hover:bg-hearst-bg-hover rounded-lg"
          >
            {isExpanded ? "Réduire" : "Voir les formules"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production BTC
            </label>
            <textarea
              value={notes.btcProduction}
              onChange={(e) => handleNoteChange("btcProduction", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent font-mono text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calcul Revenue
            </label>
            <textarea
              value={notes.revenue}
              onChange={(e) => handleNoteChange("revenue", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent font-mono text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calcul OPEX
            </label>
            <textarea
              value={notes.opex}
              onChange={(e) => handleNoteChange("opex", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent font-mono text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calcul CAPEX
            </label>
            <textarea
              value={notes.capex}
              onChange={(e) => handleNoteChange("capex", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent font-mono text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal {dealType === "A" ? "A" : "B"} - Formule Spécifique
            </label>
            <textarea
              value={dealType === "A" ? notes.dealA : notes.dealB}
              onChange={(e) =>
                handleNoteChange(dealType === "A" ? "dealA" : "dealB", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent font-mono text-sm"
              rows={dealType === "B" ? 4 : 2}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Note :</strong> Ces formules sont utilisées pour les calculs affichés. 
              Modifiez-les pour ajuster la logique de calcul selon vos besoins.
            </div>
            <div className="text-xs text-gray-500">
              Les modifications sont sauvegardées localement dans votre navigateur.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
