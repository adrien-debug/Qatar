interface ReportFooterProps {
  reportDate: string;
}

export default function ReportFooter({ reportDate }: ReportFooterProps) {
  return (
    <div className="mt-8 print:mt-6 pt-6 print:pt-4 border-t-2 border-hearst-green/40 print:border-hearst-green/60 pdf-avoid-break">
      <div className="text-center">
        <div className="mb-3 print:mb-2">
          <div className="text-xl print:text-lg font-bold text-white mb-1">HEARST</div>
          <div className="text-lg print:text-base font-semibold text-hearst-green">Solutions</div>
        </div>
        <div className="text-xs print:text-[10px] text-gray-400">
          <p className="mb-1">Rapport généré le {reportDate}</p>
          <p>Projet Mining Qatar – Simulation Financière</p>
        </div>
      </div>
    </div>
  );
}



