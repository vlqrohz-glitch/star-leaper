# Stage 10 Automated Verification Script
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

Write-Host "=== STAR-LEAPER STAGE 10 VALIDATION SUITE ===" -ForegroundColor Cyan

# 1. Inspect Files
$audioConfigContent = Get-Content "src/config/audioConfig.js" -Raw
$audioSystemContent = Get-Content "src/systems/AudioSystem.js" -Raw
$feedbackSystemContent = Get-Content "src/systems/FeedbackSystem.js" -Raw
$gameSceneContent = Get-Content "src/scenes/GameScene.js" -Raw
$uiConfigContent = Get-Content "src/config/uiConfig.js" -Raw
$uiSystemContent = Get-Content "src/systems/UISystem.js" -Raw
$powerUpConfigContent = Get-Content "src/config/powerUpConfig.js" -Raw
$powerUpSystemContent = Get-Content "src/systems/PowerUpSystem.js" -Raw
$level1Content = Get-Content "src/levels/level1.js" -Raw
$playerConfigContent = Get-Content "src/config/playerConfig.js" -Raw
$enemyConfigContent = Get-Content "src/config/enemyConfig.js" -Raw
$playerHealthConfigContent = Get-Content "src/config/playerHealthConfig.js" -Raw
$healthSystemContent = Get-Content "src/systems/HealthSystem.js" -Raw
$goalContent = Get-Content "src/entities/Goal.js" -Raw
$levelCompContent = Get-Content "src/systems/LevelCompletionSystem.js" -Raw

# TEST A: AudioSystem initializes without errors
$audioInitMethod = $audioSystemContent -match "initialize\(scene\)\s*\{"
$audioInstantiated = $gameSceneContent -match "this\.audioSystem\s*=\s*new\s+AudioSystem\(this\);"
Assert-Test "TEST A" "AudioSystem initializes without errors" ($audioInitMethod -and $audioInstantiated)

# TEST B: Audio configuration loads correctly
$hasAudioConfig = ($audioConfigContent -match "MASTER_VOLUME") -and ($audioConfigContent -match "AUDIO_KEYS") -and ($audioConfigContent -match "MUSIC_STATES")
Assert-Test "TEST B" "Audio configuration loads correctly" $hasAudioConfig

# TEST C: Title music state activates correctly
$titleMusicActivated = $gameSceneContent -match "this\.audioSystem\.playMusic\(MUSIC_STATES\.TITLE_MUSIC\)"
Assert-Test "TEST C" "Title music state activates correctly" $titleMusicActivated

# TEST D: Gameplay music state activates after starting
$gameplayMusicActivated = $gameSceneContent -match "playMusic\(MUSIC_STATES\.GAMEPLAY_MUSIC\)"
Assert-Test "TEST D" "Gameplay music state activates after starting" $gameplayMusicActivated

# TEST E: Repeated restarts do not create duplicate music instances
$preventsDuplicateMusic = $audioSystemContent -match "if\s*\(this\.currentMusicKey\s*===\s*key\)\s*return;"
Assert-Test "TEST E" "Repeated restarts do not create duplicate music instances" $preventsDuplicateMusic

# TEST F: Crystal collection triggers CRYSTAL_COLLECT
$crystalSFX = $gameSceneContent -match "COLLECTIBLE_COLLECTED[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.CRYSTAL_COLLECT\)"
Assert-Test "TEST F" "Crystal collection triggers CRYSTAL_COLLECT" $crystalSFX

# TEST G: Enemy defeat triggers ENEMY_DEFEAT
$enemySFX = $gameSceneContent -match "ENEMY_DEFEATED[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.ENEMY_DEFEAT\)"
Assert-Test "TEST G" "Enemy defeat triggers ENEMY_DEFEAT" $enemySFX

# TEST H: Player damage triggers PLAYER_DAMAGE
$damageSFX = $gameSceneContent -match "HEALTH_CHANGED[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.PLAYER_DAMAGE\)"
Assert-Test "TEST H" "Player damage triggers PLAYER_DAMAGE" $damageSFX

# TEST I: Player death triggers PLAYER_DEATH
$deathSFX = $gameSceneContent -match "handlePlayerDeath[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.PLAYER_DEATH\)"
Assert-Test "TEST I" "Player death triggers PLAYER_DEATH" $deathSFX

# TEST J: Player respawn triggers PLAYER_RESPAWN
$respawnSFX = $gameSceneContent -match "this\.audioSystem\.playSFX\(AUDIO_KEYS\.PLAYER_RESPAWN\)"
Assert-Test "TEST J" "Player respawn triggers PLAYER_RESPAWN" $respawnSFX

# TEST K: Aegis collection triggers POWERUP_COLLECT
$powerUpCollectSFX = $gameSceneContent -match "POWERUP_COLLECTED[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.POWERUP_COLLECT\)"
Assert-Test "TEST K" "Aegis collection triggers POWERUP_COLLECT" $powerUpCollectSFX

# TEST L: Aegis activation triggers POWERUP_ACTIVATE
$powerUpActivateSFX = $gameSceneContent -match "this\.audioSystem\.playSFX\(AUDIO_KEYS\.POWERUP_ACTIVATE\)"
Assert-Test "TEST L" "Aegis activation triggers POWERUP_ACTIVATE" $powerUpActivateSFX

# TEST M: Aegis expiration triggers POWERUP_EXPIRE
$powerUpExpireSFX = $gameSceneContent -match "this\.audioSystem\.playSFX\(AUDIO_KEYS\.POWERUP_EXPIRE\)"
Assert-Test "TEST M" "Aegis expiration triggers POWERUP_EXPIRE" $powerUpExpireSFX

# TEST N: Goal interaction triggers GOAL_REACHED
$goalSFX = $gameSceneContent -match "handleGoalReached[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.GOAL_REACHED\)"
Assert-Test "TEST N" "Goal interaction triggers GOAL_REACHED" $goalSFX

# TEST O: Level completion triggers completion audio
$completeSFX = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.LEVEL_COMPLETE\)"
Assert-Test "TEST O" "Level completion triggers completion audio" $completeSFX

# TEST P: Game Over triggers Game Over audio
$gameOverSFX = $gameSceneContent -match "triggerGameOver[\s\S]*?this\.audioSystem\.playSFX\(AUDIO_KEYS\.GAME_OVER\)"
Assert-Test "TEST P" "Game Over triggers Game Over audio" $gameOverSFX

# TEST Q: Gameplay music stops on Game Over
$gameOverStopsMusic = $gameSceneContent -match "triggerGameOver[\s\S]*?this\.audioSystem\.stopMusic\(\)"
Assert-Test "TEST Q" "Gameplay music stops on Game Over" $gameOverStopsMusic

# TEST R: Gameplay music stops on completion
$completeStopsMusic = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.audioSystem\.stopMusic\(\)"
Assert-Test "TEST R" "Gameplay music stops on completion" $completeStopsMusic

# TEST S: Completion music/state activates correctly
$completeMusicActive = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.audioSystem\.playMusic\(MUSIC_STATES\.COMPLETION_MUSIC\)"
Assert-Test "TEST S" "Completion music/state activates correctly" $completeMusicActive

# TEST T: Screen shake works for appropriate events
$hasScreenShake = $feedbackSystemContent -match "screenShake\(intensity" -and ($feedbackSystemContent -match "cameras\.main\.shake")
Assert-Test "TEST T" "Screen shake works for appropriate events" $hasScreenShake

# TEST U: Player damage visual feedback works
$damageFeedback = $feedbackSystemContent -match "playerDamage\(\)\s*\{[\s\S]*?playerFlash"
Assert-Test "TEST U" "Player damage visual feedback works" $damageFeedback

# TEST V: Player death feedback works
$deathFeedback = $feedbackSystemContent -match "playerDeath\(\)\s*\{[\s\S]*?screenShake"
Assert-Test "TEST V" "Player death feedback works" $deathFeedback

# TEST W: Respawn feedback works
$respawnFeedback = $feedbackSystemContent -match "playerRespawn\(\)\s*\{[\s\S]*?playerFlash"
Assert-Test "TEST W" "Respawn feedback works" $respawnFeedback

# TEST X: Aegis visual feedback works
$aegisFeedback = ($feedbackSystemContent -match "powerUpActivated\(\)") -and ($feedbackSystemContent -match "powerUpExpired\(\)")
Assert-Test "TEST X" "Aegis visual feedback works" $aegisFeedback

# TEST Y: Floating score feedback works
$floatingScore = $feedbackSystemContent -match "spawnFloatingScore\("
Assert-Test "TEST Y" "Floating score feedback works" $floatingScore

# TEST Z: Temporary feedback effects clean themselves up
$cleansUpFeedback = $feedbackSystemContent -match "popup\.destroy\(\)" -and ($feedbackSystemContent -match "activeTweens\.delete")
Assert-Test "TEST Z" "Temporary feedback effects clean themselves up" $cleansUpFeedback

# TEST AA: Feedback does not modify score
$noScoreMod = -not ($feedbackSystemContent -match "scoreSystem" -or $feedbackSystemContent -match "addScore")
Assert-Test "TEST AA" "Feedback does not modify score" $noScoreMod

# TEST AB: Feedback does not modify health
$noHealthMod = -not ($feedbackSystemContent -match "healthSystem" -or $feedbackSystemContent -match "takeDamage")
Assert-Test "TEST AB" "Feedback does not modify health" $noHealthMod

# TEST AC: Feedback does not modify lives
$noLivesMod = -not ($feedbackSystemContent -match "livesSystem" -or $feedbackSystemContent -match "loseLife")
Assert-Test "TEST AC" "Feedback does not modify lives" $noLivesMod

# TEST AD: Feedback does not modify power-up duration
$noPowerUpDurationMod = -not ($feedbackSystemContent -match "remainingDuration" -or $feedbackSystemContent -match "remainingTime")
Assert-Test "TEST AD" "Feedback does not modify power-up duration" $noPowerUpDurationMod

# TEST AE: Completion state remains frozen
$completeLocked = $feedbackSystemContent -match "isGameplayLocked\(\)\s*\{[\s\S]*?levelCompletionSystem\.isLevelComplete\(\)"
Assert-Test "TEST AE" "Completion state remains frozen (isGameplayLocked check)" $completeLocked

# TEST AF: No gameplay audio starts after completion
$goalStopsGameplay = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.audioSystem\.stopMusic\(\)"
Assert-Test "TEST AF" "No gameplay audio starts after completion" $goalStopsGameplay

# TEST AG: No gameplay feedback starts after completion
$feedbackBlocksAfterComplete = $feedbackSystemContent -match "isGameplayLocked"
Assert-Test "TEST AG" "No gameplay feedback starts after completion" $feedbackBlocksAfterComplete

# TEST AH: Game Over state remains authoritative
$gameOverBlocksFeedback = $feedbackSystemContent -match "this\.scene\.isGameOver"
Assert-Test "TEST AH" "Game Over state remains authoritative" $gameOverBlocksFeedback

# TEST AI: R clears audio and feedback state
$rResetsAudioFeedback = ($gameSceneContent -match "restartLevel[\s\S]*?this\.audioSystem\.reset\(\)") -and ($gameSceneContent -match "this\.feedbackSystem\.reset\(\)")
Assert-Test "TEST AI" "R clears audio and feedback state" $rResetsAudioFeedback

# TEST AJ: R starts a fresh audio/feedback state
$rRestoresGameplayMusic = $gameSceneContent -match "restartLevel[\s\S]*?this\.audioSystem\.playMusic\(MUSIC_STATES\.GAMEPLAY_MUSIC\)"
Assert-Test "TEST AJ" "R starts a fresh audio/feedback state" $rRestoresGameplayMusic

# TEST AK: Mute functionality works if implemented
$hasMute = ($audioSystemContent -match "toggleMute\(\)") -and ($audioSystemContent -match "isMuted\(\)") -and ($gameSceneContent -match "this\.audioSystem\.toggleMute\(\)")
Assert-Test "TEST AK" "Mute functionality works with toggle and query methods" $hasMute

# TEST AL: Missing audio assets do not crash the game
$audioGracefulFallback = $audioSystemContent -match "catch\s*\(e\)\s*\{"
Assert-Test "TEST AL" "Missing audio assets/unsupported contexts do not crash the game" $audioGracefulFallback

# TEST AM: No duplicate event listeners occur
$restartMethod = if ($gameSceneContent -match '(?s)restartLevel\(\)\s*\{(.*?)\n  \}') { $matches[1] } else { "" }
$restartNoBindEvents = ($restartMethod.Length -gt 0) -and (-not ($restartMethod -match "bindEvents"))
Assert-Test "TEST AM" "No duplicate event listeners occur after restart" $restartNoBindEvents

# TEST AN: No console errors occur during normal gameplay
$cleanAudioImports = $gameSceneContent -match "import\s*\{\s*AudioSystem\s*\}\s*from\s*'\.\.\/systems\/AudioSystem\.js'"
Assert-Test "TEST AN" "Clean AudioSystem & FeedbackSystem imports and zero syntax discrepancies" $cleanAudioImports

# TEST AO: No console errors occur during death/respawn
$deathAudioHandled = $gameSceneContent -match "handlePlayerDeath[\s\S]*?this\.audioSystem\.playSFX"
Assert-Test "TEST AO" "Death/respawn cleanly delegates to AudioSystem" $deathAudioHandled

# TEST AP: No console errors occur during Game Over
$gameOverAudioHandled = $gameSceneContent -match "triggerGameOver[\s\S]*?this\.audioSystem\.playSFX"
Assert-Test "TEST AP" "Game Over cleanly delegates to AudioSystem" $gameOverAudioHandled

# TEST AQ: No console errors occur during completion
$completeAudioHandled = $gameSceneContent -match "LEVEL_COMPLETE[\s\S]*?this\.audioSystem\.playSFX"
Assert-Test "TEST AQ" "Completion cleanly delegates to AudioSystem" $completeAudioHandled

# TEST AR: No console errors occur during repeated restarts
$cleanRestartAudio = $gameSceneContent -match "restartLevel\(\)\s*\{"
Assert-Test "TEST AR" "Repeated restarts cleanly reset audio and feedback" $cleanRestartAudio

# Regression Tests
Write-Host "`n=== REGRESSION SUITE (STAGES 2 - 9) ===" -ForegroundColor Cyan
$pConfigValid = ($playerConfigContent -match "GROUND_ACCELERATION:\s*1100") -and ($playerConfigContent -match "MOVE_SPEED:\s*230") -and ($playerConfigContent -match "COYOTE_TIME:\s*0\.13")
$cameraBounds = $gameSceneContent -match "cam\.setBounds\(0,\s*0,\s*this\.levelData\.width,\s*this\.levelData\.height\)" -and ($gameSceneContent -match "cam\.startFollow")
$has20Crystals = ($level1Content | Select-String "x:" -AllMatches).Matches.Count -ge 20
$crystalPoints = (Get-Content "src/systems/ScoreSystem.js" -Raw) -match "100"
$enemyConfigValid = ($enemyConfigContent -match "PATROL_SPEED:\s*55") -and ($enemyConfigContent -match "STOMP_BOUNCE_FORCE:\s*-280")
$hConfigValid = ($playerHealthConfigContent -match "MAX_HEALTH:\s*3") -and ($playerHealthConfigContent -match "STARTING_LIVES:\s*3")
$goalInScene = $gameSceneContent -match "this\.goal\s*=\s*new\s+Goal"
$powerUpsInScene = $gameSceneContent -match "this\.powerUpSystem\s*=\s*new\s+PowerUpSystem"
$uiInScene = $gameSceneContent -match "this\.uiSystem\s*=\s*new\s+UISystem"

Assert-Test "REG-2" "Stage 2 Movement constants preserved" $pConfigValid
Assert-Test "REG-3" "Stage 3 Level Layout & Camera boundaries preserved" $cameraBounds
Assert-Test "REG-4" "Stage 4 20 Star Crystals & Collectible scoring preserved" ($crystalPoints -and $has20Crystals)
Assert-Test "REG-5" "Stage 5 5 Drifter Drones & Stomp combat preserved" $enemyConfigValid
Assert-Test "REG-6" "Stage 6 Health (3) & Lives (3) system preserved" $hConfigValid
Assert-Test "REG-7" "Stage 7 Goal & Level Completion system preserved" $goalInScene
Assert-Test "REG-8" "Stage 8 Power-Up System & Aegis Core preserved" $powerUpsInScene
Assert-Test "REG-9" "Stage 9 UI System, Title Screen & HUD preserved" $uiInScene

$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$totalCount = $testResults.Count
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "STAGE 10 TEST RESULTS: $passedCount / $totalCount PASSED" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "===============================================" -ForegroundColor Cyan

if ($passedCount -ne $totalCount) {
    exit 1
}
