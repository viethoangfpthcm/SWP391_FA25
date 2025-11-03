# Script để xóa các console.log debug có emoji
$files = Get-ChildItem -Path "src\features" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Xóa các dòng console.log/warn/error có emoji
    $content = $content -replace "(?m)^\s*console\.(log|warn|error)\([^)]*[🚗📡✅❌🔑🌐🔗📊📏🔍⚠️🏁][^)]*\);\r?\n", ""
    
    # Chỉ ghi file nếu có thay đổi
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Cleaned: $($file.FullName)"
    }
}

Write-Host "`n🎉 Done! Cleaned up debug logs with emojis."
