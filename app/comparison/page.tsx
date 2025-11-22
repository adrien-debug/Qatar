import Navigation from "@/components/Navigation";
import ComparisonTable from "@/components/ComparisonTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  calculateDealA,
  calculateDealB,
  DealAInputs,
  DealBInputs,
  defaultMiningParams,
  defaultPhases,
  calculateOPEXMonthly,
  calculateCAPEX,
  defaultHardwareCosts,
} from "@/lib/financial-calculations";

export default function ComparisonPage() {
  const phase = defaultPhases[2]; // Phase 3
  const capex = calculateCAPEX(phase.mw, defaultHardwareCosts, 3);
  const opexMonthly = calculateOPEXMonthly(phase.mw, 2.5, capex);
  const opexPerMW = opexMonthly / phase.mw;

  // Generate sensitivity data
  const btcPrices = [80000, 100000, 120000, 140000, 160000, 180000];
  const sensitivityData = btcPrices.map((price) => {
    const dealAInputs: DealAInputs = {
      phase: 3,
      mw: phase.mw,
      revenueSharePercent: 20,
      miningParams: { ...defaultMiningParams, btcPrice: price },
      opexMonthly,
    };
    const dealAResult = calculateDealA(dealAInputs);

    const dealBInputs: DealBInputs = {
      phase: 3,
      totalMW: phase.mw,
      mwSharePercent: 20,
      miningParams: { ...defaultMiningParams, btcPrice: price },
      opexPerMW,
    };
    const dealBResult = calculateDealB(dealBInputs);

    return {
      btcPrice: `$${(price / 1000).toFixed(0)}k`,
      dealA: (dealAResult.hearstNetProfit + dealAResult.qatarNetProfit) / 1000000,
      dealB: (dealBResult.hearstAnnualProfit + dealBResult.qatarAnnualProfit) / 1000000,
    };
  });

  return (
    <div className="min-h-screen bg-hearst-light">
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-hearst-text">
            Deal Comparison Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive comparison of Deal A and Deal B models
          </p>
        </div>

        <ComparisonTable />

        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-hearst-text">
            BTC Price Sensitivity Analysis
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sensitivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="btcPrice" />
              <YAxis label={{ value: "Total Profit (M$)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}M`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="dealA"
                stroke="#1A1A1A"
                strokeWidth={2}
                name="Deal A (20% Rev)"
              />
              <Line
                type="monotone"
                dataKey="dealB"
                stroke="#A3FF8B"
                strokeWidth={2}
                name="Deal B (20% MW)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-hearst-text">Deal A Advantages</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>Maximum BTC accumulation for Qatar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>Simple revenue model</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>High sovereign asset growth</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Considerations</div>
              <ul className="space-y-1 text-sm text-gray-700 mt-2">
                <li>• Qatar bears all operational costs</li>
                <li>• HEARST profitability depends on fee structure</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-hearst-text">Deal B Advantages</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>HEARST achieves profitability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>Energy resale optionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>Strong ESG narrative</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hearst-green mt-1">✓</span>
                <span>Aligned long-term incentives</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Optimal Range</div>
              <div className="text-lg font-semibold text-hearst-green mt-2">
                15-20% MW allocation
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


