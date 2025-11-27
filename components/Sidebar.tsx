"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText,
  BarChart3
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Ne pas afficher la sidebar sur la page de login
  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projection", label: "Projection", icon: TrendingUp },
    { href: "/report", label: "Rapport", icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-hearst-dark-700 border-r border-hearst-grey-100/30 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-hearst-grey-100/30">
        <Link href="/" className="flex items-center">
          <Image
            src="/Logo.svg"
            alt="HEARST Solutions"
            width={140}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-hearst-green text-hearst-dark font-bold"
                  : "text-hearst-text-secondary hover:bg-hearst-bg-hover hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

