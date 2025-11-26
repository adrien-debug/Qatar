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
import InputPanel from "@/components/InputPanel";
import PhaseSelector from "@/components/PhaseSelector";
import CalculationNotes from "@/components/CalculationNotes";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
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
      <SectionHeader
        title="Deal Model A"
        subtitle="Revenue-Based Share on Bitcoin Generated"
        variant="dark"
      />

      <PhaseSelector
        phases={defaultPhases}
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
      />

      <InputPanel miningParams={miningParams} onParamsChange={(p) => setMiningParams({ ...miningParams, ...p })} />

      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Revenue Share Percentage
        </label>
        <div className="flex gap-2 mb-4">
          {shareOptions.map((option) => (
            <Button
              key={option}
              onClick={() => setRevenueShare(option)}
              active={revenueShare === option}
              variant="secondary"
            >
              {option}%
            </Button>
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
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
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
        </Card>

        <Card>
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
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-hearst-text">Détails de Production</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">BTC Mensuel</div>
            <div className="text-xl font-semibold">{result.totalMonthlyBTC.toFixed(2)} BTC</div>
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
      </Card>

      <Card>
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
            <Bar dataKey="hearst" fill="#8afd81" name="HEARST" />
            <Bar dataKey="qatar" fill="#1A1A1A" name="Qatar" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <CalculationNotes dealType="A" />
    </div>
  );
}


