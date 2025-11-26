"use client";

import { useRef, useEffect } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  className = "",
}: RangeSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      sliderRef.current.style.setProperty("--range-progress", `${percentage}%`);
    }
  }, [value, min, max]);

  return (
    <div className="relative">
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full range-slider ${className}`}
        style={{
          background: `linear-gradient(to right, #8afd81 0%, #8afd81 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  );
}

