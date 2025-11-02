# Robust button -> Button replacement script
# - Replaces <button ...>...</button> with <Button ...>...</Button>
# - Inserts import Button from '@components/ui/Button.jsx' after the last import if missing
# - Skips files in components/ui to avoid touching the shared components themselves

Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse | ForEach-Object {
    $path = $_.FullName
    if ($path -match "\\components\\ui\\") { return }

    $text = Get-Content $path -Raw
    if ($text -notmatch "<button") { return }

    $original = $text

    # Perform replacement
    $text = $text -replace "<button", "<Button"
    $text = $text -replace "</button>", "</Button>"

    # Add import if missing (look for any import that ends with Button.jsx)
    if ($text -notmatch "import\s+Button\s+from\s+['\"][^'\"]*Button\.jsx['\"]") {
        # Find insertion index after last import line
        $lines = $text -split "\r?\n"
        $lastImportIndex = -1
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^\s*import\s+") { $lastImportIndex = $i }
        }
        $importLine = "import Button from '@components/ui/Button.jsx';"
        if ($lastImportIndex -ge 0) {
            $before = $lines[0..$lastImportIndex]
            $after = $lines[($lastImportIndex+1)..($lines.Length-1)]
            $newLines = @()
            $newLines += $before
            $newLines += $importLine
            $newLines += $after
            $text = ($newLines -join "`n")
        } else {
            $text = $importLine + "`n" + $text
        }
    }

    if ($text -ne $original) {
        Set-Content -Path $path -Value $text -NoNewline
        Write-Host "Updated buttons in: $path"
    }
}
Write-Host "Done replacing buttons (review changes)."