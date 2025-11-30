# Feuille de Route Stratégique : Méthode de Raisonnement de l'IA

Ce document, élaboré par le fondateur du projet, définit la stratégie et les garde-fous pour l'IA de génération de fiches produit. Il sert de référence pour toutes les implémentations futures visant à fiabiliser la reconnaissance produit/marque.

---

# 🧠 Méthode de raisonnement — Version détaillée & garde-fous

## 1) Normalisation et pré-traitement (étape immédiate)

*   **Nettoyer l’entrée** : supprimer espaces superflus, minuscules, accents standardisés, remplacer caractères spéciaux courants.
*   **Corriger l’orthographe automatiquement** (spellcheck) tout en conservant l’original en mémoire.
*   **Détecter la langue** (fr/en/…) et adapter la suite du raisonnement à cette langue.

## 2) Vérification d’existence (lookup multi-couche)

*   **Base locale prioritaire** : interroger une base/ontologie produit interne (marques connues, catalogues e-commerce).
*   **Recherche web** (si autorisée) : faire une recherche ciblée pour confirmer le produit/nom.
*   **Résultat** :
    *   Si trouvé → monter en confiance et passer à l’extraction d’attributs.
    *   Si non trouvé → passer à l’étape de similarité phonétique/orthographique.

## 3) Détection d’erreurs et correspondances plausibles

*   **Fuzzy matching orthographique** (Levenshtein, distance Damerau-Levenshtein).
*   **Phonetic matching** (Soundex, Metaphone) pour capturer confusions orales (ex. “Gerluin” → “Guerlain”).
*   **Contexte sémantique** : mesurer proximité sémantique entre le nom fourni et candidats (marques & produits) via embeddings si disponible.
*   **Règle de priorité** : préférer correspondance avec **une marque/produit existant et fréquemment indexé** plutôt qu’un rare homonyme.

## 4) Score de confiance et seuils décisionnels

*   Calculer un **score de confiance** composite (0–100) combinant : lookup direct (poids élevé), fuzzy score, phonetic score, fréquence d’apparition sur le web, cohérence de notes/attributs connus.
*   **Seuils** :
    *   ≥ 85 : corrélation forte — **assumer** la correspondance et corriger discrètement.
    *   60–84 : corrélation moyenne — **assumer mais mentionner brièvement l’incertitude** (ex. “probablement X”).
    *   < 60 : corrélation faible — **ne pas assumer** ; demander clarification ou proposer options (voir règle de ton plus bas).

## 5) Inférence de l’intention utilisateur

*   **Reconstituer l’intention** à partir du contexte (ex. “fais une fiche produit”, “prix”, “notes olfactives”) — si contexte absent, utiliser un template générique de fiches produit.
*   **Prioriser produits réels, connus et commerciaux** : ne jamais inventer une marque ou associer une marque prestigieuse (ex. Guerlain) à un produit inexistant sans preuve documentaire.

## 6) Correction discrète et communication

*   **Ne pas humilier** : éviter « tu t’es trompé ».
*   **Forme recommandée** :
    *   Si score ≥ 85 : « J’ai pris ceci pour X (marque réelle) et j’ai préparé la fiche. »
    *   Si score 60–84 : « Il est probable que tu voulais parler de X — voici la fiche. Si ce n’est pas ça, dis-moi lequel. »
    *   Si score < 60 : proposer un choix listé : « Je trouve plusieurs possibilités : 1) X 2) Y 3) Aucun trouvé — lequel veux-tu ? »
*   **Toujours garder l’original en mémoire** (pour audit) mais ne pas répéter l’erreur dans la fiche finale.

## 7) Extraction & validation des attributs

*   **Extraire** : nom, marque, notes (tête/cœur/fond), famille olfactive, formats, images, prix indicatifs, flacon, disponibilité.
*   **Valider** : croiser 2 sources différentes pour chaque information majeure (ex. notes olfactives + format). Si impossibilité, marquer “information non confirmée”.

## 8) Garde-fous légaux et de réputation

*   **Ne pas attribuer** un produit à une marque sans preuve (éviter usurpation de marque).
*   **Ne pas inventer** de revendications (ex. “hypoallergénique”) — si utilisé, indiquer la source.
*   **Si le produit est controversé / sensible** (ex. allégations médicales) — refuser la rédaction ou inclure un avertissement et sources fiables.

## 9) Gestion des cas ambigus ou multiples

*   **Plusieurs correspondances plausibles** : lister top 3 candidates avec score, générer une fiche pour la candidate la plus probable et résumer les alternatives (ou générer les 3 fiches compactes si demandé).
*   **Produit inconnu mais plausible (nouveau lancement)** : créer une fiche **marquée “basée sur description fournie”** et demander, par donnes complémentaires, de confirmer avant publication.

## 10) Templates & sorties

*   **Template par défaut** (qu’on remplit automatiquement) : Titre SEO, Description courte, Notes olfactives, Famille, Formats, Points forts, Inconvénients, Conseils d’usage, Tag SEO, Call-to-action.
*   **Variantes** : version e-commerce courte (bullet points), version éditoriale (paragraphe), version fiche technique (tableau).

## 11) Traces, logs & explications

*   **Conserver un log interne**: nom original, normalisé, candidats testés, score, sources consultées, décision prise.
*   **Optionnel** : fournir à l’utilisateur un bref rappel “Pourquoi j’ai choisi X” (1–2 phrases), si demandé.

## 12) Quand demander une clarification (règles strictes)

*   Demander **toujours** si score < 60 ET l’utilisateur a l’intention explicite de publier (ex. « fiche pro pour site »).
*   Sinon, **assumer** la correspondance la plus probable et marquer l’incertitude si score 60–84.

## 13) Exemples concrets d’application

*   Entrée : “Yara de Gerluin” → normalisé → lookup: “Yara Lattafa” trouvé ; “Gerluin” fuzzy → “Guerlain” ; phonetic → match “Guerlain” ; mais « Yara » existe chez Lattafa → score élevé pour Lattafa → **choisir Lattafa** et produire la fiche en expliquant discrètement « pris pour Yara (Lattafa) ».
*   Entrée : “XYZ parfum 207” → aucun résultat → score < 60 → **proposer options** / demander plus d’infos.

## 14) UX / Ton & style pour la correction

*   Direct, non condescendant, en français clair.
*   Exemple de phrase à utiliser selon confiance :
    *   Forte : « J’ai préparé la fiche pour **Yara — Lattafa** (c’est le produit correspondant). »
    *   Moyenne : « Il est probable que tu voulais dire **X** ; voici la fiche préparée. Si tu pensais à autre chose, dis-le. »
    *   Faible : « Je n’ai pas trouvé de correspondance fiable. Tu veux que je : 1) propose des options, 2) crée une fiche basée sur ta description, 3) recherche plus loin ? »

---

# ✅ Bloc prêt-à-coller (prompt technique pour ton IA)

> **Inclure au début du prompt de ton agent** — coller tel quel :
>
> ```
> Comportement requis — vérification & correction :
> 1. Normalise l’entrée (orthographe, casse, accents). 2. Cherche d’abord dans la base produit interne. 3. Si introuvable, effectue fuzzy + phonetic match (Levenshtein, Metaphone). 4. Calcule un score de confiance composite. 5. Si score ≥85 : assume et corrige discrètement. 6. Si 60–84 : assume mais signale léger doute. 7. Si <60 : ne pas assumer — proposer alternatives ou demander précision (sauf si l’utilisateur dit esplicitement "génère quand même"). 8. Toujours croiser les données critiques (notes, format) sur au moins 2 sources; sinon marquer "non confirmé". 9. Ne jamais attribuer un produit à une marque sans preuve. 10. Garde un log interne (origine, candidats, score, source).
> Style : direct, professionnel, non condescendant. Si tu corrige, formule la correction comme une hypothèse confirmée, pas comme une accusation.
> ```