# Blueprint de Reconstruction : WooSenteur SaaS sur Firebase

## 1.0 Introduction : Mission et Objectifs du Document

Ce document constitue un guide technique complet et une feuille de route architecturale, conçus pour être exécutés par un développeur assisté d'une intelligence artificielle. Sa mission est de permettre la reproduction à l'identique de l'application SaaS WooSenteur. Il détaille avec précision l'architecture technologique, l'ensemble des fonctionnalités, le modèle de données, la logique de raisonnement de l'IA, ainsi que la stratégie de déploiement sur l'écosystème Firebase. Chaque instruction et spécification contenues dans ce blueprint est rigoureusement basée sur les documents de conception et les analyses techniques fournis, formant ainsi une base de travail exhaustive et fiable.

## 2.0 Vision Stratégique et Positionnement du Produit

Avant de plonger dans les spécificités techniques de l'implémentation, il est fondamental de comprendre le "pourquoi" qui anime WooSenteur. Cette section définit le problème métier que l'application résout, identifie son public cible avec précision et articule la proposition de valeur unique qui justifie son existence. Cette compréhension est la clé pour prendre des décisions techniques alignées avec les objectifs du produit.

### 2.1 Le Problème : Le Piège Temporel de l'E-commerce

La principale difficulté rencontrée par les e-commerçants du secteur de la beauté réside dans le coût temporel exorbitant de la création de contenu de qualité. Ce problème peut être résumé en trois points critiques :

* Un temps moyen de 3 heures est nécessaire pour créer une seule fiche produit complète, optimisée et persuasive.
* Ce processus implique des tâches hautement répétitives et chronophages : recherche de mots-clés, rédaction de textes marketing, mise en forme structurée, et analyse détaillée de la pyramide olfactive.
* La productivité s'effondre face à des catalogues contenant des centaines de produits, rendant la mise à jour et l'expansion quasi impossibles sans une équipe dédiée.

### 2.2 La Solution : De 3 Heures à 3 Minutes

La proposition de valeur fondamentale de WooSenteur est de réduire radicalement ce temps de travail. Il s'agit d'un SaaS (Software as a Service) hyper-spécialisé, conçu pour la niche des produits sensoriels (parfums, cosmétiques, soins). L'application transforme la création de fiches produits d'un "travail d'artisan fastidieux" en un processus quasi instantané, divisant le temps de travail par un facteur de 60.

### 2.3 Cible et Niche

La cible principale de l'application est clairement définie : les e-commerçants opérant dans le secteur de la beauté et de la parfumerie, qui utilisent majoritairement la plateforme WooCommerce pour gérer leur boutique en ligne.

Cette vision stratégique claire justifie les choix d'architecture qui suivent, conçus pour servir cette niche de manière optimale.

## 3.0 Architecture Technique Complète

L'architecture de WooSenteur repose sur une stack technologique moderne, performante et évolutive. Chaque composant a été sélectionné pour sa robustesse, sa capacité à offrir une expérience utilisateur fluide et sa faculté à fournir une base de développement solide et maintenable.

Le tableau ci-dessous détaille les technologies spécifiques employées pour chaque composant de l'application.

| Composant | Technologies Spécifiques |
|-----------|-------------------------|
| Framework Frontend | Next.js 15 (avec App Router), React, TypeScript |
| Style & UI | TailwindCSS, ShadCN UI, Icônes Lucide-react |
| Backend & Infrastructure | Firebase (Authentication, Firestore, Storage, Hosting) |
| Moteur d'IA | Genkit (utilisant un modèle comme Gemini) |
| Paiements | Stripe (Checkout, Portal Client, Webhooks) |
| Déploiement Mobile (Futur) | Capacitor pour Android. Capacitor est la technologie retenue pour une future expansion mobile, car elle permet d'encapsuler l'application web Next.js existante dans un conteneur natif, maximisant ainsi la réutilisation du code et réduisant le temps de mise sur le marché pour la version Android. |

La synergie de cette stack est un choix stratégique clé. L'utilisation de Next.js permet d'obtenir un rendu côté serveur (SSR) pour les pages marketing, garantissant des temps de chargement rapides et un excellent référencement naturel. En parallèle, l'écosystème Firebase offre un backend entièrement géré ("serverless") qui minimise la charge de gestion de l'infrastructure, permettant à l'équipe de développement de se concentrer exclusivement sur les fonctionnalités à haute valeur ajoutée pour l'utilisateur.

La section suivante expliquera comment la base de données Firestore est structurée pour stocker les données de l'application de manière sécurisée et efficace.

## 4.0 Modèle de Données et Sécurité (Firestore)

La structure de la base de données et les règles de sécurité associées sont le fondement de la protection des données utilisateur et de l'intégrité de l'application. Le choix de Firestore est motivé par ses capacités temps réel et son modèle documentaire évolutif, parfaitement adaptés à un tableau de bord SaaS où les utilisateurs s'attendent à des mises à jour immédiates de leurs listes de produits et de leurs quotas de crédits. WooSenteur applique rigoureusement le principe du moindre privilège, garantissant que chaque utilisateur n'a accès qu'à ses propres informations, et à rien d'autre.

### 4.1 Structure des Collections

La base de données Firestore est organisée selon une structure hiérarchique simple et efficace, conçue pour un cloisonnement naturel des données.

* `/users/{userId}`
  * Description : Ce document stocke les informations du profil de l'utilisateur, incluant son email, son identifiant d'abonnement Stripe, et ses crédits de génération/export restants.
* `/users/{userId}/products/{productId}`
  * Description : Cette sous-collection contient l'ensemble des fiches produits générées par un utilisateur spécifique. Chaque document représente un produit unique avec tout son contenu généré.

### 4.2 Règles de Sécurité Fondamentales

Les règles de sécurité Firestore sont configurées pour appliquer strictement le principe de propriété des données. Ces règles sont délibérément définies côté backend Firebase pour garantir qu'elles sont appliquées de manière non-contournable, quelle que soit la logique du client, protégeant ainsi l'intégrité de la base de données contre toute manipulation. Toute tentative d'accès non autorisé est bloquée au niveau de l'infrastructure.

| Chemin de la Donnée | Règle de Sécurité Appliquée |
|---------------------|----------------------------|
| `/users/{userId}` | Un utilisateur authentifié ne peut lire, écrire ou supprimer que son propre document (isOwner(userId)). La liste de tous les utilisateurs (list) est formellement interdite. |
| `/users/{userId}/products/{productId}` | Un utilisateur authentifié ne peut lister, lire, créer, mettre à jour ou supprimer que les produits appartenant à sa propre sous-collection. Toute tentative d'accès aux produits d'un autre utilisateur est bloquée. |

Maintenant que la structure des données est définie, la section suivante décrira comment ces données sont exploitées à travers les fonctionnalités de l'application.

## 5.0 Parcours Utilisateur et Fonctionnalités Clés (MVP)

Cette section constitue une cartographie fonctionnelle de l'application du point de vue du Produit Minimum Viable (MVP). Elle détaille chaque étape du parcours utilisateur, de l'inscription initiale à l'exportation finale d'une fiche produit vers une boutique en ligne.

### 5.1 Authentification

Le système d'authentification est géré par Firebase Authentication et offre deux méthodes de connexion simples et sécurisées pour minimiser les frictions à l'inscription :

* Email / Mot de passe
* Lien Magique (Magic Link)

### 5.2 Génération d'une Fiche Produit

Le processus de génération est le cœur de l'application. Il est conçu pour être aussi simple et intuitif que possible.

1. **Saisie Utilisateur** : L'utilisateur remplit un formulaire concis contenant trois champs essentiels : le nom du produit, la marque et la catégorie (sélectionnée via un menu déroulant proposant : Parfums, Cosmétiques, Soins, Parfums d'intérieur, parfums beauté).
2. **Lancement de la Génération** : En cliquant sur "Générer", une barre de progression animée est affichée, fournissant un retour visuel clair et rassurant pendant que le système travaille.
3. **Appel à l'IA** : Le frontend déclenche un appel à un flux Genkit qui orchestre l'intelligence artificielle pour générer l'ensemble du contenu.
4. **Affichage du Résultat** : Le contenu généré est affiché dans l'interface, prêt à être utilisé. Il inclut :
   * Titre SEO optimisé
   * Description courte (pour les listes de produits)
   * Description longue et structurée (avec des paragraphes distincts pour la description générale, la pyramide olfactive, les conseils d'utilisation, et des informations sur la marque)
   * Mot-clé principal pré-rempli
   * Catégorie suggérée (ex: Unisexe)
5. **Finalisation Manuelle** : L'utilisateur a la main pour saisir le prix de vente et peut ajuster le poids du produit (une valeur par défaut est fournie pour accélérer le processus).

### 5.3 Gestion et Validation des Images

La gestion des visuels est une étape critique pour une fiche produit. WooSenteur l'aborde en deux temps :

* **Téléversement** : L'utilisateur peut téléverser une image pour le produit. Ces images sont stockées de manière sécurisée dans l'espace personnel de l'utilisateur sur Firebase Storage. (La gestion de galeries multi-images est une fonctionnalité envisagée pour une version future.)
* **Validation par IA** : Un flux d'IA dédié (validateProductImage) analyse l'image téléversée pour vérifier qu'elle correspond bien au produit décrit. En cas d'incohérence, un message d'erreur clair est affiché. Cette fonctionnalité est un différenciateur clé, souvent mis en avant dans la communication comme un "garde-fou contre les erreurs de catalogue coûteuses" et une assurance de "fiabilité inédite pour le catalogue".

### 5.4 Gestion et Export des Produits

Le tableau de bord "Produits" centralise l'historique des générations et offre des options d'export flexibles.

* **Historique** : Un tableau clair liste tous les produits générés par l'utilisateur, permettant une gestion centralisée.
* **Options d'Export** : Pour un ou plusieurs produits sélectionnés, l'utilisateur dispose de plusieurs options :
  * **Envoyer vers WooCommerce** : L'utilisateur saisit l'URL de sa boutique, sa clé API "Consumer Key" et sa clé secrète pour exporter le produit directement sur son site en un clic. Une note d'information guide l'utilisateur pour l'informer où trouver ces clés dans son tableau de bord WooCommerce.
  * **Exporter en CSV** : Télécharge les données des produits sélectionnés dans un fichier au format CSV, compatible avec la plupart des systèmes d'import.
  * **Autres Exports (Prévus)** : Des intégrations futures vers TikTok Shop et Shopify sont envisagées pour élargir la compatibilité.

### 5.5 Modèle Économique et Abonnements

Le modèle de monétisation est basé sur des abonnements récurrents, gérés de manière sécurisée et fiable par Stripe.

* **Plan Gratuit** : Conçu pour permettre aux utilisateurs de tester la valeur de l'outil, il offre un total de 5 crédits de génération et 3 crédits d'export.
* **Plans Payants (Essentiel, Standard, Premium)** : Ces plans débloquent des fonctionnalités avancées telles que l'IA avancée, l'export en masse, et un plus grand nombre de crédits.
* **Gestion** : Un portail client Stripe est intégré, permettant aux utilisateurs de consulter leurs factures, de modifier leur plan ou de mettre à jour leurs informations de paiement en toute autonomie.

La section suivante définira l'identité visuelle qui habille l'ensemble de ces fonctionnalités.

## 6.0 Spécifications de l'Interface Utilisateur (UI/UX)

Cette section sert de guide de style pour l'interface de WooSenteur. L'objectif est de garantir une identité visuelle cohérente, professionnelle et luxueuse, en parfaite adéquation avec la niche de la beauté et de la parfumerie. L'expérience utilisateur doit être intuitive et agréable.

### 6.1 Header et Menu Principal

Le header/menu est l'élément de navigation principal de l'application. Il doit refléter l'identité luxueuse de la marque tout en restant fonctionnel.

| Élément de Design | Spécification |
|-------------------|---------------|
| Couleur Primaire | Rouge amarante riche (#C1292E) |
| Couleur de Fond | Rose blush doux (#F8E7EB) |
| Couleur d'Accent | Abricot chaud (#F46036) |
| Typographie (Titres) | 'Playfair' (police serif à contraste élevé) |
| Typographie (Corps) | 'PT Sans' (police sans-serif humaniste) |
| Icônes | Minimalistes, provenant de la bibliothèque Lucide-react |
| Mise en Page | Claire, conviviale, avec une structure hiérarchique pour améliorer l'expérience utilisateur. |

Nous allons maintenant explorer le composant le plus complexe et le plus différenciant de l'application : le fonctionnement interne de son intelligence artificielle.

## 7.0 Le Cœur de l'IA : Prompt Maître et Logique de Traitement

Cette section dévoile le cerveau de WooSenteur. Elle détaille la méthode de raisonnement que l'intelligence artificielle doit impérativement suivre pour fiabiliser la génération de contenu, corriger intelligemment les erreurs de saisie des utilisateurs et garantir un résultat final de haute qualité, digne de confiance.

### 7.1 Logique de Raisonnement en Plusieurs Étapes

Le processus de traitement de l'IA est structuré en une séquence rigoureuse pour maximiser la précision. Il ne s'agit pas d'une simple génération de texte, mais d'une chaîne de validation et d'enrichissement.

1. **Normalisation et Pré-traitement** : L'IA nettoie systématiquement l'entrée utilisateur (suppression des espaces, passage en minuscules), corrige l'orthographe et détecte la langue pour adapter son traitement.
2. **Vérification d'Existence Multi-niveaux** : L'IA interroge d'abord une base de données locale prioritaire de produits connus. En cas d'échec, elle effectue une recherche web ciblée pour confirmer l'existence du produit et de la marque.
3. **Analyse de Similarité et Correction d'Erreurs** : Si aucune correspondance directe n'est trouvée, l'IA utilise des algorithmes de "fuzzy matching" orthographique (ex: Levenshtein pour "Gerluin" -> "Guerlain") et phonétique (ex: Soundex) pour identifier les candidats les plus plausibles.
4. **Calcul d'un Score de Confiance** : Un score de confiance composite (0-100) est calculé en combinant les résultats des étapes précédentes (correspondance directe, score de similarité, fréquence d'apparition sur le web). Ce score est crucial car il dicte le comportement de l'IA.
5. **Inférence de l'Intention et Application des Garde-fous** : L'IA analyse l'intention de l'utilisateur (générer une fiche produit complète). Elle applique des garde-fous stricts : ne jamais inventer une marque, ne jamais associer un produit à une marque sans preuve documentaire, et ne jamais formuler de revendications (ex: "hypoallergénique") sans citer de source.
6. **Extraction et Validation Croisée des Attributs** : Une fois le produit identifié avec une confiance suffisante, l'IA extrait les attributs clés (notes olfactives, famille, etc.) et, si possible, les valide en croisant au moins deux sources fiables.
7. **Génération Structurée via Template** : Le contenu final n'est pas généré librement mais injecté dans un template de sortie prédéfini (Titre SEO, Description courte, Description longue structurée, Conseils d'usage, etc.) pour garantir la cohérence et la qualité de chaque fiche produit.

### 7.2 Communication et Garde-fous (Prompt Maître)

Le comportement de l'IA face à l'utilisateur est régi par des instructions strictes, basées sur le score de confiance calculé.

**Instructions pour l'IA : Ton Ton et Tes Actions**

* **Règle n°1** : Ne jamais humilier l'utilisateur. Évite les phrases comme "tu t'es trompé".
* **Si Score de Confiance ≥ 85%** : Corrige discrètement l'erreur et procède à la génération. Exemple de communication : "J'ai préparé la fiche pour le produit X de la marque Y (correspondance trouvée)."
* **Si Score de Confiance entre 60% et 84%** : Assume la correspondance la plus probable mais mentionne l'incertitude pour permettre une vérification. Exemple de communication : "Il est probable que vous parliez de X. Voici la fiche. Si ce n'est pas le bon produit, veuillez préciser."
* **Si Score de Confiance < 60%** : N'assume rien. Demande une clarification en proposant des options claires et actionnables. Exemple de communication : "Je n'ai pas trouvé de correspondance fiable. Veuillez choisir parmi ces options : 1) Produit A de la marque B, 2) Produit C de la marque D, 3) Aucun de ceux-là."
* **Garde-fou légal** : Ne jamais attribuer un produit à une marque sans preuve documentaire. Ne jamais inventer de revendications sur un produit (ex: "hypoallergénique") sans citer une source.

La section suivante détaille comment mettre en œuvre l'ensemble de ces fonctionnalités via une feuille de route de développement structurée.

## 8.0 Feuille de Route de Développement

Cette section présente le plan de construction séquentiel du projet. Elle est divisée en phases logiques, partant du Produit Minimum Viable (MVP) pour valider le concept, jusqu'aux fonctionnalités d'expansion qui assureront la croissance à long terme de l'application.

### Phase 1 : Fondation et MVP (À construire)

Cette phase initiale se concentre sur la mise en place du noyau fonctionnel de l'application.

* **Stack Technique** : Mettre en place le projet Next.js 15 avec TypeScript, TailwindCSS et ShadCN.
* **Authentification** : Intégrer Firebase Authentication avec les fournisseurs Email/Mot de passe et Lien Magique.
* **Base de Données** : Configurer Firestore avec la structure de collections et les règles de sécurité définies précédemment.
* **Cœur de l'IA** : Implémenter le flux Genkit principal pour la génération de fiches produits.
* **Interface de Base** : Créer le formulaire de génération, le tableau de bord des produits et la page de détail d'un produit.
* **Exports Essentiels** : Développer les fonctionnalités d'export unitaire et en masse vers WooCommerce, ainsi que l'export en fichier CSV.
* **Paiements** : Intégrer Stripe Checkout pour la gestion des abonnements et le portail client.

### Phase 2 : Consolidation et Monétisation (Améliorations)

Une fois le MVP lancé, cette phase vise à affiner le produit et à renforcer le modèle économique.

* **Gestion des Limitations** : Renforcer la logique de gestion des crédits et de limitation des fonctionnalités pour le plan gratuit.
* **Amélioration de l'Expérience** : Affiner les dialogues de mise à niveau (upgrade) et enrichir le tableau de bord avec des statistiques d'utilisation simples.
* **Fiabilisation de l'IA** : Implémenter le flux de validation d'image (validateProductImage) et la gestion des erreurs guidée par l'IA.

### Phase 3 : Expansion (Vision Future)

Cette phase se concentre sur le développement de fonctionnalités premium à haute valeur ajoutée pour attirer des clients plus importants et augmenter la rétention.

* **Génération en Masse depuis un Fichier** : Permettre l'upload d'un fichier CSV ou Excel pour générer des centaines de fiches en tâche de fond.
* **Adaptation Événementielle** : Créer une fonctionnalité (identifiée dans les tests bêta comme "Adapter") pour régénérer les descriptions de produits afin qu'elles correspondent à des événements commerciaux clés comme Noël, le Black Friday ou la Saint-Valentin.
* **Gestion Multi-Boutiques et API** : Permettre aux agences de connecter et de gérer plusieurs boutiques WooCommerce depuis un seul compte, et fournir un accès API pour les intégrations personnalisées.
* **Internationalisation (i18n)** : Adapter l'interface et la génération de contenu pour d'autres langues, en priorisant l'anglais.

La dernière étape de ce blueprint couvre le processus de mise en production de l'application.

## 9.0 Guide de Déploiement sur Firebase Hosting

Cette section fournit le guide final pour mettre en ligne l'application WooSenteur, en tirant parti de la simplicité et de la performance de Firebase Hosting pour les applications web modernes.

Le processus de déploiement se déroule en quelques étapes claires :

1. **Configuration de Next.js pour l'Export Statique** : Assurez-vous que le fichier `next.config.js` contient l'option `output: 'export'`. Cette directive est cruciale car elle compile l'application Next.js en un ensemble de fichiers HTML/CSS/JS purement statiques. Cette approche est optimale pour Firebase Hosting, garantissant des temps de chargement minimaux, une sécurité renforcée et un coût d'hébergement quasi nul à faible trafic.
2. **Mise à jour des Scripts** : Vérifier que le script build dans le fichier `package.json` exécute la commande `next build`.
3. **Exécution de la Compilation** : Lancer la commande `npm run build` (ou l'équivalent avec yarn ou pnpm). Cette action va compiler l'application et générer l'ensemble des fichiers statiques (HTML, CSS, JS) dans un dossier `/out` à la racine du projet.
4. **Configuration de Firebase** : Si ce n'est pas déjà fait, initialiser Firebase dans le projet avec la commande `firebase init`. Lors de la configuration du service d'hébergement (Hosting), spécifier `out` comme le répertoire public. Cela indique à Firebase de déployer le contenu de ce dossier.
5. **Déploiement** : Exécuter la commande `firebase deploy --only hosting` pour téléverser les fichiers du dossier `/out` sur les serveurs de Firebase et mettre l'application en ligne.

En suivant ce blueprint avec rigueur, le développeur et l'intelligence artificielle disposent de toutes les informations, spécifications et logiques nécessaires pour recréer avec succès le SaaS WooSenteur sur l'infrastructure Firebase.
