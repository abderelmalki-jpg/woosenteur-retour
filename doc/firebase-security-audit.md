# Audit des Règles de Sécurité Firestore pour WooSenteur

Ce document examine les règles de sécurité Firestore actuelles de l'application WooSenteur, identifie les bonnes pratiques mises en œuvre et explique comment elles protègent les données des utilisateurs en appliquant le principe du moindre privilège.

---

## 1. Philosophie Générale : Le "Moindre Privilège"

La règle de base de notre système est simple : **chaque utilisateur ne peut accéder et modifier QUE ses propres données**. Il n'existe aucun accès public ou partagé par défaut. C'est ce qu'on appelle le principe du moindre privilège.

---

## 2. Analyse des Règles Actuelles (`firestore.rules`)

Voici une analyse détaillée des règles en place pour chaque partie de la base de données.

### a) Accès aux profils utilisateurs (`/users/{userId}`)

**Règle concernée :**
```rules
match /users/{userId} {
  function isOwner(userId) {
    return request.auth.uid == userId;
  }
  function isSignedIn() {
    return request.auth != null;
  }

  allow create: if isSignedIn() && isOwner(userId) && request.resource.data.id == userId;
  allow get: if isSignedIn() && isOwner(userId);
  allow update: if isSignedIn() && isOwner(userId) && resource.data.id == userId;
  allow delete: if isSignedIn() && isOwner(userId) && resource != null;
  allow list: if false; // Interdit de lister tous les utilisateurs
}
```

**Explication :**

*   `isOwner(userId)` : C'est la fonction la plus importante. Elle vérifie si l'UID de l'utilisateur authentifié (`request.auth.uid`) est exactement le même que le `userId` dans le chemin du document.
*   `allow create, get, update, delete` : Un utilisateur ne peut effectuer ces opérations (créer son profil, le lire, le mettre à jour ou le supprimer) que s'il est **authentifié ET propriétaire** du document.
*   `allow list: if false;` : C'est une mesure de sécurité cruciale. Elle **interdit formellement** à quiconque de télécharger la liste complète de tous les utilisateurs de l'application, protégeant ainsi contre le spam ou la fuite de données.

**Conclusion :** Cette règle est très sécurisée. Elle cloisonne parfaitement les données de chaque utilisateur.

### b) Accès aux produits générés (`/users/{userId}/products/{productId}`)

**Règle concernée :**
```rules
match /users/{userId}/products/{productId} {
  function isOwner(userId) {
    return request.auth.uid == userId;
  }
  function isSignedIn() {
    return request.auth != null;
  }
  allow create: if isSignedIn() && isOwner(userId);
  allow get: if isSignedIn() && isOwner(userId);
  allow update: if isSignedIn() && isOwner(userId) && resource != null;
  allow delete: if isSignedIn() && isOwner(userId) && resource != null;
  allow list: if isSignedIn() && isOwner(userId);
}
```

**Explication :**

*   **Structure de chemin :** Le fait que les produits soient dans une sous-collection (`/products/`) d'un utilisateur (`/users/{userId}/`) est un choix de conception délibéré. Cela nous permet d'utiliser le même `userId` pour vérifier la propriété.
*   `allow create, get, update, delete` : Comme pour le profil, un utilisateur ne peut gérer que les produits qui sont stockés "sous" son propre identifiant. Il est impossible pour un utilisateur A de modifier un produit de l'utilisateur B.
*   `allow list: if isSignedIn() && isOwner(userId);` : C'est ici que la magie opère. Un utilisateur peut **lister uniquement les produits de sa propre collection**. La requête pour obtenir la liste des produits (ex: `collection('users/USER_A_ID/products')`) est autorisée, car la règle vérifie que l'UID de l'utilisateur qui fait la demande correspond au `USER_A_ID` dans le chemin.

---

## 3. Potentielles Failles et Permissions Excessives

**Aucune faille majeure identifiée** dans la configuration actuelle. Les règles sont restrictives et basées sur le modèle de propriété, ce qui est une des meilleures pratiques recommandées par Firebase.

**Points de vigilance pour le futur :**
*   **Fonctionnalités "Admin" :** Si un jour vous souhaitez créer un rôle d'administrateur, il faudra ajouter une logique pour vérifier ce rôle (souvent via les "custom claims" de Firebase Auth) afin de donner des permissions plus étendues de manière sécurisée.
*   **Partage de données :** Si vous permettez un jour à un utilisateur de partager un produit avec un autre, les règles actuelles le bloqueront. Il faudra alors implémenter un système de permissions plus granulaire (par exemple, un champ `sharedWith` dans le document du produit).

En conclusion, la base actuelle est solide, sécurisée et parfaitement adaptée aux fonctionnalités de WooSenteur.
