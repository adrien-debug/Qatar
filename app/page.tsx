import Navigation from "@/components/Navigation";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Link from "next/link";
import { BarChart3, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {/* Header Premium avec style PowerPoint */}
        <SectionHeader
          title="Qatar Financial Simulator"
          subtitle="Dynamic financial modeling platform for Bitcoin mining partnership"
          variant="dark"
          size="large"
        />

        {/* CTA vers Projection - Premium */}
        <div className="mb-16">
          <Link href="/projection">
            <Card className="border-2 border-hearst-green/40 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-hearst-green rounded-2xl flex items-center justify-center shadow-xl">
                      <BarChart3 className="w-10 h-10 text-hearst-dark" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Projection Financière</h2>
                      <p className="text-hearst-text-secondary text-xl leading-relaxed">
                        Configurez votre deal et visualisez les projections sur 5 ans avec des graphiques interactifs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-hearst-green font-bold text-xl">
                    Accéder au simulateur
                    <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Informations Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10">
            <h3 className="text-3xl font-bold mb-8 text-white tracking-tight">Deal Models</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-hearst-green pl-6">
                <h4 className="font-bold text-xl mb-3 text-white">Type Share Revenu</h4>
                <p className="text-hearst-text-secondary text-lg leading-relaxed">
                  HEARST reçoit un pourcentage du revenu Bitcoin généré. Modèle simple et transparent.
                </p>
              </div>
              <div className="border-l-4 border-hearst-text pl-6">
                <h4 className="font-bold text-xl mb-3 text-white">Type MW Allocated</h4>
                <p className="text-hearst-text-secondary text-lg leading-relaxed">
                  HEARST reçoit une allocation de MW avec électricité à zéro coût. Modèle durable et aligné.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-10">
            <h3 className="text-3xl font-bold mb-8 text-white tracking-tight">Project Features</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                <span className="text-hearst-text-secondary text-lg leading-relaxed">Simulateur financier dynamique avec calculs en temps réel</span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                <span className="text-hearst-text-secondary text-lg leading-relaxed">Projections sur 5 ans avec graphiques interactifs</span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                <span className="text-hearst-text-secondary text-lg leading-relaxed">Comparaison automatique des deux modèles de deal</span>
              </li>
              <li className="flex items-start gap-4">
                <Check className="w-6 h-6 text-hearst-green mt-1 flex-shrink-0" strokeWidth={3} />
                <span className="text-hearst-text-secondary text-lg leading-relaxed">Paramètres ajustables (prix BTC, difficulté, etc.)</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
