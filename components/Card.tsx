"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "minimal" | "green-border";
}

export default function Card({ children, className = "", variant = "default" }: CardProps) {
  if (variant === "dark") {
    return (
      <div className={`bg-black text-white rounded-xl p-6 md:p-8 border border-hearst-grey-100/20 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`bg-hearst-bg-secondary text-white rounded-xl p-6 border border-hearst-grey-100/30 ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === "green-border") {
    return (
      <div className={`bg-hearst-bg-secondary text-white rounded-xl p-6 border-2 border-hearst-green ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-hearst-bg-secondary text-white rounded-xl p-6 md:p-8 border border-hearst-grey-100/30 ${className}`}>
      {children}
    </div>
  );
}

