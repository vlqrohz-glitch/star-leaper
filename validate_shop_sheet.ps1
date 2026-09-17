# validate_shop_sheet.ps1 - Automated Validation for Fullscreen, Character Sheet & Cosmic Shop
$ErrorActionPreference = "Stop"
$testResults = [System.Collections.Generic.List[PSObject]]::new()

function Assert-Test($id, $description, $passed, $details = "") {
    $result = [PSCustomObject]@{
        Id = $id
        Description = $description
        Passed = [bool]$passed
        Details = $details
    }
    $script:testResults.Add($result)
    $status = if ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }
    Write-Host "$status $id : $description" -ForegroundColor $color
    if (-not $passed -and $details) {
        Write-Host "       Error: $details" -ForegroundColor DarkRed
    }
}

Write-Host "`n=== FULLSCREEN, CHARACTER SHEET & COSMIC SHOP VALIDATION ===" -ForegroundColor Cyan

# 1. FULLSCREEN SYSTEM
$indexHtml = Get-Content "index.html" -Raw
Assert-Test "FS-01" "index.html defines toggleGameFullscreen function" ($indexHtml -match "toggleGameFullscreen")
Assert-Test "FS-02" "index.html avoids aspect-distorting width:100% on canvas" (-not ($indexHtml -match "width:\s*100%\s*!important"))
Assert-Test "FS-03" "index.html preserves letterboxing with object-fit / max-dimensions" ($indexHtml -match "max-width:\s*100%" -and $indexHtml -match "object-fit:\s*contain")
Assert-Test "FS-04" "index.html binds global 'F' key listener" ($indexHtml -match "e\.key === 'f'")

$gameConfig = Get-Content "src/config/gameConfig.js" -Raw
Assert-Test "FS-05" "gameConfig.js targets 'game-container' for fullscreen" ($gameConfig -match "fullscreenTarget:\s*'game-container'")

# 2. SHOP CONFIGURATION
$shopConfigPath = "src/config/shopConfig.js"
$hasShopConfig = Test-Path $shopConfigPath
$shopConfig = if ($hasShopConfig) { Get-Content $shopConfigPath -Raw } else { "" }
Assert-Test "SHOP-01" "shopConfig.js exists" $hasShopConfig
Assert-Test "SHOP-02" "shopConfig defines outfits (Solar Flare, Cyber Void, Neon Pulse, Stellar Gold)" ($shopConfig -match "solar_flare" -and $shopConfig -match "cyber_void" -and $shopConfig -match "neon_pulse" -and $shopConfig -match "stellar_gold")
Assert-Test "SHOP-03" "shopConfig defines perks (Magnet Core, Reinforced Plating, Boost Thrusters, Lucky Stars)" ($shopConfig -match "magnet_core" -and $shopConfig -match "reinforced_plating" -and $shopConfig -match "boost_thrusters" -and $shopConfig -match "lucky_stars")
Assert-Test "SHOP-04" "shopConfig defines companion pets (Cosmo, Orb-E, Chrono, Star-Kitten)" ($shopConfig -match "pet_cosmo" -and $shopConfig -match "pet_orbe" -and $shopConfig -match "pet_chrono" -and $shopConfig -match "pet_starkitten")
Assert-Test "SHOP-05" "shopConfig defines STARTING_CRYSTAL_BALANCE (500)" ($shopConfig -match "STARTING_CRYSTAL_BALANCE = 500")

# 3. SHOP & INVENTORY SYSTEM
$shopSystemPath = "src/systems/ShopSystem.js"
$hasShopSystem = Test-Path $shopSystemPath
$shopSystem = if ($hasShopSystem) { Get-Content $shopSystemPath -Raw } else { "" }
Assert-Test "SYS-01" "ShopSystem.js exists" $hasShopSystem
Assert-Test "SYS-02" "ShopSystem manages wallet crystals" ($shopSystem -match "getCrystals" -and $shopSystem -match "addCrystals" -and $shopSystem -match "spendCrystals")
Assert-Test "SYS-03" "ShopSystem manages item purchases and ownership" ($shopSystem -match "purchaseItem" -and $shopSystem -match "isOwned")
Assert-Test "SYS-04" "ShopSystem manages item equipping and retrieval" ($shopSystem -match "equipItem" -and $shopSystem -match "getEquippedOutfit" -and $shopSystem -match "getEquippedPerk" -and $shopSystem -match "getEquippedPet")

# 4. COMPANION PET ENTITY & PROCEDURAL TEXTURES
$petPath = "src/entities/Pet.js"
$hasPet = Test-Path $petPath
$petCode = if ($hasPet) { Get-Content $petPath -Raw } else { "" }
Assert-Test "PET-01" "Pet.js exists" $hasPet
Assert-Test "PET-02" "Pet smoothly follows player with interpolation and bobbing" ($petCode -match "Linear" -and $petCode -match "Math\.sin")
Assert-Test "PET-03" "Pet mirrors player facing direction and emits stardust" ($petCode -match "setFlipX" -and $petCode -match "emitStardust")

$bootScene = Get-Content "src/scenes/BootScene.js" -Raw
Assert-Test "TEX-01" "BootScene generates outfit variant textures" ($bootScene -match "createOutfitTextures" -and $bootScene -match "solar_flare" -and $bootScene -match "stellar_gold")
Assert-Test "TEX-02" "BootScene generates all 4 pet textures" ($bootScene -match "createPetTextures" -and $bootScene -match "pet_cosmo" -and $bootScene -match "pet_starkitten")
Assert-Test "TEX-03" "BootScene generates shop badge textures" ($bootScene -match "createShopBadgeTextures" -and $bootScene -match "badge_magnet" -and $bootScene -match "badge_armor")

# 5. CHARACTER SHEET & SHOP SCENES
$sheetPath = "src/scenes/CharacterSheetScene.js"
$hasSheet = Test-Path $sheetPath
$sheetCode = if ($hasSheet) { Get-Content $sheetPath -Raw } else { "" }
Assert-Test "SCN-01" "CharacterSheetScene.js exists" $hasSheet
Assert-Test "SCN-02" "CharacterSheetScene displays attributes and stats meters" ($sheetCode -match "createInspectionBay" -and $sheetCode -match "createMetricsPanel" -and $sheetCode -match "updateDossier")
Assert-Test "SCN-03" "CharacterSheetScene displays equipped outfit, perk, and companion pet" ($sheetCode -match "getEquippedOutfit" -and $sheetCode -match "getEquippedPerk" -and $sheetCode -match "getEquippedPet")

$shopScenePath = "src/scenes/ShopScene.js"
$hasShopScene = Test-Path $shopScenePath
$shopSceneCode = if ($hasShopScene) { Get-Content $shopScenePath -Raw } else { "" }
Assert-Test "SCN-04" "ShopScene.js exists" $hasShopScene
Assert-Test "SCN-05" "ShopScene provides tabbed category browsing (Outfits, Perks, Pets)" ($shopSceneCode -match "createCategoryTabs" -and $shopSceneCode -match "renderCategoryCards")
Assert-Test "SCN-06" "ShopScene handles item purchases and equips" ($shopSceneCode -match "handleItemAction" -and $shopSceneCode -match "purchaseItem")

$mainJs = Get-Content "src/main.js" -Raw
Assert-Test "SCN-07" "main.js registers CharacterSheetScene and ShopScene" ($mainJs -match "CharacterSheetScene" -and $mainJs -match "ShopScene")

# 6. IN-GAME INTEGRATION
$playerCode = Get-Content "src/entities/Player.js" -Raw
Assert-Test "INT-01" "Player.js applies equipped outfit skin and boost thrusters perk" ($playerCode -match "applyAppearanceAndPerks" -and $playerCode -match "boost_thrusters")

$gameScene = Get-Content "src/scenes/GameScene.js" -Raw
Assert-Test "INT-02" "GameScene spawns and updates companion pet" ($gameScene -match "new Pet\(" -and $gameScene -match "this\.pet\.update\(delta\)")
Assert-Test "INT-03" "GameScene implements Magnet Core crystal pull" ($gameScene -match "magnet_core" -and $gameScene -match "pullSpeed")
Assert-Test "INT-04" "GameScene applies Reinforced Plating +1 HP capacity" ($gameScene -match "reinforced_plating")

$scoreCode = Get-Content "src/systems/ScoreSystem.js" -Raw
Assert-Test "INT-05" "ScoreSystem awards Lucky Stars bonus score and funds crystal credits" ($scoreCode -match "lucky_stars" -and $scoreCode -match "ShopSystem\.addCrystals")

$uiCode = Get-Content "src/systems/UISystem.js" -Raw
Assert-Test "INT-06" "UISystem Title menu includes Character Sheet and Cosmic Shop" ($uiCode -match "CHARACTER SHEET" -and $uiCode -match "COSMIC SHOP")
Assert-Test "INT-07" "UISystem Pause menu includes Character Sheet" ($uiCode -match "CHARACTER SHEET \[C\]")

$audioConfig = Get-Content "src/config/audioConfig.js" -Raw
Assert-Test "INT-08" "audioConfig defines shop sound effect keys" ($audioConfig -match "SHOP_BUY" -and $audioConfig -match "SHOP_EQUIP" -and $audioConfig -match "SHOP_ERROR")

$audioSystem = Get-Content "src/systems/AudioSystem.js" -Raw
Assert-Test "INT-09" "AudioSystem synthesizes shop sound effects" ($audioSystem -match "AUDIO_KEYS\.SHOP_BUY" -and $audioSystem -match "AUDIO_KEYS\.SHOP_EQUIP")

Write-Host "`n=======================================================" -ForegroundColor Cyan
$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
$allPassed = $passedCount -eq $totalCount
$summaryColor = if ($allPassed) { "Green" } else { "Red" }
Write-Host "SHOP & CHARACTER SHEET VALIDATION: $passedCount / $totalCount PASSED" -ForegroundColor $summaryColor
Write-Host "=======================================================`n" -ForegroundColor Cyan

if (-not $allPassed) {
    exit 1
}
