"use client";

import { ReactNode } from "react";

interface MetricBoxProps {
  children: ReactNode;
  className?: string;
}

export default function MetricBox({ children, className = "" }: MetricBoxProps) {
  return (
    <div className={`bg-hearst-green text-black px-4 py-3 rounded-lg font-semibold inline-block ${className}`}>
      {children}
    </div>
  );
}

