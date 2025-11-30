# 🔒 Configuration SSL - Guide Rapide

## ✅ Votre domaine : woosenteur.fr

---

## 🎯 Étapes (5 minutes)

### 1️⃣ Accéder à Firebase Console
🔗 https://console.firebase.google.com/project/studio-667958240-ed1db/hosting/sites

### 2️⃣ Ajouter un domaine personnalisé
Cliquer sur **"Ajouter un domaine personnalisé"**

### 3️⃣ Entrer votre domaine
```
woosenteur.fr
```

### 4️⃣ Configuration DNS (chez votre registrar)

Firebase vous donnera ces enregistrements :

#### Enregistrement A (domaine principal)
```
Type: A
Nom: @
Valeur: 151.101.1.195
```

#### Enregistrement CNAME (www)
```
Type: CNAME
Nom: www
Valeur: woosenteur.fr
```

#### Enregistrement TXT (vérification)
```
Type: TXT
Nom: @
Valeur: [Valeur unique fournie par Firebase]
```

### 5️⃣ Attendre la propagation DNS
⏱️ **5 minutes à 24 heures**

Vérifier : https://dnschecker.org/#A/woosenteur.fr

### 6️⃣ Déployer l'application

```powershell
# Option 1: Script automatique
.\deploy-firebase.ps1

# Option 2: Manuel
npm run build
firebase deploy --only hosting
```

### 7️⃣ Attendre l'activation SSL
⏱️ **Jusqu'à 24 heures après propagation DNS**

Le certificat SSL Let's Encrypt sera généré **automatiquement** et **gratuitement**.

---

## ✅ Vérification finale

1. Aller sur `https://woosenteur.fr`
2. Vérifier le cadenas 🔒 dans le navigateur
3. Tester avec SSL Labs : https://www.ssllabs.com/ssltest/analyze.html?d=woosenteur.fr

---

## 🆘 Problème ?

**DNS pas propagé ?**
```powershell
nslookup woosenteur.fr
```

**SSL pas actif ?**
- Attendre jusqu'à 24h après propagation DNS
- Vérifier que les enregistrements DNS sont corrects
- Contacter le support Firebase si problème persiste

---

## 📚 Documentation complète

Voir `doc/SSL_SETUP.md` pour plus de détails
