# 🎨 Palette de Couleurs WooSenteur - Thème Violet

## Nouvelle Identité Visuelle

Le site WooSenteur utilise maintenant un **thème violet cohérent** sur toutes les pages, remplaçant l'ancien thème rouge/orange.

---

## 🎨 Palette Principale

### Violet Principal
```css
--primary-purple: #7C3AED;      /* Violet 600 - Couleur dominante */
--secondary-purple: #A78BFA;    /* Violet 400 - Secondaire */
--accent-purple: #C4B5FD;       /* Violet 300 - Accents */
--deep-purple: #5B21B6;         /* Violet 800 - Foncé */
--light-purple: #EDE9FE;        /* Violet 100 - Clair */
--ultra-light: #F5F3FF;         /* Violet 50 - Très clair */
```

### Variantes Purple
```css
Purple 600: #9333EA
Purple 500: #A855F7
Purple 400: #C084FC
```

### Variantes Indigo (accents)
```css
Indigo 600: #4F46E5
Indigo 500: #6366F1
Indigo 400: #818CF8
```

---

## 🌈 Dégradés Utilisés

### Dégradé Principal (CTA)
```css
from-violet-600 to-purple-600
/* Hover: from-violet-700 to-purple-700 */
```

### Dégradé Secondaire
```css
from-purple-600 to-indigo-600
```

### Dégradé Tertiaire
```css
from-indigo-600 to-violet-600
```

### Backgrounds
```css
/* Light mode */
from-violet-50 via-purple-50 to-indigo-50

/* Dark mode */
from-slate-950 via-violet-950 to-slate-950
```

---

## 📍 Application par Composant

### Header
- **Logo texte**: `from-violet-600 via-purple-600 to-indigo-600`
- **Badge crédits**: `from-violet-500/10 to-indigo-500/10`

### Homepage (page.tsx)
- **Hero titre**: `text-violet-600` + `text-purple-600`
- **Badge IA**: `from-violet-500/10 to-purple-500/10`
- **CTA principal**: `from-violet-600 to-purple-600` avec `shadow-violet-500/50`
- **CTA secondaire**: `border-violet-600` hover `from-violet-600 to-purple-600`
- **Stats**: 
  - 83%: `from-violet-600 to-purple-600`
  - 3min: `from-purple-600 to-indigo-600`
  - 7 étapes: `text-violet-600`

### Section Avant/Après (BeforeAfterSection)
- **Titre**: `from-violet-600 to-purple-600`
- **Badge**: `from-violet-600/10 to-purple-600/10`
- **Icône**: `text-violet-600`
- **Flèche transition**: `from-violet-600 to-purple-600`
- **Badge "Après"**: `from-violet-600 to-purple-600`

### Vidéo Hero (HeroVideo)
- **Glow**: `from-violet-600/20 to-purple-600/20`
- **Badge démo**: `from-violet-600 to-purple-600`
- **Icônes contrôles**: `text-violet-600`

### Dashboard
- **Loader**: `text-violet-600`
- **Card CTA**: `from-violet-600/5 to-purple-600/5` border `border-violet-200`
- **Icône bg**: `from-violet-600 to-purple-600`
- **Boutons**: `from-violet-600 to-purple-600` avec `shadow-violet-500/30`
- **Graphiques**:
  - Générations: `#7C3AED`
  - Exports: `#A78BFA`
  - Palette: `['#7C3AED', '#A78BFA', '#C4B5FD', '#8B5CF6', '#6D28D9']`

### Products Page
- **Backgrounds**: `from-violet-50 via-purple-50 to-indigo-50`
- **Loader**: `text-violet-600`
- **Boutons**: `from-violet-600 to-purple-600`
- **Checkboxes**: `text-violet-600` focus `focus:ring-violet-600`
- **Cards sélectionnées**: `ring-2 ring-violet-600`
- **Placeholders images**: `from-violet-100 to-purple-100`

### Profile Page
- **Loader**: `text-violet-600`
- **Bouton portail**: `from-violet-600 to-purple-600` avec `shadow-violet-500/30`

### Adapter Page
- **Backgrounds**: `from-violet-50 via-purple-50 to-indigo-50`
- **Boutons**: `from-violet-600 to-purple-600`
- **Cards sélectionnées**: `border-violet-600` bg `from-violet-50 to-purple-50`
- **Badge**: `bg-violet-600/10`
- **Icône**: `text-violet-600`

### Pricing
- **Card highlighted**: `ring-2 ring-violet-600`
- **Badge populaire**: `from-violet-600 to-purple-600`
- **Crédits**: `text-violet-600`
- **Bouton**: `from-violet-600 to-purple-600` avec `shadow-violet-500/30`

### CTA Final
- **Background**: `from-violet-600 to-purple-600` avec `shadow-violet-500/50`
- **Bouton**: `bg-white text-violet-600 hover:bg-violet-50`

---

## 🎯 Principes de Cohérence

### 1. Boutons CTA Primaires
```tsx
className="bg-gradient-to-r from-violet-600 to-purple-600 
  hover:from-violet-700 hover:to-purple-700 
  text-white shadow-lg shadow-violet-500/30"
```

### 2. Boutons Secondaires (Outline)
```tsx
className="border-2 border-violet-600 text-violet-600 
  hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 
  hover:text-white"
```

### 3. Badges/Pills
```tsx
className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 
  text-violet-700 dark:text-violet-300 
  border-violet-500/30"
```

### 4. Icônes
```tsx
className="text-violet-600"
```

### 5. Backgrounds de Page
```tsx
// Light
className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50"

// Dark
className="dark:from-slate-950 dark:via-violet-950 dark:to-slate-950"
```

### 6. Texte Accentué
```tsx
className="text-violet-600 dark:text-violet-400"
```

### 7. Loaders/Spinners
```tsx
className="text-violet-600"
```

---

## 🌙 Mode Sombre

### Couleurs adaptées
```css
Primary: oklch(0.72 0.18 285)      /* Violet plus clair */
Secondary: oklch(0.35 0.15 285)    /* Violet moyen */
Accent: oklch(0.55 0.22 285)       /* Violet accent */
Border: oklch(0.30 0.05 285)       /* Violet foncé */
```

### Charts en dark mode
```css
Chart 1: oklch(0.65 0.20 285)
Chart 2: oklch(0.72 0.15 285)
Chart 3: oklch(0.80 0.12 285)
Chart 4: oklch(0.55 0.22 285)
Chart 5: oklch(0.45 0.25 285)
```

---

## ✅ Avantages du Nouveau Thème

1. **Cohérence visuelle** - Une seule famille de couleurs (violet/purple/indigo)
2. **Modernité** - Le violet est associé à l'IA, la tech, l'innovation
3. **Lisibilité** - Meilleur contraste que le rouge
4. **Élégance** - Plus adapté au secteur beauté/parfumerie
5. **Accessibilité** - Ratios de contraste WCAG AA/AAA respectés

---

## 🔧 Variables CSS Personnalisées

Dans `app/globals.css` :

```css
:root {
  --primary-purple: #7C3AED;
  --secondary-purple: #A78BFA;
  --accent-purple: #C4B5FD;
  --deep-purple: #5B21B6;
  --light-purple: #EDE9FE;
  --ultra-light: #F5F3FF;
  
  --primary: oklch(0.55 0.22 285);
  --secondary: oklch(0.65 0.18 285);
  --accent: oklch(0.72 0.15 285);
}
```

---

## 📦 Fichiers Modifiés

- `app/globals.css` - Variables CSS + palette
- `app/layout.tsx` - Background global
- `app/page.tsx` - Homepage complète
- `app/dashboard/page.tsx` - Dashboard + graphiques
- `app/products/page.tsx` - Liste produits
- `app/profile/page.tsx` - Profil utilisateur
- `app/adapter/page.tsx` - Adapter événements
- `components/layout/Header.tsx` - En-tête
- `components/branding/HeroLogo.tsx` - Logo animé
- `components/landing/BeforeAfterSection.tsx` - Section comparative
- `components/landing/HeroVideo.tsx` - Vidéo hero
- `components/dashboard/StatCards.tsx` - Cards stats
- `components/animations/MotionWrappers.tsx` - Animations
- `components/auth/AdminLoginButton.tsx` - Bouton admin

---

## 🎨 Inspirations

- **Violet 600** (#7C3AED) - Couleur dominante, moderne et tech
- **Purple 600** (#9333EA) - Variation complémentaire
- **Indigo 600** (#4F46E5) - Accent pour créer de la profondeur

Ces couleurs évoquent :
- ✨ Innovation et IA
- 🎨 Créativité et beauté
- 💎 Luxe et raffinement
- 🚀 Modernité et performance
