# 🚨 URGENT : Corriger les Erreurs d'API Keys

## ❌ Erreurs Actuelles

```
403 Forbidden - API_KEY_SERVICE_BLOCKED
```

**Cause** : La clé Firebase `AIzaSyBkh9L80CtfJSOHUf4WtRg8qf-UY_L-Vdw` est **bloquée** pour :
1. ❌ Gemini API (`generativelanguage.googleapis.com`)
2. ❌ Custom Search API (`customsearch.googleapis.com`)

---

## ✅ Solution : Obtenir une Clé Gemini Valide

### Méthode 1 : Google AI Studio (RECOMMANDÉE - Gratuit)

1. **Va sur** : https://aistudio.google.com/app/apikey
2. **Connecte-toi** avec ton compte Google
3. Clique sur **"Create API Key"** (Créer une clé API)
4. **Options** :
   - **Nouveau projet** : Crée un projet séparé (pas Firebase)
   - **Projet existant** : Utilise un projet Google Cloud existant (pas `studio-667958240-ed1db` s'il est bloqué)
5. **Copie la clé** générée (format : `AIzaSy...`)

### Méthode 2 : Google Cloud Console

1. Va sur : https://console.cloud.google.com/
2. **Crée un NOUVEAU projet** (ne pas utiliser `studio-667958240-ed1db`)
3. Active **"Generative Language API"** :
   - Menu → **APIs & Services** → **Library**
   - Cherche "Generative Language API"
   - Clique sur **Enable**
4. Crée une clé API :
   - **APIs & Services** → **Credentials**
   - **Create Credentials** → **API Key**
   - Copie la clé

---

## 🔧 Mise à Jour du `.env.local`

Une fois la nouvelle clé obtenue, remplace dans `.env.local` :

```bash
# REMPLACE CETTE LIGNE :
GOOGLE_API_KEY=AIzaSyBkh9L80CtfJSOHUf4WtRg8qf-UY_L-Vdw

# PAR TA NOUVELLE CLÉ :
GOOGLE_API_KEY=TA_NOUVELLE_CLE_GEMINI_ICI
```

---

## 🧪 Test Après Correction

1. **Redémarre le serveur** :
   ```powershell
   npm run dev
   ```

2. **Teste une génération** :
   - Produit : `La Vie Est Belle`
   - Marque : `Lancôme`
   - Catégorie : `Parfums`

3. **Console doit afficher** :
   ```
   ✅ Génération réussie avec score de confiance XX%
   ```

---

## 📋 Checklist de Vérification

- [ ] Nouvelle clé Gemini obtenue depuis https://aistudio.google.com/app/apikey
- [ ] Clé copiée et collée dans `.env.local` (variable `GOOGLE_API_KEY`)
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Test de génération réussi (aucune erreur 403)
- [ ] Console affiche le résultat JSON avec `seoTitle`, `shortDescription`, etc.

---

## ⚠️ Notes sur Custom Search API

Pour l'instant, la recherche web sur Notino/Fragrantica est **désactivée automatiquement** si la clé Custom Search est invalide. L'IA fonctionnera quand même, mais sans validation externe.

Pour activer Custom Search plus tard :

1. Va sur Google Cloud Console
2. Active **"Custom Search API"**
3. Utilise la même clé Gemini OU crée une clé dédiée
4. Mets à jour `GOOGLE_CUSTOM_SEARCH_API_KEY` dans `.env.local`

---

## 🆘 Si Problème Persiste

### Erreur : "API key not valid"
→ Vérifie que tu as copié la BONNE clé (pas celle de Firebase)  
→ Va sur https://aistudio.google.com/app/apikey et vérifie le statut de la clé

### Erreur : "Service not enabled"
→ Va sur Google Cloud Console  
→ Active "Generative Language API" manuellement

### Erreur : "Quota exceeded"
→ Tu as dépassé les 15 requêtes/minute (plan gratuit)  
→ Attends 1 minute et réessaye

---

## 💡 Quotas Gratuits

**Google AI Studio (Gemini 1.5 Flash)** :
- ✅ **60 requêtes/minute**
- ✅ **1500 requêtes/jour**
- ✅ **Gratuit** (pas de carte bancaire requise)

Largement suffisant pour le développement et les tests ! 🚀
