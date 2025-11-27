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
    <Card variant="dark" className={`mb-8 ${isActive ? 'border-2 border-hearst-green' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
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
              className="text-2xl font-bold text-white bg-hearst-dark border border-hearst-green rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-hearst-green"
              autoFocus
            />
          ) : (
            <h2 
              className="text-2xl font-bold text-white cursor-pointer hover:text-hearst-green transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Cliquez pour modifier le nom"
            >
              {scenario.name}
            </h2>
          )}
          {isActive && (
            <span className="px-3 py-1 bg-hearst-green/20 text-hearst-green rounded-full text-xs font-semibold border border-hearst-green/50">
              Scénario Actif
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isActive && (
            <button
              onClick={() => onSetActive(scenario.id)}
              className="px-4 py-2 bg-hearst-green text-white rounded-lg font-semibold text-sm hover:bg-hearst-green/80 transition-all"
            >
              Activer
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-all"
          >
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-hearst-dark z-10">
            <tr className="border-b border-hearst-grey-100/30">
              <th className="text-left py-4 px-4 text-white font-semibold">Label</th>
              <th className="text-left py-4 px-4 text-white font-semibold">Chemin</th>
              <th className="text-left py-4 px-4 text-white font-semibold">Valeur (éditable)</th>
              <th className="text-left py-4 px-4 text-white font-semibold">Valeur formatée</th>
              <th className="text-left py-4 px-4 text-white font-semibold">Card</th>
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
                <tr key={item.path} className="border-b border-hearst-grey-100/20 hover:bg-hearst-grey-100/10">
                  <td className="py-4 px-4 text-white font-medium">{item.label}</td>
                  <td className="py-4 px-4 text-hearst-text-secondary text-xs font-mono">
                    baseSetup.{item.path}
                  </td>
                  <td className="py-4 px-4">
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
                      className="w-full px-3 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded text-white text-sm focus:border-hearst-green focus:outline-none"
                      style={{ minWidth: '120px' }}
                    />
                  </td>
                  <td className="py-4 px-4 text-white font-semibold">
                    {(() => {
                      const numValue = parseFloat(inputValue);
                      if (!isNaN(numValue) && inputValue !== "" && inputValue !== "-") {
                        return item.formatter(numValue);
                      }
                      return item.formatter(rawValue);
                    })()}
                  </td>
                  <td className="py-4 px-4 text-hearst-text-secondary">
                    {item.currentCard}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {hasChanges && (
        <div className="mt-6 p-4 bg-hearst-green/20 border border-hearst-green/50 rounded-lg">
          <p className="text-white text-sm font-semibold mb-2">
            ✅ Modifications sauvegardées
          </p>
          <p className="text-hearst-text-secondary text-xs">
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
      
      <main className="pt-4 p-8 overflow-y-auto min-h-screen mx-[200px]">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Setup
          </h1>
          <p className="text-hearst-text-secondary text-lg">
            Gestion des Scénarios
          </p>
        </div>

        {/* Section Scénario de Base Toujours Actif */}
        <Card variant="dark" className="mb-8 bg-gradient-to-br from-hearst-blue/20 to-hearst-blue/10 border-2 border-hearst-blue/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-hearst-blue rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">
                Scénario de Base (Toujours Actif)
              </h2>
            </div>
            <span className="px-4 py-2 bg-hearst-blue/30 text-hearst-blue rounded-full text-sm font-semibold border border-hearst-blue/50">
              Toujours Actif
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Power MW */}
            <div className="p-4 bg-hearst-dark/50 rounded-lg border border-hearst-blue/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wide">
                  Total Power
                </span>
                <span className="text-2xl font-bold text-hearst-blue">
                  {setup.projectData.totalPowerMw} MW
                </span>
              </div>
              <p className="text-hearst-text-secondary text-xs mt-2">
                Valeur fixe : 200 MW
              </p>
            </div>
            
            {/* Share SPV */}
            <div className="p-4 bg-hearst-dark/50 rounded-lg border border-hearst-blue/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wide">
                  Share SPV
                </span>
                <span className="text-2xl font-bold text-hearst-blue">
                  {setup.parameters.shareSpvPercent}%
                </span>
              </div>
              <p className="text-hearst-text-secondary text-xs mt-2">
                Modifiable depuis la page <strong className="text-white">Projection</strong> via les sliders
              </p>
            </div>
            
            {/* Share Electricity */}
            <div className="p-4 bg-hearst-dark/50 rounded-lg border border-hearst-blue/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-hearst-text-secondary text-sm uppercase tracking-wide">
                  Share Electricity
                </span>
                <span className="text-2xl font-bold text-hearst-blue">
                  {setup.parameters.shareElectricityPercent}%
                </span>
              </div>
              <p className="text-hearst-text-secondary text-xs mt-2">
                Modifiable depuis la page <strong className="text-white">Projection</strong> via les sliders
              </p>
            </div>
          </div>
        </Card>

        {/* Section Sous-Scénario Sélectionné */}
        {activeSubScenarioId && (() => {
          const activeSubScenario = getScenarioById(activeSubScenarioId);
          return activeSubScenario ? (
            <Card variant="dark" className="mb-8 bg-gradient-to-br from-hearst-green/20 to-hearst-green/10 border-2 border-hearst-green/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-hearst-green rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-white">
                    Sous-Scénario Sélectionné : {activeSubScenario.name}
                  </h2>
                </div>
                <span className="px-4 py-2 bg-hearst-green/30 text-hearst-green rounded-full text-sm font-semibold border border-hearst-green/50">
                  Utilisé dans Projection
                </span>
              </div>
              
              <p className="text-hearst-text-secondary text-sm mb-4">
                Ce sous-scénario contient les données des tableaux éditables ci-dessous. 
                Les valeurs sont fusionnées avec le scénario de base (200 MW, SPV, Electricity).
              </p>
            </Card>
          ) : null;
        })()}

        {/* Card informative */}
        <Card variant="dark" className="mb-8 bg-gradient-to-br from-hearst-green/10 to-hearst-green/5 border-2 border-hearst-green/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50">
              <svg className="w-6 h-6 text-hearst-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">📝 Gestion des Scénarios</h3>
              <p className="text-hearst-text-secondary text-sm leading-relaxed mb-3">
                <strong className="text-white">Créez et gérez plusieurs scénarios de configuration.</strong>
                <br />
                Chaque scénario contient un tableau éditable avec toutes les valeurs. Le scénario actif est utilisé dans toute l&apos;application (y compris la page Projection).
              </p>
              <p className="text-hearst-text-secondary text-sm leading-relaxed">
                <strong className="text-white">Actions :</strong> Cliquez sur le nom d&apos;un scénario pour le modifier, utilisez &quot;Activer&quot; pour le rendre actif, ou &quot;Supprimer&quot; pour le supprimer.
              </p>
            </div>
          </div>
        </Card>

        {/* Bouton pour créer un nouveau scénario */}
        <div className="mb-8">
          {!showNewScenarioForm ? (
            <button
              onClick={() => setShowNewScenarioForm(true)}
              className="px-6 py-3 bg-hearst-green text-white rounded-lg font-semibold text-base hover:bg-hearst-green/80 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un Nouveau Scénario
            </button>
          ) : (
            <Card variant="dark" className="mb-4">
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
                  className="flex-1 px-4 py-2 bg-hearst-dark border border-hearst-grey-100/30 rounded text-white focus:border-hearst-green focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateScenario}
                  className="px-4 py-2 bg-hearst-green text-white rounded-lg font-semibold text-sm hover:bg-hearst-green/80 transition-all"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowNewScenarioForm(false);
                    setNewScenarioName("");
                  }}
                  className="px-4 py-2 bg-hearst-grey-200 text-white rounded-lg font-semibold text-sm hover:bg-hearst-grey-100 transition-all"
                >
                  Annuler
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Liste des scénarios */}
        {scenarios.length === 0 ? (
          <Card variant="dark" className="mb-8">
            <div className="text-center py-12">
              <p className="text-hearst-text-secondary text-lg mb-4">
                Aucun scénario créé pour le moment.
              </p>
              <p className="text-hearst-text-secondary text-sm">
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
