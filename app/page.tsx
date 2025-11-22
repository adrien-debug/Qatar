import Navigation from "@/components/Navigation";
import ComparisonTable from "@/components/ComparisonTable";
import { defaultMiningParams, defaultPhases } from "@/lib/financial-calculations";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-hearst-light">
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-hearst-text">
            Qatar Financial Simulator
          </h1>
          <p className="text-xl text-gray-600">
            Dynamic financial modeling platform for Bitcoin mining partnership
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/deal-a" className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-hearst-green rounded-lg flex items-center justify-center text-2xl font-bold">
                A
              </div>
              <h2 className="text-2xl font-semibold">Deal Model A</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Revenue-based share on Bitcoin generated. HEARST receives a percentage of mining revenue.
            </p>
            <div className="text-sm text-hearst-green font-medium">Explore Model A →</div>
          </Link>

          <Link href="/deal-b" className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl font-bold text-hearst-green">
                B
              </div>
              <h2 className="text-2xl font-semibold">Deal Model B</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Megawatt allocation with zero-cost electricity. HEARST receives capacity allocation for own operations.
            </p>
            <div className="text-sm text-hearst-green font-medium">Explore Model B →</div>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-hearst-text">Quick Comparison</h2>
          <ComparisonTable />
        </div>

        <div className="bg-black text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Key Assumptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-hearst-green font-semibold mb-2">Phased Deployment</div>
              <div className="text-gray-300">25MW → 100MW → 200MW</div>
            </div>
            <div>
              <div className="text-hearst-green font-semibold mb-2">Energy Cost</div>
              <div className="text-gray-300">2.5 ¢/kWh (Qatar rate)</div>
            </div>
            <div>
              <div className="text-hearst-green font-semibold mb-2">BTC Price</div>
              <div className="text-gray-300">${defaultMiningParams.btcPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


