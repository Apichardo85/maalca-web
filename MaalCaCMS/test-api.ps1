# Script para probar Umbraco Delivery API
# Uso: .\test-api.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Umbraco Delivery API - Test Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5011"
$apiUrl = "$baseUrl/umbraco/delivery/api/v2"

# Verificar que Umbraco está corriendo
Write-Host "[1/4] Verificando que Umbraco está corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Umbraco está corriendo en $baseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Umbraco no está corriendo en $baseUrl" -ForegroundColor Red
    Write-Host "   Ejecuta: dotnet run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Probar endpoint de contenido
Write-Host "[2/4] Probando endpoint de contenido..." -ForegroundColor Yellow
try {
    $contentResponse = Invoke-RestMethod -Uri "$apiUrl/content" -Method Get
    $totalItems = $contentResponse.total

    Write-Host "✅ API de contenido funcionando" -ForegroundColor Green
    Write-Host "   Total de items: $totalItems" -ForegroundColor Cyan

    if ($totalItems -eq 0) {
        Write-Host "   ⚠️  No hay contenido publicado aún" -ForegroundColor Yellow
        Write-Host "   Accede a $baseUrl/umbraco para crear contenido" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERROR: No se pudo acceder a la API de contenido" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Backoffice URL: $baseUrl/umbraco" -ForegroundColor Cyan
Write-Host "API Base URL: $apiUrl" -ForegroundColor Cyan
Write-Host ""
