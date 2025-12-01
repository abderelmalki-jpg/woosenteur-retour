# Installation APK WooSenteur sur Téléphone
# Guide complet

## 📱 Méthode 1 : Installation Directe (SANS CÂBLE)

### Étape 1 : Transférer l'APK
1. **Via Google Drive/Dropbox** :
   - Uploader `builds\WooSenteur-debug-2025-12-01_10-38.apk`
   - Partager le lien
   - Ouvrir sur téléphone et télécharger

2. **Via Email** :
   - Envoyer l'APK en pièce jointe
   - Ouvrir email sur téléphone

3. **Via WhatsApp/Telegram** :
   - Envoyer à vous-même
   - Télécharger sur téléphone

### Étape 2 : Autoriser Installation Sources Inconnues
1. Ouvrir **Paramètres** → **Sécurité**
2. Activer **"Sources inconnues"** OU **"Installer des applications inconnues"**
3. Autoriser pour le navigateur/app utilisée (Chrome, Gmail, etc.)

### Étape 3 : Installer
1. Ouvrir le fichier APK téléchargé
2. Cliquer **"Installer"**
3. Attendre fin installation
4. Cliquer **"Ouvrir"**

---

## 🔌 Méthode 2 : Via Câble USB (ADB)

### Prérequis
1. **Activer Mode Développeur** :
   - Paramètres → À propos
   - Taper 7x sur "Numéro de build"

2. **Activer Débogage USB** :
   - Paramètres → Options développeur
   - Activer "Débogage USB"

3. **Brancher téléphone** avec câble USB

### Installation Automatique
```powershell
# Vérifier détection téléphone
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices

# Installer APK
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r "builds\WooSenteur-debug-2025-12-01_10-38.apk"
```

### Lancer l'app
```powershell
& "$env:ANDROID_HOME\platform-tools\adb.exe" shell am start -n fr.woosenteur.app/.MainActivity
```

---

## 🐛 Débuggage en Temps Réel

### Voir les logs pendant utilisation
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" logcat | Select-String "Capacitor|WooSenteur|chromium"
```

### Inspecter avec Chrome DevTools
1. Ouvrir Chrome sur PC : `chrome://inspect`
2. Téléphone branché en USB
3. Sélectionner "WooSenteur" dans la liste
4. Inspecter console JavaScript, Network, etc.

---

## ⚠️ Problèmes Courants

### "Installation bloquée"
- Vérifier "Sources inconnues" activé
- Sur Android 13+ : Autoriser app par app

### "L'application n'est pas installée"
- APK corrompu → Re-télécharger
- Espace insuffisant → Libérer stockage
- Signature incompatible → Désinstaller ancienne version

### "Impossible d'ouvrir le fichier"
- Télécharger app "APK Installer" depuis Play Store
- Utiliser pour installer

### Écran blanc au lancement
- Problème API routes (normal pour MVP)
- Voir logs : `adb logcat`

---

## 🎯 Checklist Tests

- [ ] L'app s'ouvre (splash screen violet)
- [ ] Page d'accueil charge (vidéo hero, CTA)
- [ ] Navigation menu fonctionne
- [ ] Formulaire login/register visible
- [ ] Dashboard accessible (après login)
- [ ] Responsive mobile correct
- [ ] Génération produit (va échouer - API routes à migrer)
- [ ] Upload image fonctionne (plugin Camera)
- [ ] Scroll fluide
- [ ] Thème violet cohérent partout

---

## 📊 Informations APK

**Fichier** : `builds\WooSenteur-debug-2025-12-01_10-38.apk`
**Taille** : 7.40 MB
**Version** : Debug (non signée)
**Package** : `fr.woosenteur.app`
**Min SDK** : Android 5.0 (API 21)
**Target SDK** : Android 15 (API 36)

---

## 🚀 Prochaines Étapes Après Tests

1. **Identifier bugs visuels** (responsive, couleurs)
2. **Tester features offline** (localStorage → Preferences)
3. **Migrer API routes** vers Firebase Functions (génération IA, Stripe, WooCommerce)
4. **Build APK Release** signé pour distribution
5. **Distribution** : Firebase App Distribution ou Play Store

---

**Besoin d'aide ?** Consultez `doc/ANDROID_SETUP_COMPLETE.md` pour guide complet.
