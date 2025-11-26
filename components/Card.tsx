"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "minimal" | "green-border" | "premium" | "royal";
}

export default function Card({ children, className = "", variant = "default" }: CardProps) {
  if (variant === "royal") {
    return (
      <div className={`card-royal text-white ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === "premium") {
    return (
      <div className={`card-premium text-white ${className}`}>
        {children}
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div className={`bg-black text-white rounded-2xl p-6 md:p-8 border border-hearst-grey-100/20 shadow-lg ${className} transition-all duration-300 hover:border-hearst-green/40 hover:shadow-xl`}>
        {children}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`glass-premium text-white rounded-2xl p-6 border border-hearst-grey-100/30 ${className} transition-all duration-300 hover:border-hearst-green/40`}>
        {children}
      </div>
    );
  }

  if (variant === "green-border") {
    return (
      <div className={`glass-premium text-white rounded-2xl p-6 border-2 border-hearst-green/50 shadow-lg ${className} transition-all duration-300 hover:border-hearst-green hover:shadow-xl hover:shadow-hearst-green/20`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`card-premium text-white ${className}`}>
      {children}
    </div>
  );
}

