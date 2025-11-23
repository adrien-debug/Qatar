"use client";

import { ReactNode } from "react";

interface KeyFactsBoxProps {
  title: string;
  value: string | ReactNode;
  note?: string;
  className?: string;
}

export default function KeyFactsBox({ 
  title, 
  value, 
  note,
  className = "" 
}: KeyFactsBoxProps) {
  return (
    <div className={`bg-hearst-green text-black px-5 py-4 rounded-lg ${className}`}>
      <div className="font-semibold text-sm md:text-base mb-2 uppercase tracking-wide">{title}</div>
      <div className="font-bold text-lg md:text-xl leading-tight">{value}</div>
      {note && <div className="text-xs md:text-sm mt-2 opacity-90 italic">({note})</div>}
    </div>
  );
}

