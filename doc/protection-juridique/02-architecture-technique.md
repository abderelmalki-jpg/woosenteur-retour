# Architecture Technique de WooSenteur

Ce document décrit l'architecture technique de l'application WooSenteur à la date de sa rédaction.

## 1. Vue d'ensemble

WooSenteur est une application web de type **SaaS (Software as a Service)** construite sur une stack technologique moderne, serverless et scalable.

## 2. Stack Technologique Principale

- **Framework Frontend :** [Next.js 15](https://nextjs.org/) (utilisant le App Router).
- **Langage :** [TypeScript](https://www.typescriptlang.org/) pour la robustesse et la sécurité du typage.
- **UI & Style :**
    - **Composants :** [ShadCN/UI](https://ui.shadcn.com/) pour une bibliothèque de composants accessibles et personnalisables.
    - **CSS :** [TailwindCSS](https://tailwindcss.com/) pour un styling rapide et cohérent.
- **Backend & Base de Données :**
    - **Services Backend :** [Firebase](https://firebase.google.com/) (plateforme serverless de Google).
    - **Base de Données :** [Cloud Firestore](https://firebase.google.com/docs/firestore), une base de données NoSQL, flexible et temps réel.
    - **Authentification :** [Firebase Authentication](https://firebase.google.com/docs/auth) pour la gestion des utilisateurs (Email/Mot de passe et Anonyme).
    - **Stockage Fichiers :** [Firebase Storage](https://firebase.google.com/docs/storage) pour le téléversement des images de produits.
- **Fonctionnalités IA :**
    - **Orchestration IA :** [Google Genkit](https://firebase.google.com/docs/genkit) pour la gestion des flux d'IA, des prompts et des outils.
    - **Modèle de Langage (LLM) :** [Google Gemini](https://deepmind.google.com/technologies/gemini/) pour la génération de texte et l'analyse d'images.
- **Hébergement :**
    - **Application Web :** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) pour un déploiement continu et managé de l'application Next.js.
    - **Paiements :** [Stripe](https://stripe.com/) pour la gestion des abonnements.

## 3. Flux de Données et Interactions

### a) Flux de Génération de Description

1.  **Interface Utilisateur (Client) :** L'utilisateur remplit le formulaire (Marque, Nom produit, Catégorie via menu déroulant) dans l'application Next.js.
2.  **Appel à l'Action (Server Action) :** Le client appelle une "Server Action" Next.js (`generateDescriptionAction`).
3.  **Flux Genkit (`generateSeoDescriptionFlow`) :**
    - L'action serveur invoque le flux Genkit.
    - Le flux appelle d'abord un **outil de recherche web** (`searchWebForPerfumeInfo`) qui interroge l'API Google Custom Search pour trouver du contexte.
    - Le flux compile ces informations et les injecte dans un **prompt structuré**.
    - Le prompt est envoyé à l'**API Gemini** pour générer la fiche produit au format JSON.
4.  **Sauvegarde & Retour :**
    - La réponse de l'IA est validée. Si une information cruciale comme la marque est manquante, une erreur spécifique est interceptée et un message d'aide est renvoyé au client.
    - Une transaction Firestore est initiée pour :
        - Décrémenter le crédit de l'utilisateur (sauf si admin/premium).
        - Sauvegarder la nouvelle fiche produit dans la sous-collection `products` de l'utilisateur.
    - Le résultat est renvoyé au client, qui met à jour l'interface. L'attente est rendue agréable par une **barre de progression animée**.

### b) Flux de Validation d'Image

1.  **Interface Utilisateur (Client) :** Dans l'éditeur de fiche produit, l'utilisateur téléverse une image.
2.  **Appel à l'Action (Server Action) :** Le client appelle la `validateImageAction` avec le nom du produit, la marque et l'image (en data URI).
3.  **Flux Genkit (`validateProductImageFlow`) :**
    - L'action serveur invoque le flux Genkit.
    - Le prompt, contenant les informations du produit et l'image, est envoyé à l'**API Gemini Vision**.
    - Le modèle analyse l'image et détermine si elle correspond au produit.
4.  **Réponse au Client :**
    - Si l'image est valide, elle est téléversée vers Firebase Storage et l'URL est sauvegardée.
    - Si l'image est invalide, une notification d'erreur est affichée à l'utilisateur avec la raison, et l'image n'est pas sauvegardée.

### c) Flux d'Authentification

- L'utilisateur s'inscrit ou se connecte via Firebase Authentication.
- Un document est créé dans la collection `users` de Firestore, avec l'UID de l'utilisateur comme identifiant de document. Ce document stocke les métadonnées de l'utilisateur (crédits, statut d'abonnement...).
- Les règles de sécurité Firestore garantissent que chaque utilisateur ne peut lire ou écrire que dans son propre document et ses sous-collections.

### d) Flux d'Export WooCommerce

1.  **Interface Utilisateur (Client) :** L'utilisateur clique sur "Exporter vers WooCommerce" et remplit les informations de l'API REST de sa boutique.
2.  **Appel à l'Action (Server Action) :** Le client appelle la `exportToWooCommerceAction` avec les données du produit et les clés API.
3.  **Action Serveur :**
    - L'action vérifie les droits de l'utilisateur (plan d'abonnement, crédits d'export).
    - Elle formate les données du produit selon la structure attendue par l'API WooCommerce.
    - Elle effectue un appel `POST` à l'endpoint `/wp-json/wc/v3/products` de la boutique de l'utilisateur, en utilisant les clés fournies pour l'authentification.
    - Si l'option "Se souvenir" est cochée, les clés API sont sauvegardées (chiffrées) dans le document de l'utilisateur dans Firestore.
    - La réponse (succès ou échec) est retournée au client. Pour les exports en masse, une barre de progression informe l'utilisateur de l'avancement.
