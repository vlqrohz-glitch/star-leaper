# validate_expansion.ps1 - Automated Validation Suite for Major Expansion
# Validates Graphics, Characters, Levels, Mechanics, Enemies, Power-Ups, Fullscreen, and Menus

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

Write-Host "`n=== STAR-LEAPER MAJOR EXPANSION VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. PARALLAX SYSTEM
$parallaxPath = "src/systems/ParallaxBackgroundSystem.js"
$hasParallax = Test-Path $parallaxPath
$parallaxContent = if ($hasParallax) { Get-Content $parallaxPath -Raw } else { "" }
Assert-Test "EXP-01" "ParallaxBackgroundSystem.js exists" $hasParallax
Assert-Test "EXP-02" "Parallax system manages 5 depth layers" ($parallaxContent -match "layer1" -and $parallaxContent -match "layer2" -and $parallaxContent -match "layer3" -and $parallaxContent -match "layer4" -and $parallaxContent -match "layer5")
Assert-Test "EXP-03" "Parallax system has update drift loop" ($parallaxContent -match "update\(time,\s*delta\)")

# 2. CHARACTER SYSTEM
$charConfigPath = "src/config/characterConfig.js"
$hasCharConfig = Test-Path $charConfigPath
$charConfigContent = if ($hasCharConfig) { Get-Content $charConfigPath -Raw } else { "" }
Assert-Test "EXP-04" "characterConfig.js exists" $hasCharConfig
Assert-Test "EXP-05" "Roster defines Nova (Balanced)" ($charConfigContent -match "NOVA:" -and $charConfigContent -match "player_nova")
Assert-Test "EXP-06" "Roster defines Zenith (Aerial)" ($charConfigContent -match "ZENITH:" -and $charConfigContent -match "player_zenith")
Assert-Test "EXP-07" "Roster defines Atlas (Heavy)" ($charConfigContent -match "ATLAS:" -and $charConfigContent -match "player_atlas")
Assert-Test "EXP-08" "Roster defines Lumen (Energy)" ($charConfigContent -match "LUMEN:" -and $charConfigContent -match "player_lumen")

$charProfilePath = "src/entities/characters/CharacterProfile.js"
$hasCharProfile = Test-Path $charProfilePath
$charProfileContent = if ($hasCharProfile) { Get-Content $charProfilePath -Raw } else { "" }
Assert-Test "EXP-09" "CharacterProfile.js architecture exists" ($hasCharProfile -and $charProfileContent -match "getPhysicsConfig")

$playerContent = Get-Content "src/entities/Player.js" -Raw
Assert-Test "EXP-10" "Player.js consumes CharacterProfile" ($playerContent -match "CharacterProfile" -and $playerContent -match "characterId")
Assert-Test "EXP-11" "Player.js supports dynamic setCharacter()" ($playerContent -match "setCharacter\(characterId\)")

# 3. CHARACTER SELECTION & LEVEL SELECTION SCENES
$charSelectPath = "src/scenes/CharacterSelectScene.js"
$hasCharSelect = Test-Path $charSelectPath
$charSelectContent = if ($hasCharSelect) { Get-Content $charSelectPath -Raw } else { "" }
Assert-Test "EXP-12" "CharacterSelectScene.js exists" ($hasCharSelect -and $charSelectContent -match "CHARACTER_ROSTER")

$lvlSelectPath = "src/scenes/LevelSelectScene.js"
$hasLvlSelect = Test-Path $lvlSelectPath
$lvlSelectContent = if ($hasLvlSelect) { Get-Content $lvlSelectPath -Raw } else { "" }
Assert-Test "EXP-13" "LevelSelectScene.js exists" ($hasLvlSelect -and $lvlSelectContent -match "LEVEL_CATALOG")

$mainContent = Get-Content "src/main.js" -Raw
Assert-Test "EXP-14" "main.js registers CharacterSelectScene and LevelSelectScene" ($mainContent -match "CharacterSelectScene" -and $mainContent -match "LevelSelectScene")

# 4. LEVEL ARCHITECTURE & 5 SECTORS
$hasL1 = Test-Path "src/levels/level1.js"
$hasL2 = Test-Path "src/levels/level2.js"
$hasL3 = Test-Path "src/levels/level3.js"
$hasL4 = Test-Path "src/levels/level4.js"
$hasL5 = Test-Path "src/levels/level5.js"
$hasLIndex = Test-Path "src/levels/index.js"
Assert-Test "EXP-15" "All 5 level files and index registry exist" ($hasL1 -and $hasL2 -and $hasL3 -and $hasL4 -and $hasL5 -and $hasLIndex)

$l2Content = Get-Content "src/levels/level2.js" -Raw
Assert-Test "EXP-16" "Sector 2 (Moonfall Station) defines movingPlatforms" ($l2Content -match "movingPlatforms")

$l3Content = Get-Content "src/levels/level3.js" -Raw
Assert-Test "EXP-17" "Sector 3 (Nebula Rift) defines gravityZones and launchPads" ($l3Content -match "gravityZones" -and $l3Content -match "launchPads")

$l4Content = Get-Content "src/levels/level4.js" -Raw
Assert-Test "EXP-18" "Sector 4 (Ember Crater) defines fallingPlatforms and hazardZones" ($l4Content -match "fallingPlatforms" -and $l4Content -match "hazardZones")

$l5Content = Get-Content "src/levels/level5.js" -Raw
Assert-Test "EXP-19" "Sector 5 (Zenith Ruins) defines energyGates and ancient crystals" ($l5Content -match "energyGates" -and $l5Content -match "crystal_ancient")

# 5. NEW MECHANICS ENTITIES
$hasMP = Test-Path "src/entities/MovingPlatform.js"
$hasFP = Test-Path "src/entities/FallingPlatform.js"
$hasLP = Test-Path "src/entities/LaunchPad.js"
$hasEG = Test-Path "src/entities/EnergyGate.js"
$hasHZ = Test-Path "src/entities/HazardZone.js"
$hasGZ = Test-Path "src/entities/GravityZone.js"
Assert-Test "EXP-20" "All 6 mechanics entities exist" ($hasMP -and $hasFP -and $hasLP -and $hasEG -and $hasHZ -and $hasGZ)

# 6. EXPANDED ENEMIES ROSTER
$hasVC = Test-Path "src/entities/VoidCrawler.js"
$hasOS = Test-Path "src/entities/OrbitalSentinel.js"
$hasRH = Test-Path "src/entities/RiftHopper.js"
$hasNW = Test-Path "src/entities/NebulaWisp.js"
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
Assert-Test "EXP-21" "All 4 new enemy classes exist" ($hasVC -and $hasOS -and $hasRH -and $hasNW)
Assert-Test "EXP-22" "enemyConfig.js configures all 5 enemy types" ($enemyConfigContent -match "VOID_CRAWLER" -and $enemyConfigContent -match "ORBITAL_SENTINEL" -and $enemyConfigContent -match "RIFT_HOPPER" -and $enemyConfigContent -match "NEBULA_WISP")

# 7. EXPANDED POWER-UPS ROSTER
$powerUpConfigContent = Get-Content "src/config/powerUpConfig.js" -Raw
Assert-Test "EXP-23" "powerUpConfig.js defines all 5 power-up types" (
    $powerUpConfigContent -match "AEGIS_CORE" -and
    $powerUpConfigContent -match "NOVA_BURST" -and
    $powerUpConfigContent -match "GRAVITY_SHIFT" -and
    $powerUpConfigContent -match "CHRONO_CORE" -and
    $powerUpConfigContent -match "STAR_SURGE"
)

$powerUpSystemContent = Get-Content "src/systems/PowerUpSystem.js" -Raw
Assert-Test "EXP-24" "PowerUpSystem supports operative duration multipliers" ($powerUpSystemContent -match "powerUpDurationMultiplier")

# 8. MENUS, FULLSCREEN & PAUSE
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$uiSystemContent = Get-Content "src/systems/UISystem.js" -Raw
$indexHtmlContent = Get-Content "index.html" -Raw

Assert-Test "EXP-25" "GameScene implements toggleFullscreen()" ($gameSceneContent -match "toggleFullscreen\(\)")
Assert-Test "EXP-26" "GameScene implements togglePause()" ($gameSceneContent -match "togglePause\(\)")
Assert-Test "EXP-27" "GameScene binds Fullscreen (F) and Pause (ESC)" ($gameSceneContent -match "KeyCodes\.F" -and $gameSceneContent -match "KeyCodes\.ESC")
Assert-Test "EXP-28" "UISystem creates Pause overlay" ($uiSystemContent -match "createPauseOverlay")
Assert-Test "EXP-29" "UISystem creates Settings overlay" ($uiSystemContent -match "createSettingsOverlay")
Assert-Test "EXP-30" "UISystem Title screen has interactive menu options" ($uiSystemContent -match "titleMenuItems" -and $uiSystemContent -match "selectTitleMenuOption")
Assert-Test "EXP-31" "Level Complete UI supports Next Sector advance flow" ($uiSystemContent -match "SECTOR CLEAR" -and $gameSceneContent -match "levelIndex \+ 1")
Assert-Test "EXP-32" "index.html exposes Fullscreen and Pause buttons" ($indexHtmlContent -match "fullscreen-btn" -and $indexHtmlContent -match "pause-btn")

# 9. PROCEDURAL GRAPHICS GENERATION
$bootSceneContent = Get-Content "src/scenes/BootScene.js" -Raw
Assert-Test "EXP-33" "BootScene generates all 4 character textures" ($bootSceneContent -match "player_nova" -and $bootSceneContent -match "player_zenith" -and $bootSceneContent -match "player_atlas" -and $bootSceneContent -match "player_lumen")
Assert-Test "EXP-34" "BootScene generates multi-layer parallax textures" ($bootSceneContent -match "bg_layer_stars" -and $bootSceneContent -match "bg_layer_nebula" -and $bootSceneContent -match "bg_layer_celestial" -and $bootSceneContent -match "bg_layer_structures" -and $bootSceneContent -match "bg_layer_dust")
Assert-Test "EXP-35" "BootScene generates all sector tilesets" ($bootSceneContent -match "ground_station" -and $bootSceneContent -match "ground_nebula" -and $bootSceneContent -match "ground_volcanic" -and $bootSceneContent -match "ground_ruins")

Write-Host "`n=======================================================" -ForegroundColor Cyan
$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "MAJOR EXPANSION VALIDATION: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "=======================================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
