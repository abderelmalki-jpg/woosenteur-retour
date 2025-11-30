# 🎉 WooSenteur - Système d'Authentification Complet

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification Firebase
- **Email/Password** : Inscription + Connexion avec validation
- **Google OAuth** : Sign-in en 1 clic avec popup
- **Auto-création profil** : Première connexion → création automatique dans Firestore `/users/{userId}`
- **Persistance session** : `onAuthStateChanged` garde l'utilisateur connecté
- **Messages d'erreur français** : Traduction des codes Firebase

### 👤 Gestion Utilisateurs (Firestore)
**Collection `/users/{userId}` avec 30+ champs :**

#### Identité
- `displayName`, `email`, `photoURL`, `phoneNumber`

#### Localisation & Langue
- `country` (FR/US/etc.), `city`, `timezone`, `language`

#### Abonnement & Crédits
- `subscriptionPlan` : free/essentiel/standard/premium
- `subscriptionStatus` : active/canceled/incomplete/past_due/trialing
- `creditBalance` : Crédits génération restants (5 par défaut)
- `exportCount` : Nombre d'exports effectués
- `totalGenerations` : Total produits générés

#### Pricing & Paiements
- `currentPrice` (€), `currency` (EUR/USD)
- `subscriptionStartDate`, `subscriptionEndDate`
- `lastPaymentDate`, `nextBillingDate`
- `lifetimeValue` (LTV)

#### Stripe
- `stripeCustomerId`, `subscriptionId`

#### WooCommerce
- `woocommerce.url`, `woocommerce.key`, `woocommerce.secret`

#### Métadonnées
- `createdAt`, `updatedAt`, `lastLoginAt`
- `onboardingCompleted`

#### Préférences
- `autoSaveToFirestore`, `emailNotifications`, `newsletter`

#### Analytics
- `totalProductsGenerated`, `totalExports`
- `averageConfidenceScore`, `favoriteCategories`

### 📄 Pages Créées

#### `/login` - Connexion
- Formulaire Email/Password
- Bouton Google OAuth avec icône Chrome
- Lien vers inscription
- Lien "Mot de passe oublié"
- Design violet/blush cohérent
- Redirection automatique vers `/generate` après login

#### `/register` - Inscription
- Formulaire complet (nom, email, password, confirmation)
- Validation : min 6 caractères, correspondance passwords
- Bouton Google OAuth
- Liste des avantages (génération IA, export WooCommerce, pyramide olfactive)
- Badge "5 générations gratuites • 3 exports inclus"
- CGV/Politique de confidentialité
- Redirection automatique vers `/generate` après inscription

#### `/generate` - Formulaire Génération (PROTÉGÉ)
**Protection :** Wrapper `<ProtectedRoute>` avec redirection `/login` si non authentifié

**Nouvelles fonctionnalités :**
1. **Badge Crédits en header** : Affiche `creditBalance` + `subscriptionPlan`
2. **Vérification crédits avant génération** : Erreur si `creditBalance <= 0`
3. **Sauvegarde automatique après génération** :
   - Création document `/users/{userId}/products/{productId}`
   - Décrémentation automatique des crédits (`creditBalance -= 1`)
   - Log console avec `productId` et crédits restants
4. **Upload images Firebase Storage** :
   - Bouton "📤 Sauvegarder les images" dans onglet Images
   - Upload `mainImage` → `users/{userId}/products/{productId}/main_*.jpg`
   - Upload galerie (max 5) → `users/{userId}/products/{productId}/gallery_*.jpg`
   - Mise à jour Firestore avec `imageUrl` et `galleryImages[]`
5. **Sauvegarde manuelle modifications** :
   - Bouton "💾 Sauvegarder les modifications" dans onglet Détails
   - Met à jour : seoTitle, descriptions, price, volume, weight, tags

### 🎨 Header Mis à Jour

#### Mode Non Authentifié
- Logo WooSenteur
- Liens : Tarifs, Connexion
- Bouton CTA : "Commencer gratuitement" (gradient violet)

#### Mode Authentifié
- Logo WooSenteur
- Liens : Générer, Mes Produits
- **Badge Crédits** : Icône carte + nombre + "crédits" (fond violet/10)
- **Avatar utilisateur** avec dropdown :
  - Nom + Email + Badge plan (FREE/PRO/etc.)
  - Tableau de bord
  - Profil
  - Crédits & Abonnement
  - Paramètres
  - **Déconnexion** (texte rouge)

#### Mobile (Responsive)
- Même logique avec menu hamburger
- Avatar + infos user en haut
- Liste verticale des liens
- Bouton déconnexion en bas

### 📚 Bibliothèques Firebase

#### `/lib/firebase/users.ts` (380 lignes)
**Fonctions disponibles :**
```typescript
createUser(userId, email, additionalData)      // Création compte
getUser(userId)                                 // Récupération profil
updateUser(userId, updates)                     // Mise à jour
updateLastLogin(userId)                         // MAJ dernière connexion
decrementCredits(userId)                        // -1 crédit (retourne bool)
incrementExports(userId)                        // +1 export
updateSubscription(userId, subscriptionData)    // Sync Stripe
saveWooCommerceCredentials(userId, credentials)
completeOnboarding(userId)
updatePreferences(userId, preferences)
```

#### `/contexts/AuthContext.tsx` (150 lignes)
**Hook `useAuth()` expose :**
```typescript
{
  user: FirebaseUser | null,           // Objet Firebase Auth
  userProfile: User | null,             // Document Firestore
  loading: boolean,                     // État chargement initial
  register(email, password, displayName),
  login(email, password),
  loginWithGoogle(),
  logout(),
  refreshUserProfile()                  // Rafraîchir depuis Firestore
}
```

#### `/components/auth/ProtectedRoute.tsx`
- Affiche loader pendant vérification auth
- Redirige vers `/login` si non authentifié
- Affiche composant enfant si authentifié

### 🔄 Workflow Complet

1. **Inscription** (`/register`)
   - User remplit formulaire → `register()` → Firebase Auth + Firestore
   - Profil créé avec 5 crédits gratuits
   - Redirection `/generate`

2. **Connexion** (`/login`)
   - Email/Password ou Google OAuth → `login()` / `loginWithGoogle()`
   - Chargement profil Firestore
   - Mise à jour `lastLoginAt`
   - Redirection `/generate`

3. **Génération Produit** (`/generate`)
   - Vérification crédits > 0
   - Génération IA (7 étapes)
   - **Sauvegarde automatique** :
     - Document Firestore créé
     - Crédits décrementés
     - `savedProductId` stocké en state
   - User édite prix/descriptions/tags
   - **Upload images** :
     - Bouton "Sauvegarder images" → Firebase Storage
     - URLs stockées dans Firestore
   - **Export** :
     - CSV : Téléchargement fichier
     - WooCommerce : REST API v3 (TODO)

4. **Déconnexion**
   - Clic dropdown menu → `logout()` → `signOut()` Firebase
   - Redirection vers `/`

### 🎯 Points Clés Décision Autonome

✅ **Protection des routes** : Middleware au niveau composant (pas Next.js middleware car `output: 'export'`)

✅ **Auto-création profil** : Premier login → vérification existence → `createUser()` si null

✅ **Sauvegarde automatique** : Pas besoin d'action user, se fait après génération IA

✅ **Gestion crédits** : Vérification avant génération + décrémentation après succès

✅ **Upload images déporté** : Séparé de la génération pour éviter timeouts API

✅ **Messages français** : `getAuthErrorMessage()` traduit tous les codes Firebase

✅ **Avatar fallback** : Initiales du nom si pas de photo (W → WooSenteur)

✅ **Responsive** : Menu mobile complet avec avatar + crédits

✅ **ShadCN UI** : Composants ajoutés (dropdown-menu, avatar, badge)

### 🚀 Prochaines Étapes

1. **Page Dashboard** (`/dashboard`)
   - Liste produits avec filtres
   - Stats : crédits utilisés, total générations, catégories favorites
   - Boutons : Éditer, Supprimer, Dupliquer

2. **Activation Firebase Console**
   - Authentication : Email/Password + Google OAuth
   - Storage : Règles pour images (`users/{userId}/**`)
   - Firestore : Règles sécurité `isOwner(userId)`

3. **Test End-to-End**
   - Register → Generate → Save → Upload images → Logout → Login → Dashboard

4. **Intégration Stripe**
   - Webhooks pour sync `subscriptionStatus`
   - Customer Portal pour upgrade/downgrade
   - Recharge crédits

5. **Export WooCommerce**
   - REST API v3 implementation
   - Test avec vraie boutique

---

## 🔥 Résumé Technique

**Stack Auth :**
- Firebase Auth (Email/Password + Google OAuth)
- Firestore (collection `/users/{userId}`)
- Firebase Storage (`users/{userId}/products/{productId}/`)
- React Context (`AuthProvider`)
- ShadCN UI (dropdown-menu, avatar, badge)

**Fichiers Créés :**
```
/contexts/AuthContext.tsx                      (150 lignes)
/lib/firebase/users.ts                         (380 lignes)
/components/auth/LoginForm.tsx                 (120 lignes)
/components/auth/RegisterForm.tsx              (160 lignes)
/components/auth/ProtectedRoute.tsx            (40 lignes)
/app/login/page.tsx                            (5 lignes wrapper)
/app/register/page.tsx                         (5 lignes wrapper)
/components/ui/dropdown-menu.tsx               (ShadCN)
/components/ui/avatar.tsx                      (ShadCN)
```

**Fichiers Modifiés :**
```
/app/layout.tsx                                (+2 lignes AuthProvider)
/app/generate/page.tsx                         (+80 lignes auth/save)
/components/layout/Header.tsx                  (refonte complète 250 lignes)
```

**Total :** ~1200 lignes de code professionnel avec gestion complète de l'authentification et sauvegarde automatique ! 🎉
