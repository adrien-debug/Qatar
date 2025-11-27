import { BarChart3, Zap } from "lucide-react";
import { safeToFixed, formatCurrency } from "@/lib/utils";

interface ReportSummaryProps {
  dealType: "revenue" | "mw";
  revenueShare?: number;
  mwAllocated?: number;
  selectedPhase: number;
  phaseMW: number;
  phaseTimeline: string;
  capex: number;
}

export default function ReportSummary({
  dealType,
  revenueShare,
  mwAllocated,
  selectedPhase,
  phaseMW,
  phaseTimeline,
  capex,
}: ReportSummaryProps) {
  return (
    <div className="pdf-avoid-break mb-8 print:mb-6">
      <h3 className="text-2xl print:text-xl font-bold text-white mb-4 print:mb-3 flex items-center gap-2 uppercase tracking-wide">
        <BarChart3 className="w-6 h-6 print:w-5 print:h-5 text-hearst-green" />
        Résumé Exécutif
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:gap-2">
        {/* Type de Deal */}
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg">
          <div className="text-xs print:text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Type de Deal</div>
          <div className="text-lg print:text-base font-bold text-white">
            {dealType === "revenue" ? "Revenue Share" : "MW Allocation"}
          </div>
          {dealType === "revenue" && revenueShare && (
            <div className="text-xs print:text-[10px] mt-1 text-hearst-green font-semibold">
              {revenueShare}% de part de revenus
            </div>
          )}
          {dealType === "mw" && mwAllocated && (
            <div className="text-xs print:text-[10px] mt-1 text-hearst-green font-semibold">
              {mwAllocated}% d&apos;allocation MW
            </div>
          )}
        </div>

        {/* Phase */}
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg">
          <div className="text-xs print:text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Phase</div>
          <div className="text-lg print:text-base font-bold text-white">
            Phase {selectedPhase} - {phaseMW} MW
          </div>
          <div className="text-xs print:text-[10px] mt-1 text-gray-400">
            {phaseTimeline}
          </div>
        </div>

        {/* CAPEX Total */}
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg">
          <div className="text-xs print:text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide">CAPEX Total</div>
          <div className="text-lg print:text-base font-bold text-white">
            {formatCurrency(capex)}
          </div>
        </div>

        {/* MW Alloués / Restants */}
        <div className="bg-gray-900 print:bg-gray-800 border-2 border-hearst-green/40 print:border-hearst-green/60 p-4 print:p-3 rounded-lg">
          <div className="text-xs print:text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
            <Zap className="w-3 h-3 print:w-2 print:h-2" />
            MW Total
          </div>
          <div className="text-lg print:text-base font-bold text-white">{phaseMW} MW</div>
        </div>
      </div>
    </div>
  );
}

