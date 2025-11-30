# 📱 Feuille de Route - WooSenteur Android (Capacitor)

## 🎯 Objectif Final
Créer une application Android native de WooSenteur avec Capacitor, générer un APK signé, et le partager sur Google Play Store ou en téléchargement direct.

---

## 📋 Phase 1 : Préparation & Configuration (1-2 jours)

### ✅ Prérequis à Installer

#### 1.1 Android Studio
```powershell
# Télécharger et installer Android Studio
# https://developer.android.com/studio

# Composants requis :
# - Android SDK Platform 33 (Android 13)
# - Android SDK Build-Tools 33.0.0+
# - Android Emulator
# - Android SDK Platform-Tools
```

#### 1.2 Java Development Kit (JDK)
```powershell
# Installer JDK 17
# https://adoptium.net/

# Vérifier installation
java -version
# Output attendu : openjdk version "17.x.x"
```

#### 1.3 Variables d'Environnement
```powershell
# Ajouter dans Variables d'environnement système :

# ANDROID_HOME
C:\Users\VotreNom\AppData\Local\Android\Sdk

# JAVA_HOME
C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot

# Path (ajouter) :
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

#### 1.4 Capacitor CLI
```powershell
cd "c:\Woosenteur le retour"
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android
```

---

## 🔧 Phase 2 : Adaptation du Code Next.js (2-3 jours)

### 2.1 Configuration Next.js pour Export Statique

**Fichier: `next.config.ts`**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // ✅ DÉJÀ ACTIVÉ pour Capacitor
  images: {
    unoptimized: true,  // ✅ DÉJÀ ACTIVÉ
  },
  trailingSlash: true,  // Important pour Capacitor
  assetPrefix: './',    // Chemins relatifs
};

export default nextConfig;
```

### 2.2 Adapter les API Routes

**Problème** : Les API routes Next.js ne fonctionnent pas en mode `export`.

**Solutions** :

#### Option A : Backend Séparé (RECOMMANDÉ)
```
Architecture :
- Frontend : App Capacitor Android (Next.js exporté)
- Backend : Firebase Functions (déjà configuré)

Avantages :
✅ Scalabilité
✅ Sécurité (clés API côté serveur)
✅ Même backend web + mobile
```

#### Option B : API Routes via Firebase Functions
Déplacer toutes les API routes vers Firebase Functions :
```
/api/generate → Firebase Function generateProduct
/api/export/woocommerce → Firebase Function exportToWooCommerce
/api/stripe/* → Firebase Function stripeWebhook
```

### 2.3 Gestion du Stockage

**Remplacer** :
- `localStorage` → `@capacitor/preferences`
- Cookies → `@capacitor/preferences`

```typescript
import { Preferences } from '@capacitor/preferences';

// Avant (Web)
localStorage.setItem('token', value);

// Après (Capacitor)
await Preferences.set({ key: 'token', value });
```

### 2.4 Gestion de l'Authentification

**Firebase Auth fonctionne nativement** avec Capacitor ✅

Mais adapter les redirections :
```typescript
// Au lieu de window.location.href
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

// OAuth externes (Google)
await Browser.open({ url: authUrl });
```

---

## 🏗️ Phase 3 : Initialisation Capacitor (1 jour)

### 3.1 Initialiser Capacitor
```powershell
cd "c:\Woosenteur le retour"

# Initialiser Capacitor
npx cap init

# Répondre aux questions :
# App name: WooSenteur
# App ID: fr.woosenteur.app
# Directory: out
```

### 3.2 Ajouter la Plateforme Android
```powershell
# Ajouter Android
npx cap add android

# Structure créée :
# android/
# ├── app/
# ├── gradle/
# ├── build.gradle
# └── settings.gradle
```

### 3.3 Configuration Capacitor

**Fichier: `capacitor.config.ts`**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.woosenteur.app',
  appName: 'WooSenteur',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'woosenteur.fr',
    // Pour développement local :
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7C3AED",
      showSpinner: false,
    },
  },
};

export default config;
```

---

## 🎨 Phase 4 : Assets & Branding (1 jour)

### 4.1 Icônes Application

**Générer les icônes** :
```powershell
# Installer outil
npm install -g @capacitor/assets

# Créer icône source (1024x1024 PNG)
# resources/icon.png

# Générer toutes les tailles
npx capacitor-assets generate --android
```

**Tailles requises** :
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png       (48x48)
├── mipmap-hdpi/ic_launcher.png       (72x72)
├── mipmap-xhdpi/ic_launcher.png      (96x96)
├── mipmap-xxhdpi/ic_launcher.png     (144x144)
└── mipmap-xxxhdpi/ic_launcher.png    (192x192)
```

### 4.2 Splash Screen

**Fichier: `resources/splash.png`** (2732x2732 PNG)

```powershell
npx capacitor-assets generate --android --splashscreen
```

### 4.3 Couleurs & Thème

**Fichier: `android/app/src/main/res/values/styles.xml`**
```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">#7C3AED</item>
        <item name="colorPrimaryDark">#5B21B6</item>
        <item name="colorAccent">#A78BFA</item>
        <item name="android:statusBarColor">#7C3AED</item>
    </style>
</resources>
```

---

## 🔌 Phase 5 : Plugins Capacitor (2 jours)

### 5.1 Plugins Essentiels à Installer

```powershell
cd "c:\Woosenteur le retour"

# Stockage persistant
npm install @capacitor/preferences

# Caméra (pour photos produits)
npm install @capacitor/camera

# Partage
npm install @capacitor/share

# Browser (OAuth)
npm install @capacitor/browser

# Notifications push (optionnel)
npm install @capacitor/push-notifications

# Network (détection connexion)
npm install @capacitor/network

# Filesystem
npm install @capacitor/filesystem

# App info
npm install @capacitor/app

# Splash Screen
npm install @capacitor/splash-screen

# Status Bar
npm install @capacitor/status-bar
```

### 5.2 Configurer les Permissions

**Fichier: `android/app/src/main/AndroidManifest.xml`**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
        </activity>
    </application>
</manifest>
```

### 5.3 Créer un Service pour les Plugins

**Fichier: `lib/capacitor/capacitor-service.ts`**
```typescript
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';

export class CapacitorService {
  static isNative() {
    return Capacitor.isNativePlatform();
  }

  static async checkNetwork() {
    const status = await Network.getStatus();
    return status.connected;
  }

  static async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return image.base64String;
  }

  static async shareContent(title: string, text: string, url?: string) {
    await Share.share({ title, text, url });
  }

  static async setPreference(key: string, value: string) {
    await Preferences.set({ key, value });
  }

  static async getPreference(key: string) {
    const { value } = await Preferences.get({ key });
    return value;
  }
}
```

---

## 🏗️ Phase 6 : Build & Test (1 jour)

### 6.1 Build Next.js
```powershell
cd "c:\Woosenteur le retour"

# Build production
npm run build

# Vérifier que /out existe
ls out
```

### 6.2 Synchroniser avec Android
```powershell
# Copier les fichiers vers Android
npx cap sync android

# Ou manuel :
npx cap copy android
npx cap update android
```

### 6.3 Ouvrir dans Android Studio
```powershell
npx cap open android
```

### 6.4 Tester sur Émulateur

**Dans Android Studio** :
1. Device Manager → Create Virtual Device
2. Sélectionner Pixel 6 + Android 13
3. Click ▶️ Run
4. L'app se lance dans l'émulateur

### 6.5 Tester sur Appareil Réel

**Activer mode développeur** :
1. Paramètres → À propos → Appuyer 7x sur "Numéro de build"
2. Options développeur → Débogage USB activé
3. Connecter téléphone via USB
4. Android Studio → Run → Select Device

---

## 📦 Phase 7 : Génération APK de Développement (30 min)

### 7.1 Build Debug APK
```powershell
cd "c:\Woosenteur le retour\android"

# Windows
.\gradlew assembleDebug

# Ou dans Android Studio :
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### 7.2 Localiser l'APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 7.3 Partager l'APK
```powershell
# Copier vers Desktop
cp android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/WooSenteur-debug.apk

# Ou uploader sur :
# - Google Drive
# - Dropbox
# - Firebase App Distribution
```

**⚠️ APK Debug** :
- Non signé officiellement
- Plus gros (inclut debug symbols)
- Peut nécessiter "Sources inconnues" pour installer

---

## 🔐 Phase 8 : APK de Production Signé (1 jour)

### 8.1 Générer Keystore

```powershell
cd "c:\Woosenteur le retour\android\app"

# Générer keystore
keytool -genkey -v -keystore woosenteur-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias woosenteur

# Infos demandées :
# Mot de passe : [SÉCURISÉ - Noter quelque part !]
# Prénom et nom : Votre nom
# Unité organisationnelle : WooSenteur
# Organisation : WooSenteur
# Ville : Votre ville
# État : Votre région
# Code pays : FR
```

**⚠️ TRÈS IMPORTANT** : Sauvegarder `woosenteur-release-key.jks` et le mot de passe dans un coffre-fort sécurisé !

### 8.2 Configurer Gradle

**Fichier: `android/app/build.gradle`**
```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (project.hasProperty('WOOSENTEUR_RELEASE_STORE_FILE')) {
                storeFile file(WOOSENTEUR_RELEASE_STORE_FILE)
                storePassword WOOSENTEUR_RELEASE_STORE_PASSWORD
                keyAlias WOOSENTEUR_RELEASE_KEY_ALIAS
                keyPassword WOOSENTEUR_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 8.3 Créer gradle.properties

**Fichier: `android/gradle.properties`** (⚠️ NE PAS COMMITER)
```properties
WOOSENTEUR_RELEASE_STORE_FILE=woosenteur-release-key.jks
WOOSENTEUR_RELEASE_STORE_PASSWORD=votreMotDePasse
WOOSENTEUR_RELEASE_KEY_ALIAS=woosenteur
WOOSENTEUR_RELEASE_KEY_PASSWORD=votreMotDePasse
```

**Ajouter à `.gitignore`** :
```
android/gradle.properties
android/app/*.jks
```

### 8.4 Build Release APK

```powershell
cd "c:\Woosenteur le retour\android"

# Build release
.\gradlew assembleRelease

# APK généré :
# android/app/build/outputs/apk/release/app-release.apk
```

### 8.5 Vérifier la Signature

```powershell
cd android/app/build/outputs/apk/release

# Vérifier signature
keytool -printcert -jarfile app-release.apk

# Output attendu :
# Signer #1:
# Signature algorithm name: SHA256withRSA
# Subject: CN=...
```

---

## 📤 Phase 9 : Distribution (Variables selon choix)

### Option A : Partage Direct (Immédiat)

**Uploader sur Google Drive / Dropbox** :
```
android/app/build/outputs/apk/release/app-release.apk
→ Renommer : WooSenteur-v1.0.0.apk
→ Partager lien
```

**Installation** :
1. Télécharger APK sur téléphone Android
2. Paramètres → Sécurité → Sources inconnues (Autoriser)
3. Ouvrir APK → Installer

---

### Option B : Firebase App Distribution (Recommandé pour Beta)

```powershell
# Installer CLI
npm install -g firebase-tools

# Login
firebase login

# Uploader APK
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "beta-testers" \
  --release-notes "Version 1.0.0 - Lancement Beta"
```

**Inviter testeurs** :
```
Firebase Console → App Distribution → Inviter testeurs
→ Ils reçoivent lien download
```

---

### Option C : Google Play Store (Production)

#### 9.1 Créer Compte Développeur Google Play
- Coût : 25 USD (one-time fee)
- https://play.google.com/console/signup

#### 9.2 Générer Android App Bundle (AAB)

**AAB est requis par Google Play** (pas APK direct).

```powershell
cd "c:\Woosenteur le retour\android"

# Build bundle
.\gradlew bundleRelease

# AAB généré :
# android/app/build/outputs/bundle/release/app-release.aab
```

#### 9.3 Préparer Assets Play Store

**Screenshots** (requis) :
- Téléphone : 2-8 screenshots (1080x1920 ou 1440x2560)
- Tablette 7" : 1-8 screenshots
- Tablette 10" : 1-8 screenshots

**Icône haute résolution** :
- 512x512 PNG (32-bit)

**Feature Graphic** :
- 1024x500 PNG/JPG

**Description courte** : 80 caractères max
```
Générez des fiches produits WooCommerce optimisées SEO en 3 minutes avec l'IA
```

**Description longue** : 4000 caractères max
```
WooSenteur révolutionne la création de fiches produits pour e-commerce beauté...
[Votre pitch complet]
```

#### 9.4 Uploader sur Play Console

1. Play Console → Créer Application
2. Nom : WooSenteur
3. Langue par défaut : Français
4. Type : Application
5. Gratuit ou payant : Gratuit
6. Production → Nouvelle version
7. Upload AAB : `app-release.aab`
8. Remplir formulaire :
   - Description
   - Screenshots
   - Catégorie : Productivité ou Business
   - Politique de confidentialité URL
   - Contact email
9. Classification contenu
10. Pays distribution : France (+ autres si souhaité)
11. Envoyer pour validation

**Délai validation** : 1-7 jours

---

## 🔄 Phase 10 : Workflow de Développement Continu

### 10.1 Script de Build Automatisé

**Fichier: `scripts/build-android.ps1`**
```powershell
# Build Android APK/AAB automatique

Write-Host "🚀 Build WooSenteur Android" -ForegroundColor Cyan

# 1. Build Next.js
Write-Host "📦 Build Next.js..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build Next.js échoué" -ForegroundColor Red
    exit 1
}

# 2. Sync Capacitor
Write-Host "🔄 Sync Capacitor..." -ForegroundColor Yellow
npx cap sync android

# 3. Build APK Debug
Write-Host "🔨 Build APK Debug..." -ForegroundColor Yellow
cd android
.\gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build APK échoué" -ForegroundColor Red
    exit 1
}

# 4. Copier APK
Write-Host "📂 Copie APK..." -ForegroundColor Yellow
$apkPath = "app/build/outputs/apk/debug/app-debug.apk"
$destPath = "../../builds/WooSenteur-debug-$(Get-Date -Format 'yyyyMMdd-HHmmss').apk"
New-Item -ItemType Directory -Force -Path "../../builds"
Copy-Item $apkPath $destPath

Write-Host "✅ APK généré : $destPath" -ForegroundColor Green

# 5. Build AAB Release (optionnel - décommenter si besoin)
# Write-Host "🔨 Build AAB Release..." -ForegroundColor Yellow
# .\gradlew bundleRelease
# Copy-Item "app/build/outputs/bundle/release/app-release.aab" "../../builds/WooSenteur-$(Get-Date -Format 'yyyyMMdd').aab"

cd ..
Write-Host "🎉 Build terminé !" -ForegroundColor Green
```

### 10.2 Utilisation
```powershell
cd "c:\Woosenteur le retour"
.\scripts\build-android.ps1
```

---

## 📊 Checklist Complète

### ✅ Phase 1 : Préparation (AVANT DE COMMENCER)
- [ ] Android Studio installé
- [ ] JDK 17 installé
- [ ] Variables environnement configurées
- [ ] Capacitor CLI installé

### ✅ Phase 2 : Adaptation Code
- [ ] `next.config.ts` configuré pour export
- [ ] API routes migrées vers Firebase Functions
- [ ] `@capacitor/preferences` remplace localStorage
- [ ] Authentification adaptée pour mobile

### ✅ Phase 3 : Setup Capacitor
- [ ] `npx cap init` exécuté
- [ ] `npx cap add android` exécuté
- [ ] `capacitor.config.ts` configuré

### ✅ Phase 4 : Branding
- [ ] Icône 1024x1024 créée
- [ ] Splash screen 2732x2732 créée
- [ ] `npx capacitor-assets generate` exécuté
- [ ] Couleurs thème violet appliquées

### ✅ Phase 5 : Plugins
- [ ] Tous plugins installés (preferences, camera, share, etc.)
- [ ] Permissions AndroidManifest.xml configurées
- [ ] `CapacitorService` créé

### ✅ Phase 6 : Build & Test
- [ ] `npm run build` réussi
- [ ] `npx cap sync android` exécuté
- [ ] Test émulateur OK
- [ ] Test appareil réel OK

### ✅ Phase 7 : APK Debug
- [ ] `.\gradlew assembleDebug` réussi
- [ ] APK debug généré et testé
- [ ] APK partagé avec testeurs

### ✅ Phase 8 : APK Release
- [ ] Keystore généré et sauvegardé
- [ ] `gradle.properties` configuré
- [ ] `.\gradlew assembleRelease` réussi
- [ ] Signature vérifiée

### ✅ Phase 9 : Distribution
- [ ] Choix méthode distribution (Direct / Firebase / Play Store)
- [ ] Assets préparés (screenshots, descriptions)
- [ ] Upload effectué
- [ ] Testeurs invités / App publiée

### ✅ Phase 10 : Automatisation
- [ ] Script `build-android.ps1` créé
- [ ] Workflow CI/CD configuré (optionnel)

---

## ⏱️ Timeline Estimée

| Phase | Durée | Cumul |
|-------|-------|-------|
| 1. Préparation | 1-2 jours | 2j |
| 2. Adaptation code | 2-3 jours | 5j |
| 3. Setup Capacitor | 1 jour | 6j |
| 4. Branding | 1 jour | 7j |
| 5. Plugins | 2 jours | 9j |
| 6. Build & Test | 1 jour | 10j |
| 7. APK Debug | 0.5 jour | 10.5j |
| 8. APK Release | 1 jour | 11.5j |
| 9. Distribution | 1-7 jours* | 12-18j |
| 10. Automatisation | 0.5 jour | 12.5-18.5j |

**Total : 2-3 semaines** (incluant validation Play Store)

*Si Play Store, ajouter 1-7 jours validation Google.

---

## 🚨 Points d'Attention Critiques

### 🔴 Sécurité
- **JAMAIS commiter** `gradle.properties` ou `.jks`
- Utiliser variables environnement pour clés API
- Backend Firebase Functions pour logique sensible

### 🔴 Performance
- Optimiser bundle Next.js (code splitting)
- Lazy loading images
- Minify JS/CSS en production

### 🔴 Compatibilité
- Tester sur Android 8.0+ minimum
- Tester différentes tailles écrans
- Mode sombre/clair

### 🔴 Stripe Mobile
- Utiliser Stripe SDK Android natif
- Ou WebView sécurisé pour checkout

---

## 🎯 Objectif : APK Partageable

**À la fin de cette roadmap, vous aurez** :

✅ **APK Debug** : Installable immédiatement (sources inconnues)  
✅ **APK Release Signé** : Prêt pour distribution large  
✅ **AAB** : Prêt pour Google Play Store  
✅ **Firebase App Distribution** : Beta testeurs invités  
✅ **Workflow automatisé** : Build en 1 commande  

---

## 📚 Resources Utiles

- **Capacitor Docs** : https://capacitorjs.com/docs
- **Android Studio Guide** : https://developer.android.com/studio/intro
- **Play Console** : https://play.google.com/console
- **Firebase App Distribution** : https://firebase.google.com/docs/app-distribution

---

## 🆘 Troubleshooting Courant

### Erreur : "SDK not found"
```powershell
# Vérifier ANDROID_HOME
echo $env:ANDROID_HOME

# Réinstaller platform-tools
# Android Studio → SDK Manager → Android SDK Platform-Tools
```

### Erreur : "Gradle build failed"
```powershell
# Nettoyer cache
cd android
.\gradlew clean

# Rebuild
.\gradlew assembleDebug --stacktrace
```

### Erreur : "Keystore password incorrect"
```powershell
# Vérifier gradle.properties
cat android/gradle.properties

# Régénérer keystore si perdu (⚠️ nouvelle version)
```

---

## ✨ Prochaines Étapes Après Lancement

1. **Analytics Mobile** : Firebase Analytics
2. **Crash Reporting** : Firebase Crashlytics
3. **Push Notifications** : Firebase Cloud Messaging
4. **In-App Updates** : Google Play In-App Updates API
5. **Performance** : Lighthouse, Core Web Vitals
6. **Feedback Users** : Système de reviews in-app

---

**Prêt à transformer WooSenteur en app Android native ? 🚀📱**
