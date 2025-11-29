"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Card from "@/components/Card";
import { 
  useCurrentSetup, 
  BaseSetup, 
  baseSetup,
  Scenario,
  getScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  setActiveSubScenarioId,
  getActiveSubScenarioId,
  getScenarioById,
} from "@/lib/setup-data";

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatUSDDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Composant pour un tableau éditable de scénario
function ScenarioTable({ 
  scenario, 
  onUpdate, 
  onDelete,
  isActive,
  onSetActive 
}: { 
  scenario: Scenario;
  onUpdate: (scenario: Scenario) => void;
  onDelete: (scenarioId: string) => void;
  isActive: boolean;
  onSetActive: (scenarioId: string) => void;
}) {
  const [editedData, setEditedData] = useState<BaseSetup>(scenario.data);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [scenarioName, setScenarioName] = useState(scenario.name);
  
  // Flag pour éviter les boucles infinies : on ignore les mises à jour du scenario
  // si elles proviennent de notre propre updateValue
  const isInternalUpdateRef = useRef(false);
  
  // Utiliser un ref pour suivre le dernier scenario vu
  const lastScenarioRef = useRef<{ id: string; updatedAt: string; dataStr: string; name: string }>({
    id: scenario.id,
    updatedAt: scenario.updatedAt,
    dataStr: JSON.stringify(scenario.data),
    name: scenario.name,
  });

  useEffect(() => {
    // Ignorer les mises à jour si elles proviennent de notre propre updateValue
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    // Ne mettre à jour que si le scenario a réellement changé
    const currentDataStr = JSON.stringify(scenario.data);
    const hasChanged = 
      scenario.id !== lastScenarioRef.current.id ||
      scenario.updatedAt !== lastScenarioRef.current.updatedAt ||
      currentDataStr !== lastScenarioRef.current.dataStr ||
      scenario.name !== lastScenarioRef.current.name;
    
    if (hasChanged) {
      // Mettre à jour les données (on sait qu'elles ont changé car hasChanged est true)
      setEditedData(scenario.data);
      
      // Mettre à jour le nom seulement si on n'est pas en train de l'éditer
      if (!isEditingName) {
        setScenarioName(scenario.name);
      }
      
      // Mettre à jour la référence
      lastScenarioRef.current = {
        id: scenario.id,
        updatedAt: scenario.updatedAt,
        dataStr: currentDataStr,
        name: scenario.name,
      };
    }
  }, [scenario.id, scenario.updatedAt, scenario.data, scenario.name, isEditingName]);

  const updateValue = (path: string, newValue: number) => {
    const [section, key] = path.split(".");
    const updated = { ...editedData };
    
    if (section === "parameters" && key in updated.parameters) {
      (updated.parameters as any)[key] = newValue;
    } else if (section === "projectData" && key in updated.projectData) {
      (updated.projectData as any)[key] = newValue;
    } else if (section === "qatarFigures" && key in updated.qatarFigures) {
      (updated.qatarFigures as any)[key] = newValue;
    } else if (section === "hearstFigures" && key in updated.hearstFigures) {
      (updated.hearstFigures as any)[key] = newValue;
    }
    
    setEditedData(updated);
    setHasChanges(true);
    
    // Marquer que c'est une mise à jour interne pour éviter la boucle infinie
    isInternalUpdateRef.current = true;
    
    // Sauvegarder immédiatement
    const updatedScenario = updateScenario(scenario.id, { data: updated });
    if (updatedScenario) {
      onUpdate(updatedScenario);
    }
  };

  const handleSaveName = () => {
    if (scenarioName.trim() && scenarioName !== scenario.name) {
      // Marquer que c'est une mise à jour interne pour éviter la boucle infinie
      isInternalUpdateRef.current = true;
      
      const updated = updateScenario(scenario.id, { name: scenarioName.trim() });
      if (updated) {
        onUpdate(updated);
      }
    }
    setIsEditingName(false);
  };

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le scénario &quot;${scenario.name}&quot; ?`)) {
      onDelete(scenario.id);
    }
  };

  const allValues = [
    { path: "parameters.marginOnHardwarePercent", label: "Margin on Hardware", value: editedData.parameters.marginOnHardwarePercent, currentCard: "Parameters", formatter: formatPercent },
    { path: "parameters.shareElectricityPercent", label: "Share Electricity", value: editedData.parameters.shareElectricityPercent, currentCard: "Parameters", formatter: formatPercent },
    { path: "parameters.shareSpvPercent", label: "Share SPV", value: editedData.parameters.shareSpvPercent, currentCard: "Parameters", formatter: formatPercent },
    { path: "parameters.elecCostUSDPerKwh", label: "Elec cost", value: editedData.parameters.elecCostUSDPerKwh, currentCard: "Parameters", formatter: formatUSDDecimal },
    { path: "projectData.totalCapexUSD", label: "Total Capex", value: editedData.projectData.totalCapexUSD, currentCard: "Project data", formatter: formatUSD },
    { path: "projectData.hardwareCapexUSD", label: "Hardware Capex", value: editedData.projectData.hardwareCapexUSD, currentCard: "Project data", formatter: formatUSD },
    { path: "projectData.infraCapexUSD", label: "Infra Capex", value: editedData.projectData.infraCapexUSD, currentCard: "Project data", formatter: formatUSD },
    { path: "projectData.totalPowerMw", label: "Total Power Project (Mw)", value: editedData.projectData.totalPowerMw, currentCard: "Project data", formatter: (v: number) => v.toString() },
    { path: "qatarFigures.annualizedNetRevenuesUSD", label: "Annualize net revenues", value: editedData.qatarFigures.annualizedNetRevenuesUSD, currentCard: "QATAR Figures", formatter: formatUSD },
    { path: "qatarFigures.annualizedNetProfitsUSD", label: "Annualize net profits", value: editedData.qatarFigures.annualizedNetProfitsUSD, currentCard: "QATAR Figures", formatter: formatUSD },
    { path: "qatarFigures.roiPercent", label: "ROI", value: editedData.qatarFigures.roiPercent, currentCard: "QATAR Figures", formatter: formatPercent },
    { path: "qatarFigures.costPerBtcUSD", label: "Cost 1 BTC", value: editedData.qatarFigures.costPerBtcUSD, currentCard: "QATAR Figures", formatter: formatUSDDecimal },
    { path: "hearstFigures.marginOnHardwareUSD", label: "Margin on Hardware (Contract)", value: editedData.hearstFigures.marginOnHardwareUSD, currentCard: "HEARST Figures", formatter: formatUSD },
    { path: "hearstFigures.shareElectricityYearlyUSD", label: "Share Electricity (Yearly)", value: editedData.hearstFigures.shareElectricityYearlyUSD, currentCard: "HEARST Figures", formatter: formatUSD },
    { path: "hearstFigures.shareSpvYearlyUSD", label: "Share SPV (Yearly)", value: editedData.hearstFigures.shareSpvYearlyUSD, currentCard: "HEARST Figures", formatter: formatUSD },
  ];

  return (
    <Card variant="dark" className={`mb-10 shadow-xl ${isActive ? 'border-2 border-hearst-green/60 bg-gradient-to-br from-hearst-green/10 to-hearst-green/5' : 'border-2 border-hearst-grey-100/20'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5 flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                } else if (e.key === "Escape") {
                  setScenarioName(scenario.name);
                  setIsEditingName(false);
                }
              }}
              className="text-3xl font-bold text-white bg-hearst-dark border-2 border-hearst-green rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-hearst-green/50 shadow-lg"
              autoFocus
            />
          ) : (
            <h2 
              className="text-3xl font-bold text-white cursor-pointer hover:text-hearst-green transition-colors tracking-tight"
              onClick={() => setIsEditingName(true)}
              title="Cliquez pour modifier le nom"
            >
              {scenario.name}
            </h2>
          )}
          {isActive && (
            <span className="px-6 py-3 bg-hearst-green/40 text-hearst-green rounded-full text-base font-bold border-2 border-hearst-green/60 shadow-lg">
              Scénario Actif
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isActive && (
            <button
              onClick={() => onSetActive(scenario.id)}
              className="px-6 py-3 bg-gradient-to-r from-hearst-green to-hearst-green/90 text-white rounded-xl font-bold text-base hover:from-hearst-green/90 hover:to-hearst-green/80 transition-all shadow-lg shadow-hearst-green/30 hover:shadow-xl"
            >
              Activer
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 hover:shadow-xl"
          >
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[700px] overflow-y-auto rounded-xl border-2 border-hearst-grey-100/20">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-r from-hearst-dark to-hearst-dark/95 z-10 shadow-lg">
            <tr className="border-b-2 border-hearst-grey-100/30">
              <th className="text-left py-6 px-6 text-white font-bold text-base uppercase tracking-wider">Label</th>
              <th className="text-left py-6 px-6 text-white font-bold text-base uppercase tracking-wider">Chemin</th>
              <th className="text-left py-6 px-6 text-white font-bold text-base uppercase tracking-wider">Valeur (éditable)</th>
              <th className="text-left py-6 px-6 text-white font-bold text-base uppercase tracking-wider">Valeur formatée</th>
              <th className="text-left py-6 px-6 text-white font-bold text-base uppercase tracking-wider">Card</th>
            </tr>
          </thead>
          <tbody>
            {allValues.map((item) => {
              const rawValue = item.value;
              const isPercent = item.path.includes("Percent") || item.path.includes("roi");
              const isSmallDecimal = item.path.includes("elecCost") || item.path.includes("costPerBtc");
              
              const inputKey = `${scenario.id}-${item.path}`;
              const inputValue = editingValues[inputKey] !== undefined 
                ? editingValues[inputKey] 
                : rawValue.toString();
              
              return (
                <tr key={item.path} className="border-b border-hearst-grey-100/20 hover:bg-hearst-grey-100/15 transition-colors">
                  <td className="py-5 px-6 text-white font-semibold text-base">{item.label}</td>
                  <td className="py-5 px-6 text-hearst-text-secondary text-sm font-mono bg-hearst-dark/30">
                    baseSetup.{item.path}
                  </td>
                  <td className="py-5 px-6">
                    <input
                      type="text"
                      inputMode="decimal"
                      step={isPercent || isSmallDecimal ? "0.01" : "1"}
                      value={inputValue}
                      onChange={(e) => {
                        const inputStr = e.target.value;
                        setEditingValues(prev => ({ ...prev, [inputKey]: inputStr }));
                        
                        const numValue = parseFloat(inputStr);
                        if (!isNaN(numValue) && inputStr !== "" && inputStr !== "-") {
                          updateValue(item.path, numValue);
                        }
                      }}
                      onBlur={(e) => {
                        const inputStr = e.target.value.trim();
                        const numValue = parseFloat(inputStr);
                        
                        if (inputStr === "" || isNaN(numValue)) {
                          setEditingValues(prev => {
                            const newState = { ...prev };
                            delete newState[inputKey];
                            return newState;
                          });
                        } else {
                          updateValue(item.path, numValue);
                          setEditingValues(prev => {
                            const newState = { ...prev };
                            delete newState[inputKey];
                            return newState;
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full px-4 py-3 bg-hearst-dark border-2 border-hearst-grey-100/30 rounded-lg text-white text-base focus:border-hearst-green focus:outline-none focus:ring-2 focus:ring-hearst-green/50 transition-all shadow-md hover:shadow-lg"
                      style={{ minWidth: '140px' }}
                    />
                  </td>
                  <td className="py-5 px-6 text-white font-bold text-base">
                    {(() => {
                      const numValue = parseFloat(inputValue);
                      if (!isNaN(numValue) && inputValue !== "" && inputValue !== "-") {
                        return item.formatter(numValue);
                      }
                      return item.formatter(rawValue);
                    })()}
                  </td>
                  <td className="py-5 px-6 text-hearst-text-secondary font-medium text-base">
                    {item.currentCard}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {hasChanges && (
        <div className="mt-8 p-6 bg-gradient-to-r from-hearst-green/25 to-hearst-green/15 border-2 border-hearst-green/60 rounded-xl shadow-lg">
          <p className="text-white text-lg font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Modifications sauvegardées
          </p>
          <p className="text-hearst-text-secondary text-base">
            Les valeurs modifiées sont sauvegardées automatiquement.
          </p>
        </div>
      )}
    </Card>
  );
}

export default function SetupPage() {
  const setup = useCurrentSetup();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeSubScenarioId, setActiveSubScenarioIdState] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [showNewScenarioForm, setShowNewScenarioForm] = useState(false);
  // État pour forcer le re-render quand les valeurs de base changent
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger les scénarios au montage
  useEffect(() => {
    loadScenarios();
  }, []);

  // Écouter les changements dans localStorage pour les valeurs de base (Share SPV, Share Electricity)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastBaseValues: string | null = null;

    const checkForChanges = () => {
      const baseValuesKey = "qatar-base-active-scenario";
      const saved = localStorage.getItem(baseValuesKey);
      
      // Comparer avec la dernière valeur pour détecter les changements réels
      if (saved !== lastBaseValues) {
        lastBaseValues = saved;
        // Forcer un re-render pour que useCurrentSetup() relise les valeurs
        setRefreshKey(prev => prev + 1);
      }
    };

    // Initialiser la dernière valeur
    lastBaseValues = localStorage.getItem("qatar-base-active-scenario");

    // Écouter les événements de stockage (pour les changements depuis d'autres onglets)
    window.addEventListener("storage", checkForChanges);

    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(checkForChanges, 300);

    return () => {
      window.removeEventListener("storage", checkForChanges);
      clearInterval(interval);
    };
  }, []);

  const loadScenarios = () => {
    const loadedScenarios = getScenarios();
    setScenarios(loadedScenarios);
    setActiveSubScenarioIdState(getActiveSubScenarioId());
  };

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) {
      alert("Veuillez entrer un nom pour le scénario");
      return;
    }

    const newScenario = createScenario(newScenarioName.trim(), baseSetup);
    setScenarios([...scenarios, newScenario]);
    setNewScenarioName("");
    setShowNewScenarioForm(false);
  };

  const handleUpdateScenario = (updatedScenario: Scenario) => {
    setScenarios(scenarios.map(s => s.id === updatedScenario.id ? updatedScenario : s));
  };

  const handleDeleteScenario = (scenarioId: string) => {
    deleteScenario(scenarioId);
    loadScenarios();
  };

  const handleSetActive = (scenarioId: string) => {
    setActiveSubScenarioId(scenarioId);
    setActiveSubScenarioIdState(scenarioId);
    // Recharger la page pour que useCurrentSetup utilise le nouveau sous-scénario actif
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      
      <main className="pt-8 p-12 overflow-y-auto min-h-screen mx-auto max-w-[1600px] px-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Setup
          </h1>
          <p className="text-hearst-text-secondary text-xl font-medium">
            Gestion des Scénarios
          </p>
        </div>

        {/* Section Scénario de Base Toujours Actif */}
        <Card variant="dark" className="mb-10 bg-gradient-to-br from-hearst-blue/25 to-hearst-blue/15 border-2 border-hearst-blue/60 shadow-2xl shadow-hearst-blue/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-4 h-4 bg-hearst-blue rounded-full shadow-lg shadow-hearst-blue/50"></div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Scénario de Base (Toujours Actif)
              </h2>
            </div>
            <span className="px-6 py-3 bg-hearst-blue/40 text-hearst-blue rounded-full text-base font-bold border-2 border-hearst-blue/60 shadow-lg">
              Toujours Actif
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Power MW */}
            <div className="p-8 bg-gradient-to-br from-hearst-dark/70 to-hearst-dark/50 rounded-xl border-2 border-hearst-blue/40 shadow-lg hover:shadow-xl hover:border-hearst-blue/60 transition-all duration-300">
              <div className="flex flex-col mb-4">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wider font-semibold mb-3">
                  Total Power
                </span>
                <span className="text-4xl font-bold text-hearst-blue mb-2">
                  {setup.projectData.totalPowerMw} MW
                </span>
              </div>
              <p className="text-hearst-text-secondary text-sm mt-4 pt-4 border-t border-hearst-blue/20">
                Valeur fixe : 200 MW
              </p>
            </div>
            
            {/* Share SPV */}
            <div className="p-8 bg-gradient-to-br from-hearst-dark/70 to-hearst-dark/50 rounded-xl border-2 border-hearst-blue/40 shadow-lg hover:shadow-xl hover:border-hearst-blue/60 transition-all duration-300">
              <div className="flex flex-col mb-4">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wider font-semibold mb-3">
                  Share SPV
                </span>
                <span className="text-4xl font-bold text-hearst-blue mb-2">
                  {setup.parameters.shareSpvPercent}%
                </span>
              </div>
              <p className="text-hearst-text-secondary text-sm mt-4 pt-4 border-t border-hearst-blue/20">
                Modifiable depuis la page <strong className="text-white">Projection</strong> via les sliders
              </p>
            </div>
            
            {/* Share Electricity */}
            <div className="p-8 bg-gradient-to-br from-hearst-dark/70 to-hearst-dark/50 rounded-xl border-2 border-hearst-blue/40 shadow-lg hover:shadow-xl hover:border-hearst-blue/60 transition-all duration-300">
              <div className="flex flex-col mb-4">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wider font-semibold mb-3">
                  Share Electricity
                </span>
                <span className="text-4xl font-bold text-hearst-blue mb-2">
                  {setup.parameters.shareElectricityPercent}%
                </span>
              </div>
              <p className="text-hearst-text-secondary text-sm mt-4 pt-4 border-t border-hearst-blue/20">
                Modifiable depuis la page <strong className="text-white">Projection</strong> via les sliders
              </p>
            </div>
          </div>
        </Card>

        {/* Section Sous-Scénario Sélectionné */}
        {activeSubScenarioId && (() => {
          const activeSubScenario = getScenarioById(activeSubScenarioId);
          return activeSubScenario ? (
            <Card variant="dark" className="mb-10 bg-gradient-to-br from-hearst-green/25 to-hearst-green/15 border-2 border-hearst-green/60 shadow-2xl shadow-hearst-green/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-4 h-4 bg-hearst-green rounded-full animate-pulse shadow-lg shadow-hearst-green/50"></div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    Sous-Scénario Sélectionné : {activeSubScenario.name}
                  </h2>
                </div>
                <span className="px-6 py-3 bg-hearst-green/40 text-hearst-green rounded-full text-base font-bold border-2 border-hearst-green/60 shadow-lg">
                  Utilisé dans Projection
                </span>
              </div>
              
              <p className="text-hearst-text-secondary text-base mb-6 leading-relaxed">
                Ce sous-scénario contient les données des tableaux éditables ci-dessous. 
                Les valeurs sont fusionnées avec le scénario de base (200 MW, SPV, Electricity).
              </p>
            </Card>
          ) : null;
        })()}

        {/* Card informative */}
        <Card variant="dark" className="mb-10 bg-gradient-to-br from-hearst-green/15 to-hearst-green/8 border-2 border-hearst-green/40 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-hearst-green/30 to-hearst-green/20 rounded-xl flex items-center justify-center border-2 border-hearst-green/50 shadow-lg">
              <svg className="w-8 h-8 text-hearst-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">📝 Gestion des Scénarios</h3>
              <p className="text-hearst-text-secondary text-base leading-relaxed mb-4">
                <strong className="text-white font-semibold">Créez et gérez plusieurs scénarios de configuration.</strong>
                <br />
                Chaque scénario contient un tableau éditable avec toutes les valeurs. Le scénario actif est utilisé dans toute l&apos;application (y compris la page Projection).
              </p>
              <p className="text-hearst-text-secondary text-base leading-relaxed">
                <strong className="text-white font-semibold">Actions :</strong> Cliquez sur le nom d&apos;un scénario pour le modifier, utilisez &quot;Activer&quot; pour le rendre actif, ou &quot;Supprimer&quot; pour le supprimer.
              </p>
            </div>
          </div>
        </Card>

        {/* Bouton pour créer un nouveau scénario */}
        <div className="mb-10">
          {!showNewScenarioForm ? (
            <button
              onClick={() => setShowNewScenarioForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-hearst-green to-hearst-green/90 text-white rounded-xl font-bold text-lg hover:from-hearst-green/90 hover:to-hearst-green/80 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-hearst-green/30 hover:shadow-xl hover:shadow-hearst-green/40 transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un Nouveau Scénario
            </button>
          ) : (
            <Card variant="dark" className="mb-6 shadow-xl">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateScenario();
                    } else if (e.key === "Escape") {
                      setShowNewScenarioForm(false);
                      setNewScenarioName("");
                    }
                  }}
                  placeholder="Nom du scénario (ex: Base Case, Optimiste, Pessimiste...)"
                  className="flex-1 px-6 py-4 bg-hearst-dark border-2 border-hearst-grey-100/30 rounded-xl text-white text-lg focus:border-hearst-green focus:outline-none focus:ring-2 focus:ring-hearst-green/50 transition-all"
                  autoFocus
                />
                <button
                  onClick={handleCreateScenario}
                  className="px-6 py-4 bg-gradient-to-r from-hearst-green to-hearst-green/90 text-white rounded-xl font-bold text-base hover:from-hearst-green/90 hover:to-hearst-green/80 transition-all shadow-lg shadow-hearst-green/30 hover:shadow-xl"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowNewScenarioForm(false);
                    setNewScenarioName("");
                  }}
                  className="px-6 py-4 bg-hearst-grey-200 text-white rounded-xl font-bold text-base hover:bg-hearst-grey-100 transition-all shadow-lg"
                >
                  Annuler
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Liste des scénarios */}
        {scenarios.length === 0 ? (
          <Card variant="dark" className="mb-10 shadow-xl">
            <div className="text-center py-16">
              <p className="text-hearst-text-secondary text-xl mb-4 font-medium">
                Aucun scénario créé pour le moment.
              </p>
              <p className="text-hearst-text-secondary text-base">
                Cliquez sur &quot;Créer un Nouveau Scénario&quot; pour commencer.
              </p>
            </div>
          </Card>
        ) : (
          scenarios.map((scenario) => (
            <ScenarioTable
              key={scenario.id}
              scenario={scenario}
              onUpdate={handleUpdateScenario}
              onDelete={handleDeleteScenario}
              isActive={activeSubScenarioId === scenario.id}
              onSetActive={handleSetActive}
            />
          ))
        )}
      </main>
    </div>
  );
}
