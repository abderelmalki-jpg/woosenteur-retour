# WooSenteur - Instructions pour Agents d'IA

## Vue d'Ensemble du Projet
WooSenteur est un SaaS spécialisé pour l'e-commerce beauté, générant des fiches produits par IA pour parfums, cosmétiques et soins. Il réduit le temps de création de 3 heures à 3 minutes, ciblant les marchands WooCommerce.

**Problème résolu**: Création de contenu chronophage (recherche mots-clés, pyramide olfactive, rédaction marketing)  
**Solution**: IA hyper-spécialisée en produits sensoriels avec pipeline de validation en 7 étapes

## Stack Technique & Architecture
- **Frontend**: Next.js 15 (App Router), React, TypeScript, TailwindCSS, ShadCN UI, Lucide icons
- **Backend**: Firebase serverless (Authentication, Firestore, Storage, Hosting)
- **Moteur IA**: Genkit avec modèle Gemini pour génération de contenu
- **Paiements**: Stripe (Checkout, Customer Portal, Webhooks)
- **Déploiement**: Export statique (`output: 'export'`) vers Firebase Hosting via `/out`
- **Mobile futur**: Capacitor pour wrapper Android

## Database Structure (Firestore)
```
/users/{userId}
  - email, stripeCustomerId, generationCredits, exportCredits

/users/{userId}/products/{productId}
  - name, brand, category, seoTitle, shortDescription, longDescription, 
    price, weight, mainKeyword, imageUrl, createdAt
```

**Security Rule**: Users can ONLY access their own documents. `isOwner(userId)` enforced on all paths. No cross-user access permitted.

## AI Generation Logic (Critical Pattern)
The AI follows a **7-step validation pipeline** before generating content:

1. **Normalize Input**: Clean, lowercase, spell-check user input
2. **Multi-level Verification**: Check local DB → fallback to web search
3. **Fuzzy Matching**: Use Levenshtein/Soundex for typo correction (e.g., "Gerluin" → "Guerlain")
4. **Confidence Score** (0-100): Dictates AI behavior
   - ≥85%: Auto-correct silently and generate
   - 60-84%: Generate with disclaimer ("Il est probable que...")
   - <60%: Request clarification with options
5. **Guardrails**: NEVER invent brands/claims without documented proof
6. **Cross-validation**: Verify attributes (olfactory notes) from 2+ sources
7. **Template Output**: Structured format (SEO title, short/long descriptions, usage tips, brand info)

**Tone Rule**: Never humiliate users for errors - use empathetic phrasing.

## Key Workflows

### Product Generation Flow
1. User inputs: product name, brand, category (dropdown: Parfums, Cosmétiques, Soins, etc.)
2. Frontend calls Genkit flow → progress bar displays
3. AI generates: SEO title, descriptions, keywords, category suggestion
4. User adds price, adjusts weight (default provided)
5. Image upload → `validateProductImage` flow checks product-image match
6. Save to `/users/{userId}/products/{productId}` in Firestore

### Export Options
- **WooCommerce**: Direct API push (user provides store URL, Consumer Key, Secret Key)
- **CSV**: Batch export for selected products
- *Future*: TikTok Shop, Shopify integrations

### Credit System
- Free Plan: 5 generation credits, 3 export credits
- Paid Plans (Essentiel/Standard/Premium): More credits + advanced AI + bulk export
- Stripe manages subscriptions via Customer Portal

## Design System (Thème Beauté Luxe)
- **Primaire**: Rouge amarante `#C1292E` (header, CTA, logo)
- **Fond**: Rose blush `#F8E7EB` (background principal)
- **Accent**: Abricot chaud `#F46036` (boutons secondaires, highlights)
- **Typographie Titres**: 'Playfair Display' (serif haut contraste) - police heading
- **Typographie Corps**: 'PT Sans' (sans-serif humaniste) - police body
- **Icônes**: Lucide-react (minimalistes, cohérence visuelle)
## Phases de Développement

### Phase 1: Fondation MVP (En cours)
- ✅ Stack Next.js 15 + TypeScript + TailwindCSS + ShadCN
- ✅ Header/Menu avec design system appliqué
- 🔄 Firebase Auth (Email/Password + Magic Link)
- 🔄 Firestore avec règles `isOwner(userId)`
- 🔄 Flux Genkit pour génération (pipeline 7 étapes)
- 🔄 Formulaire génération (nom, marque, catégorie dropdown)
- 🔄 Tableau de bord produits (historique, CRUD)
- 🔄 Export WooCommerce (API REST v3) + CSV
- 🔄 Intégration Stripe (checkout, portail client)

### Phase 2: Consolidation
- Gestion crédits et limitations plan gratuit (5 gen, 3 export)
- Dialogues upgrade et statistiques usage
- Validation image par IA (`validateProductImage` flow)
- Gestion erreurs guidée par IA

### Phase 3: Expansion Premium
- Upload CSV/Excel pour génération en masse
- Fonction "Adapter" (régénération pour événements: Noël, Black Friday)
- Multi-boutiques pour agences + API
- Internationalisation (i18n, priorité anglais)
**Phase 2**: Credit limits, upgrade flows, image validation AI, error handling  
**Phase 3**: Bulk CSV import, event-based regeneration (Christmas/Black Friday), multi-store management, i18n

## Commands & Build
```powershell
# Build for production (static export)
npm run build  # Outputs to /out directory

# Deploy to Firebase
firebase deploy --only hosting

# Local development
npm run dev
```

## Firebase Hosting Config
Ensure `next.config.js` has `output: 'export'` and `firebase.json` points to `"public": "out"`.

## Critical Context
- **Niche-Specific**: All AI prompts assume beauty products (olfactory pyramids, skincare ingredients)
- **WooCommerce Integration**: Uses REST API v3 (Consumer Key/Secret authentication)
- **Image Validation**: Separate Genkit flow prevents catalog errors (e.g., wrong product photo)
- **User-Owned Data**: Firestore rules enforce strict isolation - no admin backdoors in MVP

## Coding Conventions
- Use TypeScript strict mode
- Firebase SDK for all backend interactions (no custom APIs)
- ShadCN components for UI consistency
- Async/await for Genkit AI flows
- Store images in Firebase Storage under `/users/{userId}/products/{productId}/`

## Reference Files
- Blueprint: `doc/blueprint-reconstruction-woosenteur.md` (full technical specification)
- AI prompt logic: Section 7.0 of blueprint
- Security rules: Section 4.2 of blueprint
