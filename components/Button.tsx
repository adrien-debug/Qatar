"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  active?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  active = false,
  className = "",
  type = "button",
  disabled = false,
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

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}

