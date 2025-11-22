"use client";

import { useState } from "react";
import {
  calculateDealA,
  DealAInputs,
  MiningParams,
  defaultMiningParams,
  defaultPhases,
  calculateOPEXMonthly,
  calculateCAPEX,
  defaultHardwareCosts,
} from "@/lib/financial-calculations";
import InputPanel from "./InputPanel";
import PhaseSelector from "./PhaseSelector";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DealACalculator() {
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [revenueShare, setRevenueShare] = useState(20);
  const [miningParams, setMiningParams] = useState<MiningParams>(defaultMiningParams);

  const phase = defaultPhases[selectedPhase - 1];
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, selectedPhase);
  const opexMonthly = calculateOPEXMonthly(phase.mw, 2.5, capex);

  const inputs: DealAInputs = {
    phase: selectedPhase,
    mw: phase.mw,
    revenueSharePercent: revenueShare,
    miningParams,
    opexMonthly,
  };

  const result = calculateDealA(inputs);

  const shareOptions = [5, 10, 15, 20, 30];
  const comparisonData = shareOptions.map((share) => {
    const testInputs = { ...inputs, revenueSharePercent: share };
    const testResult = calculateDealA(testInputs);
    return {
      share: `${share}%`,
      hearst: testResult.hearstAnnual / 1000000,
      qatar: testResult.qatarAnnual / 1000000,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-black text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Deal Model A</h2>
        <p className="text-gray-300">Revenue-Based Share on Bitcoin Generated</p>
      </div>

      <PhaseSelector
        phases={defaultPhases}
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
      />

      <InputPanel miningParams={miningParams} onParamsChange={(p) => setMiningParams({ ...miningParams, ...p })} />

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Revenue Share Percentage
        </label>
        <div className="flex gap-2 mb-4">
          {shareOptions.map((option) => (
            <button
              key={option}
              onClick={() => setRevenueShare(option)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                revenueShare === option
                  ? "bg-hearst-green text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}%
            </button>
          ))}
        </div>
        <input
          type="range"
          min="5"
          max="30"
          step="5"
          value={revenueShare}
          onChange={(e) => setRevenueShare(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">HEARST Revenue</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Mensuel</div>
              <div className="text-2xl font-bold text-hearst-green">
                ${(result.hearstRevenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Annuel</div>
              <div className="text-2xl font-bold text-hearst-green">
                ${(result.hearstAnnual / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">Net Profit</div>
              <div className={`text-xl font-semibold ${result.hearstNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${(result.hearstNetProfit / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">Qatar Revenue</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Mensuel</div>
              <div className="text-2xl font-bold">
                ${(result.qatarRevenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Annuel</div>
              <div className="text-2xl font-bold">
                ${(result.qatarAnnual / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">Net Profit</div>
              <div className={`text-xl font-semibold ${result.qatarNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${(result.qatarNetProfit / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-hearst-text">Détails de Production</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">BTC Mensuel</div>
            <div className="text-xl font-semibold">{result.monthlyBTC.toFixed(2)} BTC</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Revenue Total Mensuel</div>
            <div className="text-xl font-semibold">
              ${(result.monthlyRevenue / 1000).toFixed(0)}K
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">OPEX Annuel</div>
            <div className="text-xl font-semibold text-red-600">
              ${(result.opexAnnual / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-hearst-text">
          Comparaison par Revenue Share
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="share" />
            <YAxis label={{ value: "Revenue (M$)", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}M`} />
            <Legend />
            <Bar dataKey="hearst" fill="#A3FF8B" name="HEARST" />
            <Bar dataKey="qatar" fill="#1A1A1A" name="Qatar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


