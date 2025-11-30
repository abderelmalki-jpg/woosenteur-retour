# 🎉 WooSenteur - Pages SaaS Créées avec Succès !

## ✅ Pages Complétées (Phase 14)

### 1. Page Tarifs (`/pricing`)
**Fichier**: `/app/pricing/page.tsx` (300+ lignes)

**Fonctionnalités**:
- 4 plans tarifaires (Free, Essentiel €19, Standard €49, Premium €99)
- Intégration Stripe Checkout avec fonction `handleSelectPlan()`
- Détection du plan actuel depuis `userProfile.subscriptionPlan`
- Badges "Plan actuel" et "Plus populaire"
- FAQ section (4 cartes: changer plan, quotas, paiements, remboursement)
- CTA Enterprise avec mailto contact
- Design responsive (md:grid-cols-2 lg:grid-cols-4)
- États de chargement avec spinner

**Prix IDs à configurer** (voir section Configuration Stripe):
- `price_essentiel_monthly`
- `price_standard_monthly`
- `price_premium_monthly`

---

### 2. Dashboard (`/dashboard`)
**Fichier**: `/app/dashboard/page.tsx` (450+ lignes)

**Fonctionnalités**:
- **4 cartes statistiques**:
  - Total produits (avec icône ShoppingBag)
  - Crédits restants (∞ pour admin, bouton "Recharger" si < 3)
  - Plan actuel (badge coloré, bouton "Upgrader" si free)
  - Exports réalisés (compteur produits avec tag "exported")
  
- **Actions rapides**: 2 cartes
  - "Générer nouveau produit" → `/generate`
  - "Voir tous mes produits" → `/products`
  
- **Produits récents**:
  - Grille 3 colonnes (md:grid-cols-2 lg:grid-cols-3)
  - 6 produits par défaut, bouton "Voir plus" (+6 à chaque clic)
  - Cartes cliquables → `/products/{productId}`
  - Placeholder image si pas d'image uploadée
  - Badges catégorie + score SEO (vert ≥85%, orange 60-84%, rouge <60%)
  - Date de génération formatée (FR)
  
- **Score SEO moyen**: Carte verte avec moyenne des `confidenceScore`
- **État vide**: Message + CTA "Générer ma première fiche" si aucun produit

**Sécurité**: Utilise `listProducts(userId)` - données isolées par utilisateur

---

### 3. Mes Produits (`/products`)
**Fichier**: `/app/products/page.tsx` (550+ lignes)

**Fonctionnalités**:
- **Barre de filtres** (Card avec 3 contrôles):
  - Recherche texte (nom + marque + catégorie)
  - Dropdown catégorie (Tous, Parfums, Cosmétiques, Soins, etc.)
  - Tri (Date, Score SEO, Nom A-Z)
  
- **Sélection multiple**:
  - Checkbox "Tout sélectionner" en haut
  - Checkbox par produit dans la liste
  - Barre d'actions groupées (violet) avec compteur + bouton "Supprimer"
  
- **Liste produits**:
  - Cartes en grille 1 colonne (layout horizontal)
  - Image miniature 20x20 (placeholder si vide)
  - Infos: nom, marque, catégorie, score SEO, date
  - Actions: bouton "Modifier" (Edit) + bouton Supprimer (Trash2)
  - Ring rouge si sélectionné
  
- **Dialog de confirmation**:
  - AlertDialog pour suppression individuelle
  - Loading state pendant la suppression
  - Messages de succès/erreur (Alert vert/rouge)
  
- **État vide**: Message adapté selon filtres actifs

**Sécurité**: Fonction `deleteProduct()` supprime aussi les images Firebase Storage

---

### 4. Profil (`/profile`)
**Fichier**: `/app/profile/page.tsx` (400+ lignes)

**Fonctionnalités**:
- **Informations personnelles** (Card avec User icon):
  - Email (disabled, non modifiable)
  - Display Name (editable avec boutons Modifier/Sauvegarder)
  - User ID (Firebase UID, lecture seule, monospace)
  - Badge "ADMIN ∞ crédits" si superadmin
  
- **Abonnement et crédits** (Card avec CreditCard icon):
  - Plan actuel (badge coloré selon plan)
  - Bouton "Upgrader mon plan" si free
  - Bouton "Gérer l'abonnement" (Stripe Customer Portal) si payant
  - 2 cartes statistiques:
    - Crédits génération restants (∞ si admin)
    - Total générations lifetime
  - Prochaine facturation (si `nextBillingDate` existe)
  
- **WooCommerce** (Card placeholder):
  - Message "Fonctionnalité à venir"
  - Préparé pour future implémentation (credentials, test connection)

**Intégration Stripe**:
- Route `/api/stripe/portal` créée (`POST` avec `customerId`)
- Fonction `handleManageSubscription()` → redirection vers Stripe portal
- Loading state pendant création session
- Gestion erreurs si pas de customer ID

---

### 5. API Stripe
**Fichiers créés**:

#### `/app/api/stripe/checkout/route.ts` (40 lignes)
- **POST endpoint** pour créer sessions Checkout
- **Input**: `priceId` (Stripe price ID), `userId` (Firebase UID)
- **Output**: `{ url: session.url }` pour redirection
- **Config**: 
  - Mode: `subscription`
  - Success URL: `/dashboard?success=true`
  - Cancel URL: `/pricing?canceled=true`
  - Metadata: `{ userId }` pour webhook

#### `/app/api/stripe/webhook/route.ts` (140 lignes)
- **POST endpoint** pour webhooks Stripe
- **Vérification signature**: `stripe.webhooks.constructEvent()`
- **5 event handlers**:
  1. `checkout.session.completed`: Créer abonnement Firestore (mapping price ID → plan)
  2. `invoice.paid`: Update billing date (TODO)
  3. `invoice.payment_failed`: Notify user (TODO)
  4. `customer.subscription.updated`: Update status/dates
  5. `customer.subscription.deleted`: Downgrade to free plan
- **Status mapping**: active, canceled, incomplete, past_due, trialing

#### `/app/api/stripe/portal/route.ts` (35 lignes)
- **POST endpoint** pour Customer Portal
- **Input**: `customerId` (Stripe customer ID)
- **Output**: `{ url: portalSession.url }`
- **Return URL**: `/profile`

---

### 6. Landing Page Améliorée (`/`)
**Fichier**: `/app/page.tsx` (600+ lignes)

**Nouvelles sections**:

1. **Hero Section**:
   - Badge "Propulsé par Gemini 2.0"
   - Titre serif "De 3 Heures à 3 Minutes" (colored spans)
   - Sous-titre avec score "83% Rank Math garanti"
   - 2 CTA: "Commencer gratuitement" (rouge) + "Voir tarifs" (outline)
   - Stats 3 colonnes: 83% SEO, 3 min, 7 étapes validation

2. **Comment ça marche** (3 étapes):
   - Étape 1: Entrez infos (Target icon, violet)
   - Étape 2: IA génère (Sparkles icon, pink)
   - Étape 3: Exportez (CheckCircle2 icon, amber)
   - Cartes avec barre colorée gauche + badges "Étape X"

3. **Pourquoi WooSenteur** (6 features):
   - Score SEO garanti (TrendingUp, green)
   - Génération ultra-rapide (Zap, yellow)
   - Validation 7 étapes (Shield, blue)
   - Spécialisé beauté (Target, purple)
   - Export WooCommerce (CheckCircle2, pink)
   - Gain de temps (Clock, orange)

4. **Testimonials** (3 cartes):
   - Sophie Martin (Gérante boutique)
   - Alexandre Dubois (E-commerce manager)
   - Marie Laurent (Consultante beauté)
   - 5 étoiles + avatar initiales + quote

5. **Pricing Preview** (4 plans):
   - Grille 4 colonnes avec pricing cards
   - Plan "Standard" highlighted (ring rouge + badge)
   - Liste features avec CheckCircle2 icons
   - CTA "Voir tous les détails" vers `/pricing`

6. **CTA Final**:
   - Card gradient rouge-orange
   - Titre serif "Prêt à transformer..."
   - 2 boutons: "Créer compte gratuit" (blanc) + "Découvrir forfaits" (outline blanc)
   - Footer 3 items: 5 crédits, sans CB, 83% SEO

**Design**: Theme beauté luxe (rose-pink-amber gradient, font serif Playfair)

---

## 🔧 Configuration Stripe Requise

### Étape 1: Récupérer les clés API
1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **API keys**
3. Copier:
   - **Secret key** (commence par `sk_test_...` ou `sk_live_...`)
   - **Publishable key** (commence par `pk_test_...` ou `pk_live_...`)

### Étape 2: Créer les produits et price IDs
1. **Products** → **Add product**
2. Créer 3 produits:

   **Produit 1: Plan Essentiel**
   - Nom: `Plan Essentiel`
   - Description: `50 générations par mois`
   - Prix: `19€` (recurring monthly)
   - Copier le **Price ID** (format `price_xxxxx`)

   **Produit 2: Plan Standard**
   - Nom: `Plan Standard`
   - Description: `200 générations par mois`
   - Prix: `49€` (recurring monthly)
   - Copier le **Price ID**

   **Produit 3: Plan Premium**
   - Nom: `Plan Premium`
   - Description: `1000 générations par mois`
   - Prix: `99€` (recurring monthly)
   - Copier le **Price ID**

### Étape 3: Configurer .env.local
Ajouter dans `.env.local`:

```env
# Stripe Keys (remplacer par vos vraies clés)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici

# URL de l'app (localhost en dev, votre domaine en prod)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 4: Mettre à jour les Price IDs dans le code
Ouvrir `/app/pricing/page.tsx` et remplacer ligne ~65:

```typescript
// AVANT (placeholders)
const priceIds = {
  essentiel: 'price_essentiel_monthly',
  standard: 'price_standard_monthly',
  premium: 'price_premium_monthly'
};

// APRÈS (vos vrais IDs)
const priceIds = {
  essentiel: 'price_1234567890abcdefgh',  // ⬅️ Remplacer
  standard: 'price_abcdefgh1234567890',   // ⬅️ Remplacer
  premium: 'price_xyz9876543210mnopqr'    // ⬅️ Remplacer
};
```

**Également dans** `/app/api/stripe/webhook/route.ts` ligne ~80:

```typescript
const priceIdToPlan: Record<string, string> = {
  'price_1234567890abcdefgh': 'essentiel',  // ⬅️ Remplacer
  'price_abcdefgh1234567890': 'standard',   // ⬅️ Remplacer
  'price_xyz9876543210mnopqr': 'premium'    // ⬅️ Remplacer
};
```

### Étape 5: Configurer le Webhook
1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**
2. URL endpoint:
   - Dev: `http://localhost:3000/api/stripe/webhook` (avec Stripe CLI, voir ci-dessous)
   - Prod: `https://votredomaine.com/api/stripe/webhook`
3. Événements à écouter:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le **Signing secret** (commence par `whsec_...`)
5. Ajouter dans `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Étape 6: Tester en local avec Stripe CLI

#### Installer Stripe CLI:
**Windows (PowerShell)**:
```powershell
scoop install stripe
```

Ou télécharger depuis: https://github.com/stripe/stripe-cli/releases

#### Commandes:
```powershell
# Se connecter à Stripe
stripe login

# Écouter les webhooks (laissez tourner dans un terminal séparé)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Cette commande affiche un webhook secret temporaire - le copier dans .env.local

# Tester un événement spécifique (dans un autre terminal)
stripe trigger checkout.session.completed
```

#### Tester le flow complet:
1. Aller sur `http://localhost:3000/pricing`
2. Cliquer "Choisir" sur un plan
3. Page Stripe Checkout s'ouvre (mode test)
4. Utiliser carte test: `4242 4242 4242 4242`, date future, CVC 123
5. Valider le paiement
6. Vérifier dans les logs du terminal `stripe listen` que le webhook est reçu
7. Vérifier dans Firestore que l'abonnement est créé:
   - Collection: `/users/{userId}`
   - Champs mis à jour: `subscriptionPlan`, `stripeCustomerId`, `subscriptionId`, `subscriptionStatus`

### Étape 7: Activer Stripe Customer Portal
1. **Stripe Dashboard** → **Settings** → **Billing** → **Customer portal**
2. Activer le portail
3. Configurer les options:
   - ✅ Permettre changement de plan
   - ✅ Permettre annulation abonnement
   - ✅ Afficher historique factures
   - ✅ Permettre mise à jour moyen de paiement
4. URL de retour par défaut: `https://votredomaine.com/profile`

### Étape 8: Tester le Customer Portal
1. Créer un abonnement via `/pricing` (étape 6)
2. Aller sur `/profile`
3. Cliquer "Gérer l'abonnement"
4. Vérifier redirection vers Stripe Customer Portal
5. Tester changement de plan, annulation, etc.
6. Vérifier que les webhooks mettent à jour Firestore

---

## 📋 Checklist de Déploiement

Avant de déployer en production:

- [ ] **Stripe en mode Live**:
  - [ ] Remplacer `sk_test_...` par `sk_live_...`
  - [ ] Remplacer `pk_test_...` par `pk_live_...`
  - [ ] Créer webhook en production avec URL réelle
  - [ ] Copier nouveau `STRIPE_WEBHOOK_SECRET` en prod

- [ ] **Variables d'environnement production**:
  - [ ] `NEXT_PUBLIC_APP_URL=https://votredomaine.com`
  - [ ] Toutes les clés Stripe en mode live

- [ ] **Firestore Security Rules**:
  - [ ] Vérifier règle `isOwner(userId)` active
  - [ ] Tester accès cross-user bloqué

- [ ] **Tests complets**:
  - [ ] Création compte gratuit (5 crédits)
  - [ ] Génération produit (décrémente crédit)
  - [ ] Upgrade vers plan payant
  - [ ] Webhook subscription créée
  - [ ] Dashboard affiche bon plan
  - [ ] Customer Portal fonctionne
  - [ ] Downgrade/Cancel met à jour Firestore

---

## 🎨 Thème Design Appliqué

Toutes les pages utilisent le thème beauté luxe:

- **Couleurs**:
  - Primaire: `#C1292E` (rouge amarante)
  - Fond: `from-rose-50 via-pink-50 to-amber-50` (gradient)
  - Accent: `#F46036` (abricot chaud)

- **Typographie**:
  - Titres: `font-serif` (Playfair Display)
  - Corps: `font-sans` (PT Sans)

- **Icônes**: Lucide-react (cohérence visuelle)

- **Badges plans**:
  - Free: slate (gris)
  - Essentiel: violet
  - Standard: bleu
  - Premium: amber

---

## 📊 Architecture Firestore

### Collection `/users/{userId}`
Champs ajoutés pour Stripe:

```typescript
{
  // ... champs existants ...
  
  // Stripe
  stripeCustomerId?: string,           // cus_xxxxx
  subscriptionId?: string,             // sub_xxxxx
  subscriptionPlan: 'free' | 'essentiel' | 'standard' | 'premium',
  subscriptionStatus?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing',
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,
  nextBillingDate?: Date,
  
  // Crédits
  creditBalance: number,               // Décrémenté à chaque génération
  totalGenerations: number,            // Lifetime counter
  
  // Admin
  role?: 'user' | 'admin' | 'superadmin',
  isUnlimited?: boolean                // Bypass credit checks
}
```

### Collection `/users/{userId}/products/{productId}`
Structure inchangée (voir `lib/firebase/products.ts`)

---

## 🚀 Routes Disponibles

| Route | Fichier | Protection | Description |
|-------|---------|------------|-------------|
| `/` | `app/page.tsx` | Public | Landing page améliorée |
| `/register` | `app/register/page.tsx` | Public | Inscription |
| `/login` | `app/login/page.tsx` | Public | Connexion |
| `/dashboard` | `app/dashboard/page.tsx` | Protected | Tableau de bord |
| `/generate` | `app/generate/page.tsx` | Protected | Génération IA |
| `/products` | `app/products/page.tsx` | Protected | Liste produits |
| `/products/{id}` | À créer | Protected | Détail/édition produit |
| `/profile` | `app/profile/page.tsx` | Protected | Profil utilisateur |
| `/pricing` | `app/pricing/page.tsx` | Public | Page tarifs |
| `/api/stripe/checkout` | `app/api/stripe/checkout/route.ts` | API | Créer session Checkout |
| `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | API | Webhooks Stripe |
| `/api/stripe/portal` | `app/api/stripe/portal/route.ts` | API | Customer Portal |
| `/api/generate` | `app/api/generate/route.ts` | API | Génération IA |

---

## 🐛 Debugging

### Logs à surveiller:

**Génération IA**:
```
✅ Admin détecté - crédits illimités
🔍 Vérification d'existence sur sources fiables...
```

**Stripe Webhook**:
```
✅ Webhook received: checkout.session.completed
✅ Subscription created for user {userId}
```

**Credit Management**:
```
✅ Produit sauvegardé : {productId} pour user {userId}
✅ Crédit décrémenté : {creditBalance} crédits restants
```

### Erreurs communes:

1. **"No Stripe customer ID"** → Utilisateur n'a jamais payé, normal pour compte gratuit
2. **"Invalid price ID"** → Vérifier que les price IDs dans le code correspondent à Stripe Dashboard
3. **"Webhook signature verification failed"** → Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env.local`
4. **"404 Not Found" sur webhook** → Vérifier URL endpoint dans Stripe Dashboard

---

## ✅ Prochaines Étapes Recommandées

1. **Page détail produit** (`/products/{id}`):
   - Formulaire d'édition complet
   - Upload image avec preview
   - Bouton "Exporter vers WooCommerce"
   - Historique des modifications

2. **Export WooCommerce**:
   - Route API `/api/woocommerce/export`
   - Formulaire credentials dans `/profile`
   - Test connection avant export
   - Mapping champs WooSenteur → WooCommerce

3. **Export CSV**:
   - Bouton "Exporter sélection en CSV" dans `/products`
   - Génération CSV côté client avec `papaparse`
   - Template colonnes WooCommerce

4. **Génération en masse**:
   - Upload CSV avec liste produits
   - Queue processing avec Firebase Functions
   - Progress tracking en temps réel

5. **Analytics**:
   - Graphiques génération par jour (Chart.js)
   - Catégories les plus générées
   - Score SEO moyen évolution

6. **Notifications**:
   - Email nouvel abonnement (SendGrid/Mailgun)
   - Email facturation échouée
   - Email crédits bientôt épuisés

---

## 🎉 Félicitations !

Vous avez maintenant une infrastructure SaaS complète avec:
- ✅ Système d'authentification (Email/Password, Google OAuth, Magic Link)
- ✅ Génération IA avec Gemini 2.0 (83% SEO score)
- ✅ Système admin (unlimited credits, bypass checks)
- ✅ Pages Dashboard, Products, Profile
- ✅ Intégration Stripe (Checkout, Webhooks, Customer Portal)
- ✅ Landing page marketing
- ✅ Thème beauté luxe cohérent

**Prochaine étape**: Configurer Stripe avec les instructions ci-dessus et tester le flow complet ! 🚀
