# 🔥 Activation Firebase - Checklist Complète

## 📋 Avant de Tester l'Application

### 1️⃣ Firebase Authentication

#### Activer Email/Password
1. Ouvrir [Firebase Console](https://console.firebase.google.com)
2. Sélectionner projet **studio-667958240-ed1db**
3. Menu **Authentication** → **Sign-in method**
4. Cliquer sur **Email/Password**
5. Activer le toggle **Enable**
6. **NE PAS** activer "Email link (passwordless sign-in)" pour le moment
7. Cliquer **Save**

#### Activer Google OAuth
1. Dans **Authentication** → **Sign-in method**
2. Cliquer sur **Google**
3. Activer le toggle **Enable**
4. **Project support email** : Sélectionner votre email
5. Cliquer **Save**
6. ⚠️ **Important** : Ajouter domaine autorisé :
   - Aller dans **Authorized domains**
   - Ajouter `localhost` (déjà présent normalement)
   - Pour production : Ajouter votre domaine Firebase Hosting

### 2️⃣ Firebase Storage

#### Activer Storage
1. Menu **Storage** dans Firebase Console
2. Cliquer **Get Started**
3. **Security rules** : Choisir **Production mode** (on va modifier ensuite)
4. **Location** : Sélectionner `europe-west1` (Europe)
5. Cliquer **Done**

#### Configurer Règles de Sécurité Storage
Remplacer les règles par défaut par celles-ci :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règle : Seul le propriétaire peut accéder à ses fichiers
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*'); // Images seulement
    }
    
    // Bloquer tout autre accès
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Explications :**
- `users/{userId}/**` : Structure hiérarchique (userId DOIT correspondre à l'UID Firebase Auth)
- `request.auth.uid == userId` : Vérification stricte du propriétaire
- `size < 5MB` : Limite taille fichier
- `contentType.matches('image/.*')` : Accepte uniquement images (JPG, PNG, WEBP, etc.)

#### Tester Storage
Après activation, vérifier que le bucket existe :
```
gs://studio-667958240-ed1db.firebasestorage.app
```

### 3️⃣ Firestore Database (DÉJÀ CONFIGURÉ ✅)

#### Vérifier Règles de Sécurité Firestore
Menu **Firestore Database** → **Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function : Vérifie que l'utilisateur est propriétaire
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Collection Users : READ/WRITE uniquement son propre document
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      // Sous-collection Products
      match /products/{productId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Bloquer tout autre accès
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Explications :**
- `isOwner(userId)` : Fonction réutilisable pour vérifier propriété
- `/users/{userId}` : Utilisateur peut lire/écrire UNIQUEMENT son propre document
- `/users/{userId}/products/{productId}` : Idem pour sous-collection produits
- **Pas d'accès admin backdoor** dans le MVP (sécurité renforcée)

### 4️⃣ Google Custom Search API (DÉJÀ CONFIGURÉ ✅)

#### Vérifier Quotas
1. [Google Cloud Console](https://console.cloud.google.com)
2. Projet **studio-667958240**
3. **APIs & Services** → **Enabled APIs**
4. Vérifier :
   - ✅ Custom Search API (activée)
   - ✅ Gemini API (activée)
   - ✅ Cloud Natural Language API (activée)

#### Vérifier Clés API
Dans `.env.local` :
```bash
# Gemini AI (pour génération)
GOOGLE_API_KEY=AIzaSyCybVxSasqLFr-qtMFcs0eEcyDv3D3YVTg

# Custom Search (pour vérification produits)
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyCybVxSasqLFr-qtMFcs0eEcyDv3D3YVTg
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=215ffc97488b34cba
```

### 5️⃣ Test de Vérification

#### Test 1 : Inscription
```bash
1. Démarrer : npm run dev
2. Ouvrir : http://localhost:3000/register
3. Remplir formulaire :
   - Nom : Test User
   - Email : test@woosenteur.com
   - Password : test123456
4. Cliquer "Créer mon compte gratuit"
5. ✅ Vérifier redirection vers /generate
6. ✅ Vérifier header : Avatar + "Test User" + Badge "FREE"
7. ✅ Vérifier crédits : 5 crédits affichés
```

**Vérification Firebase Console :**
- **Authentication** → **Users** : Voir `test@woosenteur.com`
- **Firestore** → **users** : Document avec UID user créé
- Contenu : `creditBalance: 5`, `subscriptionPlan: "free"`, `createdAt`, `lastLoginAt`

#### Test 2 : Google OAuth
```bash
1. Ouvrir : http://localhost:3000/login
2. Cliquer bouton "Google"
3. Popup Google : Sélectionner compte
4. ✅ Vérifier redirection vers /generate
5. ✅ Vérifier avatar : Photo Google affichée
6. ✅ Vérifier displayName : Nom Google
```

**Vérification Firebase Console :**
- **Authentication** → **Users** : Nouvel utilisateur avec provider Google
- **Firestore** → **users** : Document créé avec `photoURL`, `displayName`

#### Test 3 : Génération Produit
```bash
1. Page /generate
2. Remplir :
   - Nom : "La Vie Est Belle"
   - Marque : "Lancôme"
   - Catégorie : "Parfums"
3. Cliquer "Générer la fiche produit"
4. ✅ Vérifier progress bar (15%→30%→50%→70%→85%→95%→100%)
5. ✅ Vérifier badge crédits : 4 crédits (décrémenté)
6. ✅ Vérifier console : "Produit sauvegardé : [productId]"
7. ✅ Vérifier console : "Crédits restants : 4"
```

**Vérification Firestore :**
- **users/[userId]/products** : Nouveau document créé
- Contenu : `productName`, `brand`, `seoTitle`, `shortDescription`, `longDescription`, `confidenceScore`, `generationDate`

#### Test 4 : Upload Images
```bash
1. Onglet "Images"
2. Upload image principale (PNG/JPG)
3. Upload 2-3 images galerie
4. Cliquer "📤 Sauvegarder les images"
5. ✅ Vérifier console : "Image principale uploadée : [URL]"
6. ✅ Vérifier console : "3 images galerie uploadées"
```

**Vérification Storage :**
- **Storage** → `users/[userId]/products/[productId]/`
- Fichiers : `main_[timestamp].jpg`, `gallery_[timestamp]_1.jpg`, etc.

**Vérification Firestore :**
- Document produit mis à jour :
  - `imageUrl: "https://firebasestorage.googleapis.com/..."`
  - `galleryImages: ["https://...", "https://...", ...]`

#### Test 5 : Déconnexion + Reconnexion
```bash
1. Clic avatar → "Déconnexion"
2. ✅ Vérifier redirection vers /
3. ✅ Vérifier header : Boutons "Connexion" + "Commencer gratuitement"
4. Ouvrir /generate directement
5. ✅ Vérifier redirection automatique vers /login
6. Se reconnecter (email/password)
7. ✅ Vérifier redirection vers /generate
8. ✅ Vérifier crédits : 4 crédits (persistés)
```

### 6️⃣ Erreurs Courantes et Solutions

#### ❌ Erreur : "auth/operation-not-allowed"
**Cause :** Email/Password ou Google OAuth non activé dans Firebase Console  
**Solution :** Activer dans Authentication → Sign-in method

#### ❌ Erreur : "storage/unauthorized"
**Cause :** Règles Storage trop restrictives ou user non authentifié  
**Solution :** Vérifier règles Storage (voir section 2️⃣) et que `request.auth != null`

#### ❌ Erreur : "permission-denied" Firestore
**Cause :** Règles Firestore bloquent l'accès ou userId ne correspond pas  
**Solution :** Vérifier que `userId` dans path = `request.auth.uid`

#### ❌ Images ne s'uploadent pas
**Cause :** Storage pas activé ou fichier > 5MB  
**Solution :** 
1. Activer Storage dans Firebase Console
2. Vérifier taille fichier < 5MB
3. Vérifier format image (JPG/PNG/WEBP)

#### ❌ "CORS policy" erreur Google OAuth
**Cause :** Domaine non autorisé  
**Solution :** Ajouter `localhost` et domaine prod dans Authentication → Settings → Authorized domains

#### ❌ Crédits ne se décrementent pas
**Cause :** Erreur silencieuse dans `decrementCredits()`  
**Solution :** Vérifier console navigateur et logs Firebase Console

### 7️⃣ Monitoring & Logs

#### Firebase Console - Usage
- **Authentication** → **Usage** : Voir nombre d'utilisateurs actifs
- **Firestore** → **Usage** : Reads/Writes quotidiennes
- **Storage** → **Usage** : Espace utilisé + bande passante

#### Quotas Gratuits (Spark Plan)
- **Authentication** : Illimité (Email + OAuth)
- **Firestore** : 50k reads, 20k writes, 20k deletes par jour
- **Storage** : 5GB stockage + 1GB/jour download
- **Custom Search** : 100 requêtes/jour (gratuit)
- **Gemini API** : 1500 requêtes/jour (gratuit)

#### Alertes Recommandées
1. Créer alerte Firestore > 40k reads/jour
2. Créer alerte Storage > 800MB download/jour
3. Monitorer erreurs Authentication (console)

### 8️⃣ Déploiement Production

#### Avant de Déployer
1. ✅ Tester tous les flows (inscription, login, génération, upload, déconnexion)
2. ✅ Vérifier `.env.local` non commité (dans `.gitignore`)
3. ✅ Configurer `.env.production` avec même clés
4. ✅ Ajouter domaine prod dans Authentication → Authorized domains
5. ✅ Mettre à jour `NEXT_PUBLIC_APP_URL` vers domaine prod

#### Commandes Déploiement
```bash
# Build statique
npm run build

# Deploy Firebase Hosting
firebase deploy --only hosting

# Vérifier déploiement
# Ouvrir : https://studio-667958240-ed1db.web.app
```

#### Post-Déploiement
1. Tester inscription/login sur prod
2. Tester génération complète
3. Vérifier Storage upload fonctionne
4. Monitorer Firebase Console Usage

---

## ✅ Checklist Finale

- [ ] Firebase Authentication activée (Email/Password + Google OAuth)
- [ ] Firebase Storage activée + règles configurées
- [ ] Firestore règles vérifiées (`isOwner(userId)`)
- [ ] Google Custom Search API quotas vérifiés
- [ ] Test inscription email/password réussi
- [ ] Test Google OAuth réussi
- [ ] Test génération + sauvegarde Firestore réussi
- [ ] Test upload images Storage réussi
- [ ] Test décrémentation crédits réussi
- [ ] Test déconnexion/reconnexion réussi
- [ ] Test protection route /generate réussi
- [ ] Monitoring Firebase Console configuré

**Une fois tous les tests passés → Prêt pour production ! 🚀**
