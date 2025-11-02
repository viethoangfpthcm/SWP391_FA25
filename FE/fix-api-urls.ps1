# Script to replace all hardcoded API URLs with proxy-based URLs

$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace hardcoded API_BASE URLs
    $content = $content -replace 'const API_BASE = import\.meta\.env\.VITE_API_URL \|\| "https://103\.90\.226\.216:8443";', 'const API_BASE = "";'
    $content = $content -replace 'const API_BASE = "https://103\.90\.226\.216:8443";', 'const API_BASE = "";'
    $content = $content -replace 'const API_BASE_URL = "https://103\.90\.226\.216:8443/api/users";', 'const API_BASE_URL = "/api/users";'
    
    # Replace direct API calls in fetch
    $content = $content -replace 'https://103\.90\.226\.216:8443/api/', '/api/'
    $content = $content -replace 'https://103\.90\.226\.216:8443', ''
    
    # Save if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`n✅ All API URLs updated to use Vite proxy!"
Write-Host "Now all API calls will go through: http://localhost:517X/api/* → https://103.90.226.216:8443/api/*"
