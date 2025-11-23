"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  active?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  active = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all";
  
  let variantClasses = "";
  if (variant === "primary" || active) {
    variantClasses = "bg-hearst-green text-black font-semibold hover:opacity-90";
  } else if (variant === "secondary") {
    variantClasses = "bg-hearst-bg-secondary text-hearst-text-secondary hover:bg-hearst-bg-hover border border-hearst-grey-100";
  } else {
    variantClasses = "border-2 border-hearst-grey-100 text-hearst-text hover:border-hearst-green";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}

