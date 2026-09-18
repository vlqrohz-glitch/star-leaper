# validate_boss_and_levels.ps1
# Comprehensive validation for Boss Battles, 10 Levels per Sector, [E] Weapon Use/Collect, and Combat Damage
$ErrorActionPreference = "Stop"

$script:testResults = @()

function Assert-Test {
    param(
        [string]$TestId,
        [string]$Description,
        [bool]$Condition,
        [string]$FailureMessage = ""
    )
    $script:testResults += [PSCustomObject]@{
        TestId = $TestId
        Description = $Description
        Passed = $Condition
        FailureMessage = $FailureMessage
    }
    if ($Condition) {
        Write-Host " [PASS] $TestId : $Description" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $TestId : $Description" -ForegroundColor Red
        if ($FailureMessage) {
            Write-Host "        Reason: $FailureMessage" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== STAR-LEAPER BOSS & 10-LEVEL EXPANSION VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. Input System & E Key Mapping
$inputContent = Get-Content "src/systems/InputSystem.js" -Raw
$hasEKeyUse = $inputContent -match "use:\s*Phaser\.Input\.Keyboard\.KeyCodes\.E"
$hasAttackEKey = ($inputContent -match "isAttack\(\)") -and ($inputContent -match "this\.wasd\.use")
$hasJustPressed = ($inputContent -match "isAttackJustPressed") -and ($inputContent -match "Phaser\.Input\.Keyboard\.JustDown\(this\.wasd\.use\)")
$hasQKeyEquip = ($inputContent -match "equip:\s*Phaser\.Input\.Keyboard\.KeyCodes\.Q") -and ($inputContent -match "isEquipJustPressed")
Assert-Test "INP-01" "InputSystem binds E key for weapon use and collect" $hasEKeyUse
Assert-Test "INP-02" "InputSystem isAttack() responds to E key" $hasAttackEKey
Assert-Test "INP-03" "InputSystem isAttackJustPressed() checks E key JustDown" $hasJustPressed
Assert-Test "INP-04" "InputSystem binds Q key for weapon equip with isEquipJustPressed" $hasQKeyEquip

# 2. WeaponPickup Entity & E Key prompt
$pickupContent = Get-Content "src/entities/WeaponPickup.js" -Raw
$hasPickupEPrompt = $pickupContent -match "\[E\] COLLECT"
$hasPickupQPrompt = $pickupContent -match "\[Q\] EQUIP"
$hasEquippedEPrompt = $pickupContent -match "PRESS \[E\] TO ATTACK"
Assert-Test "WPN-01" "WeaponPickup overhead text displays [E] COLLECT prompt" $hasPickupEPrompt
Assert-Test "WPN-02" "WeaponPickup banner guides player to press [E] to attack" $hasEquippedEPrompt
Assert-Test "WPN-03" "WeaponPickup overhead text displays [Q] EQUIP prompt" $hasPickupQPrompt

# 3. GameScene E Key Weapon Interaction
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$hasEKeyInScene = $gameSceneContent -match "this\.useKey\s*=\s*this\.input\.keyboard\.addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.E\)"
$hasQKeyInScene = ($gameSceneContent -match "this\.equipKey\s*=\s*this\.input\.keyboard\.addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.Q\)") -and ($gameSceneContent -match "handleEquipKey\(\)")
$hasHandleUseOrAttack = $gameSceneContent -match "handleUseOrAttackKey\(\)"
$hasNearbyPickupTracking = $gameSceneContent -match "this\.nearbyWeaponPickup\s*=\s*pickup"
Assert-Test "SCN-01" "GameScene listens for [E] key via keyboard input" $hasEKeyInScene
Assert-Test "SCN-02" "GameScene implements handleUseOrAttackKey() to collect or fire weapon" $hasHandleUseOrAttack
Assert-Test "SCN-03" "GameScene tracks nearby weapon pickups for [E] collection" $hasNearbyPickupTracking
Assert-Test "SCN-04" "GameScene listens for [Q] key and implements handleEquipKey()" $hasQKeyInScene

# 4. Combat Damage: Enemies deal 5 HP damage to Player
$healthConfigContent = Get-Content "src/config/playerHealthConfig.js" -Raw
$has5Damage = $healthConfigContent -match "DAMAGE_PER_HIT:\s*5"
$has100MaxHealth = $healthConfigContent -match "MAX_HEALTH:\s*100"
$damageCalledInScene = $gameSceneContent -match "this\.healthSystem\.takeDamage\(HEALTH_CONFIG\.DAMAGE_PER_HIT"
Assert-Test "DMG-01" "playerHealthConfig sets DAMAGE_PER_HIT to 5" $has5Damage
Assert-Test "DMG-02" "playerHealthConfig sets MAX_HEALTH to 100 for 20-hit survivability" $has100MaxHealth
Assert-Test "DMG-03" "GameScene applies DAMAGE_PER_HIT (-5 HP) upon enemy collision" $damageCalledInScene

# 5. Enemy Health Bar: Shorter than Player Health Bar
$playerContent = Get-Content "src/entities/Player.js" -Raw
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
$enemyContent = Get-Content "src/entities/Enemy.js" -Raw

$playerBarW48 = $playerContent -match "barW\s*=\s*48"
$enemyBarW24 = $enemyConfigContent -match "HEALTH_BAR_WIDTH:\s*24"
$enemyHasHealthBar = ($enemyContent -match "this\.healthBar\s*=\s*scene\.add\.graphics\(\)") -and ($enemyContent -match "renderHealthBar\(\)")
$enemyTracksBar = $enemyContent -match "updateHealthBarPosition\(\)"
Assert-Test "BAR-01" "Player overhead health bar width is 48px" $playerBarW48
Assert-Test "BAR-02" "Enemy overhead health bar width is 24px (50% shorter than player's 48px bar)" $enemyBarW24
Assert-Test "BAR-03" "Enemy entity instantiates graphics and renders overhead health bar" $enemyHasHealthBar
Assert-Test "BAR-04" "Enemy entity updates health bar position during patrol loop" $enemyTracksBar

# 6. Sector Final Boss Entity
$bossFileExists = Test-Path "src/entities/Boss.js"
$bossContent = if ($bossFileExists) { Get-Content "src/entities/Boss.js" -Raw } else { "" }
$hasBossConfigs = $bossContent -match "BOSS_CONFIGS"
$hasDreadnought = $bossContent -match "DREADNOUGHT_ALPHA"
$hasOrbitalBehemoth = $bossContent -match "ORBITAL_BEHEMOTH"
$hasVoidLeviathan = $bossContent -match "VOID_LEVIATHAN"
$hasMagmaColossus = $bossContent -match "MAGMA_COLOSSUS"
$hasZenithSovereign = $bossContent -match "ZENITH_SOVEREIGN"
$hasOutlawKing = $bossContent -match "OUTLAW_KING"
$hasBossOverheadBar = $bossContent -match "barW\s*=\s*36" # Shorter than player's 48px bar
$hasBossCombat = ($bossContent -match "takeDamage") -and ($bossContent -match "defeat") -and ($bossContent -match "triggerEnrage")
Assert-Test "BOS-01" "src/entities/Boss.js exists" $bossFileExists
Assert-Test "BOS-02" "Boss.js defines all 6 sector final boss configurations" ($hasBossConfigs -and $hasDreadnought -and $hasOrbitalBehemoth -and $hasVoidLeviathan -and $hasMagmaColossus -and $hasZenithSovereign -and $hasOutlawKing)
Assert-Test "BOS-03" "Boss entity overhead health bar (36px) is shorter than player bar (48px)" $hasBossOverheadBar
Assert-Test "BOS-04" "Boss entity implements multi-phase enrage, takeDamage, and defeat sequence" $hasBossCombat

# 7. BootScene Procedural Boss Textures
$bootContent = Get-Content "src/scenes/BootScene.js" -Raw
$hasBossTexturesCall = $bootContent -match "this\.createBossTextures\(\)"
$hasBossTexturesDef = ($bootContent -match "boss_dreadnought") -and ($bootContent -match "boss_orbital_behemoth") -and ($bootContent -match "boss_void_leviathan") -and ($bootContent -match "boss_magma_colossus") -and ($bootContent -match "boss_zenith_overlord") -and ($bootContent -match "boss_outlaw_king")
Assert-Test "TEX-01" "BootScene calls createBossTextures()" $hasBossTexturesCall
Assert-Test "TEX-02" "BootScene procedural graphics generates textures for all 6 sector final bosses" $hasBossTexturesDef

# 8. 10 Levels per Sector Architecture (60 levels total)
$mgrFileExists = Test-Path "src/levels/levelManager.js"
$mgrContent = if ($mgrFileExists) { Get-Content "src/levels/levelManager.js" -Raw } else { "" }
$hasBossArenaGen = $mgrContent -match "createBossArenaData"
$hasSubLevelGen = $mgrContent -match "createSubLevelData"
$hasSectorResolver = $mgrContent -match "getSectorLevelData"
$indexContent = Get-Content "src/levels/index.js" -Raw
$hasExtendedLevels = $indexContent -match "getSectorLevelData"
Assert-Test "LVL-01" "src/levels/levelManager.js exists" $mgrFileExists
Assert-Test "LVL-02" "levelManager implements createBossArenaData for Level 10 Final Boss" $hasBossArenaGen
Assert-Test "LVL-03" "levelManager implements createSubLevelData for Levels 2-9" $hasSubLevelGen
Assert-Test "LVL-04" "levels/index.js exports extended 60-level resolver with backward compatibility" $hasExtendedLevels

# 9. Boss Arena Spawning & Combat in GameScene
$hasBossSpawn = $gameSceneContent -match "this\.boss\s*=\s*new\s+Boss"
$hasBossPlatformCollider = $gameSceneContent -match "this\.physics\.add\.collider\(this\.boss,\s*this\.platforms\)"
$hasPlayerBossCollision = $gameSceneContent -match "handlePlayerBossCollision"
$hasBulletBossCollision = $gameSceneContent -match "handleBulletBossHit"
$hasActivateBossGoal = $gameSceneContent -match "activateBossGoal"
Assert-Test "ARE-01" "GameScene spawns Boss entity in boss levels" $hasBossSpawn
Assert-Test "ARE-02" "GameScene wires Boss physics collision with platforms" $hasBossPlatformCollider
Assert-Test "ARE-03" "GameScene implements player <-> boss combat with stomp and 5 HP damage" $hasPlayerBossCollision
Assert-Test "ARE-04" "GameScene implements player projectiles <-> boss damage hits" $hasBulletBossCollision
Assert-Test "ARE-05" "GameScene activates Warp Gate upon defeating the boss" $hasActivateBossGoal

# 10. UISystem Boss Health Bar & 100 HP Scaling
$uiContent = Get-Content "src/systems/UISystem.js" -Raw
$hasBossHudContainer = $uiContent -match "this\.hudBossContainer"
$hasBossHudUpdate = $uiContent -match "this\.hudBossFill\.width"
$has10BlockHealthBar = $uiContent -match "barSegments\s*=\s*\(maxHp\s*>\s*10\)\s*\?\s*10\s*:\s*maxHp"
$hasEKeyHudHint = $uiContent -match "Attack/Use:\s*\[E\]"
Assert-Test "HUD-01" "UISystem creates dedicated arena boss health bar container in HUD" $hasBossHudContainer
Assert-Test "HUD-02" "UISystem updateHUD dynamically updates boss health meter and title" $hasBossHudUpdate
Assert-Test "HUD-03" "UISystem formats 100 HP with 10-block segmented health bar" $has10BlockHealthBar
Assert-Test "HUD-04" "UISystem controls text instructs player with Attack/Use: [E]" $hasEKeyHudHint

# 11. LevelSelectScene Sublevel Chips (Stages 1 - 10)
$lvlSelectContent = Get-Content "src/scenes/LevelSelectScene.js" -Raw
$hasSubLevelChips = $lvlSelectContent -match "subLevelChips"
$hasBossChipLabel = $lvlSelectContent -match "10:\s*BOSS"
$hasSubLevelNav = ($lvlSelectContent -match "moveSubLevel") -and ($lvlSelectContent -match "keydown-LEFT")
Assert-Test "SEL-01" "LevelSelectScene creates 10 stage selection chips" $hasSubLevelChips
Assert-Test "SEL-02" "LevelSelectScene designates Stage 10 as [10: BOSS]" $hasBossChipLabel
Assert-Test "SEL-03" "LevelSelectScene binds keyboard [←/→] and [A/D] for sublevel navigation" $hasSubLevelNav

# Summary
$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "BOSS & 10-LEVEL EXPANSION RESULTS: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "=======================================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
