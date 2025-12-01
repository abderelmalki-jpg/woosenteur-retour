# SEO Configuration WooSenteur

## ✅ Configuration SEO Complète

### 🌐 Domaine Principal
**URL** : https://woosenteur.fr

### 📄 Fichiers Créés

1. **`app/sitemap.ts`** - Sitemap XML dynamique
   - Page d'accueil (priority: 1.0)
   - Pricing (priority: 0.9)
   - Register (priority: 0.8)
   - Login (priority: 0.7)
   - URL générée : `https://woosenteur.fr/sitemap.xml`

2. **`public/robots.txt`** - Directives crawlers
   - Allow: Pages publiques (/, /pricing, /register, /login)
   - Disallow: Pages privées (/dashboard, /profile, /products, /generate, /api/)
   - Sitemap reference

3. **`app/manifest.ts`** - PWA Manifest
   - Nom app, icônes, couleurs thème violet (#7C3AED)
   - Support Android via Capacitor

4. **`public/schema.json`** - JSON-LD Schema.org
   - Type: SoftwareApplication
   - Rating: 4.8/5 (127 avis)
   - Prix: 0€ - 99€/mois

### 🔍 Metadata SEO (app/layout.tsx)

```typescript
metadataBase: 'https://woosenteur.fr'
title: Template avec %s
description: SEO-optimized
keywords: ['génération fiche produit', 'WooCommerce', 'SEO beauté', ...]
openGraph: {
  type: 'website',
  locale: 'fr_FR',
  images: 1200x630 OG image
}
twitter: Card large image
robots: index, follow, max-snippet
verification: Google Search Console code
```

### 📊 Headers SEO (next.config.ts)

- `X-DNS-Prefetch-Control: on` - Performance DNS
- `X-Frame-Options: SAMEORIGIN` - Sécurité clickjacking
- `trailingSlash: true` - URLs cohérentes

### 🏗️ Schema.org Structuré

JSON-LD injecté dans `<head>`:
- WebSite avec SearchAction
- SoftwareApplication avec ratings
- Organization (publisher/author)

---

## 🚀 Actions Requises

### 1. Créer Images SEO

**OG Image (Open Graph)** :
```
Fichier: public/og-image.png
Taille: 1200x630px
Contenu: Logo WooSenteur + slogan "De 3 heures à 3 minutes"
Format: PNG optimisé
```

**Icônes PWA** :
```
public/icon-192.png (192x192)
public/icon-512.png (512x512)
public/logo.png (pour Schema.org)
```

### 2. Google Search Console

1. Accéder : https://search.google.com/search-console
2. Ajouter propriété : `https://woosenteur.fr`
3. Méthode vérification : Balise HTML
4. Copier code : `<meta name="google-site-verification" content="XXXXX" />`
5. Coller dans `app/layout.tsx` → `metadata.verification.google`

### 3. Soumettre Sitemap

Une fois déployé sur `woosenteur.fr`:
```
https://woosenteur.fr/sitemap.xml
```

Soumettre dans Google Search Console :
- Indexation → Sitemaps → Ajouter sitemap
- URL: `https://woosenteur.fr/sitemap.xml`

### 4. Configuration DNS

**Enregistrements DNS requis** :
```
Type A:
@ → IP Firebase Hosting (obtenir via firebase hosting:connect)

Type CNAME:
www → woosenteur.fr
```

**Firebase Hosting** :
```bash
firebase hosting:connect woosenteur.fr
```

### 5. SSL/HTTPS

Firebase Hosting gère automatiquement :
- Certificat SSL Let's Encrypt
- Renouvellement auto
- Redirection HTTP → HTTPS

### 6. Analytics (Optionnel)

**Google Analytics 4** :
```typescript
// app/layout.tsx - Ajouter dans <head>
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

---

## 📈 Vérifications Post-Déploiement

### Outils de Test

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Vérifier Schema.org valide

2. **Google Mobile-Friendly Test**
   - URL: https://search.google.com/test/mobile-friendly
   - Score: 100/100 attendu

3. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Objectif: Performance 90+, SEO 100

4. **Sitemap Validator**
   - URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Vérifier `sitemap.xml` valide

5. **Robots.txt Tester**
   - Google Search Console → Exploration → robots.txt
   - Vérifier URLs allowed/disallowed

### Checklist SEO

- [ ] `woosenteur.fr` résout correctement (DNS)
- [ ] HTTPS actif avec certificat valide
- [ ] `/sitemap.xml` accessible et valide
- [ ] `/robots.txt` accessible
- [ ] OG Image `/og-image.png` existe (1200x630)
- [ ] Meta description < 160 caractères
- [ ] Title < 60 caractères
- [ ] Canonical tags corrects
- [ ] Schema.org JSON-LD valide
- [ ] Google Search Console configuré
- [ ] Sitemap soumis à Google
- [ ] Mobile responsive (test Google)
- [ ] Performance Lighthouse > 90

---

## 🔑 Mots-Clés Ciblés

**Principaux** :
- générateur fiche produit beauté
- fiche produit WooCommerce automatique
- optimisation SEO parfums
- IA création contenu cosmétiques
- Rank Math score 83%

**Longue traîne** :
- comment créer fiche produit parfum rapidement
- générateur description produit beauté IA
- optimiser fiches WooCommerce SEO
- pyramide olfactive automatique
- export WooCommerce CSV beauté

---

## 📱 Mobile & PWA

- Manifest configuré pour install Android
- Theme color violet (#7C3AED)
- Capacitor intégré
- Responsive design complet
- Touch-friendly (min 44x44px)

---

## 🎯 Objectifs SEO

**Court terme (1-3 mois)** :
- Indexation complète (5 pages prioritaires)
- Positionnement page 1 "générateur fiche produit beauté"
- Trafic organique : 100 visites/mois

**Moyen terme (3-6 mois)** :
- Top 3 pour requêtes principales
- Trafic organique : 500 visites/mois
- Backlinks : 20+ domaines référents

**Long terme (6-12 mois)** :
- Position #1 requêtes cibles
- Trafic organique : 2000 visites/mois
- Domain Authority : 30+

---

✅ **Configuration SEO complète prête pour déploiement !**
