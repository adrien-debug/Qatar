"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import SectionHeader from "./SectionHeader";
import { MiningParams, defaultMiningParams } from "@/lib/financial-calculations";
import { Save, Trash2, Plus, Edit2, Check, X, TrendingUp, Cpu, Activity, DollarSign } from "lucide-react";

export interface Scenario {
  id: string;
  name: string;
  minerType: string;
  powerConsumption: number; // W/TH
  hashratePerMiner?: number; // TH par mineur (nouveau champ)
  hashratePerMW: number; // PH per MW (calculé automatiquement)
  uptime: number; // percentage
  btcPrice: number;
  networkDifficulty: number; // T
  totalHashrate: number; // PH
  blockReward: number;
  poolFee: number;
  // Paramètres Hardware
  hardwarePrice?: number; // Prix du hardware par unité ($)
  lifespan?: number; // Durée de vie en années
  // Paramètres OPEX
  energyRate?: number; // cents/kWh (défaut: 2.5)
  maintenancePercent?: number; // % du CAPEX (défaut: 2)
  fixedCostsBase?: number; // Coûts fixes de base (défaut: 75000)
  fixedCostsPerMW?: number; // Coûts fixes par MW (défaut: 1000)
  // Nouveaux paramètres Deal
  mwCapexCost?: number; // Coût MW côté client (peut être 0 si Qatar finance)
  hearstResellPricePerKwh?: number; // Prix de revente électricité HEARST (défaut: 0.055)
  mwAllocatedToHearst?: number; // MW alloués à HEARST pour revente
}

export default function ScenarioManager() {
  // Fonction pour calculer hashratePerMW
  const calculateHashratePerMW = (hashratePerMiner: number, powerConsumption: number): number => {
    if (powerConsumption > 0 && hashratePerMiner > 0) {
      const minerPowerConsumption = hashratePerMiner * powerConsumption; // W par mineur
      const minersPerMW = 1000000 / minerPowerConsumption; // Nombre de mineurs par MW
      return (hashratePerMiner * minersPerMW) / 1000; // Convertir en PH
    }
    return 0;
  };

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    id: "",
    name: "",
    minerType: "Antminer S21",
    powerConsumption: 3550, // W/TH (Antminer S21)
    hashratePerMiner: 200, // TH par mineur (Antminer S21)
    hashratePerMW: calculateHashratePerMW(200, 3550), // PH per MW (calculé)
    uptime: 90, // Pourcentage (défaut: 90%)
    btcPrice: 100000, // USD (valeur réaliste)
    networkDifficulty: 100, // T (valeur réaliste)
    totalHashrate: 600, // PH (valeur du réseau)
    blockReward: 3.125, // BTC (après halving 2024)
    poolFee: 0.8, // Pourcentage (standard)
    // Paramètres Hardware par défaut
      hardwarePrice: 1500, // Prix du hardware par unité ($)
      lifespan: 5, // Durée de vie en années
      // Paramètres OPEX par défaut
      energyRate: 2.5, // cents/kWh (taux Qatar)
      maintenancePercent: 2, // % du CAPEX
      fixedCostsBase: 75000, // Coûts fixes de base
      fixedCostsPerMW: 1000, // Coûts fixes par MW
      // Nouveaux paramètres Deal
      mwCapexCost: 0, // Coût MW (0 si Qatar finance)
      hearstResellPricePerKwh: 0.055, // Prix revente électricité HEARST
      mwAllocatedToHearst: 0, // MW alloués à HEARST
    });

  // Charger les scénarios depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qatar-scenarios");
    if (saved) {
      setScenarios(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder les scénarios dans localStorage
  const saveScenarios = (newScenarios: Scenario[]) => {
    localStorage.setItem("qatar-scenarios", JSON.stringify(newScenarios));
    setScenarios(newScenarios);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    const hashratePerMiner = 200; // TH par mineur (Antminer S21)
    const powerConsumption = 3550; // W/TH (Antminer S21)
    setCurrentScenario({
      id: Date.now().toString(),
      name: "",
      minerType: "Antminer S21",
      powerConsumption: powerConsumption,
      hashratePerMiner: hashratePerMiner,
      hashratePerMW: calculateHashratePerMW(hashratePerMiner, powerConsumption),
      uptime: 90, // Pourcentage (défaut: 90%)
      btcPrice: 100000, // USD (valeur réaliste)
      networkDifficulty: 100, // T (valeur réaliste)
      totalHashrate: 600, // PH (valeur du réseau)
      blockReward: 3.125, // BTC (après halving 2024)
      poolFee: 0.8, // Pourcentage (standard)
      hardwarePrice: 1500, // Prix du hardware par unité ($)
      lifespan: 5, // Durée de vie en années
      energyRate: 2.5, // cents/kWh (taux Qatar)
      maintenancePercent: 2, // % du CAPEX
      fixedCostsBase: 75000, // Coûts fixes de base
      fixedCostsPerMW: 1000, // Coûts fixes par MW
      // Nouveaux paramètres Deal
      mwCapexCost: 0, // Coût MW (0 si Qatar finance)
      hearstResellPricePerKwh: 0.055, // Prix revente électricité HEARST
      mwAllocatedToHearst: 0, // MW alloués à HEARST
    });
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setIsCreating(false);
    setCurrentScenario(scenario);
  };

  const handleSave = () => {
    if (!currentScenario.name.trim()) {
      alert("Veuillez entrer un nom pour le scénario");
      return;
    }

    if (isCreating) {
      saveScenarios([...scenarios, currentScenario]);
      setIsCreating(false);
    } else if (editingId) {
      saveScenarios(
        scenarios.map((s) => (s.id === editingId ? currentScenario : s))
      );
      setEditingId(null);
    }

    const hashratePerMiner = 200; // TH par mineur (Antminer S21)
    const powerConsumption = 3550; // W/TH (Antminer S21)
    setCurrentScenario({
      id: "",
      name: "",
      minerType: "Antminer S21",
      powerConsumption: powerConsumption,
      hashratePerMiner: hashratePerMiner,
      hashratePerMW: calculateHashratePerMW(hashratePerMiner, powerConsumption),
      uptime: 90, // Pourcentage (défaut: 90%)
      btcPrice: 100000, // USD (valeur réaliste)
      networkDifficulty: 100, // T (valeur réaliste)
      totalHashrate: 600, // PH (valeur du réseau)
      blockReward: 3.125, // BTC (après halving 2024)
      poolFee: 0.8, // Pourcentage (standard)
      hardwarePrice: 1500, // Prix du hardware par unité ($)
      lifespan: 5, // Durée de vie en années
      energyRate: 2.5, // cents/kWh (taux Qatar)
      maintenancePercent: 2, // % du CAPEX
      fixedCostsBase: 75000, // Coûts fixes de base
      fixedCostsPerMW: 1000, // Coûts fixes par MW
      // Nouveaux paramètres Deal
      mwCapexCost: 0, // Coût MW (0 si Qatar finance)
      hearstResellPricePerKwh: 0.055, // Prix revente électricité HEARST
      mwAllocatedToHearst: 0, // MW alloués à HEARST
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce scénario ?")) {
      saveScenarios(scenarios.filter((s) => s.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setIsCreating(false);
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    const hashratePerMiner = 200; // TH par mineur (Antminer S21)
    const powerConsumption = 3550; // W/TH (Antminer S21)
    setCurrentScenario({
      id: "",
      name: "",
      minerType: "Antminer S21",
      powerConsumption: powerConsumption,
      hashratePerMiner: hashratePerMiner,
      hashratePerMW: calculateHashratePerMW(hashratePerMiner, powerConsumption),
      uptime: 90, // Pourcentage (défaut: 90%)
      btcPrice: 100000, // USD (valeur réaliste)
      networkDifficulty: 100, // T (valeur réaliste)
      totalHashrate: 600, // PH (valeur du réseau)
      blockReward: 3.125, // BTC (après halving 2024)
      poolFee: 0.8, // Pourcentage (standard)
      hardwarePrice: 1500, // Prix du hardware par unité ($)
      lifespan: 5, // Durée de vie en années
      energyRate: 2.5, // cents/kWh (taux Qatar)
      maintenancePercent: 2, // % du CAPEX
      fixedCostsBase: 75000, // Coûts fixes de base
      fixedCostsPerMW: 1000, // Coûts fixes par MW
      // Nouveaux paramètres Deal
      mwCapexCost: 0, // Coût MW (0 si Qatar finance)
      hearstResellPricePerKwh: 0.055, // Prix revente électricité HEARST
      mwAllocatedToHearst: 0, // MW alloués à HEARST
    });
  };

  const applyScenario = (scenario: Scenario) => {
    // Sauvegarder le scénario actif pour utilisation dans ProjectionCalculator
    localStorage.setItem("qatar-active-scenario", JSON.stringify(scenario));
    alert(`Scénario "${scenario.name}" appliqué avec succès !`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Paramètres Financiers"
        subtitle="Créez et gérez différents scénarios de mining"
        variant="dark"
        size="large"
      />

      {/* Formulaire de création/édition */}
      {(isCreating || editingId) && (
        <Card className="border-2 border-hearst-green/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isCreating ? "Nouveau Scénario" : "Modifier le Scénario"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-hearst-green text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-hearst-bg-hover text-white rounded-lg font-semibold hover:bg-hearst-bg-tertiary transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>

          {/* Nom du scénario */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-hearst-text-secondary mb-3 uppercase tracking-wide">
              Nom du Scénario *
            </label>
            <input
              type="text"
              value={currentScenario.name}
              onChange={(e) =>
                setCurrentScenario({ ...currentScenario, name: e.target.value })
              }
              placeholder="Ex: Scénario Optimiste 2025"
              className="w-full px-5 py-3 border-2 border-hearst-grey-100 bg-hearst-bg-secondary text-white text-lg font-medium rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
            />
          </div>

          {/* Section Conditions Marché */}
          <div className="mb-8 p-6 bg-hearst-bg-secondary/80 rounded-xl border-2 border-hearst-green/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/30 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <TrendingUp className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Conditions Marché</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* BTC Price */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Prix BTC ($)
                </label>
                <input
                  type="number"
                  value={currentScenario.btcPrice || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      btcPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="140000"
                />
              </div>

              {/* Network Difficulty (T) */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Difficulté Réseau (T)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.networkDifficulty || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      networkDifficulty: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="105"
                />
              </div>

              {/* Total Hashrate (PH) */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Hashrate Total Réseau (PH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.totalHashrate || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      totalHashrate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="700"
                />
              </div>

              {/* Block Reward */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Block Reward (BTC)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={currentScenario.blockReward || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      blockReward: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="3.125"
                />
              </div>

              {/* Pool Fee (%) */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Pool Fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.poolFee || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      poolFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="0.8"
                />
              </div>
            </div>
          </div>

          {/* Section Hardware */}
          <div className="mb-8 p-6 bg-hearst-bg-secondary/80 rounded-xl border-2 border-hearst-green/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/30 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <Cpu className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Hardware</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type de Miner */}
              <div>
                <label className="block text-sm font-medium text-hearst-text-secondary mb-2">
                  Type de Miner
                </label>
                <select
                  value={currentScenario.minerType}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      minerType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-grey-100 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                >
                  <option value="Antminer S21">Antminer S21</option>
                  <option value="Antminer S21 Pro">Antminer S21 Pro</option>
                  <option value="Antminer S21 Hydro">Antminer S21 Hydro</option>
                  <option value="Whatsminer M60">Whatsminer M60</option>
                  <option value="AvalonMiner 1466">AvalonMiner 1466</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Consommation (W/TH) */}
              <div>
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Consommation (W/TH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.powerConsumption || ""}
                  onChange={(e) => {
                    const powerConsumption = parseFloat(e.target.value) || 0;
                    // Recalculer hashratePerMW si hashratePerMiner existe
                    const hashratePerMW = currentScenario.hashratePerMiner 
                      ? calculateHashratePerMW(currentScenario.hashratePerMiner, powerConsumption)
                      : 0;
                    setCurrentScenario({
                      ...currentScenario,
                      powerConsumption: powerConsumption,
                      hashratePerMW: hashratePerMW,
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="3550"
                />
              </div>

              {/* Hashrate par mineur (TH) */}
              <div>
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Hashrate par Mineur (TH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.hashratePerMiner || ""}
                  onChange={(e) => {
                    const hashratePerMiner = parseFloat(e.target.value) || 0;
                    // Calculer automatiquement hashratePerMW
                    const hashratePerMW = calculateHashratePerMW(hashratePerMiner, currentScenario.powerConsumption);
                    setCurrentScenario({
                      ...currentScenario,
                      hashratePerMiner: hashratePerMiner,
                      hashratePerMW: hashratePerMW,
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="200"
                />
                <div className="mt-2 p-3 bg-hearst-bg-tertiary/50 rounded-lg border border-hearst-green/30">
                  <div className="text-xs text-hearst-text-secondary mb-1">Hashrate par MW calculé:</div>
                  <div className="text-lg font-bold text-hearst-green">{currentScenario.hashratePerMW.toFixed(2)} PH</div>
                </div>
              </div>

              {/* Uptime (%) */}
              <div>
                <label className="block text-sm font-medium text-hearst-text-secondary mb-2">
                  Uptime (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.uptime}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      uptime: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-grey-100 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                />
              </div>

              {/* Prix du Hardware */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Prix du Hardware ($)
                </label>
                <input
                  type="number"
                  value={currentScenario.hardwarePrice || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      hardwarePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="2000"
                />
              </div>

              {/* Life Span */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Life Span (années)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentScenario.lifespan || ""}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      lifespan: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          {/* Section OPEX */}
          <div className="mb-8 p-6 bg-hearst-bg-secondary/80 rounded-xl border-2 border-hearst-green/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/30 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <Activity className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white">OPEX</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Taux d'Énergie */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Taux d&apos;Énergie (¢/kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.energyRate || 2.5}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      energyRate: parseFloat(e.target.value) || 2.5,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="2.5"
                />
              </div>

              {/* Pourcentage de Maintenance */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Maintenance (% CAPEX)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.maintenancePercent || 2}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      maintenancePercent: parseFloat(e.target.value) || 2,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="2"
                />
              </div>

              {/* Coûts Fixes de Base */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Coûts Fixes de Base ($)
                </label>
                <input
                  type="number"
                  value={currentScenario.fixedCostsBase || 75000}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      fixedCostsBase: parseFloat(e.target.value) || 75000,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="75000"
                />
              </div>

              {/* Coûts Fixes par MW */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Coûts Fixes par MW ($)
                </label>
                <input
                  type="number"
                  value={currentScenario.fixedCostsPerMW || 1000}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      fixedCostsPerMW: parseFloat(e.target.value) || 1000,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="bg-hearst-bg-secondary p-4 rounded-lg border border-hearst-grey-100/30">
              <p className="text-sm text-hearst-text-secondary mb-3">
                Les coûts OPEX sont calculés automatiquement en fonction des paramètres ci-dessus.
              </p>
              <div className="space-y-2 text-xs font-mono text-hearst-text-secondary">
                <div className="text-hearst-green font-semibold">OPEX = Électricité + Maintenance + Coûts Fixes</div>
                <div>Électricité = MW × 1000 × 720 × (Taux Énergie/100)</div>
                <div>Maintenance = (CAPEX × {currentScenario.maintenancePercent || 2}%) / 12 (mensuel)</div>
                <div>Coûts Fixes = {currentScenario.fixedCostsBase?.toLocaleString() || "75,000"} + (MW × {currentScenario.fixedCostsPerMW?.toLocaleString() || "1,000"})</div>
              </div>
            </div>
          </div>

          {/* Section Deal Parameters */}
          <div className="mb-8 p-6 bg-hearst-bg-secondary/80 rounded-xl border-2 border-hearst-green/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/30 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <DollarSign className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white">Paramètres Deal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Coût MW côté client */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Coût MW ($/MW)
                </label>
                <input
                  type="number"
                  value={currentScenario.mwCapexCost ?? 0}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      mwCapexCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="0"
                />
                <div className="mt-2 text-xs text-hearst-text-secondary">
                  Mettre à 0 si Qatar finance l&apos;infrastructure
                </div>
              </div>

              {/* Prix revente électricité HEARST */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  Prix Revente Électricité ($/kWh)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={currentScenario.hearstResellPricePerKwh ?? 0.055}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      hearstResellPricePerKwh: parseFloat(e.target.value) || 0.055,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="0.055"
                />
                <div className="mt-2 text-xs text-hearst-text-secondary">
                  Prix de revente par HEARST (défaut: 0.055)
                </div>
              </div>

              {/* MW alloués à HEARST */}
              <div className="bg-hearst-bg-tertiary/50 p-4 rounded-lg border border-hearst-green/30">
                <label className="block text-sm font-semibold text-hearst-green mb-2 uppercase tracking-wide">
                  MW Alloués à HEARST
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentScenario.mwAllocatedToHearst ?? 0}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      mwAllocatedToHearst: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-hearst-green/50 bg-hearst-bg-secondary text-white text-lg font-bold rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-hearst-green transition-all"
                  placeholder="0"
                />
                <div className="mt-2 text-xs text-hearst-text-secondary">
                  MW alloués à HEARST pour revente d&apos;électricité
                </div>
              </div>
            </div>
            <div className="bg-hearst-bg-secondary p-4 rounded-lg border border-hearst-grey-100/30">
              <p className="text-sm text-hearst-text-secondary mb-3">
                Paramètres spécifiques au deal HEARST/Qatar.
              </p>
              <div className="space-y-2 text-xs font-mono text-hearst-text-secondary">
                <div className="text-hearst-green font-semibold">Revenu Revente Électricité HEARST</div>
                <div>Revenu annuel = MW × 1000 × 8760 × Uptime × Prix Revente</div>
                <div>Revenu mensuel = Revenu annuel / 12</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bouton Créer */}
      {!isCreating && !editingId && (
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-hearst-green text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer un Scénario
          </button>
        </div>
      )}

      {/* Liste des scénarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="border-2 border-hearst-grey-100">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(scenario)}
                  className="p-2 text-hearst-green hover:bg-hearst-bg-hover rounded-lg transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(scenario.id)}
                  className="p-2 text-red-400 hover:bg-hearst-bg-hover rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Miner:</span>
                <span className="text-white font-medium">{scenario.minerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Consommation:</span>
                <span className="text-white font-medium">{scenario.powerConsumption} W/TH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Hashrate/MW:</span>
                <span className="text-white font-medium">{scenario.hashratePerMW} PH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Uptime:</span>
                <span className="text-white font-medium">{scenario.uptime}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">BTC Price:</span>
                <span className="text-white font-medium">${scenario.btcPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Difficulty:</span>
                <span className="text-white font-medium">{scenario.networkDifficulty} T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hearst-text-secondary">Total Hashrate:</span>
                <span className="text-white font-medium">{scenario.totalHashrate} PH</span>
              </div>
            </div>

            <button
              onClick={() => applyScenario(scenario)}
              className="w-full mt-4 px-4 py-2 bg-hearst-green text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Appliquer ce Scénario
            </button>
          </Card>
        ))}
      </div>

      {scenarios.length === 0 && !isCreating && (
        <Card className="text-center py-12">
          <p className="text-hearst-text-secondary mb-4">
            Aucun scénario créé. Créez votre premier scénario pour commencer.
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-hearst-green text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer un Scénario
          </button>
        </Card>
      )}
    </div>
  );
}

