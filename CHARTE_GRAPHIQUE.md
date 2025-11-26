# 🎨 Charte Graphique - Qatar Financial Simulator
## Basée sur les slides PowerPoint HEARST

---

## 📐 COULEURS PRINCIPALES

### Palette HEARST (selon charte complète HearstAI)
- **Vert Principal** : `#8afd81` (hearst-green) ⚠️ **STANDARDISÉ**
  - Utilisation : Boxes de métriques, accents, highlights, graphiques HEARST
  - Exemple : Key Facts boxes, pays, métriques importantes
  - **Variations** : `#6fdc66` (dark/hover), `#a5ff9c` (light)
  
- **Noir** : `#000000` (hearst-dark)
  - Utilisation : Headers de sections, navigation, sections importantes
  - Exemple : "Global Operations", "Infrastructure Proposal"
  
- **Blanc** : `#FFFFFF` (hearst-white)
  - Utilisation : Fond des sections claires, texte sur fond noir
  
- **Fond Clair** : `#F5F5F5` (hearst-light)
  - Utilisation : Arrière-plan principal de l'application
  
- **Texte** : `#1A1A1A` (hearst-text)
  - Utilisation : Contenu principal sur fond clair

---

## 🔤 TYPOGRAPHIE

### Police
- **Famille** : Inter (Google Fonts)
- **Poids disponibles** : 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Hiérarchie (selon slides)
- **Titres Principaux** : Inter Bold, 3xl-5xl (32-48px)
  - Exemple : "Global Operations", "Infrastructure Proposal"
  
- **Sous-titres** : Inter Semibold, xl-2xl (20-24px)
  - Exemple : "Mining Sites & Asset Management"
  
- **Corps de texte** : Inter Regular, base-lg (16-18px)
  
- **Labels/Métriques** : Inter Medium/Semibold, sm-base (14-16px)

### Espacements typographiques
- **Line Height** : `leading-tight` pour titres, `leading-relaxed` pour paragraphes
- **Letter Spacing** : Normal (par défaut)

---

## 🧩 COMPOSANTS DE LA CHARTE

### 1. SectionHeader
Headers standardisés avec style PowerPoint

**Variante Dark** (fond noir, texte blanc) :
```tsx
<SectionHeader
  title="Titre Principal"
  subtitle="Sous-titre optionnel"
  variant="dark"
  size="large"
/>
```
- Fond : Noir (`bg-black`)
- Texte : Blanc
- Padding : `p-8 md:p-10`
- Utilisation : Sections importantes comme dans les slides

**Variante Light** (fond transparent, texte noir) :
```tsx
<SectionHeader
  title="Titre"
  subtitle="Description"
  variant="light"
/>
```

### 2. Card
Cartes standardisées

**Variantes** :
- `default` : Fond blanc, bordure grise, ombre légère
- `dark` : Fond noir, texte blanc
- `minimal` : Fond blanc, bordure simple
- `green-border` : Fond blanc, bordure verte (#8afd81)

```tsx
<Card variant="default" className="...">
  Contenu
</Card>
```

### 3. KeyFactsBox
Boxes vertes pour métriques clés (comme dans les slides)

```tsx
<KeyFactsBox
  title="Energy cost*"
  value="2.5 cents / kWh"
  note="(highly competitive)"
/>
```
- Fond : Vert #8afd81
- Texte : Noir
- Style : Comme les "Key Facts" des slides

### 4. CountryBox
Boxes pour pays/éléments avec bordure verte

```tsx
<CountryBox
  country="Kazakhstan"
  description="For its competitive energy costs..."
/>
```
- Fond : Vert transparent (`bg-hearst-green/20`)
- Bordure : Vert #8afd81

### 5. InfoBox
Boxes d'information

**Variantes** :
- `default` : Fond blanc, bordure grise
- `green` : Fond vert transparent, bordure verte

```tsx
<InfoBox variant="green">
  Contenu
</InfoBox>
```

### 6. Button
Boutons standardisés

**Variantes** :
- `primary` : Vert #8afd81, texte noir (actif)
- `secondary` : Fond gris clair
- `outline` : Bordure, fond transparent

```tsx
<Button
  variant="primary"
  active={true}
  onClick={...}
>
  Texte
</Button>
```

---

## 📐 STRUCTURE DES PAGES (selon slides)

### Layout Standard PowerPoint
```
┌─────────────────────────────────────────┐
│ Navigation (noir, vert accent)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ SectionHeader (dark)              │  │
│  │ Fond noir, texte blanc            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ KeyFactsBox  │  │ KeyFactsBox  │    │
│  │ (vert)       │  │ (vert)       │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Card (contenu)                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Country  │  │ Country  │            │
│  │ Box      │  │ Box      │            │
│  └──────────┘  └──────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 RÈGLES DE DESIGN (selon slides)

### Espacements
- **Marges entre sections** : `space-y-6` ou `mb-8` (24-32px)
- **Padding des cards** : `p-6 md:p-8` (24-32px)
- **Gap dans les grids** : `gap-6` (24px)
- **Padding headers** : `p-8 md:p-10` (32-40px)

### Bordures
- **Cards standard** : `border border-gray-200`
- **Cards vertes** : `border-2 border-hearst-green`
- **InfoBoxes** : `border-2`

### Ombres
- **Cards** : `shadow-sm` (ombre très légère, style PowerPoint)
- **Hover** : `hover:shadow-md` (optionnel)

### Transitions
- **Boutons** : `transition-all`
- **Cards** : `transition-shadow`

### Arrondis
- **Tous les éléments** : `rounded-lg` (8px, style PowerPoint)

---

## 📊 GRAPHIQUES (selon slides)

### Couleurs des Graphiques
- **HEARST** : `#8afd81` (vert)
- **Qatar** : `#1A1A1A` (noir)
- **Total/Neutre** : `#6B7280` (gris) - optionnel

### Style
- **Lignes** : `strokeWidth={2-3}`
- **Barres** : Couleurs cohérentes avec la charte
- **Grille** : `strokeDasharray="3 3"` (discrète)
- **Fond** : Transparent ou blanc

---

## 🧭 NAVIGATION (selon slides)

### Style
- **Fond** : Noir (`bg-black`)
- **Texte** : Blanc
- **Actif** : Vert #8afd81, texte noir
- **Hover** : Gris foncé (`hover:bg-gray-800`)
- **Bordure** : `border-b border-gray-800`

### Logo
- **HEARST** : Blanc, font-bold
- **Solutions** : Vert #8afd81, font-bold

---

## 📱 RESPONSIVE

### Breakpoints
- **Mobile** : `< 768px` - `grid-cols-1`, padding réduit
- **Tablette** : `md: >= 768px` - `md:grid-cols-2`
- **Desktop** : `lg: >= 1024px` - `lg:grid-cols-3`

### Max Width
- **Conteneur principal** : `max-w-7xl mx-auto`
- **Padding horizontal** : `px-6 md:px-8`

---

## ✅ EXEMPLES D'UTILISATION

### Page avec Header Noir (style PowerPoint)
```tsx
<div className="min-h-screen bg-hearst-light">
  <Navigation />
  <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
    <SectionHeader
      title="Infrastructure Proposal"
      subtitle="Hearst proposes the phased development..."
      variant="dark"
      size="large"
    />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KeyFactsBox
        title="Energy cost*"
        value="2.5 cents / kWh"
        note="(highly competitive)"
      />
      <KeyFactsBox
        title="Revenue model"
        value="Daily Bitcoin mined, minus 0.8% fee"
      />
      <KeyFactsBox
        title="Mining equipment lifecycle"
        value="5 years"
      />
    </div>
    
    <Card>
      <h2 className="text-2xl font-semibold mb-6">Contenu</h2>
      {/* ... */}
    </Card>
  </main>
</div>
```

### Boxes de Pays (style PowerPoint)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <CountryBox
    country="Kazakhstan"
    description="For its competitive energy costs and well-established mining ecosystem"
  />
  <CountryBox
    country="Brazil"
    description="Leveraging its growth in renewable energy..."
  />
</div>
```

---

## 🎨 CHECKLIST D'APPLICATION

✅ Headers noirs avec texte blanc pour sections importantes
✅ Boxes vertes (#8afd81) pour métriques clés
✅ Sections alternées noir/blanc
✅ Police Inter partout
✅ Espacements généreux (24-32px)
✅ Bordures discrètes
✅ Ombres légères (shadow-sm)
✅ Arrondis cohérents (rounded-lg)
✅ Graphiques avec couleurs de la charte
✅ Navigation noire avec vert accent
✅ Design minimaliste et épuré
✅ Responsive mobile-first

---

## 📝 NOTES IMPORTANTES

- **Style PowerPoint** : Design épuré, niveau gouvernemental/board
- **Pas d'effets flashy** : Transitions subtiles uniquement
- **Hiérarchie claire** : Titres très visibles, contenu lisible
- **Cohérence** : Tous les composants suivent la même charte
- **Accessibilité** : Contraste suffisant (noir/blanc, vert/noir)
