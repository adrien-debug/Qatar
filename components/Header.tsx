"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Ne pas afficher le header sur la page de login
  if (pathname === "/login") {
    return null;
  }

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-hearst-dark-700 border-b border-hearst-grey-100/30 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4">
        {/* Espace pour contenu futur */}
      </div>

      <div className="flex items-center gap-4">
        {username && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-hearst-bg-hover transition-colors"
            >
              <div className="w-8 h-8 bg-hearst-green text-hearst-dark rounded-full flex items-center justify-center font-bold text-sm">
                {getInitials(username)}
              </div>
              <span className="text-sm text-white font-medium">{username}</span>
              <ChevronDown className="w-4 h-4 text-hearst-text-secondary" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-hearst-dark-700 border border-hearst-grey-100/30 rounded-lg shadow-xl overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-hearst-text-secondary hover:bg-hearst-bg-hover hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

