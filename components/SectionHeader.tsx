"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "dark" | "light" | "royal" | "premium";
  size?: "large" | "medium";
}

export default function SectionHeader({
  title,
  subtitle,
  variant = "dark",
  size = "large",
}: SectionHeaderProps) {
  if (variant === "royal") {
    return (
      <div className="relative card-royal mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hearst-green/5 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h2 className={`${size === "large" ? "title-royal" : "title-premium"} mb-6 text-glow-royal`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-hearst-text-secondary text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-4xl">
              {subtitle}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hearst-green/50 to-transparent"></div>
      </div>
    );
  }

  if (variant === "premium") {
    return (
      <div className="relative card-premium mb-12">
        <h2 className={`${size === "large" ? "title-premium" : "text-3xl md:text-4xl font-bold"} mb-4 leading-tight tracking-tight text-white`}>
          {title}
        </h2>
        {subtitle && <p className="text-hearst-text-secondary text-xl md:text-2xl leading-relaxed">{subtitle}</p>}
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div className="relative bg-black text-white p-10 md:p-12 lg:p-16 rounded-2xl mb-12 border border-hearst-grey-100/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hearst-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-hearst-green/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className={`${size === "large" ? "text-4xl md:text-5xl lg:text-6xl xl:text-7xl" : "text-3xl md:text-4xl lg:text-5xl"} font-bold mb-4 leading-tight tracking-tight text-white`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-hearst-text-secondary text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-4xl">
              {subtitle}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hearst-green/30 to-transparent"></div>
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

