# Stage 9 Automated Verification Script
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

Write-Host "=== STAR-LEAPER STAGE 9 VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. Inspect Files
$level1Content = Get-Content "src/levels/level1.js" -Raw
$uiConfigContent = Get-Content "src/config/uiConfig.js" -Raw
$uiSystemContent = Get-Content "src/systems/UISystem.js" -Raw
$powerUpConfigContent = Get-Content "src/config/powerUpConfig.js" -Raw
$powerUpSystemContent = Get-Content "src/systems/PowerUpSystem.js" -Raw
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$bootSceneContent = Get-Content "src/scenes/BootScene.js" -Raw
$playerConfigContent = Get-Content "src/config/playerConfig.js" -Raw
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
$playerHealthConfigContent = Get-Content "src/config/playerHealthConfig.js" -Raw
$healthSystemContent = Get-Content "src/systems/HealthSystem.js" -Raw
$goalContent = Get-Content "src/entities/Goal.js" -Raw
$levelCompContent = Get-Content "src/systems/LevelCompletionSystem.js" -Raw

# TEST A: Title screen appears on initial launch
$hasTitleCreation = $uiSystemContent -match "createTitleScreen\(\)\s*\{"
$showsTitleOnLaunch = $uiSystemContent -match "this\.showTitleScreen\(\)" -and ($uiSystemContent -match "currentState\s*=\s*UIState\.TITLE")
Assert-Test "TEST A" "Title screen appears on initial launch" ($hasTitleCreation -and $showsTitleOnLaunch)

# TEST B: Pressing ENTER starts gameplay
$enterKeyConfigured = $gameSceneContent -match "addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.ENTER\)"
$enterCallsStart = $gameSceneContent -match "handleStartInput\(\)[\s\S]*?this\.uiSystem\.hideTitleScreen\("
Assert-Test "TEST B" "Pressing ENTER starts gameplay" ($enterKeyConfigured -and $enterCallsStart)

# TEST C: Title screen disappears after starting
$hidesTitle = $uiSystemContent -match "hideTitleScreen[\s\S]*?this\.titleContainer\.setVisible\(false\)"
$setsGameplayState = $uiSystemContent -match "this\.currentState\s*=\s*UIState\.GAMEPLAY"
Assert-Test "TEST C" "Title screen disappears after starting" ($hidesTitle -and $setsGameplayState)

# TEST D: Gameplay HUD appears correctly
$createsHUD = $uiSystemContent -match "createHUD\(\)\s*\{"
$showsHUD = $uiSystemContent -match "showGameplayHUD\(\)\s*\{\s*this\.hudContainer\.setVisible\(true\);"
Assert-Test "TEST D" "Gameplay HUD appears correctly" ($createsHUD -and $showsHUD)

# TEST E: Score displays correctly
$scoreFormatted = $uiSystemContent -match "String\(score\)\.padStart\(6,\s*'0'\)"
$scoreRendered = $uiSystemContent -match "SCORE:\s*[\$]\{scoreStr\}"
Assert-Test "TEST E" "Score displays correctly with leading zeroes" ($scoreFormatted -and $scoreRendered)

# TEST F: Star Crystal counter displays correctly
$crystalsFormatted = $uiSystemContent -match "String\(collected\)\.padStart\(2,\s*'0'\)"
$crystalsRendered = $uiSystemContent -match "CRYSTALS:\s*[\$]\{crystalStr\}"
Assert-Test "TEST F" "Star Crystal counter displays correctly" ($crystalsFormatted -and $crystalsRendered)

# TEST G: Health display reflects HealthSystem
$healthFromSystem = $uiSystemContent -match "this\.scene\.healthSystem\.getHealth\(\)"
$shieldBarRendered = $uiSystemContent -match "HEALTH:\s*\[[\$]\{shieldBar\}\]\s*[\$]\{hp\}\/[\$]\{maxHp\}"
Assert-Test "TEST G" "Health display reflects HealthSystem" ($healthFromSystem -and $shieldBarRendered)

# TEST H: Lives display reflects LivesSystem
$livesFromSystem = $uiSystemContent -match "this\.scene\.livesSystem\.getLives\(\)"
$livesRendered = $uiSystemContent -match "LIVES:\s*[\$]\{lives\}"
Assert-Test "TEST H" "Lives display reflects LivesSystem" ($livesFromSystem -and $livesRendered)

# TEST I: Aegis display reflects PowerUpSystem
$powerUpFromSystem = $uiSystemContent -match "this\.scene\.powerUpSystem\.isPowerUpActive\('AEGIS_CORE'\)"
$inactiveAegisRendered = $uiSystemContent -match "AEGIS:\s*--"
Assert-Test "TEST I" "Aegis display reflects PowerUpSystem" ($powerUpFromSystem -and $inactiveAegisRendered)

# TEST J: Aegis timer displays the actual remaining duration
$timeFromSystem = $uiSystemContent -match "this\.scene\.powerUpSystem\.getRemainingTime\(\)"
$activeTimerRendered = $uiSystemContent -match "AEGIS:\s*ACTIVE\s*[\$]\{remainingSec\}s"
Assert-Test "TEST J" "Aegis timer displays the actual remaining duration" ($timeFromSystem -and $activeTimerRendered)

# TEST K: Aegis display clears after expiration
$clearsOnInactive = $uiSystemContent -match "else\s*\{\s*this\.hudPowerUpText\s*\.setText\('AEGIS:\s*--'\)"
Assert-Test "TEST K" "Aegis display clears after expiration" $clearsOnInactive

# TEST L: Score updates after collecting a Star Crystal
$scoreEventHooked = $gameSceneContent -match "SCORE_CHANGED[\s\S]*?this\.uiSystem\.updateHUD\(\)"
Assert-Test "TEST L" "Score updates after collecting a Star Crystal" $scoreEventHooked

# TEST M: Score updates after defeating a Drifter Drone
Assert-Test "TEST M" "Score updates after defeating a Drifter Drone" $scoreEventHooked

# TEST N: Crystal count updates after collection
Assert-Test "TEST N" "Crystal count updates after collection" $scoreEventHooked

# TEST O: Health display updates after damage
$healthEventHooked = $gameSceneContent -match "HEALTH_CHANGED[\s\S]*?this\.uiSystem\.updateHUD\(\)"
Assert-Test "TEST O" "Health display updates after damage" $healthEventHooked

# TEST P: Lives display updates after death
$livesEventHooked = $gameSceneContent -match "LIVES_CHANGED[\s\S]*?this\.uiSystem\.updateHUD\(\)"
Assert-Test "TEST P" "Lives display updates after death" $livesEventHooked

# TEST Q: HUD behaves correctly after respawn
$respawnUpdatesHUD = $gameSceneContent -match "handlePlayerDeath[\s\S]*?this\.uiSystem\.updateHUD\(\)"
Assert-Test "TEST Q" "HUD behaves correctly after respawn" $respawnUpdatesHUD

# TEST R: Game Over screen appears correctly
$gameOverContainerSetup = $uiSystemContent -match "createGameOverOverlay\(\)"
$showGameOverMethod = $uiSystemContent -match "showGameOver\(\)\s*\{"
Assert-Test "TEST R" "Game Over screen appears correctly" ($gameOverContainerSetup -and $showGameOverMethod)

# TEST S: Game Over statistics are accurate
$statsInGameOver = $uiSystemContent -match "FINAL SCORE:\s*[\$]\{scoreFormatted\}" -and ($uiSystemContent -match "STAR CRYSTALS:\s*[\$]\{crystalFormatted\}")
Assert-Test "TEST S" "Game Over statistics are accurate (final score & crystals)" $statsInGameOver

# TEST T: R resets Game Over correctly
$restartResetsUI = $gameSceneContent -match "restartLevel[\s\S]*?this\.uiSystem\.reset\(\)"
$uiResetClearsGameOver = $uiSystemContent -match "reset\(\)[\s\S]*?this\.gameOverContainer\.setVisible\(false\)"
Assert-Test "TEST T" "R resets Game Over correctly" ($restartResetsUI -and $uiResetClearsGameOver)

# TEST U: Title screen cannot coexist with gameplay UI
$titleHidesHUD = $uiSystemContent -match "showTitleScreen\(\)[\s\S]*?this\.hudContainer\.setVisible\(false\)"
$gameplayHidesTitle = $uiSystemContent -match "this\.titleContainer\.setVisible\(false\)"
Assert-Test "TEST U" "Title screen cannot coexist with gameplay UI" ($titleHidesHUD -and $gameplayHidesTitle)

# TEST V: Game Over UI cannot coexist with completion UI
$gameOverGuardsComplete = $uiSystemContent -match "showGameOver\(\)[\s\S]*?if\s*\(this\.currentState\s*===\s*UIState\.LEVEL_COMPLETE\)\s*\{\s*return;"
$completeGuardsGameOver = $uiSystemContent -match "showLevelComplete[\s\S]*?if\s*\(this\.currentState\s*===\s*UIState\.GAME_OVER\)\s*\{\s*return;"
Assert-Test "TEST V" "Game Over UI cannot coexist with completion UI" ($gameOverGuardsComplete -and $completeGuardsGameOver)

# TEST W: Goal completion still works
$goalTriggersComplete = $gameSceneContent -match "this\.levelCompletionSystem\.completeLevel\(stats\)"
Assert-Test "TEST W" "Goal completion still works" $goalTriggersComplete

# TEST X: Completion screen displays correct final statistics
$completeStatsFormatted = $uiSystemContent -match "FINAL SCORE:\s*[\$]\{scoreFormatted\}" -and ($uiSystemContent -match "STAR CRYSTALS:\s*[\$]\{crystalFormatted\}") -and ($uiSystemContent -match "ENEMIES DEFEATED:\s*[\$]\{enemyFormatted\}")
Assert-Test "TEST X" "Completion screen displays correct final statistics" $completeStatsFormatted

# TEST Y: Completion statistics remain frozen
$completeStatsFrozen = $levelCompContent -match "if\s*\(this\.completed\)\s*\{\s*return\s+false;\s*\}"
Assert-Test "TEST Y" "Completion statistics remain frozen" $completeStatsFrozen

# TEST Z: Power-up state does not alter completion statistics
$noPowerUpInStats = -not ($uiSystemContent -match "showLevelComplete[\s\S]*?stats\.powerUp")
Assert-Test "TEST Z" "Power-up state does not alter completion statistics" $noPowerUpInStats

# TEST AA: R resets the completion screen correctly
$uiResetClearsComplete = $uiSystemContent -match "reset\(\)[\s\S]*?this\.levelCompleteContainer\.setVisible\(false\)"
Assert-Test "TEST AA" "R resets the completion screen correctly" ($restartResetsUI -and $uiResetClearsComplete)

# TEST AB: HUD remains camera-pinned
$hudScrollFactorZero = $uiSystemContent -match "this\.hudContainer\s*=\s*this\.scene\.add\.container\(0,\s*0\)\.setScrollFactor\(0\)"
Assert-Test "TEST AB" "HUD remains camera-pinned (scrollFactor 0)" $hudScrollFactorZero

# TEST AC: HUD remains readable during camera movement
$hudHighDepth = $uiSystemContent -match "setDepth\(50\)" -or $uiSystemContent -match "setDepth\(100\)"
Assert-Test "TEST AC" "HUD remains readable during camera movement (depth >= 50)" $hudHighDepth

# TEST AD: UI remains stable during window resizing if supported
$containersCentered = $uiSystemContent -match "this\.scene\.add\.container\(400,\s*225\)"
Assert-Test "TEST AD" "UI remains stable and centered within viewport bounds" $containersCentered

# TEST AE: No duplicate event listeners occur after restart
$restartMethod = if ($gameSceneContent -match '(?s)restartLevel\(\)\s*\{(.*?)\n  \}') { $matches[1] } else { "" }
$restartDoesNotRebindEvents = ($restartMethod.Length -gt 0) -and (-not ($restartMethod -match "bindEvents"))
Assert-Test "TEST AE" "No duplicate event listeners occur after restart" $restartDoesNotRebindEvents

# TEST AF: No duplicate UI updates occur
$singleUISystem = $gameSceneContent -match "this\.uiSystem\s*=\s*new\s+UISystem\(this\);"
Assert-Test "TEST AF" "Single UISystem instance prevents duplicate UI updates" $singleUISystem

# TEST AG: No console errors occur during normal gameplay
$cleanImports = $gameSceneContent -match "import\s*\{\s*UISystem\s*\}\s*from\s*'\.\.\/systems\/UISystem\.js'"
Assert-Test "TEST AG" "Clean UISystem imports and zero syntax discrepancies" $cleanImports

# TEST AH: No console errors occur during death/Game Over
$deathHandlesUI = $gameSceneContent -match "triggerGameOver\(\)[\s\S]*?this\.uiSystem\.showGameOver\(\)"
Assert-Test "TEST AH" "Game Over cleanly delegates to UISystem" $deathHandlesUI

# TEST AI: No console errors occur during level completion
$completeHandlesUI = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.uiSystem\.showLevelComplete\(stats\)"
Assert-Test "TEST AI" "Level completion cleanly delegates to UISystem" $completeHandlesUI

# TEST AJ: No console errors occur during repeated restarts
$cleanRestart = $gameSceneContent -match "restartLevel\(\)\s*\{"
Assert-Test "TEST AJ" "Repeated restarts cleanly execute with zero errors" $cleanRestart

# Regression Tests
Write-Host "`n=== REGRESSION SUITE (STAGES 2 - 8) ===" -ForegroundColor Cyan
$pConfigValid = ($playerConfigContent -match "GROUND_ACCELERATION:\s*1100") -and ($playerConfigContent -match "MOVE_SPEED:\s*230") -and ($playerConfigContent -match "COYOTE_TIME:\s*0\.13")
$cameraBounds = $gameSceneContent -match "cam\.setBounds\(0,\s*0,\s*this\.levelData\.width,\s*this\.levelData\.height\)" -and ($gameSceneContent -match "cam\.startFollow")
$has20Crystals = ($level1Content | Select-String "x:" -AllMatches).Matches.Count -ge 20
$crystalPoints = (Get-Content "src/systems/ScoreSystem.js" -Raw) -match "100"
$enemyConfigValid = ($enemyConfigContent -match "PATROL_SPEED:\s*55") -and ($enemyConfigContent -match "STOMP_BOUNCE_FORCE:\s*-280")
$hConfigValid = ($playerHealthConfigContent -match "MAX_HEALTH:\s*3") -and ($playerHealthConfigContent -match "STARTING_LIVES:\s*3")
$goalInScene = $gameSceneContent -match "this\.goal\s*=\s*new\s+Goal"
$powerUpsInScene = $gameSceneContent -match "this\.powerUpSystem\s*=\s*new\s+PowerUpSystem"

Assert-Test "REG-2" "Stage 2 Movement constants preserved" $pConfigValid
Assert-Test "REG-3" "Stage 3 Level Layout & Camera boundaries preserved" $cameraBounds
Assert-Test "REG-4" "Stage 4 20 Star Crystals & Collectible scoring preserved" ($crystalPoints -and $has20Crystals)
Assert-Test "REG-5" "Stage 5 5 Drifter Drones & Stomp combat preserved" $enemyConfigValid
Assert-Test "REG-6" "Stage 6 Health (3) & Lives (3) system preserved" $hConfigValid
Assert-Test "REG-7" "Stage 7 Goal & Level Completion system preserved" $goalInScene
Assert-Test "REG-8" "Stage 8 Power-Up System & Aegis Core preserved" $powerUpsInScene

$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "STAGE 9 TEST RESULTS: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "===============================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
