# Guide de Déploiement WooSenteur

## 🚀 Options de Déploiement

### Option 1: Vercel (Recommandé pour Next.js)
Vercel supporte nativement les API Routes Next.js et offre les meilleures performances.

```bash
# Installation Vercel CLI
npm i -g vercel

# Connexion
vercel login

# Déploiement
vercel --prod

# Variables d'environnement à configurer sur Vercel:
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# - NEXT_PUBLIC_FIREBASE_APP_ID
# - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - FIREBASE_ADMIN_CLIENT_EMAIL
# - FIREBASE_ADMIN_PRIVATE_KEY
# - GEMINI_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
```

**Avantages:**
- ✅ Support natif Next.js API Routes
- ✅ Edge Functions ultra-rapides
- ✅ SSL automatique
- ✅ Preview deployments pour chaque commit
- ✅ Analytics intégrés

### Option 2: Firebase Hosting + Cloud Functions
Utiliser Firebase Functions pour les API routes.

```bash
# 1. Installer Firebase Functions
npm install -D firebase-functions firebase-admin

# 2. Migrer les API routes vers /functions
# Chaque route devient une Cloud Function

# 3. Build Next.js en mode export
# Dans next.config.ts: output: 'export'

# 4. Deploy
npm run build
firebase deploy
```

**Avantages:**
- ✅ Tout sur Firebase
- ✅ Firestore co-localisé
- ✅ Gratuit jusqu'à 2M invocations/mois

**Inconvénients:**
- ❌ Cold starts (300-500ms)
- ❌ Complexité migration routes

### Option 3: Netlify
Alternative à Vercel avec support Next.js.

```bash
# Installation Netlify CLI
npm i -g netlify-cli

# Connexion
netlify login

# Déploiement
netlify deploy --prod
```

## 🔧 Configuration Actuelle

**État actuel:**
- `next.config.ts`: `output: 'export'` commenté (mode dev)
- 11 API Routes serveur actives
- Firebase Hosting configuré pour static export

**Pour production Firebase Hosting (static):**
1. Décommenter `output: 'export'` dans `next.config.ts`
2. Migrer les 11 API routes vers Firebase Cloud Functions
3. Update `firebase.json` rewrites

**Pour production Vercel (recommandé):**
1. Garder `output: 'export'` commenté
2. Déployer directement `vercel --prod`
3. Configurer les variables d'environnement
4. Done ✅

## 📊 Comparaison Hébergeurs

| Feature | Vercel | Firebase | Netlify |
|---------|--------|----------|---------|
| API Routes Next.js | ✅ Natif | ⚠️ Cloud Functions | ✅ Natif |
| Cold Start | ❌ Aucun | ⚠️ 300-500ms | ❌ Aucun |
| SSL Auto | ✅ | ✅ | ✅ |
| Custom Domain | ✅ Gratuit | ✅ Gratuit | ✅ Gratuit |
| Edge Network | ✅ Global | ✅ CDN Firebase | ✅ Global |
| Prix Gratuit | 100GB bande passante | 10GB storage | 100GB bande passante |
| Analytics | ✅ Intégré | ⚠️ Google Analytics | ✅ Intégré |

## 🎯 Recommandation

**Pour WooSenteur:** Vercel est recommandé car:
- Support natif des 11 API routes sans migration
- Performances optimales (Edge Functions)
- Déploiement instantané depuis GitHub
- Preview deployments pour tests
- Analytics gratuits

**Commande de déploiement:**
```bash
# 1. Connecter le repo GitHub à Vercel
vercel link

# 2. Configurer les env vars sur dashboard Vercel

# 3. Deploy
vercel --prod
```

## 🔐 Checklist Avant Production

- [ ] Variables d'environnement configurées
- [ ] Firebase Admin service account valide
- [ ] Stripe webhooks pointent vers URL production
- [ ] reCAPTCHA autorise le domaine production
- [ ] Firebase Auth autorise le domaine production
- [ ] DNS configuré (woosenteur.fr → Vercel)
- [ ] SSL activé
- [ ] Rate limiting testé
- [ ] Tests end-to-end passés
- [ ] Monitoring erreurs configuré (Sentry?)

## 📝 Post-Déploiement

1. Tester génération produit
2. Tester export WooCommerce
3. Tester paiement Stripe
4. Monitorer logs Firebase/Vercel
5. Configurer alertes erreurs
