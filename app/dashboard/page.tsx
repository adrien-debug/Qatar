"use client";

import { useState } from "react";
import { 
  Pickaxe, 
  Bitcoin as BitcoinIcon, 
  Waves, 
  BookOpen, 
  FileText, 
  Receipt,
  ArrowUp,
  Calendar,
  ChevronDown,
  User
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("bitcoin");
  const [performanceType, setPerformanceType] = useState<"with" | "without">("with");

  // Données exactes de l'image
  const miningOperations = {
    yesterday: { btc: "0.000000", usd: "0" },
    past7days: { btc: "0.005347", usd: "479" },
    past30days: { btc: "0.026342", usd: "2,360" }
  };

  const performanceData = [
    { month: "Sep", value: 5.5 },
    { month: "Oct", value: 4.8 },
  ];

  const performanceWithCollateral = {
    pastMonth: { value: "4.68", period: "October 2025" },
    dateRange: { value: "9.91", period: "September 2025 – October 2025" }
  };

  const performanceWithoutCollateral = {
    pastMonth: { value: "4.68", period: "October 2025" },
    dateRange: { value: "9.85", period: "September 2025 – October 2025" }
  };

  const transactionHistory = [
    { date: "2025-11-25", hashrate: "2.39 PH/s", earnings: "0.000982 BTC" },
    { date: "2025-11-24", hashrate: "1.21 PH/s", earnings: "0.000497 BTC" },
    { date: "2025-11-23", hashrate: "1.95 PH/s", earnings: "0.000801 BTC" },
  ];

  return (
    <div className="min-h-screen bg-[#050607] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111315] border-r border-[#1a1d22]/50 p-6 space-y-1.5">
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "mining" 
              ? "bg-[#7CFF5A]/15 text-[#7CFF5A] shadow-sm shadow-[#7CFF5A]/10" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("mining")}
        >
          <Pickaxe className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">Mining</span>
        </div>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "bitcoin" 
              ? "bg-[#7CFF5A] text-black font-bold shadow-lg shadow-[#7CFF5A]/30" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("bitcoin")}
        >
          <BitcoinIcon className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">Bitcoin</span>
        </div>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "defi" 
              ? "bg-[#7CFF5A]/15 text-[#7CFF5A] shadow-sm shadow-[#7CFF5A]/10" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("defi")}
        >
          <Waves className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">DeFi</span>
        </div>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "legal" 
              ? "bg-[#7CFF5A]/15 text-[#7CFF5A] shadow-sm shadow-[#7CFF5A]/10" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("legal")}
        >
          <BookOpen className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">Legal & Invoicing</span>
        </div>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "contracts" 
              ? "bg-[#7CFF5A]/15 text-[#7CFF5A] shadow-sm shadow-[#7CFF5A]/10" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("contracts")}
        >
          <FileText className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">Contracts</span>
        </div>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
            activeTab === "invoices" 
              ? "bg-[#7CFF5A]/15 text-[#7CFF5A] shadow-sm shadow-[#7CFF5A]/10" 
              : "text-gray-400 hover:text-white hover:bg-[#15181d]"
          }`}
          onClick={() => setActiveTab("invoices")}
        >
          <Receipt className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-sm">Invoices</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-[#111315] border-b border-[#1a1d22]/50 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-[#7CFF5A] text-black rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#7CFF5A]/20 hover:shadow-xl hover:shadow-[#7CFF5A]/30 transition-all duration-200">
              <BitcoinIcon className="w-4 h-4" strokeWidth={2.5} />
              Bitcoin
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-[#7CFF5A] text-black rounded-xl font-bold text-sm shadow-lg shadow-[#7CFF5A]/20 hover:shadow-xl hover:shadow-[#7CFF5A]/30 transition-all duration-200">
              Show details
            </button>
            <div className="w-10 h-10 bg-[#15181d] rounded-full flex items-center justify-center border border-[#1a1d22]/50 hover:border-[#7CFF5A]/30 transition-all duration-200 cursor-pointer">
              <User className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Mining Operations Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Mining operations</h2>
            <div className="grid grid-cols-3 gap-6">
              {/* Yesterday */}
              <div className="bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl hover:shadow-[#7CFF5A]/5 hover:border-[#7CFF5A]/30 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-4 font-medium">Yesterday</div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-5 h-5 text-[#7CFF5A]" strokeWidth={2.5} />
                  <span className="text-2xl font-bold text-white tracking-tight">+{miningOperations.yesterday.btc} BTC</span>
                </div>
                <div className="text-lg text-gray-400 font-medium">+${miningOperations.yesterday.usd} USD</div>
              </div>

              {/* Past 7 days */}
              <div className="bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl hover:shadow-[#7CFF5A]/5 hover:border-[#7CFF5A]/30 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-4 font-medium">Past 7 days</div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-5 h-5 text-[#7CFF5A]" strokeWidth={2.5} />
                  <span className="text-2xl font-bold text-white tracking-tight">+{miningOperations.past7days.btc} BTC</span>
                </div>
                <div className="text-lg text-gray-400 font-medium">+${miningOperations.past7days.usd} USD</div>
              </div>

              {/* Past 30 days */}
              <div className="bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl hover:shadow-[#7CFF5A]/5 hover:border-[#7CFF5A]/30 transition-all duration-300">
                <div className="text-sm text-gray-400 mb-4 font-medium">Past 30 days</div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-5 h-5 text-[#7CFF5A]" strokeWidth={2.5} />
                  <span className="text-2xl font-bold text-white tracking-tight">+{miningOperations.past30days.btc} BTC</span>
                </div>
                <div className="text-lg text-gray-400 font-medium">+${miningOperations.past30days.usd} USD</div>
              </div>
            </div>
          </section>

          {/* Performance Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Performance</h2>
            <div className="grid grid-cols-3 gap-6">
              {/* Graph */}
              <div className="col-span-2 bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-4 font-medium">Dollar yield strategy:</div>
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setPerformanceType("with")}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        performanceType === "with"
                          ? "bg-[#7CFF5A] text-black shadow-lg shadow-[#7CFF5A]/20"
                          : "bg-[#15181d] text-gray-400 border border-[#1a1d22]/50 hover:border-[#7CFF5A]/30 hover:text-white"
                      }`}
                    >
                      Performance with collateral
                    </button>
                    <button
                      onClick={() => setPerformanceType("without")}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        performanceType === "without"
                          ? "bg-[#7CFF5A] text-black shadow-lg shadow-[#7CFF5A]/20"
                          : "bg-[#15181d] text-gray-400 border border-[#1a1d22]/50 hover:border-[#7CFF5A]/30 hover:text-white"
                      }`}
                    >
                      Performance without collateral
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span className="font-medium">November 27, 2024 – November 27, 2025</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7CFF5A" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#7CFF5A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1d22" />
                      <XAxis dataKey="month" stroke="#666" tick={{ fill: '#999' }} />
                      <YAxis stroke="#666" domain={[0, 6]} tick={{ fill: '#999' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111315', 
                          border: '1px solid #1a1d22', 
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#7CFF5A" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorGreen)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Cards */}
              <div className="space-y-4">
                {/* Performance With Collateral */}
                <div className="bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl hover:border-[#7CFF5A]/20 transition-all duration-300">
                  <div className="text-sm text-gray-400 mb-4 font-medium">Performance With Collateral</div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-1 tracking-tight">+{performanceWithCollateral.pastMonth.value}%</div>
                    <div className="text-xs text-gray-500 font-medium">{performanceWithCollateral.pastMonth.period}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1 tracking-tight">+{performanceWithCollateral.dateRange.value}%</div>
                    <div className="text-xs text-gray-500 font-medium">{performanceWithCollateral.dateRange.period}</div>
                  </div>
                </div>

                {/* Performance Without Collateral */}
                <div className="bg-[#111315] rounded-2xl p-6 border border-[#1a1d22]/50 shadow-lg hover:shadow-xl hover:border-[#7CFF5A]/20 transition-all duration-300">
                  <div className="text-sm text-gray-400 mb-4 font-medium">Performance Without Collateral</div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-1 tracking-tight">+{performanceWithoutCollateral.pastMonth.value}%</div>
                    <div className="text-xs text-gray-500 font-medium">{performanceWithoutCollateral.pastMonth.period}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1 tracking-tight">+{performanceWithoutCollateral.dateRange.value}%</div>
                    <div className="text-xs text-gray-500 font-medium">{performanceWithoutCollateral.dateRange.period}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transaction History Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Transaction history</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select className="bg-[#111315] border border-[#1a1d22]/50 rounded-xl px-4 py-2.5 text-white text-sm appearance-none pr-8 focus:border-[#7CFF5A]/50 focus:outline-none transition-all duration-200 hover:border-[#7CFF5A]/30 cursor-pointer">
                    <option>Contract: MP01</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                </div>
                <button className="px-6 py-2.5 bg-[#7CFF5A] text-black rounded-xl font-bold text-sm shadow-lg shadow-[#7CFF5A]/20 hover:shadow-xl hover:shadow-[#7CFF5A]/30 transition-all duration-200">
                  Show details
                </button>
              </div>
            </div>
            <div className="bg-[#111315] rounded-2xl border border-[#1a1d22]/50 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1d22]/50 bg-[#15181d]/30">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">Earnings Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">Daily Hashrate</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">Earnings BTC</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((transaction, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-[#1a1d22]/30 last:border-b-0 hover:bg-[#15181d]/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-white font-medium">{transaction.date}</td>
                      <td className="py-4 px-6 text-white">{transaction.hashrate}</td>
                      <td className="py-4 px-6 text-white">{transaction.earnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

