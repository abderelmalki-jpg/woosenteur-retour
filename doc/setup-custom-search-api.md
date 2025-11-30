# Configuration Google Custom Search API

## 🎯 Objectif
Permettre à l'IA de WooSenteur de vérifier l'existence des produits beauté sur les **sites de référence** (Notino et Fragrantica) pendant l'**étape 2 du pipeline** : Vérification d'existence multi-niveaux.

---

## 📋 Prérequis
- Compte Google Cloud Platform avec Custom Search API activée
- Projet Firebase `studio-667958240-ed1db` (déjà configuré)

---

## 🔧 Étape 1 : Activer l'API Custom Search

1. Va sur **Google Cloud Console** : https://console.cloud.google.com/
2. Sélectionne ton projet : `studio-667958240-ed1db`
3. Menu **APIs & Services** → **Library**
4. Cherche **"Custom Search API"**
5. Clique sur **Enable** (si pas déjà activé)

---

## 🔍 Étape 2 : Créer un moteur de recherche personnalisé

1. Va sur **Programmable Search Engine** : https://programmablesearchengine.google.com/
2. Connecte-toi avec ton compte Google
3. Clique sur **Create a new search engine** ou **Nouveau moteur de recherche**

### Configuration du moteur :

| Champ | Valeur |
|-------|--------|
| **Nom du moteur** | `WooSenteur Beauty Products` |
| **Sites à rechercher** | `notino.fr` <br> `notino.com` <br> `fragrantica.com` <br> `fragrantica.fr` |
| **Langue** | Français |
| **Rechercher sur tout le Web** | ❌ NON (uniquement les sites spécifiés) |

4. Clique sur **Create**
5. Une fois créé, va dans **Edit search engine** → **Setup**
6. **Copie le Search Engine ID** (format : `xxxxxxxxxxxxxxx:yyyyyyyyyyy`)
   - Exemple : `017576662512468239146:omuauf_lfve`

---

## 🔑 Étape 3 : Obtenir la clé API

### Option A : Utiliser la même clé Firebase (recommandé)

Puisque Custom Search API est activée sur ton projet Firebase, tu peux utiliser la **même clé** :

```
AIzaSyBkh9L80CtfJSOHUf4WtRg8qf-UY_L-Vdw
```

### Option B : Créer une clé dédiée

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Clique sur **Create Credentials** → **API Key**
3. Copie la clé générée
4. *(Optionnel)* Restreins la clé à **Custom Search API** uniquement pour plus de sécurité

---

## ⚙️ Étape 4 : Configurer `.env.local`

Ajoute les 2 variables dans `.env.local` :

```bash
# Google Custom Search API - Pour vérification produits sur Notino & Fragrantica
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyBkh9L80CtfJSOHUf4WtRg8qf-UY_L-Vdw
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=017576662512468239146:omuauf_lfve  # ⚠️ Remplace par ton ID réel
```

---

## 🧪 Étape 5 : Tester la recherche

### Test manuel via URL

Remplace `YOUR_API_KEY` et `YOUR_ENGINE_ID` :

```
https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_ENGINE_ID&q=la+vie+est+belle+lancome
```

Si ça fonctionne, tu devrais voir un JSON avec des résultats de Notino/Fragrantica.

### Test dans l'app

1. Redémarre le serveur dev : `npm run dev`
2. Va sur `/generate`
3. Teste avec : 
   - **Produit** : `La Vie Est Belle`
   - **Marque** : `Lancôme`
   - **Catégorie** : `Parfums`
4. Vérifie dans la console du serveur :
   ```
   🔍 Vérification d'existence sur sources fiables...
   ✅ Produit trouvé : OUI (Score: 95%)
   ```

---

## 📊 Fonctionnement dans le Pipeline

Le système fonctionne en **2 étapes** :

### 1️⃣ Recherche web (Avant génération IA)
```typescript
const webSearchResult = await searchBeautyProduct(`${productName} ${brand}`);
// Retourne : { found: true, confidence: 95, source: 'notino.fr', url: '...', snippet: '...' }
```

### 2️⃣ Enrichissement du prompt IA
L'IA Gemini reçoit un contexte enrichi :
```
RÉSULTAT DE RECHERCHE WEB (Sources fiables : Notino, Fragrantica) :
- Produit trouvé : OUI
- Score de confiance recherche : 95%
- Source : notino.fr
- URL : https://...
- Extrait : "La Vie Est Belle de Lancôme - Eau de Parfum..."
```

→ L'IA ajuste son **score de confiance final** en fonction de ces résultats.

---

## 🚨 Quotas et Limites

| Plan | Requêtes/jour | Prix au-delà |
|------|--------------|--------------|
| **Gratuit** | 100 requêtes | 5$ / 1000 req |

💡 **Astuce** : Pour le MVP, 100 requêtes/jour suffisent (= ~100 générations de produits par jour).

---

## ✅ Checklist de validation

- [ ] Custom Search API activée sur GCP
- [ ] Moteur de recherche créé avec Notino + Fragrantica
- [ ] Search Engine ID copié
- [ ] Clé API configurée dans `.env.local`
- [ ] Test manuel via URL réussi
- [ ] Test dans l'app avec "La Vie Est Belle" → console affiche "✅ Produit trouvé"

---

## 🔗 Liens utiles

- **Programmable Search Engine** : https://programmablesearchengine.google.com/
- **Google Cloud Console** : https://console.cloud.google.com/
- **Documentation Custom Search API** : https://developers.google.com/custom-search/v1/overview
- **Pricing** : https://developers.google.com/custom-search/v1/overview#pricing

---

## 🆘 Troubleshooting

### Erreur : "API key not valid"
→ Vérifie que Custom Search API est activée sur GCP  
→ Vérifie que la clé n'a pas de restrictions incompatibles

### Erreur : "Invalid search engine ID"
→ Va sur https://programmablesearchengine.google.com/  
→ Clique sur ton moteur → **Setup** → copie l'ID correctement

### Aucun résultat trouvé
→ Vérifie que les sites `notino.fr` et `fragrantica.com` sont bien dans la liste  
→ Teste avec un produit connu : "chanel n5"

### Console affiche : "recherche web désactivée"
→ Les clés API contiennent encore `your_api_key_here` ou `your_search_engine_id_here`  
→ Remplace par les vraies valeurs dans `.env.local`
