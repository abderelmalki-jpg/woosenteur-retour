# 🚀 Configuration Android Capacitor - WooSenteur

## ✅ Configuration Complétée

### 📦 Packages Installés
- **Capacitor Core**: `@capacitor/core`, `@capacitor/cli` (v7.x)
- **Plateforme**: `@capacitor/android` (v7.x)
- **Plugins Essentiels**:
  - `@capacitor/preferences` - Stockage local (remplace localStorage)
  - `@capacitor/camera` - Capture photo produits
  - `@capacitor/share` - Partage contenu
  - `@capacitor/browser` - OAuth Firebase (Google/Apple)
  - `@capacitor/network` - État connexion
  - `@capacitor/filesystem` - Accès fichiers
  - `@capacitor/app` - Lifecycle Android
  - `@capacitor/splash-screen` - Écran démarrage violet
  - `@capacitor/status-bar` - Barre statut violet

**Total**: 1056 packages audités, 0 vulnérabilité

---

## 🔧 Fichiers Configurés

### 1. `capacitor.config.ts`
```typescript
{
  appId: 'fr.woosenteur.app',
  appName: 'WooSenteur',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'woosenteur.fr'
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#7C3AED', // Violet WooSenteur
      launchShowDuration: 2000,
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#7C3AED'
    }
  }
}
```

### 2. `android/app/src/main/AndroidManifest.xml`
**Permissions ajoutées**:
- ✅ `INTERNET` - Connexion API Firebase/Stripe
- ✅ `ACCESS_NETWORK_STATE` - Détection connectivité
- ✅ `CAMERA` - Upload photos produits
- ✅ `READ_MEDIA_IMAGES` (Android 13+)
- ✅ `READ_EXTERNAL_STORAGE` (Android ≤12)
- ✅ `WRITE_EXTERNAL_STORAGE` (Android ≤10)

### 3. `android/app/src/main/res/values/colors.xml`
**Thème violet cohérent**:
```xml
<color name="colorPrimary">#7C3AED</color> <!-- Violet 600 -->
<color name="colorPrimaryDark">#5B21B6</color> <!-- Violet 800 -->
<color name="colorAccent">#A78BFA</color> <!-- Purple 400 -->
<color name="splashBackground">#7C3AED</color>
```

---

## 📂 Structure Projet Android Créée

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/          ← Assets Next.js synchronisés
│   │       ├── java/
│   │       │   └── fr/woosenteur/app/
│   │       │       └── MainActivity.java
│   │       ├── res/
│   │       │   ├── drawable/
│   │       │   │   └── splash.png   ← Splash screen violet
│   │       │   ├── values/
│   │       │   │   ├── colors.xml   ✅ Créé (thème violet)
│   │       │   │   ├── strings.xml
│   │       │   │   └── styles.xml
│   │       │   └── mipmap-*/ ← Icônes app (à générer)
│   │       └── AndroidManifest.xml  ✅ Permissions ajoutées
│   └── build.gradle
├── gradle/
├── gradlew                           ← Script build Linux/Mac
├── gradlew.bat                       ← Script build Windows
└── build.gradle
```

---

## ✅ Synchronisation Effectuée

**Commandes exécutées**:
```bash
npm run build                 # Build Next.js → /out
npx cap sync android          # Copie /out → android/app/src/main/assets/public
```

**Résultat**:
- ✅ 9 plugins Capacitor détectés et liés
- ✅ Assets statiques copiés (235ms)
- ✅ capacitor.config.json créé dans assets
- ✅ Plugins Android mis à jour (24ms)
- ✅ Sync terminé en **0.734s**

---

## 📱 Prochaines Étapes (ROADMAP Phase suivante)

### Phase Immédiate: Branding & Assets
1. **Créer icônes app** (prioritaire):
   - Générer icône 1024x1024 (logo WooSenteur violet sur fond transparent)
   - Utiliser `npx capacitor-assets generate --android`
   - Formats: mipmap-mdpi (48x48), hdpi (72x72), xhdpi (96x96), xxhdpi (144x144), xxxhdpi (192x192)

2. **Créer splash screen personnalisé**:
   - Image 2732x2732 avec logo WooSenteur centré
   - Fond violet #7C3AED (déjà configuré)
   - Remplacer `android/app/src/main/res/drawable/splash.png`

3. **Tester build APK Debug**:
   ```powershell
   .\scripts\build-android.ps1
   ```
   Ou manuellement:
   ```bash
   cd android
   .\gradlew assembleDebug
   ```
   APK généré: `android/app/build/outputs/apk/debug/app-debug.apk`

### Phase Suivante: Adaptation Code
4. **Remplacer localStorage** (critique):
   - Installer: Déjà fait (`@capacitor/preferences`)
   - Migration:
     ```typescript
     // AVANT (web)
     localStorage.setItem('key', 'value')
     
     // APRÈS (Capacitor)
     import { Preferences } from '@capacitor/preferences';
     await Preferences.set({ key: 'key', value: 'value' });
     ```
   - Fichiers à modifier:
     - `lib/auth-helpers.ts` (tokens Firebase)
     - `components/ui/use-toast.tsx` (si stockage)
     - Tous composants utilisant localStorage

5. **Adapter API Routes** (problème Next.js export):
   - **Contexte**: `output: 'export'` désactive les API routes
   - **Solution**: Déplacer `/api/*` vers Firebase Functions
   - Routes à migrer:
     - `/api/generate` → `functions/src/generate.ts` (Genkit)
     - `/api/validate-image` → `functions/src/validateImage.ts`
     - `/api/stripe/checkout` → `functions/src/stripe.ts`
     - `/api/export/woocommerce` → `functions/src/woocommerce.ts`
   - Mettre à jour `lib/api.ts` avec URLs Firebase Functions

6. **Configurer Firebase Auth mobile**:
   - Plugin: `@capacitor/browser` (déjà installé)
   - Activer OAuth redirect: `https://woosenteur.fr/__/auth/handler`
   - Tester connexion Google/Apple sur émulateur

### Phase Testing
7. **Préparer environnement de test**:
   - Installer Android Studio
   - Télécharger AVD (Android Virtual Device) - Pixel 6, Android 13
   - Activer USB debugging sur téléphone réel

8. **Build et test**:
   ```bash
   # Build APK
   .\scripts\build-android.ps1
   
   # Installer sur émulateur
   adb install builds/WooSenteur-debug-YYYY-MM-DD_HH-mm.apk
   
   # Logs en temps réel
   adb logcat | Select-String "Capacitor|WooSenteur"
   ```

---

## 🔧 Scripts Créés

### `scripts/build-android.ps1`
**Automatisation complète** du workflow:
1. ✅ Build Next.js (`npm run build`)
2. ✅ Sync Capacitor (`npx cap sync android`)
3. ✅ Build APK Debug (`.\gradlew assembleDebug`)
4. ✅ Copie APK vers `builds/WooSenteur-debug-TIMESTAMP.apk`
5. ✅ Affichage taille fichier et instructions installation

**Usage**:
```powershell
cd "c:\Woosenteur le retour"
.\scripts\build-android.ps1
```

---

## ⚠️ Notes Importantes

### 1. API Routes Non Fonctionnelles
**Problème**: Next.js en mode `export` ne supporte pas les API routes (`/api/*`).  
**Impact**: 
- ❌ Génération IA (`/api/generate`)
- ❌ Validation image (`/api/validate-image`)
- ❌ Checkout Stripe (`/api/stripe/checkout`)
- ❌ Export WooCommerce (`/api/export/woocommerce`)

**Solution obligatoire**: Migrer vers Firebase Functions (voir Phase Adaptation).

### 2. localStorage Incompatible
**Problème**: Android WebView peut perdre données localStorage.  
**Solution**: Utiliser `@capacitor/preferences` (déjà installé).

### 3. Permissions Runtime (Android 6+)
Certaines permissions (CAMERA, STORAGE) nécessitent demande runtime. Capacitor gère automatiquement via plugins.

### 4. HTTPS Obligatoire
`androidScheme: 'https'` configuré pour:
- Compatibilité OAuth Firebase
- Cookies sécurisés Stripe
- Service Workers (PWA futur)

---

## 📊 État Actuel

| Composant | État | Prochaine Action |
|-----------|------|------------------|
| Capacitor Core | ✅ Installé | - |
| Plateforme Android | ✅ Configurée | - |
| Plugins | ✅ 9 installés | Implémenter dans code |
| Configuration | ✅ Complète | - |
| Thème Violet | ✅ Appliqué | - |
| Assets | ⏳ Splash par défaut | Générer icônes + splash custom |
| Build APK | ⏳ Non testé | Exécuter `build-android.ps1` |
| API Routes | ❌ Non adaptées | Migrer vers Functions |
| localStorage | ❌ Non adapté | Utiliser Preferences |
| Tests | ⏳ En attente | Installer Android Studio |

---

## 🎯 Timeline Estimée (Suite)

- **Aujourd'hui**: Générer assets branding (icônes + splash) - **1-2h**
- **J+1**: Premier build APK debug + test émulateur - **2-3h**
- **J+2-3**: Migration API routes vers Firebase Functions - **6-8h**
- **J+4-5**: Adaptation localStorage → Preferences - **3-4h**
- **J+6-7**: Tests fonctionnels complets (génération, export, paiement) - **4-6h**
- **J+8-10**: Corrections bugs + optimisations performances - **4-8h**
- **J+11-14**: Préparation APK Release (keystore, signature, obfuscation) - **3-5h**
- **Total**: **2-3 semaines** (selon complexité bugs)

---

## 📚 Ressources Utiles

- **Documentation Capacitor**: https://capacitorjs.com/docs
- **Plugins Officiels**: https://capacitorjs.com/docs/apis
- **Android Build Guide**: https://capacitorjs.com/docs/android
- **Roadmap complète**: Voir `ROADMAP_ANDROID.md` (racine projet)

---

✅ **Configuration Android terminée avec succès!**  
🚀 **Prêt pour Phase 4: Branding & Assets**
