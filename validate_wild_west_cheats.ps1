# validate_wild_west_cheats.ps1
$ErrorActionPreference = "Stop"

$testResults = @()

function Assert-Check {
    param(
        [string]$CheckId,
        [string]$Description,
        [bool]$Condition
    )
    $script:testResults += [PSCustomObject]@{
        Id = $CheckId
        Description = $Description
        Passed = $Condition
    }
    if ($Condition) {
        Write-Host " [PASS] $CheckId : $Description" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $CheckId : $Description" -ForegroundColor Red
    }
}

Write-Host "`n=== Validating Wild West & Cheat Code System ===" -ForegroundColor Cyan

$charConfig = Get-Content "src/config/characterConfig.js" -Raw
$shopConfig = Get-Content "src/config/shopConfig.js" -Raw
$shopSystem = Get-Content "src/systems/ShopSystem.js" -Raw
$cheatSystem = Get-Content "src/systems/CheatSystem.js" -Raw
$enemyConfig = Get-Content "src/config/enemyConfig.js" -Raw
$levelsIndex = Get-Content "src/levels/index.js" -Raw
$levelSelect = Get-Content "src/scenes/LevelSelectScene.js" -Raw
$uiSystem = Get-Content "src/systems/UISystem.js" -Raw
$gameScene = Get-Content "src/scenes/GameScene.js" -Raw
$bootScene = Get-Content "src/scenes/BootScene.js" -Raw
$indexHtml = Get-Content "index.html" -Raw

Assert-Check "WST-01" "CheatSystem.js exists and exports CheatSystem" `
    ((Test-Path "src/systems/CheatSystem.js") -and ($cheatSystem -match "export const CheatSystem = new CheatSystemClass"))

Assert-Check "WST-02" "CheatSystem handles YEEHAW, COWBOY, RODEO, QUICKDRAW, GOLDRUSH, and WESTWORLD" `
    ($cheatSystem -match "YEEHAW" -and $cheatSystem -match "COWBOY" -and $cheatSystem -match "RODEO" -and $cheatSystem -match "QUICKDRAW" -and $cheatSystem -match "GOLDRUSH" -and $cheatSystem -match "WESTWORLD")

Assert-Check "WST-03" "characterConfig defines Sheriff Wyatt and Desperado Billy" `
    ($charConfig -match "WYATT" -and $charConfig -match "Sheriff Wyatt" -and $charConfig -match "BILLY" -and $charConfig -match "Desperado Billy")

Assert-Check "WST-04" "shopConfig defines Mustang Spirit (Horse) and Barnaby the Bear" `
    ($shopConfig -match "pet_horse" -and $shopConfig -match "Mustang Spirit" -and $shopConfig -match "pet_bear" -and $shopConfig -match "Barnaby the Bear")

Assert-Check "WST-05" "shopConfig defines Quickdraw, Gold Rush, and Dynamite Boots perks" `
    ($shopConfig -match "quickdraw" -and $shopConfig -match "gold_rush" -and $shopConfig -match "dynamite_boots")

Assert-Check "WST-06" "shopConfig defines Frontier Duster and Desperado Poncho outfits" `
    ($shopConfig -match "frontier_duster" -and $shopConfig -match "desperado_poncho")

Assert-Check "WST-07" "ShopSystem implements unlockItem and unlockAll" `
    ($shopSystem -match "unlockItem\(itemId\)" -and $shopSystem -match "unlockAll\(\)")

Assert-Check "WST-08" "Gunslinger.js enemy entity exists with line-of-sight revolver shooting" `
    ((Test-Path "src/entities/Gunslinger.js") -and ((Get-Content "src/entities/Gunslinger.js" -Raw) -match "aimAndFire" -and (Get-Content "src/entities/Gunslinger.js" -Raw) -match "Bullet"))

Assert-Check "WST-09" "DynamiteBandit.js enemy entity exists with arcing dynamite throwing" `
    ((Test-Path "src/entities/DynamiteBandit.js") -and ((Get-Content "src/entities/DynamiteBandit.js" -Raw) -match "throwDynamite" -and (Get-Content "src/entities/DynamiteBandit.js" -Raw) -match "Dynamite"))

Assert-Check "WST-10" "Bullet.js projectile entity exists" `
    ((Test-Path "src/entities/Bullet.js") -and ((Get-Content "src/entities/Bullet.js" -Raw) -match "class Bullet"))

Assert-Check "WST-11" "Dynamite.js explosive projectile entity exists with blast radius" `
    ((Test-Path "src/entities/Dynamite.js") -and ((Get-Content "src/entities/Dynamite.js" -Raw) -match "detonate" -and (Get-Content "src/entities/Dynamite.js" -Raw) -match "blastRadius"))

Assert-Check "WST-12" "enemyConfig defines GUNSLINGER and DYNAMITE_BANDIT" `
    ($enemyConfig -match "GUNSLINGER" -and $enemyConfig -match "DYNAMITE_BANDIT")

Assert-Check "WST-13" "level6.js Sector 6 Desert Biome layout exists with desert theme" `
    ((Test-Path "src/levels/level6.js") -and ((Get-Content "src/levels/level6.js" -Raw) -match "Dust Devil Canyon" -and (Get-Content "src/levels/level6.js" -Raw) -match "key: 'desert'"))

Assert-Check "WST-14" "levels/index.js registers LEVEL_6_DATA in LEVELS (6 sectors total)" `
    ($levelsIndex -match "LEVEL_6_DATA" -and $levelsIndex -match "LEVEL_5_DATA,\s*LEVEL_6_DATA")

Assert-Check "WST-15" "LevelSelectScene includes Sector 6 in LEVEL_CATALOG" `
    ($levelSelect -match "DUST DEVIL CANYON" -and $levelSelect -match "index: 6")

Assert-Check "WST-16" "UISystem creates Cheat Terminal modal with quick chips" `
    ($uiSystem -match "createCheatOverlay" -and $uiSystem -match "showCheatTerminal" -and $uiSystem -match "hideCheatTerminal")

Assert-Check "WST-17" "UISystem Title Screen and Pause Menu feature Cheat Terminal options" `
    ($uiSystem -match "CHEAT TERMINAL" -and $uiSystem -match "selectTitleMenuOption" -and $uiSystem -match "handlePauseSelect")

Assert-Check "WST-18" "UISystem HUD features interactive CODES button" `
    ($uiSystem -match "codesBtn" -and $uiSystem -match "★ CODES")

Assert-Check "WST-19" "GameScene binds cheat key C and manages enemy projectiles" `
    ($gameScene -match "KeyCodes\.C" -and $gameScene -match "enemyProjectiles" -and $gameScene -match "handlePlayerProjectileCollision")

Assert-Check "WST-20" "index.html exposes cheats button in header and mobile touch cluster" `
    ($indexHtml -match "cheats-btn" -and $indexHtml -match "btn-touch-cheats")

$failed = $script:testResults | Where-Object { -not $_.Passed }
if ($failed.Count -gt 0) {
    Write-Error "Validation failed: $($failed.Count) checks failed."
    exit 1
} else {
    Write-Host "`nAll $($script:testResults.Count) Wild West & Cheat Code checks PASSED!" -ForegroundColor Green
    exit 0
}
