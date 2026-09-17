# validate_mobile_polish.ps1 - Automated verification for mobile touch polish & features
$ErrorActionPreference = "Stop"

Write-Host "`n=== Validating Mobile Polish & Touch Features ===" -ForegroundColor Cyan

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Assert-Check($id, $desc, $cond) {
    if ($cond) {
        Write-Host " [PASS] $id : $desc" -ForegroundColor Green
        $script:results.Add([PSCustomObject]@{ Id = $id; Description = $desc; Status = "PASS" })
    } else {
        Write-Host " [FAIL] $id : $desc" -ForegroundColor Red
        $script:results.Add([PSCustomObject]@{ Id = $id; Description = $desc; Status = "FAIL" })
    }
}

$root = $PSScriptRoot
$indexContent = Get-Content (Join-Path $root "index.html") -Raw
$uiContent = Get-Content (Join-Path $root "src\systems\UISystem.js") -Raw
$gameContent = Get-Content (Join-Path $root "src\scenes\GameScene.js") -Raw
$charSelectContent = Get-Content (Join-Path $root "src\scenes\CharacterSelectScene.js") -Raw
$levelSelectContent = Get-Content (Join-Path $root "src\scenes\LevelSelectScene.js") -Raw
$shopContent = Get-Content (Join-Path $root "src\scenes\ShopScene.js") -Raw
$sheetContent = Get-Content (Join-Path $root "src\scenes\CharacterSheetScene.js") -Raw

# POL-01: index.html defines touch scale and opacity CSS variables
Assert-Check "POL-01" "index.html defines --touch-scale and --touch-opacity in :root" `
    ($indexContent -match '--touch-scale:' -and $indexContent -match '--touch-opacity:')

# POL-02: .touch-btn uses opacity variable and dynamic scale
Assert-Check "POL-02" ".touch-btn applies --touch-opacity and calc with --touch-scale" `
    ($indexContent -match '\.touch-btn\s*\{[^}]*--touch-scale' -and $indexContent -match '\.touch-btn\s*\{[^}]*--touch-opacity')

# POL-03: .touch-btn.btn-jump applies dynamic scale
Assert-Check "POL-03" ".touch-btn.btn-jump applies calc with --touch-scale" `
    ($indexContent -match '\.touch-btn\.btn-jump\s*\{[^}]*--touch-scale')

# POL-04: index.html exposes setTouchButtonScale, getTouchButtonScale, cycleTouchButtonScale
Assert-Check "POL-04" "index.html exposes global touch sizing helper functions" `
    ($indexContent -match 'window\.setTouchButtonScale' -and `
     $indexContent -match 'window\.getTouchButtonScale' -and `
     $indexContent -match 'window\.cycleTouchButtonScale')

# POL-05: index.html defines touch-size-btn in header
Assert-Check "POL-05" "index.html defines #touch-size-btn header button" `
    ($indexContent -match 'id="touch-size-btn"')

# POL-06: index.html defines size presets in mobile modal
Assert-Check "POL-06" "index.html mobile modal includes scale option buttons (.btn-scale-opt)" `
    ($indexContent -match 'class="copy-btn btn-scale-opt"')

# POL-07: btn-touch-jump advances when level complete or title active
Assert-Check "POL-07" "btn-touch-jump handler checks isLevelCompleteActive and calls handleStartInput" `
    ($indexContent -match 'isLevelCompleteActive' -and $indexContent -match 'gs\.handleStartInput\(\)')

# POL-08: UISystem.js adds Touch Button Size control in Settings overlay
Assert-Check "POL-08" "UISystem.js creates interactive Touch Button Size control in Settings" `
    ($uiContent -match 'TOUCH BUTTON SIZE' -and $uiContent -match 'adjustScale')

# POL-09: UISystem.js creates interactive Next Sector button in Level Complete overlay
Assert-Check "POL-09" "UISystem.js adds interactive nextBtn in createLevelCompleteOverlay" `
    ($uiContent -match '▶ NEXT SECTOR' -and $uiContent -match 'nextBtnBg\.on\(''pointerdown''')

# POL-10: UISystem.js adds auto-advance countdown timer for mobile level completion
Assert-Check "POL-10" "UISystem.js creates autoAdvanceTimer in showLevelComplete" `
    ($uiContent -match 'this\.autoAdvanceTimer' -and $uiContent -match 'Auto-advancing')

# POL-11: UISystem.js makes Game Over overlay tap-to-restart
Assert-Check "POL-11" "UISystem.js makes scrim and panel tap-to-restart in GameOverOverlay" `
    ($uiContent -match 'PRESS \[ENTER\] OR TAP TO RETURN' -and $uiContent -match 'panel\.setInteractive')

# POL-12: GameScene.js adds pointerdown listener to advance on level complete
Assert-Check "POL-12" "GameScene.js listens for pointerdown to advance completed level" `
    ($gameContent -match 'this\.input\.on\(''pointerdown''' -and $gameContent -match 'isLevelComplete\(\)')

# POL-13: CharacterSelectScene has touch navigation buttons
Assert-Check "POL-13" "CharacterSelectScene has interactive Back and Deploy buttons" `
    ($charSelectContent -match 'BACK' -and $charSelectContent -match 'DEPLOY OPERATIVE')

# POL-14: LevelSelectScene has touch Back button
Assert-Check "POL-14" "LevelSelectScene has interactive Back to Title button" `
    ($levelSelectContent -match 'TITLE' -and $levelSelectContent -match 'backBtn')

# POL-15: ShopScene has touch Back and Sheet buttons
Assert-Check "POL-15" "ShopScene has interactive Back and Sheet buttons in header" `
    ($shopContent -match 'BACK' -and $shopContent -match 'SHEET' -and $shopContent -match 'backBtn')

# POL-16: CharacterSheetScene has touch Back, Shop, and Prev/Next buttons
Assert-Check "POL-16" "CharacterSheetScene has interactive Back, Shop, and Prev/Next buttons" `
    ($sheetContent -match 'BACK' -and $sheetContent -match 'SHOP' -and $sheetContent -match 'prevBtn')

# Summary
$failed = $results | Where-Object { $_.Status -eq "FAIL" }
Write-Host "`n------------------------------------------------------------"
Write-Host "Summary: $($results.Count - $failed.Count) / $($results.Count) checks PASSED." -ForegroundColor $(if ($failed.Count -eq 0) { "Green" } else { "Red" })

if ($failed.Count -gt 0) {
    Write-Host "Failed checks:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host " - $($_.Id): $($_.Description)" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "All mobile polish and touch features verified successfully!" -ForegroundColor Green
    exit 0
}
