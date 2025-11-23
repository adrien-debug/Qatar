"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import ScenarioManager from "@/components/ScenarioManager";
import CoinGeckoScraper from "@/components/CoinGeckoScraper";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import { Calculator, Coins, Calendar, DollarSign, Activity, TrendingUp, Edit2, Save, X } from "lucide-react";
import { Scenario } from "@/components/ScenarioManager";

interface FormulaData {
  btcMonthly: string;
  revenueMonthly: string;
  revenueAnnual: string;
  opexAnnual: string;
  netProfit: string;
}

const defaultFormulas: FormulaData = {
  btcMonthly: "Hashrate (PH) = MW × Hashrate/MW\nPart Réseau = Hashrate / (Difficulty × 6000)\nBTC/Jour = Part × 450 × (Uptime/100) × (1 - PoolFee/100)\nBTC/Mois = BTC/Jour × 30",
  revenueMonthly: "Revenue = Volume BTC × Prix BTC\n\nPour Deal A (Revenue Share) :\nHEARST = Revenue × %Share\nQatar = Revenue - HEARST",
  revenueAnnual: "Revenue Annuel = Revenue Mensuel × 12",
  opexAnnual: "OPEX Mensuel = Électricité + Maintenance + Fixe\nÉlectricité = MW × 1000 × 720 × (Taux/100)\nMaintenance = (CAPEX × 2%) / 12\nFixe = 75,000 + (MW × 1000)\nOPEX Annuel = OPEX Mensuel × 12",
  netProfit: "Net Profit = Revenue Annuel - OPEX Annuel\n\nPour Deal A (Revenue Share) :\nHEARST Net Profit = HEARST Revenue (OPEX = 0)\nQatar Net Profit = Qatar Revenue - OPEX Annuel"
};

export default function SettingsPage() {
  const [formulas, setFormulas] = useState<FormulaData>(defaultFormulas);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const scenarioManagerRef = useRef<{ createScenarioFromData: (scenario: Scenario) => void } | null>(null);

  // Charger les formules depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qatar-formulas");
    if (saved) {
      try {
        setFormulas(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading formulas:", e);
      }
    }
  }, []);

  // Sauvegarder les formules
  const saveFormulas = (newFormulas: FormulaData) => {
    localStorage.setItem("qatar-formulas", JSON.stringify(newFormulas));
    setFormulas(newFormulas);
  };

  const startEdit = (key: keyof FormulaData) => {
    setEditingKey(key);
    setEditValue(formulas[key]);
  };

  const saveEdit = () => {
    if (editingKey) {
      const newFormulas = { ...formulas, [editingKey]: editValue };
      saveFormulas(newFormulas);
      setEditingKey(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const resetToDefault = (key: keyof FormulaData) => {
    const newFormulas = { ...formulas, [key]: defaultFormulas[key] };
    saveFormulas(newFormulas);
  };

  const handleScenarioCreated = (scenario: Scenario) => {
    // Charger les scénarios existants
    const saved = localStorage.getItem("qatar-scenarios");
    const existingScenarios = saved ? JSON.parse(saved) : [];
    
    // Vérifier si un scénario avec le même nom existe déjà
    const existingIndex = existingScenarios.findIndex((s: Scenario) => s.name === scenario.name);
    
    if (existingIndex >= 0) {
      // Remplacer le scénario existant
      existingScenarios[existingIndex] = scenario;
    } else {
      // Ajouter le nouveau scénario
      existingScenarios.push(scenario);
    }
    
    // Sauvegarder
    localStorage.setItem("qatar-scenarios", JSON.stringify(existingScenarios));
    
    // Déclencher un événement de stockage pour mettre à jour ScenarioManager
    window.dispatchEvent(new Event("storage"));
    
    // Recharger la page pour voir le nouveau scénario
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-16 space-y-12">
        <CoinGeckoScraper onScenarioCreated={handleScenarioCreated} />
        <ScenarioManager />
        
        {/* Header Premium */}
        <SectionHeader
          title="Paramètres Financiers"
          subtitle="Configuration avancée des formules de calcul et paramètres financiers"
          variant="dark"
          size="large"
        />
        
        {/* Formules de Calcul - Ultra Premium */}
        <Card className="border-2 border-hearst-green/30 p-12">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-hearst-green/20 rounded-2xl flex items-center justify-center shadow-xl">
              <Calculator className="w-10 h-10 text-hearst-green" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">Formules de Calcul</h3>
              <p className="text-xl text-hearst-text-secondary">Détails des calculs financiers - Éditables</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Volume BTC Mensuel */}
            <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden">
              {/* Effet de lumière premium */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-hearst-green/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-hearst-green/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center shadow-xl border border-hearst-green/20">
                      <Coins className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">Volume BTC Mensuel</h4>
                  </div>
                <div className="flex gap-3">
                  {editingKey === "btcMonthly" ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-3.5 bg-hearst-green text-black rounded-xl font-bold shadow-xl border-2 border-hearst-green/50"
                        title="Enregistrer"
                      >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-3.5 bg-hearst-grey-200 text-white rounded-xl font-bold border-2 border-hearst-grey-100/30 shadow-lg"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit("btcMonthly")}
                        className="p-3.5 bg-hearst-green/20 text-hearst-green rounded-xl font-bold border-2 border-hearst-green/40 shadow-lg"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => resetToDefault("btcMonthly")}
                        className="px-5 py-3.5 bg-hearst-grey-200 text-hearst-text-secondary rounded-xl font-bold text-sm border-2 border-hearst-grey-100/40 shadow-lg"
                        title="Réinitialiser"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingKey === "btcMonthly" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-hearst-dark/90 backdrop-blur-sm border-2 border-hearst-green text-white rounded-2xl font-mono text-base focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green resize-none shadow-xl"
                  rows={7}
                />
              ) : (
                <div className="bg-hearst-dark/60 backdrop-blur-sm p-8 rounded-2xl font-mono text-base text-hearst-text-secondary whitespace-pre-line leading-relaxed border-2 border-hearst-grey-100/30 shadow-inner">
                  {formulas.btcMonthly.split('\n').map((line, i) => (
                    <div key={i} className={line.includes('=') && !line.includes('BTC/Mois') ? 'text-hearst-text-secondary' : line.includes('BTC/Mois') ? 'text-hearst-green font-bold mt-4 text-xl' : 'text-hearst-text-secondary'}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Revenue Mensuel */}
            <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden">
              {/* Effet de lumière premium */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-hearst-green/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-hearst-green/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center shadow-xl border border-hearst-green/20">
                      <Calendar className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">Revenue Mensuel</h4>
                  </div>
                <div className="flex gap-3">
                  {editingKey === "revenueMonthly" ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-3.5 bg-hearst-green text-black rounded-xl font-bold shadow-xl border-2 border-hearst-green/50"
                        title="Enregistrer"
                      >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-3.5 bg-hearst-grey-200 text-white rounded-xl font-bold border-2 border-hearst-grey-100/30 shadow-lg"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit("revenueMonthly")}
                        className="p-3 bg-hearst-green/20 text-hearst-green rounded-xl font-bold border-2 border-hearst-green/30"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => resetToDefault("revenueMonthly")}
                        className="px-4 py-3 bg-hearst-grey-200 text-hearst-text-secondary rounded-xl font-bold text-sm border-2 border-hearst-grey-100/30"
                        title="Réinitialiser"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingKey === "revenueMonthly" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-hearst-dark/90 backdrop-blur-sm border-2 border-hearst-green text-white rounded-2xl font-mono text-base focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green resize-none shadow-xl"
                  rows={7}
                />
              ) : (
                <div className="bg-hearst-dark/60 backdrop-blur-sm p-8 rounded-2xl font-mono text-base text-hearst-text-secondary whitespace-pre-line leading-relaxed border-2 border-hearst-grey-100/30 shadow-inner">
                  {formulas.revenueMonthly.split('\n').map((line, i) => (
                    <div key={i} className={line.includes('Revenue =') ? 'text-hearst-green font-bold text-xl mt-2' : 'text-hearst-text-secondary'}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Revenue Annuel */}
            <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden">
              {/* Effet de lumière premium */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-hearst-green/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-hearst-green/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center shadow-xl border border-hearst-green/20">
                      <DollarSign className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">Revenue Annuel</h4>
                  </div>
                <div className="flex gap-3">
                  {editingKey === "revenueAnnual" ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-3.5 bg-hearst-green text-black rounded-xl font-bold shadow-xl border-2 border-hearst-green/50"
                        title="Enregistrer"
                      >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-3.5 bg-hearst-grey-200 text-white rounded-xl font-bold border-2 border-hearst-grey-100/30 shadow-lg"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit("revenueAnnual")}
                        className="p-3 bg-hearst-green/20 text-hearst-green rounded-xl font-bold border-2 border-hearst-green/30"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => resetToDefault("revenueAnnual")}
                        className="px-4 py-3 bg-hearst-grey-200 text-hearst-text-secondary rounded-xl font-bold text-sm border-2 border-hearst-grey-100/30"
                        title="Réinitialiser"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingKey === "revenueAnnual" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-hearst-dark/90 backdrop-blur-sm border-2 border-hearst-green text-white rounded-2xl font-mono text-base focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green resize-none shadow-xl"
                  rows={4}
                />
              ) : (
                <div className="bg-hearst-dark/60 backdrop-blur-sm p-8 rounded-2xl font-mono text-base text-hearst-text-secondary border-2 border-hearst-grey-100/30 shadow-inner">
                  <div className="text-hearst-green font-bold text-xl">{formulas.revenueAnnual}</div>
                </div>
              )}
              </div>
            </div>

            {/* OPEX Annuel */}
            <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden">
              {/* Effet de lumière premium */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-hearst-green/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-hearst-green/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center shadow-xl border border-hearst-green/20">
                      <Activity className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">OPEX Annuel</h4>
                  </div>
                <div className="flex gap-3">
                  {editingKey === "opexAnnual" ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-3.5 bg-hearst-green text-black rounded-xl font-bold shadow-xl border-2 border-hearst-green/50"
                        title="Enregistrer"
                      >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-3.5 bg-hearst-grey-200 text-white rounded-xl font-bold border-2 border-hearst-grey-100/30 shadow-lg"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit("opexAnnual")}
                        className="p-3 bg-hearst-green/20 text-hearst-green rounded-xl font-bold border-2 border-hearst-green/30"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => resetToDefault("opexAnnual")}
                        className="px-4 py-3 bg-hearst-grey-200 text-hearst-text-secondary rounded-xl font-bold text-sm border-2 border-hearst-grey-100/30"
                        title="Réinitialiser"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingKey === "opexAnnual" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-hearst-dark/90 backdrop-blur-sm border-2 border-hearst-green text-white rounded-2xl font-mono text-base focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green resize-none shadow-xl"
                  rows={7}
                />
              ) : (
                <div className="bg-hearst-dark/60 backdrop-blur-sm p-8 rounded-2xl font-mono text-base text-hearst-text-secondary whitespace-pre-line leading-relaxed border-2 border-hearst-grey-100/30 shadow-inner">
                  {formulas.opexAnnual.split('\n').map((line, i) => (
                    <div key={i} className={line.includes('OPEX Annuel =') ? 'text-hearst-green font-bold mt-4 text-xl' : 'text-hearst-text-secondary'}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Net Profit */}
            <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden md:col-span-2">
              {/* Effet de lumière premium */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-hearst-green/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-hearst-green/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/10 rounded-2xl flex items-center justify-center shadow-xl border border-hearst-green/20">
                      <TrendingUp className="w-8 h-8 text-hearst-green" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-3xl font-bold text-white tracking-tight">Net Profit</h4>
                  </div>
                <div className="flex gap-3">
                  {editingKey === "netProfit" ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-3.5 bg-hearst-green text-black rounded-xl font-bold shadow-xl border-2 border-hearst-green/50"
                        title="Enregistrer"
                      >
                        <Save className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-3.5 bg-hearst-grey-200 text-white rounded-xl font-bold border-2 border-hearst-grey-100/30 shadow-lg"
                        title="Annuler"
                      >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit("netProfit")}
                        className="p-3 bg-hearst-green/20 text-hearst-green rounded-xl font-bold border-2 border-hearst-green/30"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => resetToDefault("netProfit")}
                        className="px-4 py-3 bg-hearst-grey-200 text-hearst-text-secondary rounded-xl font-bold text-sm border-2 border-hearst-grey-100/30"
                        title="Réinitialiser"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingKey === "netProfit" ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-8 py-5 bg-hearst-dark/90 backdrop-blur-sm border-2 border-hearst-green text-white rounded-2xl font-mono text-base focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green resize-none shadow-xl"
                  rows={7}
                />
              ) : (
                <div className="bg-hearst-dark/60 backdrop-blur-sm p-8 rounded-2xl font-mono text-base text-hearst-text-secondary whitespace-pre-line leading-relaxed border-2 border-hearst-grey-100/30 shadow-inner">
                  {formulas.netProfit.split('\n').map((line, i) => (
                    <div key={i} className={line.includes('Net Profit =') ? 'text-hearst-green font-bold text-xl mt-2' : 'text-hearst-text-secondary'}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

