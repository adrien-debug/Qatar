"use client";

interface CountryBoxProps {
  country: string;
  description: string;
  className?: string;
}

export default function CountryBox({ 
  country, 
  description,
  className = "" 
}: CountryBoxProps) {
  return (
    <div className={`bg-hearst-green/20 border-2 border-hearst-green rounded-lg p-4 ${className}`}>
      <div className="font-bold text-hearst-text mb-2">{country}</div>
      <div className="text-sm text-gray-700">{description}</div>
    </div>
  );
}

