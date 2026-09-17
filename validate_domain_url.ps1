# validate_domain_url.ps1 - Automated verification for starleaper.io domain integration
$ErrorActionPreference = "Stop"

$passed = 0
$total = 0

function Assert-Check($id, $desc, $condition) {
    $script:total++
    if ($condition) {
        $script:passed++
        Write-Host " [PASS] $id : $desc" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $id : $desc" -ForegroundColor Red
    }
}

Write-Host "=== STARLEAPER.IO DOMAIN VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. index.html checks
$indexContent = Get-Content "index.html" -Raw
Assert-Check "DOM-01" "index.html title includes starleaper.io" ($indexContent -match "<title>starleaper\.io")
Assert-Check "DOM-02" "index.html defines canonical link to http://starleaper.io/" ($indexContent -match '<link rel="canonical" href="http://starleaper\.io/">')
Assert-Check "DOM-03" "index.html defines .domain-pill styling" ($indexContent -match '\.domain-pill')
Assert-Check "DOM-04" "index.html renders domain pill in header" ($indexContent -match 'class="domain-pill"[^>]*>.*starleaper\.io')
Assert-Check "DOM-05" "index.html renders starleaper.io in footer status bar" ($indexContent -match 'class="domain-footer-link"')

# 2. UISystem.js checks
$uiContent = Get-Content "src/systems/UISystem.js" -Raw
Assert-Check "DOM-06" "UISystem.js renders STARLEAPER.IO watermark on Title screen" ($uiContent -match 'STARLEAPER\.IO')
Assert-Check "DOM-07" "UISystem.js renders starleaper.io in Pause Menu" ($uiContent -match 'starleaper\.io')
Assert-Check "DOM-08" "UISystem.js maintains titlePromptText definition" ($uiContent -match 'this\.titlePromptText =')

# 3. Setup and Configuration scripts
Assert-Check "DOM-09" "setup_starleaper_domain.ps1 exists" (Test-Path "setup_starleaper_domain.ps1")
$setupPs1 = Get-Content "setup_starleaper_domain.ps1" -Raw
Assert-Check "DOM-10" "setup_starleaper_domain.ps1 defines 127.0.0.1 starleaper.io mapping" ($setupPs1 -match '127\.0\.0\.1 starleaper\.io')
Assert-Check "DOM-11" "setup_starleaper_domain.ps1 flushes DNS cache" ($setupPs1 -match 'ipconfig /flushdns')

Assert-Check "DOM-12" "setup_starleaper_domain.bat exists" (Test-Path "setup_starleaper_domain.bat")
Assert-Check "DOM-13" "uninstall_starleaper_domain.ps1 exists" (Test-Path "uninstall_starleaper_domain.ps1")

# 4. Server responsiveness with starleaper.io Host header
$serverResponsive = $false
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8080/" -Headers @{ Host = "starleaper.io:8080" } -TimeoutSec 3 -ErrorAction Stop
    if ($res -match "starleaper\.io") {
        $serverResponsive = $true
    }
} catch {
    $serverResponsive = $false
}
Assert-Check "DOM-14" "server.ps1 accepts Host: starleaper.io:8080 and serves index.html" ($serverResponsive -eq $true)

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "STARLEAPER.IO VALIDATION: $passed / $total PASSED" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
Write-Host "=======================================================" -ForegroundColor Cyan

if ($passed -ne $total) {
    exit 1
}
