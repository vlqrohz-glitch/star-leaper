# validate_mobile_touch.ps1 - Automated verification for mobile touch controls & mobile readiness
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

Write-Host "=== MOBILE TOUCH CONTROLS & COMPATIBILITY VALIDATION ===" -ForegroundColor Cyan

# 1. InputSystem.js touch state integration
$inputContent = Get-Content "src/systems/InputSystem.js" -Raw
Assert-Check "MOB-01" "InputSystem.js defines touchState object" ($inputContent -match "this\.touchState\s*=")
Assert-Check "MOB-02" "InputSystem.js exposes window.__STARLEAPER_TOUCH__" ($inputContent -match "window\.__STARLEAPER_TOUCH__\s*=")
Assert-Check "MOB-03" "isLeft checks touchState.left" ($inputContent -match "this\.touchState\.left")
Assert-Check "MOB-04" "isRight checks touchState.right" ($inputContent -match "this\.touchState\.right")
Assert-Check "MOB-05" "isJump checks touchState.jump" ($inputContent -match "this\.touchState\.jump")
Assert-Check "MOB-06" "isJumpJustPressed handles touchState.jumpJustPressed" ($inputContent -match "this\.touchState\.jumpJustPressed")
Assert-Check "MOB-07" "isJumpJustReleased handles touchState.jumpJustReleased" ($inputContent -match "this\.touchState\.jumpJustReleased")

# 2. index.html touch gamepad DOM elements
$indexContent = Get-Content "index.html" -Raw
Assert-Check "MOB-08" "index.html defines #virtual-gamepad" ($indexContent -match 'id="virtual-gamepad"')
Assert-Check "MOB-09" "index.html defines #btn-touch-left" ($indexContent -match 'id="btn-touch-left"')
Assert-Check "MOB-10" "index.html defines #btn-touch-right" ($indexContent -match 'id="btn-touch-right"')
Assert-Check "MOB-11" "index.html defines #btn-touch-jump" ($indexContent -match 'id="btn-touch-jump"')
Assert-Check "MOB-12" "index.html defines #touch-toggle-btn" ($indexContent -match 'id="touch-toggle-btn"')
Assert-Check "MOB-13" "index.html defines #mobile-guide-btn" ($indexContent -match 'id="mobile-guide-btn"')
Assert-Check "MOB-14" "index.html defines #mobile-modal" ($indexContent -match 'id="mobile-modal"')

# 3. Mobile viewport & PWA meta tags
Assert-Check "MOB-15" "index.html defines touch-action / user-scalable meta" ($indexContent -match 'user-scalable=no')
Assert-Check "MOB-16" "index.html defines apple-mobile-web-app-capable" ($indexContent -match 'apple-mobile-web-app-capable')

# 4. server.ps1 mobile network detection
$serverContent = Get-Content "server.ps1" -Raw
Assert-Check "MOB-17" "server.ps1 detects LAN/Wi-Fi IPv4 address" ($serverContent -match 'GetHostAddresses')
Assert-Check "MOB-18" "server.ps1 logs Mobile URL in banner" ($serverContent -match 'Mobile URL:')

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "MOBILE VALIDATION RESULTS: $passed / $total PASSED" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
Write-Host "=======================================================" -ForegroundColor Cyan

if ($passed -ne $total) {
    exit 1
}
