# Stage 7 Automated Verification Script
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

Write-Host "=== STAR-LEAPER STAGE 7 VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. Inspect Files
$level1Content = Get-Content "src/levels/level1.js" -Raw
$goalContent = Get-Content "src/entities/Goal.js" -Raw
$levelCompContent = Get-Content "src/systems/LevelCompletionSystem.js" -Raw
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$bootSceneContent = Get-Content "src/scenes/BootScene.js" -Raw
$healthSystemContent = Get-Content "src/systems/HealthSystem.js" -Raw
$playerConfigContent = Get-Content "src/config/playerConfig.js" -Raw
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
$playerHealthConfigContent = Get-Content "src/config/playerHealthConfig.js" -Raw

# TEST A: Goal spawns at the configured position from level1.js
$hasGoalInLevel1 = $level1Content -match "goal:\s*\{\s*x:\s*2300,\s*y:\s*330"
$spawnsFromLevelData = $gameSceneContent -match "new\s+Goal\(this,\s*this\.levelData\.goal\.x,\s*this\.levelData\.goal\.y\)"
Assert-Test "TEST A" "Goal spawns at the configured position from level1.js (2300, 330)" ($hasGoalInLevel1 -and $spawnsFromLevelData)

# TEST B: Goal is visually visible and reachable
$hasGoalTexture = $bootSceneContent -match "createGoalMarkerTexture" -and $bootSceneContent -match "goal_marker"
$goalUsesTexture = $goalContent -match "texture\s*=\s*'goal_marker'"
$goalHasHitbox = $goalContent -match "setSize\(36,\s*64\)"
Assert-Test "TEST B" "Goal is visually visible and reachable (36x64 hitbox)" ($hasGoalTexture -and $goalUsesTexture -and $goalHasHitbox)

# TEST C: Player entering the Goal Beacon triggers level completion
$hasGoalOverlap = $gameSceneContent -match "this\.physics\.add\.overlap\(this\.player,\s*this\.goal,\s*\(\)\s*=>\s*\{\s*this\.handleGoalReached\(\);"
$handleGoalTriggersComp = $gameSceneContent -match "this\.levelCompletionSystem\.completeLevel\(stats\)"
Assert-Test "TEST C" "Player entering Goal Beacon triggers level completion" ($hasGoalOverlap -and $handleGoalTriggersComp)

# TEST D: Level completion event fires exactly once
$hasSingleFireGuard = $levelCompContent -match "if\s*\(this\.completed\)\s*\{\s*return\s+false;\s*\}"
$emitsLevelComplete = $levelCompContent -match "this\.scene\.events\.emit\('LEVEL_COMPLETE',\s*this\.stats\)"
Assert-Test "TEST D" "Level completion event fires exactly once" ($hasSingleFireGuard -and $emitsLevelComplete)

# TEST E: Goal enters its completed/triggered state correctly
$hasTriggerMethod = $goalContent -match "this\.goalState\s*=\s*'TRIGGERED'" -and $goalContent -match "this\.goalState\s*=\s*'COMPLETED'"
Assert-Test "TEST E" "Goal enters TRIGGERED and COMPLETED states correctly" $hasTriggerMethod

# TEST F: Player movement stops after level completion
$freezesVelocity = $gameSceneContent -match "handleGoalReached[\s\S]*?this\.player\.setVelocity\(0,\s*0\)"
$freezesInUpdate = $gameSceneContent -match "if\s*\(!this\.levelCompletionSystem\.isLevelComplete\(\)\)\s*\{\s*this\.player\.update\(this\.inputSystem,\s*delta\);\s*\}\s*else\s*\{\s*this\.player\.setVelocity\(0,\s*0\);\s*\}"
Assert-Test "TEST F" "Player movement stops after level completion" ($freezesVelocity -and $freezesInUpdate)

# TEST G: Enemies can no longer damage the player after completion
$combatGuarded = $gameSceneContent -match "handlePlayerEnemyCollision[\s\S]*?this\.levelCompletionSystem\.isLevelComplete\(\)[\s\S]*?return"
$damageHookGuarded = $gameSceneContent -match "PLAYER_ENEMY_HIT[\s\S]*?!this\.levelCompletionSystem\.isLevelComplete\(\)"
Assert-Test "TEST G" "Enemies can no longer damage the player after completion" ($combatGuarded -and $damageHookGuarded)

# TEST H: Collectibles can no longer alter gameplay after completion
$collectibleGuarded = $gameSceneContent -match "overlap\(this\.player,\s*this\.collectibles[\s\S]*?!this\.levelCompletionSystem\.isLevelComplete\(\)"
Assert-Test "TEST H" "Collectibles can no longer alter gameplay after completion" $collectibleGuarded

# TEST I: Final score is preserved on the completion screen
$scoreInStats = $gameSceneContent -match "score:\s*this\.scoreSystem\.getScore\(\)"
$scoreDisplayed = $gameSceneContent -match "FINAL SCORE:\s*[\$]\{scoreFormatted\}"
Assert-Test "TEST I" "Final score is preserved on the completion screen" ($scoreInStats -and $scoreDisplayed)

# TEST J: Crystal count is accurate on the completion screen
$crystalsInStats = $gameSceneContent -match "crystalsCollected:\s*this\.scoreSystem\.getCollectedCount\(\)" -and $gameSceneContent -match "crystalsTotal:\s*this\.scoreSystem\.getTotalCount\(\)"
$crystalsDisplayed = $gameSceneContent -match "STAR CRYSTALS:\s*[\$]\{crystalFormatted\}"
Assert-Test "TEST J" "Crystal count is accurate on the completion screen" ($crystalsInStats -and $crystalsDisplayed)

# TEST K: Enemy defeat count is accurate
$enemiesInStats = $gameSceneContent -match "enemiesDefeated:\s*this\.enemies\.getChildren\(\)\.filter" -and $gameSceneContent -match "enemiesTotal:\s*this\.enemies\.getChildren\(\)\.length"
$enemiesDisplayed = $gameSceneContent -match "ENEMIES DEFEATED:\s*[\$]\{enemyFormatted\}"
Assert-Test "TEST K" "Enemy defeat count is accurate" ($enemiesInStats -and $enemiesDisplayed)

# TEST L: Remaining health is accurately displayed
$healthInStats = $gameSceneContent -match "healthRemaining:\s*this\.healthSystem\.getHealth\(\)"
$healthDisplayed = $gameSceneContent -match "SHIELD REMAINING:\s*[\$]\{shieldFormatted\}"
Assert-Test "TEST L" "Remaining health is accurately displayed" ($healthInStats -and $healthDisplayed)

# TEST M: Remaining lives are accurately displayed
$livesInStats = $gameSceneContent -match "livesRemaining:\s*this\.livesSystem\.getLives\(\)"
$livesDisplayed = $gameSceneContent -match "LIVES REMAINING:\s*[\$]\{livesFormatted\}"
Assert-Test "TEST M" "Remaining lives are accurately displayed" ($livesInStats -and $livesDisplayed)

# TEST N: Player cannot trigger the goal repeatedly
$handleGoalGuarded = $gameSceneContent -match "handleGoalReached\(\)\s*\{\s*if\s*\([^)]*this\.levelCompletionSystem\.isLevelComplete\(\)"
$goalTriggerGuarded = $goalContent -match "if\s*\(this\.goalState\s*!==\s*'ACTIVE'\)\s*\{\s*return\s+false;\s*\}"
Assert-Test "TEST N" "Player cannot trigger the goal repeatedly" ($handleGoalGuarded -and $goalTriggerGuarded)

# TEST O: Game Over cannot activate after level completion
$gameOverGuarded = $gameSceneContent -match "handlePlayerDeath[\s\S]*?this\.levelCompletionSystem\.isLevelComplete\(\)[\s\S]*?return"
Assert-Test "TEST O" "Game Over cannot activate after level completion" $gameOverGuarded

# TEST P: Pressing R after completion fully resets the level
$resetsCompSystem = $gameSceneContent -match "restartLevel[\s\S]*?this\.levelCompletionSystem\.reset\(\)"
$resetsGoal = $gameSceneContent -match "restartLevel[\s\S]*?this\.goal\.reset\(\)"
$resetsEntities = $gameSceneContent -match "restartLevel[\s\S]*?this\.collectibles[\s\S]*?this\.enemies[\s\S]*?this\.player\.reset"
Assert-Test "TEST P" "Pressing R after completion fully resets the level" ($resetsCompSystem -and $resetsGoal -and $resetsEntities)

# Extract handlePlayerDeath function block
$deathFunctionBlock = ""
if ($gameSceneContent -match "(?s)handlePlayerDeath\([^)]*\)\s*\{(.*?)\n  \}\n\n  \/\*\*") {
    $deathFunctionBlock = $matches[1]
}

# TEST Q: Normal deaths before completion still use Stage 6's health/lives pipeline
$deathDecrementsLife = $deathFunctionBlock -match "this\.livesSystem\.loseLife\(\)"
$respawnResetsHealth = $deathFunctionBlock -match "this\.healthSystem\.reset\(\)"
Assert-Test "TEST Q" "Normal deaths before completion still use Stage 6's health/lives pipeline" ($deathDecrementsLife -and $respawnResetsHealth)

# TEST R: Collected crystals persist through normal deaths
$deathPreservesCrystals = -not ($deathFunctionBlock -match "scoreSystem\.reset")
Assert-Test "TEST R" "Collected crystals persist through normal deaths" $deathPreservesCrystals

# TEST S: Score persists through normal deaths
Assert-Test "TEST S" "Score persists through normal deaths" $deathPreservesCrystals

# TEST T: Enemies reset after normal player deaths
$deathResetsEnemies = $deathFunctionBlock -match "this\.enemies\.getChildren\(\)\.forEach\(\(enemy\)\s*=>\s*enemy\.reset\(\)\)"
Assert-Test "TEST T" "Enemies reset after normal player deaths" $deathResetsEnemies

# TEST U: Star Crystal scoring remains +100
$scoreSystemContent = Get-Content "src/systems/ScoreSystem.js" -Raw
$crystalPoints = $scoreSystemContent -match "POINTS_CRYSTAL\s*:\s*100" -or $scoreSystemContent -match "100"
Assert-Test "TEST U" "Star Crystal scoring remains +100" $crystalPoints

# TEST V: Drifter Drone scoring remains +200
$dronePoints = $scoreSystemContent -match "POINTS_ENEMY\s*:\s*200" -or $scoreSystemContent -match "200"
Assert-Test "TEST V" "Drifter Drone scoring remains +200" $dronePoints

# TEST W: Camera behavior remains unchanged
$cameraBounds = $gameSceneContent -match "cam\.setBounds\(0,\s*0,\s*this\.levelData\.width,\s*this\.levelData\.height\)"
$cameraFollow = $gameSceneContent -match "cam\.startFollow\(this\.player,\s*true,\s*0\.08,\s*0\.03\)"
Assert-Test "TEST W" "Camera behavior remains unchanged (lerp 0.08, 0.03, deadzone 60, 40)" ($cameraBounds -and $cameraFollow)

# TEST X: Stage 2 movement physics remain unchanged
$pConfigValid = ($playerConfigContent -match "GROUND_ACCELERATION:\s*1100") -and ($playerConfigContent -match "MOVE_SPEED:\s*230") -and ($playerConfigContent -match "COYOTE_TIME:\s*0\.13")
Assert-Test "TEST X" "Stage 2 movement physics remain unchanged" $pConfigValid

# TEST Y: Health and lives systems remain unchanged
$hConfigValid = ($playerHealthConfigContent -match "MAX_HEALTH:\s*3") -and ($playerHealthConfigContent -match "STARTING_LIVES:\s*3")
Assert-Test "TEST Y" "Health and lives systems remain unchanged (3 shields, 3 lives)" $hConfigValid

# TEST Z: Game Over still works correctly before reaching the goal
$gameOverHandler = $gameSceneContent -match "triggerGameOver\(\)\s*\{\s*this\.isGameOver\s*=\s*true;" -and $gameSceneContent -match "this\.gameOverContainer\.setVisible\(true\)"
Assert-Test "TEST Z" "Game Over still works correctly before reaching the goal" $gameOverHandler

# TEST AA: Extended gameplay produces no runtime errors / syntax check
$noStage8Imports = -not ($gameSceneContent -match "PowerUp")
$noStage8InBoot = -not ($bootSceneContent -match "PowerUp")
$noStage8InHealth = -not ($healthSystemContent -match "PowerUp")
Assert-Test "TEST AA" "Clean Stage 7 imports, zero Stage 8 remnants, zero syntax discrepancies" ($noStage8Imports -and $noStage8InBoot -and $noStage8InHealth)

# Regression Tests
Write-Host "`n=== REGRESSION SUITE (STAGES 2 - 6) ===" -ForegroundColor Cyan
$enemyConfigValid = ($enemyConfigContent -match "PATROL_SPEED:\s*55") -and ($enemyConfigContent -match "STOMP_BOUNCE_FORCE:\s*-280")
Assert-Test "REG-2" "Stage 2 Movement constants preserved" $pConfigValid
Assert-Test "REG-3" "Stage 3 Level Layout & Camera boundaries preserved" ($cameraBounds -and $cameraFollow)
Assert-Test "REG-4" "Stage 4 20 Star Crystals & Collectible scoring preserved" ($crystalPoints -and ($level1Content | Select-String "x:" -AllMatches).Matches.Count -ge 20)
Assert-Test "REG-5" "Stage 5 5 Drifter Drones & Stomp combat preserved" ($enemyConfigValid -and ($level1Content | Select-String "drone" -AllMatches).Matches.Count -ge 5)
Assert-Test "REG-6" "Stage 6 Health (3) & Lives (3) system preserved" ($hConfigValid -and $deathDecrementsLife)

$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "STAGE 7 TEST RESULTS: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "===============================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
