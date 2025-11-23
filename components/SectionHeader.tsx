"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "dark" | "light";
  size?: "large" | "medium";
}

export default function SectionHeader({
  title,
  subtitle,
  variant = "dark",
  size = "large",
}: SectionHeaderProps) {
  if (variant === "dark") {
    return (
      <div className="bg-black text-white p-10 md:p-12 rounded-xl mb-12 border border-hearst-grey-100/20">
        <h2 className={`${size === "large" ? "text-4xl md:text-5xl lg:text-6xl" : "text-3xl md:text-4xl"} font-bold mb-4 leading-tight tracking-tight`}>
          {title}
        </h2>
        {subtitle && <p className="text-hearst-text-secondary text-xl md:text-2xl leading-relaxed">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className={`${size === "large" ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl"} font-bold mb-3 text-hearst-text leading-tight`}>
        {title}
      </h2>
      {subtitle && <p className="text-xl md:text-2xl text-hearst-text-secondary leading-relaxed">{subtitle}</p>}
    </div>
  );
}

