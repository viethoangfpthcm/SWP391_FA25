$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse
foreach ($file in $files) {
    $path = $file.FullName
    $text = Get-Content $path -Raw
    if ($text -match "<button") {
        # skip files that are UI components already (to avoid nested replacements in Button.jsx)
        if ($path -match "\\components\\ui\\") { continue }

        $original = $text
        # Replace opening and closing tags
        $text = $text -replace "<button", "<Button"
        $text = $text -replace "</button>", "</Button>"

        # Ensure Button import exists
        if ($text -notmatch "import\s+Button\s+from\s+['\"]@components/ui/Button\.jsx['\"]") {
            # Try to insert after last import
            if ($text -match "(import[\s\S]*?;\r?\n)([^]*?)$") {
                # find position after last import
                $lines = $text -split "\r?\n"
                $insertAt = 0
                for ($i=0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match "^import ") { $insertAt = $i }
                }
                $insertAt = $insertAt + 1
                $lines = $lines[0..($lines.Count-1)]
                $newLines = @()
                for ($i=0; $i -lt $insertAt; $i++) { $newLines += $lines[$i] }
                $newLines += "import Button from '@components/ui/Button.jsx';"
                for ($i=$insertAt; $i -lt $lines.Count; $i++) { $newLines += $lines[$i] }
                $text = ($newLines -join "`n")
            } else {
                $text = "import Button from '@components/ui/Button.jsx';`n" + $text
            }
        }

        if ($text -ne $original) {
            Set-Content -Path $path -Value $text -NoNewline
            Write-Host "Updated buttons in: $path"
        }
    }
}
Write-Host "Done replacing buttons (review changes)."