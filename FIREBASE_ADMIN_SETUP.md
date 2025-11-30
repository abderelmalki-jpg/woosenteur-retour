# Instructions Firebase Admin Service Account

## Comment obtenir la clé privée Firebase Admin

1. **Allez sur la Console Firebase** :
   https://console.firebase.google.com/project/studio-667958240-ed1db/settings/serviceaccounts/adminsdk

2. **Générer une nouvelle clé privée** :
   - Cliquez sur "Générer une nouvelle clé privée"
   - Un fichier JSON sera téléchargé (ex: `studio-667958240-ed1db-firebase-adminsdk-xxxxx.json`)

3. **Extraire les valeurs du fichier JSON** :
   ```json
   {
     "project_id": "studio-667958240-ed1db",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@studio-667958240-ed1db.iam.gserviceaccount.com"
   }
   ```

4. **Mettre à jour .env.local** :
   ```bash
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studio-667958240-ed1db.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_COMPLETE\n-----END PRIVATE KEY-----\n"
   ```

5. **Important** :
   - Gardez ce fichier JSON **secret** et **ne le commitez JAMAIS** sur Git
   - Le fichier est déjà dans `.gitignore` : `*firebase-adminsdk*.json`
   - Utilisez des variables d'environnement pour la production

## Utilisation

Une fois configuré, les API routes pourront :
- ✅ Vérifier l'authentification des utilisateurs
- ✅ Décrémenter les crédits de génération
- ✅ Accéder à Firestore côté serveur
- ✅ Gérer les webhooks Stripe avec sécurité

## Alternative (Production)

Pour Firebase Hosting/Cloud Functions, utilisez les credentials par défaut :
```javascript
// Pas besoin de clé privée en production Firebase
import admin from 'firebase-admin';
admin.initializeApp();
```
