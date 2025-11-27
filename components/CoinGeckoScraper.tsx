"use client";

import { useState } from "react";
import { Scenario } from "./ScenarioManager";
import { Download, Loader2, CheckCircle } from "lucide-react";
import Card from "./Card";

interface CoinGeckoScraperProps {
  onScenarioCreated: (scenario: Scenario) => void;
}

export default function CoinGeckoScraper({ onScenarioCreated }: CoinGeckoScraperProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBitcoinData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Récupérer le prix Bitcoin depuis CoinGecko
      const priceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
      );
      const priceData = await priceResponse.json();
      const btcPrice = priceData.bitcoin?.usd || 0;

      // 2. Récupérer les données détaillées Bitcoin (difficulté, hashrate, etc.)
      // Note: CoinGecko ne fournit pas directement la difficulté, on utilise une API alternative
      const statsResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true"
      );
      const statsData = await statsResponse.json();

      // 3. Récupérer la difficulté et le hashrate depuis blockchain.info (API publique)
      let networkDifficulty = 0;
      let totalHashrate = 0;
      let blockReward = 3.125; // Block reward actuel (halving 2024)

      try {
        const blockchainResponse = await fetch("https://blockchain.info/stats?format=json");
        const blockchainData = await blockchainResponse.json();
        
        // Difficulté en TeraHash (convertir depuis la valeur brute)
        networkDifficulty = blockchainData.difficulty / 1e12; // Convertir en T
        totalHashrate = blockchainData.hash_rate / 1e15; // Convertir en PH
      } catch (e) {
        console.warn("Blockchain.info API failed, using fallback values");
        // Valeurs de fallback basées sur les données récentes (janvier 2024)
        networkDifficulty = 81.73; // T (approximatif)
        totalHashrate = 500; // PH (approximatif)
      }

      // 4. Paramètres par défaut réalistes pour un scénario
      const scenario: Scenario = {
        id: `coingecko-${Date.now()}`,
        name: `Scénario CoinGecko - ${new Date().toLocaleDateString("fr-FR")}`,
        minerType: "Antminer S21",
        powerConsumption: 3550, // W/TH pour Antminer S21
        hashratePerMW: 3.5, // PH par MW (réaliste)
        uptime: 98.5, // Pourcentage d'uptime
        btcPrice: btcPrice,
        networkDifficulty: networkDifficulty,
        totalHashrate: totalHashrate,
        blockReward: blockReward, // 3.125 BTC après halving 2024
        poolFee: 0.8, // 0.8% pool fee standard
        // Paramètres Hardware
        hardwarePrice: 1500, // Prix moyen par unité ($)
        lifespan: 5, // Durée de vie en années
        // Paramètres OPEX
        energyRate: 2.5, // cents/kWh (taux Qatar)
        maintenancePercent: 2, // % du CAPEX
        fixedCostsBase: 75000, // Coûts fixes de base
        fixedCostsPerMW: 1000, // Coûts fixes par MW
      };

      // Appeler la fonction callback pour créer le scénario
      onScenarioCreated(scenario);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error fetching Bitcoin data:", err);
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Scénario depuis CoinGecko</h3>
          <p className="text-sm text-hearst-text-secondary">
            Récupère automatiquement les données Bitcoin actuelles depuis CoinGecko et crée un scénario
          </p>
        </div>
        <button
          onClick={fetchBitcoinData}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-hearst-bg-tertiary text-gray-400 cursor-not-allowed"
              : success
              ? "bg-green-600 text-white"
              : "bg-hearst-green text-black hover:opacity-90"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Chargement...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Créé !
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Créer depuis CoinGecko
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
          <p className="text-sm text-green-400">
            Scénario créé avec succès ! Les données Bitcoin actuelles ont été importées.
          </p>
        </div>
      )}
    </Card>
  );
}




