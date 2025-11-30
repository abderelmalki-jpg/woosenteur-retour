# Script de déploiement Firebase avec SSL
# Usage: .\deploy-firebase.ps1

Write-Host "🚀 Déploiement WooSenteur sur Firebase Hosting" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Build
Write-Host "📦 Étape 1/4 : Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green
Write-Host ""

# Étape 2: Vérifier que le dossier /out existe
Write-Host "🔍 Étape 2/4 : Vérification du dossier /out..." -ForegroundColor Yellow

if (Test-Path "out") {
    $fileCount = (Get-ChildItem -Path "out" -Recurse -File).Count
    Write-Host "✅ Dossier /out trouvé ($fileCount fichiers)" -ForegroundColor Green
} else {
    Write-Host "❌ Dossier /out introuvable" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 3: Déployer sur Firebase
Write-Host "🌐 Étape 3/4 : Déploiement sur Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement Firebase" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Déploiement réussi" -ForegroundColor Green
Write-Host ""

# Étape 4: Afficher les URLs
Write-Host "🎉 Étape 4/4 : Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs disponibles :" -ForegroundColor Cyan
Write-Host "  • Firebase: https://studio-667958240-ed1db.web.app" -ForegroundColor White
Write-Host "  • Domaine personnalisé: https://woosenteur.fr" -ForegroundColor White
Write-Host ""

# Vérifier si le SSL est actif
Write-Host "🔒 Vérification SSL..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://woosenteur.fr" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ SSL actif sur woosenteur.fr" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  SSL pas encore actif sur woosenteur.fr" -ForegroundColor Yellow
    Write-Host "   Raisons possibles:" -ForegroundColor Gray
    Write-Host "   - DNS pas encore propagé (attendre 1-24h)" -ForegroundColor Gray
    Write-Host "   - Domaine personnalisé pas encore configuré dans Firebase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📖 Voir doc/SSL_SETUP.md pour configurer le domaine" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✨ Déploiement terminé avec succès !" -ForegroundColor Green
