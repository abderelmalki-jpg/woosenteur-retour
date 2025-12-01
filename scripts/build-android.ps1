# Script PowerShell - Build Android APK Debug
# WooSenteur - Génération APK pour tests

Write-Host "🚀 Début du build Android WooSenteur" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Étape 1: Build Next.js
Write-Host "`n📦 Étape 1/4: Build Next.js (export statique)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build Next.js" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build Next.js terminé" -ForegroundColor Green

# Étape 2: Sync Capacitor
Write-Host "`n🔄 Étape 2/4: Synchronisation Capacitor Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la synchronisation Capacitor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Synchronisation terminée" -ForegroundColor Green

# Étape 3: Build APK Debug
Write-Host "`n🔨 Étape 3/4: Build APK Debug avec Gradle..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build Gradle" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ APK Debug compilé" -ForegroundColor Green

# Étape 4: Copier APK vers dossier builds
Write-Host "`n📋 Étape 4/4: Copie de l'APK..." -ForegroundColor Yellow
$buildDir = "builds"
if (!(Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "$buildDir\WooSenteur-debug-$timestamp.apk"

if (Test-Path $apkSource) {
    Copy-Item $apkSource $apkDest
    Write-Host "✅ APK copié vers: $apkDest" -ForegroundColor Green
    
    # Afficher la taille du fichier
    $fileSize = (Get-Item $apkDest).Length / 1MB
    Write-Host "📊 Taille du fichier: $($fileSize.ToString('0.00')) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ APK introuvable à: $apkSource" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
Write-Host "📱 APK disponible: $apkDest" -ForegroundColor Cyan
Write-Host "`n💡 Pour installer sur un appareil:" -ForegroundColor Yellow
Write-Host "   1. Activer le mode développeur sur votre téléphone" -ForegroundColor White
Write-Host "   2. Activer l'installation depuis des sources inconnues" -ForegroundColor White
Write-Host "   3. Transférer l'APK et l'installer" -ForegroundColor White
Write-Host "`n💡 Pour tester avec émulateur:" -ForegroundColor Yellow
Write-Host "   adb install `"$apkDest`"" -ForegroundColor White
