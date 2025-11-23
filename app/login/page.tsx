"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulation d'une authentification
    setTimeout(() => {
      if (username === "Admin" && password === "1234") {
        // Sauvegarder l'état de connexion
        localStorage.setItem("qatar-auth", "true");
        localStorage.setItem("qatar-username", username);
        // Rediriger vers la page d'accueil
        router.push("/");
      } else {
        setError("Identifiants incorrects");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-12 relative"
      style={{
        backgroundImage: 'url(/Background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay léger pour la lisibilité */}
      <div className="absolute inset-0 bg-hearst-dark/30"></div>
      
      <div className="flex flex-col items-center relative z-10 mt-[100px]">
        <img
          src="/Logo.svg"
          alt="HEARST Solutions"
          className="h-[300px] w-auto object-contain -mt-[20px]"
        />

        <div className="relative p-10 bg-gradient-to-br from-hearst-bg-secondary via-hearst-bg-tertiary to-hearst-bg-secondary rounded-3xl border-2 border-hearst-green/40 shadow-2xl overflow-hidden -mt-[70px] w-full max-w-md">
          {/* Effet de lumière premium */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-hearst-green/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-hearst-green/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">Connexion</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-hearst-text-secondary mb-3 uppercase tracking-wide">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-hearst-dark/60 backdrop-blur-sm border-2 border-hearst-grey-100/30 text-white rounded-xl font-medium text-lg focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green transition-all shadow-inner"
                    placeholder="Admin"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-hearst-text-secondary mb-3 uppercase tracking-wide">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-hearst-dark/60 backdrop-blur-sm border-2 border-hearst-grey-100/30 text-white rounded-xl font-medium text-lg focus:ring-4 focus:ring-hearst-green/30 focus:border-hearst-green transition-all shadow-inner"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/20 border-2 border-red-500/40 rounded-xl">
                  <p className="text-red-400 font-semibold text-center">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-hearst-green text-black rounded-xl font-bold text-xl shadow-xl border-2 border-hearst-green/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" strokeWidth={2.5} />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Info credentials */}
            <div className="mt-8 p-4 bg-hearst-dark/40 backdrop-blur-sm rounded-xl border border-hearst-grey-100/20">
              <p className="text-xs text-hearst-text-secondary text-center">
                Identifiants par défaut : <span className="text-hearst-green font-bold">Admin / 1234</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

