"use client";

import Navigation from "@/components/Navigation";
import Card from "@/components/Card";
import Link from "next/link";
import { BarChart3, ArrowRight, Check, TrendingUp, DollarSign, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      
      <main className="p-8 overflow-y-auto min-h-screen mx-[200px]">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Qatar Financial Simulator
            </h1>
            <p className="text-hearst-text-secondary text-lg">
              Plateforme de modélisation financière dynamique pour le partenariat de mining Bitcoin
            </p>
          </div>

          {/* CTA vers Projection */}
          <div className="mb-12">
            <Link href="/projection">
              <Card className="border-2 border-hearst-green/40 cursor-pointer hover:border-hearst-green/60 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-hearst-green rounded-2xl flex items-center justify-center shadow-xl">
                        <BarChart3 className="w-10 h-10 text-hearst-dark" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                          Projection Financière
                        </h2>
                        <p className="text-hearst-text-secondary text-lg leading-relaxed">
                          Configurez votre deal et visualisez les projections sur 5 ans avec des graphiques interactifs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-hearst-green font-bold text-lg">
                      Accéder au simulateur
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-hearst-text-secondary text-sm">Projections</p>
                  <h3 className="text-2xl font-bold text-white">5 ans</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-hearst-text-secondary text-sm">Modèles</p>
                  <h3 className="text-2xl font-bold text-white">2 deals</h3>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-hearst-green/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-hearst-green" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-hearst-text-secondary text-sm">Phases</p>
                  <h3 className="text-2xl font-bold text-white">3 phases</h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Deal Models</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-hearst-green pl-6">
                  <h4 className="font-bold text-xl mb-3 text-white">Type Share Revenu</h4>
                  <p className="text-hearst-text-secondary leading-relaxed">
                    HEARST reçoit un pourcentage du revenu Bitcoin généré. Modèle simple et transparent.
                  </p>
                </div>
                <div className="border-l-4 border-hearst-text pl-6">
                  <h4 className="font-bold text-xl mb-3 text-white">Type MW Allocated</h4>
                  <p className="text-hearst-text-secondary leading-relaxed">
                    HEARST reçoit une allocation de MW avec électricité à zéro coût. Modèle durable et aligné.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Project Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                  <span className="text-hearst-text-secondary leading-relaxed">
                    Simulateur financier dynamique avec calculs en temps réel
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                  <span className="text-hearst-text-secondary leading-relaxed">
                    Projections sur 5 ans avec graphiques interactifs
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                  <span className="text-hearst-text-secondary leading-relaxed">
                    Comparaison automatique des deux modèles de deal
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                  <span className="text-hearst-text-secondary leading-relaxed">
                    Paramètres ajustables (prix BTC, difficulté, etc.)
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </main>
    </div>
  );
}
