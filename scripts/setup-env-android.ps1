# Configuration Environnement Android & Java - WooSenteur
# À exécuter UNE SEULE FOIS pour configurer Windows

Write-Host "🔧 Configuration environnement WooSenteur Android" -ForegroundColor Cyan

# Java 21 (requis par Capacitor 7)
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')
Write-Host "✅ JAVA_HOME configuré: $javaHome" -ForegroundColor Green

# Android SDK
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidHome, 'User')
Write-Host "✅ ANDROID_HOME configuré: $androidHome" -ForegroundColor Green

# Mise à jour PATH
$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$pathsToAdd = @(
    "$javaHome\bin",
    "$androidHome\platform-tools",
    "$androidHome\tools",
    "$androidHome\cmdline-tools\latest\bin"
)

foreach ($path in $pathsToAdd) {
    if ($userPath -notlike "*$path*") {
        $userPath = "$path;$userPath"
        Write-Host "✅ Ajouté au PATH: $path" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Déjà dans PATH: $path" -ForegroundColor Yellow
    }
}

[System.Environment]::SetEnvironmentVariable('Path', $userPath, 'User')

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Redémarrer PowerShell/VSCode pour appliquer" -ForegroundColor Yellow
Write-Host "`n💡 Vérifier la configuration:" -ForegroundColor Cyan
Write-Host "   java -version    # Doit afficher 21.0.9" -ForegroundColor White
Write-Host "   adb version      # Doit afficher version ADB" -ForegroundColor White
