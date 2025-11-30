# Configuration reCAPTCHA v2

## Problème actuel
**Erreur**: "Domaine non valide pour la clé de site RECHAPTCHA"

Cette erreur signifie que le domaine actuel n'est pas autorisé dans la console Google reCAPTCHA.

## Solution

### 1. Accéder à la console Google reCAPTCHA
🔗 https://www.google.com/recaptcha/admin

### 2. Identifier votre site reCAPTCHA
- Clé de site actuelle: `6Lft9xwsAAAAAN9srTd26g4Xy0sMjuOIBDyJNDY0`
- Cherchez ce site dans votre console

### 3. Ajouter les domaines autorisés
Dans les paramètres du site, ajoutez les domaines suivants :

```
localhost
127.0.0.1
woosenteur.fr
www.woosenteur.fr
*.vercel.app
*.firebaseapp.com
```

### 4. Domaines à configurer selon votre environnement

#### Développement local
- `localhost`
- `127.0.0.1`

#### Production
- `woosenteur.fr`
- `www.woosenteur.fr`

#### Staging/Preview
- `*.vercel.app` (si déployé sur Vercel)
- `*.firebaseapp.com` (si déployé sur Firebase)
- `*.netlify.app` (si déployé sur Netlify)

### 5. Créer une nouvelle paire de clés (Alternative)

Si vous n'avez plus accès à la console avec la clé actuelle, créez une nouvelle :

1. Aller sur https://www.google.com/recaptcha/admin/create
2. Choisir **reCAPTCHA v2** → "Je ne suis pas un robot"
3. Ajouter tous les domaines listés ci-dessus
4. Copier les nouvelles clés :
   - **Site Key** → `.env.local` dans `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Secret Key** → `.env.local` dans `RECAPTCHA_SECRET_KEY`

### 6. Redémarrer l'application

Après modification des variables d'environnement :

```powershell
npm run dev
```

## Contournement temporaire (Mode développement uniquement)

Le code a été modifié pour permettre un bypass en développement :
- Si `NODE_ENV === 'development'` et que la clé n'est pas configurée
- Un token fictif `'dev-token-bypass'` est automatiquement généré
- ⚠️ **DANGER** : Ne jamais déployer en production avec cette configuration

## Vérification

### Test en local
1. Lancer `npm run dev`
2. Aller sur `/login` ou `/register`
3. Le widget reCAPTCHA doit s'afficher sans erreur
4. Cocher "Je ne suis pas un robot"
5. La connexion/inscription doit fonctionner

### Test en production
1. Déployer sur votre domaine principal
2. Tester `/login` et `/register`
3. Vérifier qu'aucune erreur console n'apparaît
4. Valider que le formulaire fonctionne

## Fichiers concernés

- `components/ReCaptcha.tsx` - Composant client
- `lib/recaptcha.ts` - Validation serveur
- `components/auth/LoginForm.tsx` - Utilisation
- `components/auth/RegisterForm.tsx` - Utilisation (si existe)
- `.env.local` - Variables d'environnement

## Variables d'environnement requises

```bash
# Public (côté client)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lft9xwsAAAAAN9srTd26g4Xy0sMjuOIBDyJNDY0

# Secret (côté serveur uniquement)
RECAPTCHA_SECRET_KEY=6Lft9xwsAAAAAMLlE0L4tEo1J7JDvoZAZzax-SmN
```

## Support

Documentation officielle :
- https://developers.google.com/recaptcha/docs/domain_validation
- https://developers.google.com/recaptcha/docs/faq#localhost_support
