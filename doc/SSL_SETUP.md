# 🔒 Configuration SSL/HTTPS pour woosenteur.fr

## ✅ Domaine validé : woosenteur.fr

Félicitations ! Votre domaine est maintenant actif. Voici comment activer le certificat SSL HTTPS.

---

## 🎯 Solution recommandée : Firebase Hosting (GRATUIT + AUTOMATIQUE)

Firebase Hosting fournit **automatiquement** un certificat SSL gratuit via **Let's Encrypt**.

### Étape 1 : Connecter le domaine personnalisé à Firebase

#### A. Accéder à la console Firebase Hosting

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet : **studio-667958240-ed1db**
3. Menu latéral → **Hosting** → **Ajouter un domaine personnalisé**

#### B. Ajouter woosenteur.fr

1. Cliquer sur **"Ajouter un domaine personnalisé"**
2. Entrer : `woosenteur.fr`
3. Firebase va vous demander de vérifier la propriété du domaine

### Étape 2 : Configuration DNS (Chez votre registrar)

Firebase vous donnera des enregistrements DNS à ajouter. Généralement :

#### Pour le domaine principal (woosenteur.fr)

```
Type: A
Nom: @
Valeur: 151.101.1.195
Valeur: 151.101.65.195
```

#### Pour le sous-domaine www (www.woosenteur.fr)

```
Type: CNAME
Nom: www
Valeur: woosenteur.fr
```

#### Vérification de propriété (TXT)

Firebase vous donnera un enregistrement TXT unique pour vérifier que vous possédez le domaine :

```
Type: TXT
Nom: @
Valeur: google-site-verification=XXXXXXXXXXXXXXXXXXXXX
```

### Étape 3 : Attendre la propagation DNS

⏱️ **Temps d'attente** : 5 minutes à 48 heures (généralement 1-2 heures)

#### Vérifier la propagation DNS

```powershell
# Windows PowerShell
nslookup woosenteur.fr
nslookup www.woosenteur.fr

# Ou en ligne
# https://dnschecker.org/#A/woosenteur.fr
```

### Étape 4 : Activation automatique du SSL

Une fois la propagation DNS terminée :

1. Firebase détecte automatiquement la configuration
2. **Let's Encrypt** génère automatiquement un certificat SSL gratuit
3. Le cadenas 🔒 apparaît dans le navigateur
4. Votre site est accessible via `https://woosenteur.fr`

⚠️ **Important** : Le certificat SSL peut prendre jusqu'à **24 heures** après la propagation DNS pour être activé.

---

## 🚀 Déployer sur Firebase Hosting

### Build de production

```powershell
cd "c:\Woosenteur le retour"

# Build l'application
npm run build

# Vérifier que le dossier /out existe
ls out

# Déployer sur Firebase
firebase deploy --only hosting
```

### Vérifier le déploiement

1. Aller sur votre URL Firebase : `https://studio-667958240-ed1db.web.app`
2. Vérifier que le site fonctionne correctement
3. Une fois le DNS propagé, aller sur `https://woosenteur.fr`

---

## 🔧 Configuration avancée Firebase Hosting

### Redirection HTTP → HTTPS (Automatique)

Firebase force automatiquement HTTPS. Aucune configuration nécessaire.

### Redirection www → non-www (ou inverse)

Si vous voulez rediriger `www.woosenteur.fr` vers `woosenteur.fr` :

Dans `firebase.json` :

```json
{
  "hosting": {
    "public": "out",
    "redirects": [
      {
        "source": "https://www.woosenteur.fr/**",
        "destination": "https://woosenteur.fr/:splat",
        "type": 301
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          }
        ]
      }
    ]
  }
}
```

---

## 🌐 Alternative : Vercel (AUSSI GRATUIT + AUTOMATIQUE)

Si vous préférez Vercel à Firebase :

### Étape 1 : Déployer sur Vercel

```powershell
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### Étape 2 : Ajouter le domaine

1. Dashboard Vercel → Votre projet → **Settings** → **Domains**
2. Ajouter `woosenteur.fr`
3. Ajouter `www.woosenteur.fr`

### Étape 3 : Configuration DNS

Vercel vous donnera :

```
Type: A
Nom: @
Valeur: 76.76.21.21

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
```

### Étape 4 : SSL automatique

Vercel active automatiquement le SSL via **Let's Encrypt** dès que le DNS est propagé (5-10 minutes).

---

## 🔍 Vérifier le certificat SSL

### Dans le navigateur

1. Aller sur `https://woosenteur.fr`
2. Cliquer sur le cadenas 🔒 à gauche de l'URL
3. Cliquer sur **"Le certificat est valide"**
4. Vérifier les détails :
   - **Émis par** : Let's Encrypt
   - **Valide jusqu'à** : Date future (généralement 90 jours)

### Via SSL Labs

Tester la qualité de votre SSL :

🔗 https://www.ssllabs.com/ssltest/analyze.html?d=woosenteur.fr

**Objectif** : Note A ou A+

---

## 🛠️ Dépannage

### "Le certificat SSL n'est pas encore actif"

**Causes possibles** :
- DNS pas encore propagé (attendre 1-24h)
- Configuration DNS incorrecte
- Cache navigateur (Ctrl+Shift+R pour forcer le refresh)

**Solution** :
```powershell
# Vider le cache DNS Windows
ipconfig /flushdns

# Tester avec curl (sans cache)
curl -I https://woosenteur.fr
```

### "NET::ERR_CERT_COMMON_NAME_INVALID"

**Cause** : Le certificat n'est pas encore généré ou le DNS pointe vers le mauvais endroit.

**Solution** :
1. Attendre 24h après configuration DNS
2. Vérifier que les enregistrements DNS sont corrects
3. Contacter le support Firebase/Vercel si problème persiste

### "Mixed Content" (contenu mixte)

**Cause** : Votre site charge des ressources HTTP (non sécurisées) depuis HTTPS.

**Solution** :
Vérifier dans `.env.local` et `.env.production` :

```bash
# Forcer HTTPS
NEXT_PUBLIC_APP_URL=https://woosenteur.fr
```

Dans `next.config.ts` :

```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'], // Cloudinary utilise HTTPS
  },
};
```

---

## 📋 Checklist de déploiement SSL

- [ ] Domaine acheté et validé (woosenteur.fr) ✅
- [ ] Projet déployé sur Firebase/Vercel
- [ ] Domaine personnalisé ajouté dans la console
- [ ] Enregistrements DNS configurés (A, CNAME, TXT)
- [ ] DNS propagé (tester avec nslookup ou dnschecker.org)
- [ ] Certificat SSL automatiquement généré par Let's Encrypt
- [ ] Site accessible via `https://woosenteur.fr` avec cadenas 🔒
- [ ] Variables d'environnement mises à jour avec `https://`
- [ ] Test SSL Labs = Note A ou A+
- [ ] reCAPTCHA configuré avec le domaine `woosenteur.fr`
- [ ] Stripe webhook configuré avec `https://woosenteur.fr/api/stripe/webhook`

---

## 🆘 Support

### Firebase Hosting
- Documentation : https://firebase.google.com/docs/hosting/custom-domain
- Support : https://firebase.google.com/support

### Let's Encrypt
- Documentation : https://letsencrypt.org/docs/
- Status : https://letsencrypt.status.io/

### Vercel
- Documentation : https://vercel.com/docs/concepts/projects/domains
- Support : https://vercel.com/support

---

## 🎉 Résumé

**Firebase Hosting** et **Vercel** fournissent tous deux :
- ✅ Certificat SSL **GRATUIT**
- ✅ **Automatique** (pas de configuration manuelle)
- ✅ Renouvellement **automatique** tous les 90 jours
- ✅ Redirection HTTP → HTTPS **automatique**
- ✅ Support HTTP/2 et HTTP/3
- ✅ CDN mondial pour performances optimales

**Il suffit de configurer le DNS et d'attendre la propagation !**
