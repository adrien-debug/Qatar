"use client";

import {
  calculateDealA,
  calculateDealB,
  DealAInputs,
  DealBInputs,
  MiningParams,
  defaultMiningParams,
  defaultPhases,
  calculateOPEXMonthly,
  calculateCAPEX,
  defaultHardwareCosts,
} from "@/lib/financial-calculations";
import Card from "./Card";

export default function ComparisonTable() {
  const phase = defaultPhases[2]; // Phase 3 - 200MW
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, 3);
  const opexMonthly = calculateOPEXMonthly(phase.mw, 2.5, capex);
  const opexPerMW = opexMonthly / phase.mw;

  // Deal A at 20% revenue share
  const dealAInputs: DealAInputs = {
    phase: 3,
    mw: phase.mw,
    revenueSharePercent: 20,
    miningParams: defaultMiningParams,
    opexMonthly,
  };
  const dealAResult = calculateDealA(dealAInputs);

  // Deal B at 20% MW allocation
  const dealBInputs: DealBInputs = {
    phase: 3,
    totalMW: phase.mw,
    mwSharePercent: 20,
    miningParams: defaultMiningParams,
    opexPerMW,
  };
  const dealBResult = calculateDealB(dealBInputs);

  const comparison = [
    {
      metric: "HEARST Annual Profit",
      dealA: dealAResult.hearstNetProfit,
      dealB: dealBResult.hearstAnnualProfit,
      unit: "M$",
    },
    {
      metric: "Qatar Annual Profit",
      dealA: dealAResult.qatarNetProfit,
      dealB: dealBResult.qatarAnnualProfit,
      unit: "M$",
    },
    {
      metric: "Total Project Profit",
      dealA: dealAResult.hearstNetProfit + dealAResult.qatarNetProfit,
      dealB: dealBResult.hearstAnnualProfit + dealBResult.qatarAnnualProfit,
      unit: "M$",
    },
    {
      metric: "CAPEX Burden",
      dealA: "Qatar 100%",
      dealB: "Shared/Negotiable",
      unit: "",
    },
    {
      metric: "Electricity Risk",
      dealA: "Qatar bears",
      dealB: "Zero (HEARST allocation)",
      unit: "",
    },
    {
      metric: "ESG Impact",
      dealA: "Moderate",
      dealB: "Very High",
      unit: "",
    },
    {
      metric: "Sovereign BTC Accumulation",
      dealA: dealAResult.totalMonthlyBTC * 12,
      dealB: dealBResult.qatarMonthlyBTC * 12,
      unit: "BTC/year",
    },
  ];

  return (
    <Card className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-6 text-white">
        Comparaison Deal A vs Deal B
      </h3>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-hearst-grey-100">
            <th className="text-left py-3 px-4 font-semibold text-hearst-text">Metric</th>
            <th className="text-center py-3 px-4 font-semibold text-hearst-text">Deal A (20% Rev)</th>
            <th className="text-center py-3 px-4 font-semibold text-hearst-green">Deal B (20% MW)</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((row, index) => (
            <tr
              key={index}
              className="border-b border-hearst-grey-100 hover:bg-hearst-bg-hover transition-colors"
            >
              <td className="py-3 px-4 font-medium">{row.metric}</td>
              <td className="py-3 px-4 text-center">
                {typeof row.dealA === "number"
                  ? row.unit === "M$"
                    ? `${row.dealA >= 0 ? "+" : ""}$${(row.dealA / 1000000).toFixed(2)}M`
                    : row.unit === "BTC/year"
                    ? `${row.dealA.toFixed(2)} ${row.unit}`
                    : `${row.dealA >= 0 ? "+" : ""}${row.dealA.toFixed(2)}${row.unit}`
                  : row.dealA}
              </td>
              <td className="py-3 px-4 text-center text-hearst-green font-semibold">
                {typeof row.dealB === "number"
                  ? row.unit === "M$"
                    ? `${row.dealB >= 0 ? "+" : ""}$${(row.dealB / 1000000).toFixed(2)}M`
                    : row.unit === "BTC/year"
                    ? `${row.dealB.toFixed(2)} ${row.unit}`
                    : `${row.dealB >= 0 ? "+" : ""}${row.dealB.toFixed(2)}${row.unit}`
                  : row.dealB}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}



