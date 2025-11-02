# Script to update all import paths to use aliases

$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Update Navbar imports
    $content = $content -replace 'from [''"].*?/components/Navbar(\.(jsx|js))?[''"]', 'from "@components/layout/Navbar.jsx"'
    
    # Update Footer imports
    $content = $content -replace 'from [''"].*?/components/Footer(\.(jsx|js))?[''"]', 'from "@components/layout/Footer.jsx"'
    
    # Update Sidebar imports
    $content = $content -replace 'from [''"].*?/sidebar/sidebar(\.(jsx|js))?[''"]', 'from "@components/layout/Sidebar.jsx"'
    
    # Update Loading imports
    $content = $content -replace 'from [''"].*?/components/Loading(\.(jsx|js))?[''"]', 'from "@components/ui/Loading.jsx"'
    
    # Update ConfirmationModal imports
    $content = $content -replace 'from [''"].*?/components/ConfirmationModal(\.(jsx|js))?[''"]', 'from "@components/ui/ConfirmationModal.jsx"'
    
    # Update Home imports
    $content = $content -replace 'from [''"].*?/components/Home(\.(jsx|js))?[''"]', 'from "@components/shared/Home.jsx"'
    
    # Update ProtectedRoute imports
    $content = $content -replace 'from [''"].*?/components/ProtectedRoute(\.(jsx|js))?[''"]', 'from "@components/shared/ProtectedRoute.jsx"'
    
    # Update VnPayPaymentButton imports
    $content = $content -replace 'from [''"].*?/components/VnPayPaymentButton(\.(jsx|js))?[''"]', 'from "@components/shared/VnPayPaymentButton.jsx"'
    
    # Update AboutUs imports
    $content = $content -replace 'from [''"].*?/(page/home/)?AboutUs(\.(jsx|js))?[''"]', 'from "@components/shared/AboutUs.jsx"'
    
    # Update Appoint imports
    $content = $content -replace 'from [''"].*?/(page/home/)?Appoint(\.(jsx|js))?[''"]', 'from "@components/shared/Appoint.jsx"'
    
    # Update Contact imports
    $content = $content -replace 'from [''"].*?/(page/home/)?Contact(\.(jsx|js))?[''"]', 'from "@components/shared/Contact.jsx"'
    
    # Save if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nImport paths updated successfully!"
