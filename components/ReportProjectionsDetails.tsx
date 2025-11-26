import { BarChart3 } from "lucide-react";

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toFixed(decimals);
};

interface Projection {
  year: number;
  hearst: number;
  qatar: number;
  total: number;
  btcPrice: number;
  hearstMonthlyBTC?: number;
  qatarMonthlyBTC?: number;
  totalMonthlyBTC?: number;
  hearstRevenueMonthly?: number;
  qatarRevenueMonthly?: number;
  hearstOpexYearly?: number;
  qatarOpexYearly?: number;
  difficulty?: number;
}

interface ReportProjectionsDetailsProps {
  projections: Projection[];
}

export default function ReportProjectionsDetails({ projections }: ReportProjectionsDetailsProps) {
  return (
    <div className="pdf-avoid-break mb-6 print:mb-4">
      <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
        <h3 className="text-xl print:text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
          <BarChart3 className="w-5 h-5 print:w-4 print:h-4 text-hearst-green" />
          Détails des Projections
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs print:text-[9px]">
          <thead>
            <tr className="bg-gray-800 print:bg-gray-700 border-2 border-hearst-green/40 print:border-hearst-green/60">
              <th className="p-2 print:p-1.5 text-left font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Année</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Prix BTC</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Difficulté</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-hearst-green border border-hearst-green/30 print:border-hearst-green/50">BTC/Mois HEARST</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">BTC/Mois Qatar</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-hearst-green border border-hearst-green/30 print:border-hearst-green/50">Revenue/Mois HEARST</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Revenue/Mois Qatar</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-hearst-green border border-hearst-green/30 print:border-hearst-green/50">OPEX/An HEARST</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">OPEX/An Qatar</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-hearst-green border border-hearst-green/30 print:border-hearst-green/50">Profit/An HEARST</th>
              <th className="p-2 print:p-1.5 text-center font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Profit/An Qatar</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((proj, idx) => (
              <tr 
                key={idx} 
                className={`border border-gray-700 print:border-gray-600 ${idx % 2 === 0 ? "bg-gray-800/50 print:bg-gray-700/30" : "bg-gray-800 print:bg-gray-700/50"}`}
              >
                <td className="p-2 print:p-1.5 font-semibold text-white border border-gray-700 print:border-gray-600">
                  Année {proj.year}
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-gray-300 border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.btcPrice, 0)}k
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-gray-300 border border-gray-700 print:border-gray-600">
                  {safeToFixed(proj.difficulty || 0, 1)} T
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-hearst-green border border-gray-700 print:border-gray-600">
                  {safeToFixed(proj.hearstMonthlyBTC || 0, 4)}
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-white border border-gray-700 print:border-gray-600">
                  {safeToFixed(proj.qatarMonthlyBTC || 0, 4)}
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-hearst-green border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.hearstRevenueMonthly || 0, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-white border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.qatarRevenueMonthly || 0, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-hearst-green border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.hearstOpexYearly || 0, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-white border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.qatarOpexYearly || 0, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-hearst-green border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.hearst, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center font-semibold text-white border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.qatar, 2)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

