"use client";

import { ReactNode } from "react";

interface InfoBoxProps {
  children: ReactNode;
  variant?: "default" | "green";
  className?: string;
}

export default function InfoBox({ 
  children, 
  variant = "default",
  className = "" 
}: InfoBoxProps) {
  if (variant === "green") {
    return (
      <div className={`bg-hearst-green/10 border-2 border-hearst-green rounded-lg p-4 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-hearst-bg-secondary text-white border-2 border-hearst-grey-100 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

