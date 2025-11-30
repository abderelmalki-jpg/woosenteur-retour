# Prompt IA pour la Migration de WooSenteur vers Android avec Capacitor

Ce prompt est conçu pour être utilisé avec un grand modèle de langage (comme Gemini) dans un environnement de développement local (ex: VS Code avec une extension IA). Son objectif est de vous fournir des blocs de code et des configurations précises pour chaque étape de la migration de l'application web Next.js "WooSenteur" vers une application Android native via Capacitor.

---

## Contexte Initial (À fournir à l'IA au début de la conversation)

> "Je veux porter mon application web SaaS 'WooSenteur' en une application Android native en utilisant Capacitor. Mon projet est basé sur Next.js 15 (App Router), TypeScript, TailwindCSS, ShadCN UI, et Firebase (Auth, Firestore, Storage) pour le backend. J'utiliserai VS Code, Android Studio, et je versionnerai mon code sur GitHub. Mon objectif est de suivre une feuille de route précise pour accomplir cela. Je te fournirai le contenu de mes fichiers actuels lorsque ce sera nécessaire. Tu agiras en tant qu'expert en développement mobile hybride et me guideras à chaque étape."

---

## Prompts pour Chaque Étape de la Feuille de Route

### Étape 2.1 : Configuration de Next.js pour l'Export Statique

**Votre prompt à l'IA :**

> "Ok, commençons. Je dois configurer mon projet Next.js pour l'exportation statique. Modifie mon fichier `next.config.js` pour qu'il soit compatible avec Capacitor. Voici mon `next.config.js` actuel :"
> 
> ```typescript
> // Collez ici le contenu de votre next.config.js
> ```
> 
> "Modifie également mon `package.json` pour mettre à jour le script de build. Voici mon `package.json` actuel :"
> 
> ```json
> // Collez ici le contenu de votre package.json
> ```

---

### Étape 2.2 : Configuration de Capacitor

**Votre prompt à l'IA :**

> "Parfait. Maintenant, je dois configurer Capacitor pour qu'il utilise le bon dossier web. Génère le contenu complet de mon fichier `capacitor.config.ts`. Il doit pointer vers le dossier `out` de Next.js. Mon `appId` est `com.woosenteur.app` et le nom de l'application est `WooSenteur`."

---

### Étape 2.3 : Gestion des Variables d'Environnement

**Votre prompt à l'IA :**

> "C'est une étape critique. Je dois exposer mes variables d'environnement côté client de manière sécurisée pour l'application mobile. Pour l'instant, mes clés sont dans un fichier `.env` non versionné, comme `FIREBASE_API_KEY=...` ou `STRIPE_SECRET_KEY=...`.
> 
> 1.  Montre-moi un exemple de ce à quoi mon nouveau fichier `.env.local` devrait ressembler, en utilisant le préfixe `NEXT_PUBLIC_` pour les clés qui doivent être accessibles par le client (comme toute la configuration Firebase).
> 2.  Modifie mon `next.config.js` pour qu'il lise ces variables depuis `process.env` et les expose via la clé `env`.
> 3.  Donne-moi un exemple de modification dans un de mes fichiers, comme `src/firebase/config.ts`, pour montrer comment je devrais maintenant lire une variable (passer de `process.env.FIREBASE_API_KEY` à `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`)."

---

### Prompts pour les Problèmes Courants (Debugging)

**Exemple 1 : L'application se lance mais reste sur un écran blanc.**

**Votre prompt à l'IA :**

> "J'ai lancé mon application sur l'émulateur Android, mais elle affiche un écran blanc. C'est un problème courant de "routing" ou de chemins de fichiers avec les SPA dans Capacitor.
> 1.  Vérifie à nouveau ma configuration `capacitor.config.ts` et `next.config.js`. Y a-t-il une erreur ?
> 2.  Est-ce que je dois ajouter une configuration spécifique pour le "deep linking" ou la gestion des routes sur Android ? Propose-moi une solution, par exemple en utilisant le plugin `@capacitor/browser` pour les liens externes ou en vérifiant le `basePath` dans `next.config.js`."

**Exemple 2 : Les appels à Firebase échouent.**

**Votre prompt à l'IA :**

> "Mon application se lance, mais je n'arrive pas à me connecter ou à récupérer des données de Firestore. J'ai une erreur de permission ou de réseau.
> 
> 1.  Cela vient probablement du fait que l'application native (ex: `capacitor://localhost`) n'est pas autorisée dans les paramètres de mon projet Firebase.
> 2.  Explique-moi où, dans la console Firebase, je dois ajouter `capacitor://localhost` et `http://localhost` comme origines autorisées pour Firebase Authentication.
> 3.  Confirme également que les règles de sécurité Firestore n'ont pas besoin d'être modifiées si elles sont déjà bien écrites pour une application web cliente."

**Exemple 3 : Les images ne s'affichent pas.**

**Votre prompt à l'IA :**

> "Les images de mon application, qui viennent de `res.cloudinary.com` ou `firebasestorage.googleapis.com`, ne s'affichent pas dans l'application Android. Modifie mon fichier `next.config.js` pour autoriser ces domaines d'images dans un contexte Capacitor. Faut-il une configuration spéciale pour les `remotePatterns` quand on utilise Capacitor ?"
> 
> (Indice pour l'IA : La configuration `images.unoptimized = true` dans `next.config.js` est souvent une solution simple pour les builds Capacitor, car le composant `next/image` peut avoir des difficultés dans un contexte non-Next.js pur).
