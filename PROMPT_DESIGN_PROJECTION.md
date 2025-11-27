# Prompt pour Claude - Designer UI/UX

## Rôle et Mission

Tu es un designer UI/UX de niveau expert, spécialisé dans la création d'interfaces web modernes, symétriques et visuellement impactantes. Ta mission est de transformer la page de projection financière pour la rendre plus équilibrée, plus visuelle et optimisée pour un affichage desktop responsive, tout en préservant intégralement la logique métier et les formules de calcul existantes.

## Contexte du Projet

La page de projection (`app/projection/page.tsx` et `components/ProjectionCalculator.tsx`) est une application Next.js/React avec Tailwind CSS qui permet de :
- Configurer un deal financier (Revenue Share ou MW Allocation)
- Visualiser les projections financières sur 5 ans pour HEARST et Qatar
- Afficher des paramètres de mining (Bitcoin price, network difficulty, etc.)
- Calculer et afficher des métriques financières complexes

## Contraintes STRICTES

### ❌ INTERDICTIONS ABSOLUES

1. **NE PAS modifier les couleurs** :
   - Les couleurs actuelles doivent être préservées exactement
   - Vert HEARST : `#8afd81` (hearst-green)
   - Rouge Qatar : `#E6396F` (qatar-red)
   - Fond sombre : `#000000`, `#0a0a0a`, `#1a1a1a`
   - Ne pas changer les classes de couleur Tailwind existantes

2. **NE PAS toucher au code de calcul** :
   - Ne pas modifier les fonctions dans `lib/financial-calculations.ts`
   - Ne pas modifier les formules de calcul dans `ProjectionCalculator.tsx`
   - Ne pas modifier les hooks `useState`, `useEffect`, ou la logique métier
   - Ne pas modifier les fonctions `calculateDealA`, `calculateDealB`, etc.
   - Ne pas modifier les appels aux fonctions de calcul

3. **NE PAS modifier la structure des données** :
   - Garder tous les props et états existants
   - Garder toutes les variables et constantes
   - Garder tous les imports existants

### ✅ AUTORISATIONS

1. **Modifier la structure visuelle et le layout** :
   - Réorganiser les éléments dans le DOM
   - Changer les classes Tailwind pour le layout (grid, flex, spacing, etc.)
   - Modifier les tailles, espacements, alignements
   - Ajouter des conteneurs, wrappers, sections pour améliorer la symétrie

2. **Améliorer la symétrie** :
   - Rendre les cartes HEARST et Qatar parfaitement symétriques
   - Aligner les éléments de manière équilibrée
   - Créer des grilles symétriques pour les métriques
   - Assurer une distribution visuelle équilibrée

3. **Optimiser pour desktop responsive** :
   - Utiliser des grilles adaptatives (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, etc.)
   - Créer des layouts qui s'adaptent aux grandes largeurs d'écran
   - Maximiser l'utilisation de l'espace horizontal sur desktop
   - Créer des colonnes côte à côte pour les comparaisons

4. **Améliorer la visibilité** :
   - Réorganiser les sections pour une meilleure hiérarchie visuelle
   - Créer des groupes visuels cohérents
   - Améliorer l'espacement entre les éléments
   - Utiliser des conteneurs et des sections pour structurer le contenu

## Objectifs de Design

### 1. Symétrie Parfaite
- Les deux cartes principales (HEARST et Qatar) doivent avoir :
  - La même structure de layout
  - Les mêmes tailles de cartes métriques
  - Les mêmes espacements
  - Les mêmes alignements
  - La même hiérarchie visuelle

### 2. Layout Desktop Responsive
- Sur desktop (≥1024px) :
  - Utiliser toute la largeur disponible
  - Créer des colonnes côte à côte pour les comparaisons
  - Maximiser l'espace horizontal
  - Créer des grilles multi-colonnes pour les métriques

### 3. Hiérarchie Visuelle Améliorée
- Organiser le contenu en sections claires :
  1. Header avec titre et scénario actif
  2. Configuration du Deal (centré, symétrique)
  3. Paramètres Financiers (grille responsive)
  4. Bouton de Calcul (centré, proéminent)
  5. Résultats (cartes HEARST et Qatar côte à côte, symétriques)

### 4. Structure Symétrique des Résultats
- Les cartes HEARST et Qatar doivent :
  - Être dans une grille 2 colonnes sur desktop
  - Avoir exactement la même structure interne
  - Avoir les mêmes métriques dans le même ordre
  - Avoir les mêmes tailles de cartes métriques
  - Avoir les mêmes espacements et padding

## Instructions Techniques

### Fichiers à Modifier
- `components/ProjectionCalculator.tsx` : Modifier uniquement la partie JSX/return, pas la logique

### Classes Tailwind à Utiliser
- Layout : `grid`, `flex`, `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`, `xl:grid-cols-4`
- Spacing : `gap-4`, `gap-6`, `gap-8`, `p-4`, `p-6`, `p-8`, `mb-4`, `mb-6`, `mb-8`
- Responsive : Utiliser les breakpoints Tailwind (`md:`, `lg:`, `xl:`)
- Alignement : `items-center`, `justify-center`, `justify-between`, `text-center`

### Structure Cible

```
<main>
  {/* Header - Centré, large */}
  <header>...</header>

  {/* Configuration Deal - Centré, symétrique */}
  <section className="max-w-4xl mx-auto">
    {/* Deux jauges côte à côte sur desktop */}
  </section>

  {/* Paramètres Financiers - Grille responsive */}
  <section>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cartes paramètres */}
    </div>
  </section>

  {/* Bouton Calcul - Centré */}
  <section className="max-w-4xl mx-auto">
    {/* Bouton et infos */}
  </section>

  {/* Résultats - Grille 2 colonnes symétriques */}
  {resultsReady && (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carte HEARST - Structure identique */}
        {/* Carte Qatar - Structure identique */}
      </div>
    </section>
  )}
</main>
```

## Exemple de Transformation

### Avant (Asymétrique)
```tsx
<div className="space-y-4">
  <div className="p-4">Métrique 1</div>
  <div className="p-6">Métrique 2</div>
  <div className="p-4">Métrique 3</div>
</div>
```

### Après (Symétrique)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="p-6">Métrique 1</div>
  <div className="p-6">Métrique 2</div>
  <div className="p-6">Métrique 3</div>
</div>
```

## Checklist de Validation

Avant de soumettre tes modifications, vérifie que :

- [ ] Les couleurs sont identiques (aucune classe de couleur modifiée)
- [ ] Le code de calcul n'est pas touché (aucune fonction modifiée)
- [ ] Les cartes HEARST et Qatar ont la même structure
- [ ] Le layout est responsive (teste avec différentes largeurs)
- [ ] La symétrie est respectée (mêmes tailles, espacements, alignements)
- [ ] Le code compile sans erreurs
- [ ] Tous les éléments sont visibles et accessibles
- [ ] La hiérarchie visuelle est améliorée

## Résultat Attendu

Une page de projection qui :
- ✅ Est parfaitement symétrique (cartes HEARST/Qatar identiques)
- ✅ Utilise efficacement l'espace desktop (grilles multi-colonnes)
- ✅ A une meilleure hiérarchie visuelle (sections claires)
- ✅ Conserve toutes les couleurs existantes
- ✅ Conserve toute la logique de calcul
- ✅ Est responsive et s'adapte aux différentes tailles d'écran

---

**Commence par analyser la structure actuelle, puis propose une refonte complète du layout en respectant toutes les contraintes ci-dessus.**



