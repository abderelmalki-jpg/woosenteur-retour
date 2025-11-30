# Feuille de Route Stratégique de WooSenteur

Ce document retrace l'évolution du projet WooSenteur, de sa conception à son état actuel, et dessine les axes de développement futurs pour assurer sa croissance et sa pertinence sur le marché.

---

## Phase 1 : Fondation et Produit Minimum Viable (MVP) - (Terminée)

L'objectif de cette phase était de construire un noyau fonctionnel robuste pour valider le concept et attirer les premiers utilisateurs.

### Objectifs Clés Atteints :
- **Stack Technologique Moderne :** Mise en place d'une application Next.js 15 avec React, TypeScript, TailwindCSS et les composants ShadCN pour une base solide, performante et esthétique.
- **Authentification Utilisateur :** Intégration complète de Firebase Authentication, permettant l'inscription et la connexion via Email/Mot de passe et Lien Magique.
- **Génération de Contenu par IA (Cœur du service) :**
    - Création d'un flux Genkit (`generateSeoOptimizedProductDescriptions`) capable de générer des fiches produits complètes.
    - Implémentation d'un outil de recherche web (`searchWeb`) pour enrichir les données.
    - Le système peut fonctionner en mode "recherche" (pour les produits existants) ou en mode "création" (pour des concepts de parfums).
- **Fiabilisation par l'IA :**
    - **Validation d'image :** Un flux d'IA (`validateProductImage`) analyse les images téléversées pour s'assurer qu'elles correspondent bien au produit décrit, évitant ainsi les erreurs de visuels.
    - **Gestion d'erreurs guidée :** Mise en place de notifications contextuelles (ex: pour une marque manquante) pour guider l'utilisateur.
- **Interface de l'Application (AppShell) :**
    - **Création de Produit :** Une interface claire avec un formulaire (Marque, Nom, Catégorie en menu déroulant) pour générer, visualiser et sauvegarder les fiches produits.
    - **Feedback Visuel :** Ajout de barres de progression animées pour la génération et les exports, améliorant l'expérience utilisateur.
    - **Liste de Produits :** Un tableau de bord pour lister, gérer (modifier, supprimer) et sélectionner les produits générés.
    - **Détail du Produit :** Une page pour modifier en détail chaque information d'une fiche produit sauvegardée.
- **Base de Données Firestore :**
    - Structuration de la base de données pour stocker les profils utilisateurs et les produits générés, associés à chaque utilisateur.
    - Mise en place des hooks React (`useUser`, `useCollection`, `useDoc`) pour une interaction en temps réel avec la base de données.
- **Intégration Paiements (Stripe) :**
    - Mise en place de la logique de souscription avec Stripe Checkout pour les plans payants.
    - Création d'un portail client Stripe pour que les utilisateurs puissent gérer leurs abonnements.
    - Configuration des webhooks Stripe pour synchroniser le statut des abonnements avec l'application.
- **Exports Multi-formats :**
    - Finalisation de la fonctionnalité d'exportation unitaire et en masse vers WooCommerce.
    - Développement de l'export en CSV.
- **Marketing & Interface Publique :**
    - Création de pages marketing (accueil, fonctionnalités, tarifs) avec un design professionnel pour attirer et convertir les visiteurs.
    - Développement d'un "Live Demo" sur la page d'accueil pour prouver instantanément la valeur de l'IA.

---

## Phase 2 : Consolidation et Monétisation - (Actuelle)

Nous sommes actuellement dans cette phase, qui vise à affiner l'expérience utilisateur, à renforcer les fonctionnalités de monétisation et à préparer la croissance.

### Chantiers en Cours et Prochains Pas :
- **Lancement Bêta & Recueil des Retours :** Déploiement de la stratégie de contact (voir `docs/marketing-outreach.md` et `docs/social-media-strategy.md`) pour acquérir les premiers bêta-testeurs et obtenir des retours qualitatifs.
- **Gestion des Plans et Limitations :**
    - Renforcement de la logique de limitation des fonctionnalités pour le plan gratuit (ex: nombre de générations, export unitaire vs masse).
    - Amélioration de l'expérience de "mise à niveau" (upgrade) via des dialogues contextuels.
- **Dashboard Analytique :** Enrichissement du tableau de bord utilisateur avec des statistiques plus pertinentes.

---

## Phase 3 : Expansion et Rétention (Vision Future)

Cette phase se concentrera sur l'ajout de fonctionnalités à haute valeur ajoutée pour transformer WooSenteur en un partenaire indispensable et justifier un engagement à long terme.

### Axes de Développement Futurs :
- **Génération et Export en Masse depuis un Fichier (Fonctionnalité Premium) :**
    - **Concept :** Permettre aux utilisateurs d'uploader un fichier (CSV, Excel, TXT) contenant une liste de noms de produits et de marques. L'application générerait alors toutes les fiches produits en arrière-plan.
    - **Objectif :** Attirer les agences et les boutiques avec de grands catalogues. Créer un "power feature" justifiant un abonnement élevé.
    - **Implémentation :**
        1.  **Interface d'Upload :** Une nouvelle section où l'utilisateur peut glisser-déposer son fichier.
        2.  **Traitement Asynchrone :** Une tâche de fond (Cloud Function ou équivalent) pour traiter chaque ligne du fichier, appeler l'IA, et sauvegarder les résultats dans Firestore.
        3.  **Notification & Export :** L'utilisateur est notifié quand le traitement est terminé (avec une barre de progression), et peut ensuite exporter en masse toutes les nouvelles fiches vers WooCommerce ou en CSV.
- **Adaptation Événementielle Automatique (Fonctionnalité Premium) :**
    - **Concept :** Proposer une mise à jour automatique des descriptions de produits pour les adapter aux événements commerciaux clés (Noël, Black Friday, Saint-Valentin, Ramadan...). Voir `docs/strategy-seasonal-updates.md`.
    - **Objectif :** Créer une forte rétention, en particulier pour les abonnements annuels, en fournissant une valeur continue et proactive.
    - **Implémentation :**
        1.  **MVP :** Une option manuelle "Adapter pour une occasion" sur chaque fiche produit.
        2.  **Version Finale :** Un système automatisé (via Cloud Functions) qui régénère le contenu pour les abonnés éligibles avant chaque événement.
- **Gestion Multi-Boutiques et API :**
    - Permettre aux agences ou aux utilisateurs avancés de connecter et gérer plusieurs boutiques WooCommerce depuis un seul compte WooSenteur.
    - Fournir un accès API pour une intégration plus poussée dans les flux de travail existants des clients.
- **Fine-Tuning de l'IA :**
    - Permettre aux utilisateurs Premium de "fine-tuner" le modèle d'IA avec leurs propres descriptions de produits pour que l'IA adopte un ton et un style spécifiques à leur marque.
- **Internationalisation (i18n) :**
    - Adapter l'interface et la génération de contenu pour d'autres langues (Anglais, Espagnol...) afin d'adresser un marché global.
- **Intégration avec d'autres Plateformes :**
    - Explorer la compatibilité avec d'autres plateformes e-commerce comme Shopify, Prestashop, etc.
