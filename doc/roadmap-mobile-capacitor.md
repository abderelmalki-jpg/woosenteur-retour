# Feuille de Route : Porter WooSenteur sur Android avec Capacitor

Ce document est votre guide étape par étape pour transformer l'application web Next.js "WooSenteur" en une application Android native en utilisant le framework Capacitor.

**Objectif :** Obtenir un fichier `.apk` ou `.aab` fonctionnel, installable sur un appareil Android, qui encapsule l'expérience web existante tout en préparant le terrain pour des fonctionnalités natives.

---

## Phase 1 : Préparation et Initialisation

### 1.1. Configuration de l'Environnement de Développement Local

**Prérequis sur votre machine (PC local) :**
- **Node.js :** Assurez-vous d'avoir une version LTS (Long Term Support).
- **Git :** Pour cloner et gérer votre projet.
- **VS Code :** Votre éditeur de code.
- **Android Studio :** Indispensable pour le SDK Android, les outils de build (Gradle) et les émulateurs.
  - Durant l'installation, assurez-vous d'installer le "Android SDK" et les "Android SDK Platform-Tools".
- **Configurer les variables d'environnement :**
  - Ajoutez `ANDROID_HOME` (ou `ANDROID_SDK_ROOT`) pointant vers le dossier de votre SDK Android.
  - Ajoutez le chemin vers les `platform-tools` à votre `PATH`.

### 1.2. Cloner et Préparer le Projet WooSenteur

```bash
# Clonez votre projet depuis GitHub
git clone [URL_DE_VOTRE_DEPOT_GITHUB]
cd woosenteur

# Installez les dépendances
npm install
```

### 1.3. Intégration de Capacitor

```bash
# Installez la CLI de Capacitor
npm install @capacitor/cli @capacitor/core

# Initialisez Capacitor dans votre projet
# Acceptez les valeurs par défaut pour le nom et l'ID du paquet (ex: com.woosenteur.app)
npx cap init WooSenteur com.woosenteur.app

# Ajoutez la plateforme Android à votre projet
npm install @capacitor/android
npx cap add android
```
À la fin de cette étape, un dossier `android` sera créé à la racine de votre projet.

---

## Phase 2 : Configuration et Adaptation du Code

### 2.1. Configurer Next.js pour l'Export Statique

Capacitor a besoin de fichiers web statiques (HTML, CSS, JS). Nous devons donc configurer Next.js pour qu'il génère ces fichiers.

1.  **Modifier `next.config.js` :**
    - Ajoutez la ligne `output: 'export',` à la configuration.

2.  **Modifier `package.json` :**
    - Mettez à jour le script `build` pour qu'il inclue l'exportation :
      `"build": "next build",` -> `"build": "next build && next export",` (Si `next export` est obsolète, `next build` avec `output: 'export'` suffit).

### 2.2. Configurer Capacitor

1.  **Modifier `capacitor.config.ts` :**
    - Assurez-vous que la propriété `webDir` pointe vers le dossier généré par Next.js, qui est `out`.
    - Changez `webDir: 'www'` en `webDir: 'out'`.

### 2.3. Gestion des Variables d'Environnement

Le principal défi est de rendre les variables d'environnement (clés API, etc.) accessibles dans un contexte natif.

1.  **Créez un fichier `.env.local`** à la racine de votre projet pour y stocker vos clés (Firebase, Google, Stripe, etc.).
2.  **Modifiez `next.config.js`** pour exposer ces variables publiquement via `env`, en les préfixant par `NEXT_PUBLIC_`.
3.  **Mettez à jour votre code** pour utiliser les nouvelles variables préfixées (ex: `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`).

---

## Phase 3 : Build et Déploiement

### 3.1. Le Cycle de Build

C'est le processus que vous répéterez à chaque fois que vous voudrez tester une nouvelle version de votre application.

```bash
# 1. Générez les fichiers web statiques
npm run build

# 2. Synchronisez les fichiers web avec votre projet Android natif
npx cap sync android

# 3. Ouvrez le projet natif dans Android Studio
npx cap open android
```

### 3.2. Lancement dans Android Studio

1.  Une fois Android Studio ouvert, il va "builder" le projet avec Gradle. Cela peut prendre quelques minutes la première fois.
2.  Dans la barre d'outils, sélectionnez un émulateur que vous avez créé ou votre appareil physique connecté.
3.  Cliquez sur le bouton "Play" (Run 'app').
4.  L'application WooSenteur devrait se lancer sur votre appareil/émulateur !

### 3.3. Génération de l'APK pour le Test

Pour partager l'application, vous pouvez générer un APK de débogage.

1.  Dans Android Studio, allez dans `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
2.  Une fois la construction terminée, une notification apparaîtra. Cliquez sur "locate" pour trouver le fichier `app-debug.apk` dans le dossier `android/app/build/outputs/apk/debug/`.

---

## Phase 4 : Publication (Vision Future)

1.  **Icônes et Splash Screen :** Utilisez les outils de Capacitor pour générer facilement les icônes et les écrans de démarrage pour toutes les tailles d'écran.
2.  **Signature de l'Application :** Suivez la documentation d'Android pour créer une clé de signature de production (`keystore`). C'est une étape de sécurité obligatoire.
3.  **Génération d'un App Bundle (`.aab`) :** Dans Android Studio, utilisez l'option `Build > Generate Signed Bundle / APK...` et choisissez "Android App Bundle".
4.  **Google Play Console :** Créez un compte développeur, créez une fiche pour votre application et téléversez votre fichier `.aab`.

**Félicitations, vous aurez porté WooSenteur sur Android !** Utilisez le prompt fourni (`prompt-capacitor-migration.md`) avec une IA comme Gemini pour vous aider à générer les configurations et le code à chaque étape.
