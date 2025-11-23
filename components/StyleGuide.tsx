"use client";

/**
 * Composant de référence pour la charte graphique
 * À utiliser comme référence visuelle
 */
export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-hearst-light p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Noir (style PowerPoint) */}
        <div className="bg-black text-white p-8 md:p-10 rounded-lg">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Header Style PowerPoint
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            Fond noir, texte blanc - Style des slides HEARST
          </p>
        </div>

        {/* Key Facts Boxes (vertes) */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Key Facts Boxes (Vertes)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-hearst-green text-black px-5 py-4 rounded-lg">
              <div className="font-semibold text-sm md:text-base mb-2 uppercase tracking-wide">
                Energy cost*
              </div>
              <div className="font-bold text-lg md:text-xl leading-tight">
                2.5 cents / kWh
              </div>
              <div className="text-xs md:text-sm mt-2 opacity-90 italic">
                (highly competitive)
              </div>
            </div>
            <div className="bg-hearst-green text-black px-5 py-4 rounded-lg">
              <div className="font-semibold text-sm md:text-base mb-2 uppercase tracking-wide">
                Revenue model
              </div>
              <div className="font-bold text-lg md:text-xl leading-tight">
                Daily Bitcoin mined, minus 0.8% fee
              </div>
            </div>
            <div className="bg-hearst-green text-black px-5 py-4 rounded-lg">
              <div className="font-semibold text-sm md:text-base mb-2 uppercase tracking-wide">
                Mining equipment lifecycle
              </div>
              <div className="font-bold text-lg md:text-xl leading-tight">
                5 years
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Card Default</h3>
              <p className="text-gray-600">Fond blanc, bordure grise, ombre légère</p>
            </div>
            <div className="bg-black text-white rounded-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-4">Card Dark</h3>
              <p className="text-gray-300">Fond noir, texte blanc</p>
            </div>
          </div>
        </div>

        {/* Couleurs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Couleurs de la Charte</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="bg-hearst-green h-24 rounded-lg mb-2"></div>
              <div className="text-sm font-semibold">Vert #A3FF8B</div>
            </div>
            <div>
              <div className="bg-black h-24 rounded-lg mb-2"></div>
              <div className="text-sm font-semibold">Noir #000000</div>
            </div>
            <div>
              <div className="bg-hearst-light border-2 border-gray-300 h-24 rounded-lg mb-2"></div>
              <div className="text-sm font-semibold">Fond #F5F5F5</div>
            </div>
            <div>
              <div className="bg-hearst-text h-24 rounded-lg mb-2"></div>
              <div className="text-sm font-semibold text-white">Texte #1A1A1A</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

