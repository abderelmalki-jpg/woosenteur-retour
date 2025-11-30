# Parcours Utilisateurs Clés de WooSenteur

Ce document décrit les principaux parcours (user flows) au sein de l'application WooSenteur. Il sert de "maquette textuelle" pour comprendre comment un utilisateur interagit avec les fonctionnalités principales.

---

## 1. Parcours d'un Nouvel Utilisateur (Inscription et Première Génération)

**Objectif :** Guider un visiteur à devenir un utilisateur actif qui comprend la valeur du produit.

1.  **Arrivée sur la Landing Page :** Le visiteur arrive sur `woosenteur.fr`. Il découvre la proposition de valeur, les fonctionnalités et les tarifs.
2.  **Clic sur "Démarrer gratuitement" :** Le visiteur est redirigé vers la page de génération (`/generate`).
3.  **Connexion Anonyme Automatique :** En arrière-plan, une session utilisateur anonyme est créée via Firebase Auth. Un document utilisateur est également créé dans Firestore avec 10 crédits de génération gratuits.
4.  **Remplissage du Formulaire :**
    - L'utilisateur entre la **Marque** (ex: "Yves Saint Laurent").
    - Il entre le **Nom du Produit** (ex: "La Nuit de l'Homme").
    - Il sélectionne une **Catégorie** dans le menu déroulant (ex: "Parfum").
5.  **Clic sur "Générer la description" :**
    - Si la marque est manquante, une notification conviviale en dégradé violet apparaît, invitant l'utilisateur à renseigner la marque pour de meilleurs résultats.
    - Une **barre de progression animée** apparaît, indiquant que la génération est en cours.
    - Le bouton est désactivé.
6.  **Affichage du Résultat :**
    - La barre de progression disparaît.
    - La section "Éditeur de Fiche Produit" à droite se remplit avec le contenu généré par l'IA.
    - Une notification violette confirme le succès de la génération.
7.  **Téléversement de l'image (avec validation IA) :**
    - L'utilisateur clique sur la zone de téléversement d'image.
    - Il sélectionne une image depuis son ordinateur.
    - L'IA analyse l'image. Si elle ne correspond pas au produit ("La Nuit de l'Homme"), une notification apparaît : "Cette image ne semble pas correspondre au produit."
    - Si l'image est correcte, elle s'affiche dans l'aperçu.
8.  **Interaction et Export :**
    - L'utilisateur peut modifier manuellement les champs de texte.
    - Il voit les boutons "Exporter en CSV" et "Envoyer vers WooCommerce", comprenant ainsi les prochaines étapes possibles.

---

## 2. Parcours d'Export vers WooCommerce (Unitaire et en Masse)

**Objectif :** Permettre à un utilisateur d'envoyer facilement un ou plusieurs produits générés vers sa boutique WooCommerce.

1.  **Prérequis :** L'utilisateur a généré une ou plusieurs fiches produit.
2.  **Sélection et Clic :**
    - Pour un export unitaire, il clique sur "Envoyer vers WooCommerce" depuis l'éditeur.
    - Pour un export en masse, il se rend dans l'onglet "Produits", coche plusieurs produits, et clique sur le bouton "Exporter vers WooCommerce" qui apparaît.
3.  **Saisie des Clés API (si nécessaire) :**
    - Une boîte de dialogue modale s'ouvre.
    - Si c'est la première fois, les champs sont vides. L'utilisateur saisit l'**URL de sa boutique**, sa **Clé Client** et sa **Clé Secrète** WooCommerce.
    - Si les clés ont déjà été sauvegardées, les champs sont pré-remplis.
4.  **Clic sur "Lancer l'export" :**
    - Le bouton affiche un loader.
    - Pour l'export en masse, une **barre de progression** indique l'avancement du traitement.
    - Une action serveur est appelée, qui communique avec l'API REST de la boutique de l'utilisateur.
    - Une notification de succès (en violet) s'affiche pour chaque produit ou à la fin du lot.
    - En cas d'échec, une notification d'erreur (en rouge) s'affiche avec le message renvoyé par l'API WooCommerce.

---

## 3. Parcours d'Abonnement (Upgrade de Plan)

**Objectif :** Convertir un utilisateur gratuit en client payant.

1.  **Contexte :** L'utilisateur a épuisé ses crédits de génération ou ses exports gratuits.
2.  **Tentative d'Action Limitée :** L'utilisateur clique sur "Générer" ou sur un bouton d'export.
3.  **Affichage de l'Alerte :**
    - Une boîte de dialogue "Fonctionnalité Premium" ou "Crédits épuisés" apparaît.
    - Le message explique pourquoi l'action est bloquée et met en avant les avantages d'un plan payant.
4.  **Clic sur "Voir les plans" :**
    - L'utilisateur est redirigé vers la section des tarifs (`/#pricing`) de la page d'accueil.
5.  **Choix du Plan :**
    - L'utilisateur choisit un plan (ex: "Standard") et clique sur "Choisir Standard".
6.  **Redirection vers Stripe Checkout :**
    - L'utilisateur est redirigé vers une page de paiement sécurisée hébergée par Stripe.
7.  **Paiement :** L'utilisateur complète son paiement.
8.  **Redirection post-paiement :**
    - L'utilisateur est redirigé vers l'application (`/generate?session_id=...`).
    - Un webhook Stripe (en parallèle) met à jour le statut de l'abonnement de l'utilisateur dans Firestore.
    - L'application vérifie la session Stripe, confirme le succès du paiement, et met à jour les crédits de l'utilisateur.
    - Une **notification de bienvenue en dégradé violet** confirme l'activation de l'abonnement.
9.  **Nouvelle Tentative :** L'utilisateur peut maintenant effectuer l'action qui était auparavant bloquée.
