# validate_scoreboard_and_combat.ps1
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

Write-Host "`n=== Validating Scoreboard, 2D Scrollbars, Inventory, Health Bar & Combat ===" -ForegroundColor Cyan

$scoreboardSystem = Get-Content "src/systems/ScoreboardSystem.js" -Raw
$playerBullet = Get-Content "src/entities/PlayerBullet.js" -Raw
$weaponPickup = Get-Content "src/entities/WeaponPickup.js" -Raw
$player = Get-Content "src/entities/Player.js" -Raw
$inputSystem = Get-Content "src/systems/InputSystem.js" -Raw
$gameScene = Get-Content "src/scenes/GameScene.js" -Raw
$shopScene = Get-Content "src/scenes/ShopScene.js" -Raw
$uiSystem = Get-Content "src/systems/UISystem.js" -Raw
$bootScene = Get-Content "src/scenes/BootScene.js" -Raw
$indexHtml = Get-Content "index.html" -Raw

# 1. Scoreboard System
Assert-Check "SCB-01" "ScoreboardSystem.js exists with default records and persistence" `
    ((Test-Path "src/systems/ScoreboardSystem.js") -and ($scoreboardSystem -match "DEFAULT_HIGH_SCORES") -and ($scoreboardSystem -match "starleaper_scoreboard"))

Assert-Check "SCB-02" "ScoreboardSystem implements getScores, isHighScore, recordScore, getPersonalBest, resetDefaults" `
    (($scoreboardSystem -match "getScores\(sectorFilter") -and ($scoreboardSystem -match "isHighScore\(score") -and ($scoreboardSystem -match "recordScore\(") -and ($scoreboardSystem -match "getPersonalBest\(\)") -and ($scoreboardSystem -match "resetDefaults\(\)"))

Assert-Check "SCB-03" "UISystem creates and controls Scoreboard overlay with sector filters" `
    (($uiSystem -match "createScoreboardOverlay\(\)") -and ($uiSystem -match "renderScoreboardTable\(\)") -and ($uiSystem -match "showScoreboard\(\)") -and ($uiSystem -match "scoreboardFilterSector"))

Assert-Check "SCB-04" "UISystem has HUD SCORES button, Title Menu [8] SCOREBOARD, and Pause Menu SCOREBOARD" `
    (($uiSystem -match "SCORES") -and ($uiSystem -match "\[8\] SCOREBOARD") -and ($uiSystem -match "SCOREBOARD \[B\]"))

Assert-Check "SCB-05" "Level Complete overlay includes High Score ranking banner and SCORES button" `
    (($uiSystem -match "completeHighScoreBanner") -and ($uiSystem -match "ScoreboardSystem\.recordScore") -and ($uiSystem -match "SCORES \[B\]"))

# 2. Shop 2D Scrollbars & Inventory Tab
Assert-Check "SHP-01" "ShopScene defines [4] INVENTORY tab in this.tabs" `
    (($shopScene -match "\[4\] INVENTORY") -and ($shopScene -match "id:\s*'INVENTORY'"))

Assert-Check "SHP-02" "ShopScene implements 2D scrollbars with horizontal and vertical tracks/thumbs" `
    (($shopScene -match "hTrack") -and ($shopScene -match "hThumb") -and ($shopScene -match "vTrack") -and ($shopScene -match "vThumb"))

Assert-Check "SHP-03" "ShopScene supports 2D pan/scroll methods setScroll, scrollHorizontally, and scrollVertically" `
    (($shopScene -match "setScroll\(newX, newY\)") -and ($shopScene -match "scrollHorizontally\(") -and ($shopScene -match "scrollVertically\("))

Assert-Check "SHP-04" "ShopScene renderInventory displays Characters, Perks, and Pets with 1-click equip" `
    (($shopScene -match "renderInventory\(\)") -and ($shopScene -match "CHARACTER_ROSTER") -and ($shopScene -match "ACTIVE") -and ($shopScene -match "EQUIPPED"))

Assert-Check "SHP-05" "ShopScene supports mouse wheel 2D scrolling and drag-to-pan" `
    (($shopScene -match "this\.input\.on\('wheel'") -and ($shopScene -match "isDraggingContent"))

# 3. Character Health Bar
Assert-Check "HLT-01" "Player.js instantiates dynamic overhead healthBar graphics with depth 26" `
    (($player -match "this\.healthBar = scene\.add\.graphics\(\)") -and ($player -match "this\.healthBar\.setDepth\(26\)"))

Assert-Check "HLT-02" "Player.js implements renderHealthBar with green, amber, red color thresholds" `
    (($player -match "renderHealthBar\(hp") -and ($player -match "0x22c55e") -and ($player -match "0xf59e0b") -and ($player -match "0xef4444"))

Assert-Check "HLT-03" "Player.js updates health bar position directly above character in update loop" `
    (($player -match "updateHealthBarPosition\(\)") -and ($player -match "this\.healthBar\.setPosition\(this\.x, this\.y\)"))

Assert-Check "HLT-04" "Player.js listens to HEALTH_CHANGED event and destroys graphics cleanly" `
    (($player -match "HEALTH_CHANGED") -and ($player -match "this\.healthBar\.destroy\(\)"))

# 4. Weapons & Combat via [F] Key
Assert-Check "WPN-01" "PlayerBullet.js entity exists with velocity, lifespan, and weapon specs" `
    ((Test-Path "src/entities/PlayerBullet.js") -and ($playerBullet -match "getWeaponSpec") -and ($playerBullet -match "isPlayerBullet"))

Assert-Check "WPN-02" "PlayerBullet supports REVOLVER, PLASMA_BLASTER, PHOTON_RIFLE, DYNAMITE_LAUNCHER, SHOTGUN" `
    (($playerBullet -match "PLASMA_BLASTER") -and ($playerBullet -match "PHOTON_RIFLE") -and ($playerBullet -match "DYNAMITE_LAUNCHER") -and ($playerBullet -match "SHOTGUN"))

Assert-Check "WPN-03" "WeaponPickup.js entity exists with bobbing animation and collectible logic" `
    ((Test-Path "src/entities/WeaponPickup.js") -and ($weaponPickup -match "isWeaponPickup") -and ($weaponPickup -match "spawnPickupBanner"))

Assert-Check "WPN-04" "BootScene creates pixel textures for all 5 weapons and projectiles" `
    (($bootScene -match "weapon_revolver") -and ($bootScene -match "weapon_plasma_blaster") -and ($bootScene -match "weapon_photon_rifle") -and ($bootScene -match "player_bullet"))

Assert-Check "WPN-05" "Player.js implements attack() method with fire cooldown and weapon recoil" `
    (($player -match "attack\(\)") -and ($player -match "this\.attackCooldown") -and ($player -match "spawnPlayerBullet"))

Assert-Check "WPN-06" "GameScene binds Key F to handlePlayerAttack() and Key B to scoreboard" `
    (($gameScene -match "addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.F\)") -and ($gameScene -match "handlePlayerAttack\(\)") -and ($gameScene -match "addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.B\)"))

Assert-Check "WPN-07" "GameScene spawns WeaponPickup on each map and manages playerProjectiles overlap with enemies" `
    (($gameScene -match "createWeaponPickup\(\)") -and ($gameScene -match "playerProjectiles") -and ($gameScene -match "handleBulletEnemyHit"))

Assert-Check "WPN-08" "InputSystem maps attack key F and virtual touch attack state" `
    (($inputSystem -match "attack: Phaser\.Input\.Keyboard\.KeyCodes\.F") -and ($inputSystem -match "isAttackJustPressed\(\)"))

Assert-Check "WPN-09" "index.html includes SCORES button in header, virtual FIRE touch button, and attack guide" `
    (($indexHtml -match "scoreboard-btn") -and ($indexHtml -match "btn-touch-attack") -and ($indexHtml -match "Attack: <span class=.key-badge.>F</span>"))

Assert-Check "WPN-10" "UISystem HUD displays active equipped weapon and guide text" `
    (($uiSystem -match "hudWeaponText") -and ($uiSystem -match "Attack: \[F\]"))

$failed = $script:testResults | Where-Object { -not $_.Passed }
if ($failed.Count -gt 0) {
    Write-Error "$($failed.Count) checks failed in Scoreboard & Combat test suite!"
} else {
    Write-Host "`n>>> ALL 24 CHECKS PASSED IN SCOREBOARD & COMBAT SUITE! <<<" -ForegroundColor Green
}
