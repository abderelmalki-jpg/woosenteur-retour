# Script pour activer/désactiver les routes API
# Usage: .\toggle-api-routes.ps1 -Action disable|enable

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("disable", "enable")]
    [string]$Action
)

$apiPath = "app\api"
$apiDisabledPath = "app\api-disabled-for-capacitor"

if ($Action -eq "disable") {
    if (Test-Path $apiPath) {
        Write-Host "🔒 Désactivation des routes API pour build Capacitor..." -ForegroundColor Yellow
        
        # Forcer la fermeture des processus qui pourraient bloquer
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        
        Move-Item -Path $apiPath -Destination $apiDisabledPath -Force
        Write-Host "✅ Routes API désactivées (renommé en api-disabled-for-capacitor)" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Routes API déjà désactivées" -ForegroundColor Cyan
    }
}
elseif ($Action -eq "enable") {
    if (Test-Path $apiDisabledPath) {
        Write-Host "🔓 Réactivation des routes API..." -ForegroundColor Yellow
        Move-Item -Path $apiDisabledPath -Destination $apiPath -Force
        Write-Host "✅ Routes API réactivées" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Routes API déjà activées" -ForegroundColor Cyan
    }
}
