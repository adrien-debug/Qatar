"use client";

import { PhaseConfig } from "@/lib/financial-calculations";

interface PhaseSelectorProps {
  phases: PhaseConfig[];
  selectedPhase: number;
  onPhaseChange: (phase: number) => void;
}

export default function PhaseSelector({
  phases,
  selectedPhase,
  onPhaseChange,
}: PhaseSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      {phases.map((phase, index) => (
        <button
          key={index}
          onClick={() => onPhaseChange(index + 1)}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selectedPhase === index + 1
              ? "bg-hearst-green text-black"
              : "bg-white text-hearst-text border-2 border-gray-200 hover:border-hearst-green"
          }`}
        >
          <div className="text-lg font-semibold">{phase.mw}MW</div>
          <div className="text-xs opacity-70">{phase.timeline}</div>
        </button>
      ))}
    </div>
  );
}


