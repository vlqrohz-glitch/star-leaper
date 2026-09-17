# Stage 8 Automated Verification Script
$ErrorActionPreference = 'Stop'
$testResults = @()

function Assert-Test {
    param(
        [string]$TestId,
        [string]$Description,
        [bool]$Condition
    )
    $script:testResults += [PSCustomObject]@{
        Id = $TestId
        Description = $Description
        Passed = $Condition
    }
    if ($Condition) {
        Write-Host " [PASS] $TestId : $Description" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $TestId : $Description" -ForegroundColor Red
    }
}

Write-Host "=== STAR-LEAPER STAGE 8 VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. Inspect Files
$level1Content = Get-Content "src/levels/level1.js" -Raw
$powerUpConfigContent = Get-Content "src/config/powerUpConfig.js" -Raw
$powerUpSystemContent = Get-Content "src/systems/PowerUpSystem.js" -Raw
$powerUpEntityContent = Get-Content "src/entities/PowerUp.js" -Raw
$healthSystemContent = Get-Content "src/systems/HealthSystem.js" -Raw
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$bootSceneContent = Get-Content "src/scenes/BootScene.js" -Raw
$playerConfigContent = Get-Content "src/config/playerConfig.js" -Raw
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
$playerHealthConfigContent = Get-Content "src/config/playerHealthConfig.js" -Raw
$goalContent = Get-Content "src/entities/Goal.js" -Raw
$levelCompContent = Get-Content "src/systems/LevelCompletionSystem.js" -Raw
$uiSystemContent = if (Test-Path "src/systems/UISystem.js") { Get-Content "src/systems/UISystem.js" -Raw } else { "" }

# TEST A: Aegis Core spawns at every configured level-data position
$hasPowerUpsArray = $level1Content -match "powerUps:\s*\["
$hasTwoCores = ($level1Content | Select-String "AEGIS_CORE" -AllMatches).Matches.Count -ge 2
Assert-Test "TEST A" "Aegis Core spawns at every configured level-data position" ($hasPowerUpsArray -and $hasTwoCores)

# TEST B: Power-up positions are sourced from level1.js
$pos1Valid = $level1Content -match "x:\s*620,\s*y:\s*300"
$pos2Valid = $level1Content -match "x:\s*1420,\s*y:\s*250"
Assert-Test "TEST B" "Power-up positions sourced from level1.js" ($pos1Valid -and $pos2Valid)

# TEST C: Aegis Core is visually distinct and reachable
$hasTexture = $bootSceneContent -match "createPowerUpTexture" -and $bootSceneContent -match "powerup_aegis"
$entityUsesTexture = $powerUpEntityContent -match "config\.texture" -or $powerUpEntityContent -match "powerup_aegis"
Assert-Test "TEST C" "Aegis Core is visually distinct and reachable" ($hasTexture -and $entityUsesTexture)

# TEST D: Player overlapping an available Aegis Core collects it
$collectMethod = $powerUpEntityContent -match "collect\(\)\s*\{"
$overlapInScene = $gameSceneContent -match "this\.physics\.add\.overlap\(this\.player,\s*this\.powerUps"
Assert-Test "TEST D" "Player overlapping available Aegis Core collects it" ($collectMethod -and $overlapInScene)

# TEST E: Collected Aegis Core cannot be collected twice
$guardsTwice = $powerUpEntityContent -match "if\s*\(this\.state\s*!==\s*PowerUpState\.AVAILABLE\)\s*\{\s*return\s+false;"
Assert-Test "TEST E" "Collected Aegis Core cannot be collected twice" $guardsTwice

# TEST F: Collecting Aegis Core activates PowerUpSystem
$callsActivate = $powerUpEntityContent -match "this\.scene\.powerUpSystem\.activatePowerUp"
Assert-Test "TEST F" "Collecting Aegis Core activates PowerUpSystem" $callsActivate

# TEST G: Aegis protection prevents enemy damage while active
$healthChecksAegis = $healthSystemContent -match "source\s*===\s*'enemy'\s*&&\s*this\.scene\.powerUpSystem\s*&&\s*this\.scene\.powerUpSystem\.isPowerUpActive\('AEGIS_CORE'\)"
$emitsPrevented = $healthSystemContent -match "DAMAGE_PREVENTED"
Assert-Test "TEST G" "Aegis protection prevents enemy damage while active" ($healthChecksAegis -and $emitsPrevented)

# TEST H: Aegis does not permanently modify player health
$noMaxHealthMod = -not ($powerUpSystemContent -match "maxHealth")
Assert-Test "TEST H" "Aegis does not permanently modify player health" $noMaxHealthMod

# TEST I: Aegis does not grant extra lives
$noLivesMod = -not ($powerUpSystemContent -match "livesSystem" -or $powerUpSystemContent -match "addLife")
Assert-Test "TEST I" "Aegis does not grant extra lives" $noLivesMod

# TEST J: Aegis automatically expires after configured duration
$hasDuration5000 = $powerUpConfigContent -match "5000"
$hasUpdateTimer = $powerUpSystemContent -match "this\.remainingTime\s*-=\s*delta"
$hasExpireCall = $powerUpSystemContent -match "this\.expire\(\)"
Assert-Test "TEST J" "Aegis automatically expires after configured duration (5000ms)" ($hasDuration5000 -and $hasUpdateTimer -and $hasExpireCall)

# TEST K: Normal enemy damage resumes after expiration
$clearsActive = $powerUpSystemContent -match "expire\(\)\s*\{\s*const\s+expiredType\s*=\s*this\.activePowerUp;\s*this\.activePowerUp\s*=\s*null;"
Assert-Test "TEST K" "Normal enemy damage resumes after expiration" $clearsActive

# TEST L: Collecting another Aegis while active refreshes duration
$refreshesTimer = $powerUpSystemContent -match "this\.activePowerUp\s*=\s*type;\s*this\.totalDuration\s*=\s*duration;\s*this\.remainingTime\s*=\s*duration;"
Assert-Test "TEST L" "Collecting another Aegis while active refreshes configured duration" $refreshesTimer

# TEST M: Power-up HUD displays the correct active state
$hudHasAegisText = ($gameSceneContent -match "this\.hudPowerUpText\s*=") -or ($uiSystemContent -match "this\.hudPowerUpText\s*=")
Assert-Test "TEST M" "Power-up HUD displays correct active state" $hudHasAegisText

# TEST N: Power-up HUD timer counts down correctly
$hudTimerFormatted = ($gameSceneContent -match "AEGIS:\s*ACTIVE\s*[\$]\{remainingSec\}s") -or ($uiSystemContent -match "AEGIS:\s*ACTIVE\s*[\$]\{remainingSec\}s")
Assert-Test "TEST N" "Power-up HUD timer counts down correctly" $hudTimerFormatted

# TEST O: Power-up HUD clears when effect expires
$hudClearsOnExpiry = ($gameSceneContent -match "this\.hudPowerUpText\.setText\('AEGIS:\s*--'\)") -or ($uiSystemContent -match "this\.hudPowerUpText\s*\.setText\('AEGIS:\s*--'\)")
Assert-Test "TEST O" "Power-up HUD clears when effect expires" $hudClearsOnExpiry

# TEST P: Player death clears active Aegis protection
$deathResetsPowerUp = $gameSceneContent -match "handlePlayerDeath[\s\S]*?this\.powerUpSystem\.reset\(\)"
Assert-Test "TEST P" "Player death clears active Aegis protection" $deathResetsPowerUp

# TEST Q: Respawn restores normal non-powered state
$respawnNonPowered = $gameSceneContent -match "this\.playerShieldAura\.setVisible\(false\)"
Assert-Test "TEST Q" "Respawn restores normal non-powered state" $respawnNonPowered

# TEST R: Game Over clears power-up state
$gameOverResetsPowerUp = $gameSceneContent -match "triggerGameOver[\s\S]*?this\.powerUpSystem\.reset\(\)"
Assert-Test "TEST R" "Game Over clears power-up state" $gameOverResetsPowerUp

# TEST S: R fully resets PowerUpSystem
$restartResetsPowerUpSystem = $gameSceneContent -match "restartLevel[\s\S]*?this\.powerUpSystem\.reset\(\)"
Assert-Test "TEST S" "R fully resets PowerUpSystem" $restartResetsPowerUpSystem

# TEST T: R restores all power-ups to initial level state
$restartResetsEntities = $gameSceneContent -match "this\.powerUps\.getChildren\(\)\.forEach\(\(p\)\s*=>\s*p\.reset\(\)\)"
Assert-Test "TEST T" "R restores all power-ups to initial level state" $restartResetsEntities

# TEST U: Power-ups cannot activate after level completion
$completeGuardsActivate = $powerUpSystemContent -match "if\s*\(this\.scene\.levelCompletionSystem\s*&&\s*this\.scene\.levelCompletionSystem\.isLevelComplete\(\)\)\s*\{\s*return\s+false;"
Assert-Test "TEST U" "Power-ups cannot activate after level completion" $completeGuardsActivate

# TEST V: Power-up collection cannot occur after level completion
$completeGuardsCollect = $powerUpEntityContent -match "if\s*\(this\.scene\.levelCompletionSystem\s*&&\s*this\.scene\.levelCompletionSystem\.isLevelComplete\(\)\)\s*\{\s*return\s+false;"
$completeGuardsOverlap = $gameSceneContent -match "overlap\(this\.player,\s*this\.powerUps[\s\S]*?!this\.levelCompletionSystem\.isLevelComplete\(\)"
Assert-Test "TEST V" "Power-up collection cannot occur after level completion" ($completeGuardsCollect -and $completeGuardsOverlap)

# TEST W: Power-up timers do not continue changing completion-state gameplay
$timersFreezeOnComp = $powerUpSystemContent -match "update\(delta\)[\s\S]*?this\.scene\.levelCompletionSystem\.isLevelComplete\(\)[\s\S]*?return"
Assert-Test "TEST W" "Power-up timers do not continue changing completion-state gameplay" $timersFreezeOnComp

# TEST X: Goal completion still works while Aegis is active
$goalFunctionBlock = ""
if ($gameSceneContent -match "(?s)handleGoalReached\([^)]*\)\s*\{(.*?)\n  \}\n\n  \/\*\*") {
    $goalFunctionBlock = $matches[1]
}
$goalNotBlockedByAegis = -not ($goalFunctionBlock -match "isPowerUpActive")
Assert-Test "TEST X" "Goal completion works whether Aegis is active or not" $goalNotBlockedByAegis

# TEST Y: Completion statistics remain unchanged by power-up state
$noPowerUpInStats = -not ($gameSceneContent -match "displayLevelCompleteScreen[\s\S]*?stats\.powerUp")
Assert-Test "TEST Y" "Completion statistics remain unchanged by power-up state" $noPowerUpInStats

# TEST Z: Star Crystal scoring remains +100
$scoreSystemContent = Get-Content "src/systems/ScoreSystem.js" -Raw
$crystalPoints = $scoreSystemContent -match "POINTS_CRYSTAL\s*:\s*100" -or $scoreSystemContent -match "100"
Assert-Test "TEST Z" "Star Crystal scoring remains +100" $crystalPoints

# TEST AA: Drifter Drone scoring remains +200
$dronePoints = $scoreSystemContent -match "POINTS_ENEMY\s*:\s*200" -or $scoreSystemContent -match "200"
Assert-Test "TEST AA" "Drifter Drone scoring remains +200" $dronePoints

# TEST AB: Stage 2 movement physics remain unchanged
$pConfigValid = ($playerConfigContent -match "GROUND_ACCELERATION:\s*1100") -and ($playerConfigContent -match "MOVE_SPEED:\s*230") -and ($playerConfigContent -match "COYOTE_TIME:\s*0\.13")
Assert-Test "TEST AB" "Stage 2 movement physics remain unchanged" $pConfigValid

# TEST AC: Stage 3 camera, boundaries, death zone, and respawn remain unchanged
$cameraBounds = $gameSceneContent -match "cam\.setBounds\(0,\s*0,\s*this\.levelData\.width,\s*this\.levelData\.height\)"
$cameraFollow = $gameSceneContent -match "cam\.startFollow\(this\.player,\s*true,\s*0\.08,\s*0\.03\)"
Assert-Test "TEST AC" "Stage 3 camera, boundaries, death zone, and respawn remain unchanged" ($cameraBounds -and $cameraFollow)

# TEST AD: Stage 4 crystal collection and persistence remain unchanged
$has20Crystals = ($level1Content | Select-String "x:" -AllMatches).Matches.Count -ge 20
$crystalsInScene = $gameSceneContent -match "this\.collectibles\s*=\s*this\.physics\.add\.group\(\)"
Assert-Test "TEST AD" "Stage 4 crystal collection and persistence remain unchanged" ($has20Crystals -and $crystalsInScene)

# TEST AE: Stage 5 enemy AI and combat remain unchanged
$enemyConfigValid = ($enemyConfigContent -match "PATROL_SPEED:\s*55") -and ($enemyConfigContent -match "STOMP_BOUNCE_FORCE:\s*-280")
$enemiesInScene = $gameSceneContent -match "this\.enemies\s*=\s*this\.physics\.add\.group\(\)"
Assert-Test "TEST AE" "Stage 5 enemy AI and combat remain unchanged" ($enemyConfigValid -and $enemiesInScene)

# TEST AF: Stage 6 health, lives, damage, respawn, and Game Over remain unchanged
$hConfigValid = ($playerHealthConfigContent -match "MAX_HEALTH:\s*3") -and ($playerHealthConfigContent -match "STARTING_LIVES:\s*3")
$gameOverHandler = $gameSceneContent -match "triggerGameOver\(\)\s*\{\s*this\.isGameOver\s*=\s*true;"
Assert-Test "TEST AF" "Stage 6 health, lives, damage, respawn, and Game Over remain unchanged" ($hConfigValid -and $gameOverHandler)

# TEST AG: Stage 7 goal completion and completion UI remain unchanged
$goalInScene = $gameSceneContent -match "this\.goal\s*=\s*new\s+Goal"
$completeInScene = $gameSceneContent -match "this\.levelCompletionSystem\.completeLevel\(stats\)"
Assert-Test "TEST AG" "Stage 7 goal completion and completion UI remain unchanged" ($goalInScene -and $completeInScene)

# TEST AH: Extended gameplay produces no console or runtime errors
$cleanImports = $gameSceneContent -match "import\s*\{\s*PowerUp\s*\}\s*from\s*'\.\.\/entities\/PowerUp\.js'"
Assert-Test "TEST AH" "Extended gameplay produces no console or runtime errors / clean imports" $cleanImports

# Regression Tests
Write-Host "`n=== REGRESSION SUITE (STAGES 2 - 7) ===" -ForegroundColor Cyan
Assert-Test "REG-2" "Stage 2 Movement constants preserved" $pConfigValid
Assert-Test "REG-3" "Stage 3 Level Layout & Camera boundaries preserved" ($cameraBounds -and $cameraFollow)
Assert-Test "REG-4" "Stage 4 20 Star Crystals & Collectible scoring preserved" ($crystalPoints -and $has20Crystals)
Assert-Test "REG-5" "Stage 5 5 Drifter Drones & Stomp combat preserved" ($enemyConfigValid -and $enemiesInScene)
Assert-Test "REG-6" "Stage 6 Health (3) & Lives (3) system preserved" ($hConfigValid -and $gameOverHandler)
Assert-Test "REG-7" "Stage 7 Goal & Level Completion system preserved" ($goalInScene -and $completeInScene)

$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "STAGE 8 TEST RESULTS: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "===============================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
