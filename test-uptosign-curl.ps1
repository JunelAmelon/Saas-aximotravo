# Script PowerShell pour tester UpToSign directement
# Remplacez YOUR_API_KEY par votre vraie clé API

$apiKey = "YOUR_API_KEY"  # Remplacez par votre clé
$baseUrl = "https://dev.uptosign.com"

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "Test d'authentification UpToSign..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/documents" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/documents" -Method GET -Headers $headers
    Write-Host "✅ Succès! Réponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
