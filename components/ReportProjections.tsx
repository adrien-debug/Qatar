import { Calendar } from "lucide-react";
import { safeToFixed } from "@/lib/utils";

interface Projection {
  year: number;
  hearst: number;
  qatar: number;
  total: number;
  btcPrice: number;
}

interface ReportProjectionsProps {
  projections: Projection[];
}

export default function ReportProjections({ projections }: ReportProjectionsProps) {
  return (
    <div className="pdf-avoid-break mb-6 print:mb-4">
      <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg mb-3 print:mb-2">
        <h3 className="text-xl print:text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
          <Calendar className="w-5 h-5 print:w-4 print:h-4 text-hearst-green" />
          Projections sur 5 Ans
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 print:bg-gray-700 border-2 border-hearst-green/40 print:border-hearst-green/60">
              <th className="p-2 print:p-1.5 text-left text-xs print:text-[10px] font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Année</th>
              <th className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Prix BTC (k$)</th>
              <th className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-bold text-hearst-green border border-hearst-green/30 print:border-hearst-green/50">HEARST (M$)</th>
              <th className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Qatar (M$)</th>
              <th className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-bold text-white border border-hearst-green/30 print:border-hearst-green/50">Total (M$)</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((proj, idx) => (
              <tr 
                key={idx} 
                className={`border border-gray-700 print:border-gray-600 ${idx % 2 === 0 ? "bg-gray-800/50 print:bg-gray-700/30" : "bg-gray-800 print:bg-gray-700/50"}`}
              >
                <td className="p-2 print:p-1.5 text-xs print:text-[10px] font-semibold text-white border border-gray-700 print:border-gray-600">
                  Année {proj.year}
                </td>
                <td className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-semibold text-gray-300 border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.btcPrice, 0)}k
                </td>
                <td className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-semibold text-hearst-green border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.hearst, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-semibold text-white border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.qatar, 2)}M
                </td>
                <td className="p-2 print:p-1.5 text-center text-xs print:text-[10px] font-semibold text-white border border-gray-700 print:border-gray-600">
                  ${safeToFixed(proj.total, 2)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

