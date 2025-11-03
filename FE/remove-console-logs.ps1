# Script to remove all console.log statements from JS/JSX files
$files = Get-ChildItem -Path "src" -Recurse -Include *.js,*.jsx
$totalCleaned = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Remove standalone console.log lines (with any indentation)
    $content = $content -replace '(?m)^\s*console\.log\([^)]*\);\s*[\r\n]+', ''
    
    # Remove inline console.log statements
    $content = $content -replace '\s*console\.log\([^)]*\);\s*', ''
    
    # Remove lines that disable console.log
    $content = $content -replace '(?m)^\s*console\.log\s*=\s*\(\)\s*=>\s*\{\s*\};\s*[\r\n]+', ''
    
    # Remove if statement that disables console.log in production
    $content = $content -replace '(?m)^\s*if\s*\(import\.meta\.env\.MODE\s*!==\s*"development"\)\s*\{\s*[\r\n]+\s*console\.log\s*=\s*\(\)\s*=>\s*\{\s*\};\s*[\r\n]+\s*\}[\r\n]+', ''
    
    # Remove comment lines about console.log
    $content = $content -replace '(?m)^\s*//.*console\.log.*[\r\n]+', ''
    
    if ($content -ne $originalContent) {
        $cleanedLines = ($originalContent.Length - $content.Length) / 20
        Set-Content $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
        $totalCleaned++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONSOLE.LOG CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files cleaned: $totalCleaned" -ForegroundColor Yellow
Write-Host "Project is now lighter and faster!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
