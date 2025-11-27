"use client";

import Navigation from "@/components/Navigation";
import Card from "@/components/Card";
import Link from "next/link";
import { 
  BarChart3, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Settings,
  Database,
  FileText,
  Calculator
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      
      <main className="pt-4 p-8 overflow-y-auto min-h-screen mx-[200px]">
        {/* Hero Section - Premium Style */}
        <div className="mb-12">
          <div className="relative">
            <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-8 md:p-10 border-2 border-hearst-green/30">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hearst-green to-transparent opacity-70 shadow-[0_0_15px_rgba(124,255,90,0.5)]"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-hearst-green/90 to-white bg-clip-text text-transparent">
                      Qatar Financial Simulator
                    </h1>
                    <p className="text-hearst-text-secondary text-lg">
                      Plateforme de modélisation financière dynamique pour le partenariat de mining Bitcoin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* CTA vers Projection */}
          <Link href="/projection">
            <Card variant="dark" className="cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      Projection Financière
                    </h2>
                    <p className="text-hearst-text-secondary leading-relaxed">
                      Configurez votre deal et visualisez les projections sur 10 ans avec des graphiques interactifs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-hearst-green font-bold text-lg mt-auto group-hover:gap-4 transition-all duration-300">
                  Accéder au simulateur
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </div>
              </div>
            </Card>
          </Link>

          {/* CTA vers Data Menu */}
          <Link href="/data">
            <Card variant="dark" className="cursor-pointer group h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex items-center justify-center">
                    <Database className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      Data Menu
                    </h2>
                    <p className="text-hearst-text-secondary leading-relaxed">
                      Gérez les paramètres de calcul, le glossaire et les formules de manière dynamique
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-hearst-green font-bold text-lg mt-auto group-hover:gap-4 transition-all duration-300">
                  Accéder au menu
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats Cards - Premium Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="dark" className="group">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-hearst-text-secondary text-sm font-medium mb-1">Projections</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">10 ans</h3>
              </div>
            </div>
          </Card>

          <Card variant="dark" className="group">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-hearst-text-secondary text-sm font-medium mb-1">Modèles</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">2 deals</h3>
              </div>
            </div>
          </Card>

          <Card variant="dark" className="group">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-hearst-text-secondary text-sm font-medium mb-1">Phases</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">3 phases</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Informations - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="dark">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <FileText className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Deal Models</h3>
            </div>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-4 border-hearst-green">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-hearst-green rounded-full border-2 border-hearst-dark"></div>
                <h4 className="font-bold text-xl mb-3 text-white">Type Share Revenu</h4>
                <p className="text-hearst-text-secondary leading-relaxed">
                  HEARST reçoit un pourcentage du revenu Bitcoin généré. Modèle simple et transparent.
                </p>
              </div>
              <div className="relative pl-6 border-l-4 border-hearst-grey-200/50">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-hearst-grey-200/50 rounded-full border-2 border-hearst-dark"></div>
                <h4 className="font-bold text-xl mb-3 text-white">Type MW Allocated</h4>
                <p className="text-hearst-text-secondary leading-relaxed">
                  HEARST reçoit une allocation de MW avec électricité à zéro coût. Modèle durable et aligné.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="dark">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50">
                <Settings className="w-5 h-5 text-hearst-green" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Project Features</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-hearst-green" strokeWidth={3} />
                </div>
                <span className="text-hearst-text-secondary leading-relaxed">
                  Simulateur financier dynamique avec calculs en temps réel
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-hearst-green" strokeWidth={3} />
                </div>
                <span className="text-hearst-text-secondary leading-relaxed">
                  Projections sur 10 ans avec graphiques interactifs
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-hearst-green" strokeWidth={3} />
                </div>
                <span className="text-hearst-text-secondary leading-relaxed">
                  Comparaison automatique des deux modèles de deal
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-hearst-green" strokeWidth={3} />
                </div>
                <span className="text-hearst-text-secondary leading-relaxed">
                  Paramètres ajustables (prix BTC, difficulté, etc.)
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-hearst-green/20 rounded-lg flex items-center justify-center border border-hearst-green/50 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-hearst-green" strokeWidth={3} />
                </div>
                <span className="text-hearst-text-secondary leading-relaxed">
                  Menu Data dynamique avec scénarios personnalisables
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
