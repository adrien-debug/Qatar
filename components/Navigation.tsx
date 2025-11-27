"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("qatar-username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("qatar-auth");
    localStorage.removeItem("qatar-username");
    router.push("/login");
  };

  const navItems = [
    { href: "/", label: "Overview" },
    { href: "/projection", label: "Projection" },
    { href: "/setup", label: "Setup" },
  ];

  // Ne pas afficher la navigation sur la page de login
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="bg-hearst-dark text-white py-4 md:py-5 border-b border-hearst-grey-100/30">
      <div className="px-6 md:px-8 mx-[200px] flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 md:px-6 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors ${
                pathname === item.href
                  ? "bg-hearst-green text-black font-bold"
                  : "text-hearst-text-secondary hover:text-white hover:bg-hearst-bg-hover"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {username && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-hearst-grey-100/30">
              <span className="text-sm text-hearst-text-secondary">{username}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-hearst-grey-200 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-hearst-grey-100 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
