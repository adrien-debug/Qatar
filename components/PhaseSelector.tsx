"use client";

import { PhaseConfig } from "@/lib/financial-calculations";
import Button from "./Button";

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
        <Button
          key={index}
          onClick={() => onPhaseChange(index + 1)}
          active={selectedPhase === index + 1}
          variant="outline"
        >
          <div className="text-lg font-semibold">{phase.mw}MW</div>
          <div className="text-xs opacity-70">{phase.timeline}</div>
        </Button>
      ))}
    </div>
  );
}


