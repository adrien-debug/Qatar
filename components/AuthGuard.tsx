"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier l'authentification
    const auth = localStorage.getItem("qatar-auth");
    const isAuth = auth === "true";

    setIsAuthenticated(isAuth);

    // Si pas authentifié et pas sur la page de login, rediriger vers login
    if (!isAuth && pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  // Afficher rien pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-hearst-dark flex items-center justify-center">
        <div className="text-hearst-green text-xl font-bold">Chargement...</div>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  // Si authentifié ou sur la page de login, afficher le contenu
  return <>{children}</>;
}


