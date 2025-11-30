# Modèles de Données de WooSenteur

Ce document explique la structure de la base de données Cloud Firestore utilisée par WooSenteur. Cette structure est conçue pour être sécurisée, scalable et facile à interroger.

La source de vérité pour cette structure est le fichier `docs/backend.json`.

## 1. Collection Principale : `users`

La collection racine de notre base de données est `users`. Chaque document de cette collection représente un utilisateur unique de l'application.

- **Chemin :** `/users/{userId}`
- **Identifiant de document (`userId`) :** L'UID fourni par Firebase Authentication lors de l'inscription de l'utilisateur. Cela garantit un lien direct et sécurisé entre l'authentification et les données.

### Schéma d'un document `User`

Un document utilisateur contient les champs suivants :

- `id` (string) : L'UID de l'utilisateur (redondant pour faciliter les requêtes).
- `email` (string) : L'adresse e-mail de l'utilisateur.
- `creditBalance` (number) : Le nombre de crédits de génération de fiches produits restants.
- `exportCount` (number) : Le nombre d'exports gratuits déjà utilisés par l'utilisateur.
- `woocommerce` (object) : Un objet contenant les clés API WooCommerce de l'utilisateur s'il a choisi de les sauvegarder.
    - `url` (string)
    - `key` (string)
    - `secret` (string)
- `stripeCustomerId` (string) : L'identifiant client unique chez notre partenaire de paiement Stripe.
- `subscriptionId` (string) : L'identifiant de l'abonnement Stripe actif.
- `subscriptionStatus` (string) : Le statut de l'abonnement (ex: `active`, `canceled`).

**Règle de sécurité associée :** Un utilisateur ne peut lire ou modifier que son propre document. Il est impossible de lister les documents de tous les utilisateurs.

## 2. Sous-collection : `products`

Chaque document utilisateur peut contenir une sous-collection nommée `products`. Cette collection stocke toutes les fiches produits générées par cet utilisateur.

- **Chemin :** `/users/{userId}/products/{productId}`
- **Identifiant de document (`productId`) :** Un identifiant unique généré automatiquement par Firestore.

### Schéma d'un document `Product`

Un document produit contient les champs suivants :

- `id` (string) : L'identifiant unique du produit.
- `productName` (string) : Le nom du produit fourni par l'utilisateur.
- `brand` (string) : La marque du produit fournie par l'utilisateur.
- `productTitle` (string) : Le titre SEO complet généré par l'IA.
- `shortDescription` (string) : La méta-description générée.
- `longDescription` (string) : La description longue et structurée pour WooCommerce.
- `category` (string) : La catégorie suggérée ('Homme', 'Femme', 'Unisexe').
- `focusKeyword` (string) : Le mot-clé principal pour le SEO.
- `targetAudience` (string) : Le public cible.
- `mainNotes` (string) : La pyramide olfactive.
- `ambiance` (string) : L'ambiance du parfum.
- `imageUrl` (string) : L'URL de l'image téléversée par l'utilisateur.
- `generationDate` (timestamp) : La date et l'heure de la génération.
- `language` (string) : La langue de génération ('fr', 'en'...).
- `descriptionVariants` (map) : Un objet pour stocker les adaptations événementielles (ex: `{"Noël": "description pour Noël..."}`).

**Règle de sécurité associée :** La structure imbriquée garantit l'héritage de la propriété. Un utilisateur authentifié en tant que `{userId}` peut lister, lire, créer, modifier et supprimer les produits uniquement dans sa propre sous-collection. Il ne peut pas accéder aux produits d'un autre utilisateur.
