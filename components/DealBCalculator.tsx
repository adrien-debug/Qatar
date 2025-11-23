"use client";

import { useState } from "react";
import {
  calculateDealB,
  DealBInputs,
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DealBCalculator() {
  const [selectedPhase, setSelectedPhase] = useState(3);
  const [mwShare, setMwShare] = useState(20);
  const [miningParams, setMiningParams] = useState<MiningParams>(defaultMiningParams);

  const phase = defaultPhases[selectedPhase - 1];
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, selectedPhase);
  // Calculate OPEX per MW: total OPEX for phase divided by MW
  const totalOpexMonthly = calculateOPEXMonthly(phase.mw, 2.5, capex);
  const opexPerMW = totalOpexMonthly / phase.mw;

  const inputs: DealBInputs = {
    phase: selectedPhase,
    totalMW: phase.mw,
    mwSharePercent: mwShare,
    miningParams,
    opexPerMW,
  };

  const result = calculateDealB(inputs);

  const shareOptions = [10, 15, 20, 25];
  const comparisonData = shareOptions.map((share) => {
    const testInputs = { ...inputs, mwSharePercent: share };
    const testResult = calculateDealB(testInputs);
    return {
      share: `${share}%`,
      hearst: testResult.hearstAnnualProfit / 1000000,
      qatar: testResult.qatarAnnualProfit / 1000000,
    };
  });

  const pieData = [
    { name: "HEARST", value: result.hearstMW, color: "#A3FF8B" },
    { name: "Qatar", value: result.qatarMW, color: "#1A1A1A" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Deal Model B"
        subtitle="Megawatt Allocation with Zero-Cost Electricity"
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
          MW Allocation Percentage
        </label>
        <div className="flex gap-2 mb-4">
          {shareOptions.map((option) => (
            <Button
              key={option}
              onClick={() => setMwShare(option)}
              active={mwShare === option}
              variant="secondary"
            >
              {option}%
            </Button>
          ))}
        </div>
        <input
          type="range"
          min="10"
          max="25"
          step="5"
          value={mwShare}
          onChange={(e) => setMwShare(parseInt(e.target.value))}
          className="w-full"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">HEARST Allocation</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Capacity</div>
              <div className="text-2xl font-bold text-hearst-green">
                {result.hearstMW.toFixed(1)} MW
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Electricity Cost</div>
              <div className="text-2xl font-bold text-green-600">
                ${result.hearstElectricityCost.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">BTC Mensuel</div>
              <div className="text-xl font-semibold">
                {result.hearstMonthlyBTC.toFixed(2)} BTC
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">Profit Annuel</div>
              <div className="text-2xl font-bold text-hearst-green">
                ${(result.hearstAnnualProfit / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">Qatar Allocation</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Capacity</div>
              <div className="text-2xl font-bold">
                {result.qatarMW.toFixed(1)} MW
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Electricity Cost</div>
              <div className="text-xl font-semibold text-red-600">
                ${(result.qatarElectricityCost / 1000).toFixed(0)}K/mois
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">BTC Mensuel</div>
              <div className="text-xl font-semibold">
                {result.qatarMonthlyBTC.toFixed(2)} BTC
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">Profit Annuel</div>
              <div className="text-2xl font-bold">
                ${(result.qatarAnnualProfit / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">Allocation de Capacité</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-hearst-text">Option de Revente Énergie</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Revente à 5.5¢/kWh</div>
              <div className="text-xl font-semibold text-hearst-green">
                ${((result.resaleRevenue || 0) / 1000000).toFixed(2)}M/an
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">vs Mining Revenue</div>
              <div className="text-lg">
                ${(result.qatarMonthlyRevenue * 12 / 1000000).toFixed(2)}M/an
              </div>
            </div>
            <div className="pt-3 border-t text-sm text-gray-600">
              Qatar peut choisir de revendre la capacité allouée à HEARST 
              au lieu de miner, générant un cash flow stable.
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-hearst-text">
          Comparaison par MW Share
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="share" />
            <YAxis label={{ value: "Profit (M$)", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}M`} />
            <Legend />
            <Bar dataKey="hearst" fill="#A3FF8B" name="HEARST" />
            <Bar dataKey="qatar" fill="#1A1A1A" name="Qatar" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <CalculationNotes dealType="B" />
    </div>
  );
}


