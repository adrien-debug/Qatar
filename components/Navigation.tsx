"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Overview" },
    { href: "/deal-a", label: "Deal A" },
    { href: "/deal-b", label: "Deal B" },
    { href: "/comparison", label: "Comparison" },
  ];

  return (
    <nav className="bg-black text-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">HEARST</span>
          <span className="text-hearst-green">Solutions</span>
        </div>
        <div className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg transition-all ${
                pathname === item.href
                  ? "bg-hearst-green text-black font-semibold"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}


