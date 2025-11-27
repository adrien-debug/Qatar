import { Calendar } from "lucide-react";

interface ReportHeaderProps {
  reportDate: string;
  scenarioName?: string | null;
}

export default function ReportHeader({ reportDate, scenarioName }: ReportHeaderProps) {
  return (
    <div className="pdf-avoid-break mb-8 print:mb-6">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-8 print:p-6 rounded-xl print:rounded-lg border-2 border-hearst-green/30 print:border-hearst-green/50">
        <div className="flex items-center justify-between mb-4 print:mb-3">
          <div>
            <h1 className="text-4xl print:text-3xl font-bold text-white mb-2 print:mb-1 uppercase tracking-tight">
              HEARST Solutions
            </h1>
            <h2 className="text-2xl print:text-xl font-semibold text-hearst-green uppercase tracking-wide">
              Qatar Financial Simulator
            </h2>
            <div className="mt-3 print:mt-2 text-sm print:text-xs text-gray-300">
              Rapport Financier – Projet Mining Qatar
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm print:text-xs text-gray-300 mb-2">
              <Calendar className="w-4 h-4 print:w-3 print:h-3" />
              <span>Date du rapport</span>
            </div>
            <div className="text-lg print:text-base font-semibold text-white">{reportDate}</div>
            {scenarioName && (
              <div className="mt-3 print:mt-2">
                <div className="text-xs print:text-[10px] text-gray-400 mb-1">Scénario</div>
                <div className="text-sm print:text-xs font-bold text-hearst-green">{scenarioName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



