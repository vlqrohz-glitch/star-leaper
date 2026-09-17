# validate_stars_and_menu.ps1
# Test suite for 1-3 Star Level Performance Ratings & Completion Menu/Next-Level Choice

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$pass = 0
$fail = 0

function Assert-Test($id, $desc, $condition) {
    if ($condition) {
        Write-Host "  [PASS] $id : $desc" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $id : $desc" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   STAR LEAPER: LEVEL STARS & COMPLETION CHOICE VALIDATION" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Read source files
$levelCompPath = Join-Path $root "src\systems\LevelCompletionSystem.js"
$uiSystemPath = Join-Path $root "src\systems\UISystem.js"
$gameScenePath = Join-Path $root "src\scenes\GameScene.js"
$levelSelectPath = Join-Path $root "src\scenes\LevelSelectScene.js"

$levelCompContent = Get-Content $levelCompPath -Raw
$uiSystemContent = Get-Content $uiSystemPath -Raw
$gameSceneContent = Get-Content $gameScenePath -Raw
$levelSelectContent = Get-Content $levelSelectPath -Raw

# 1. LevelCompletionSystem Tests
Write-Host "`n--- LevelCompletionSystem Stars Logic ---" -ForegroundColor Yellow

Assert-Test "STAR-01" "calculateStars method exists in LevelCompletionSystem" `
    ($levelCompContent -match "calculateStars\s*\(")

Assert-Test "STAR-02" "calculateStars awards 1 to 3 stars based on performance" `
    ($levelCompContent -match "stars\s*=\s*3" -and $levelCompContent -match "stars\s*=\s*2" -and $levelCompContent -match "return\s+Math\.max\(1,\s*Math\.min\(3")

Assert-Test "STAR-03" "LevelCompletionSystem has star metadata helper (getStarRatingMeta)" `
    ($levelCompContent -match "getStarRatingMeta\s*\(")

Assert-Test "STAR-04" "LocalStorage persistence for level stars implemented (saveStars & getSavedStars)" `
    ($levelCompContent -match "starleaper_level_stars" -and $levelCompContent -match "saveStars\s*\(" -and $levelCompContent -match "getSavedStars\s*\(")

Assert-Test "STAR-05" "completeLevel computes stars, saves to storage, and emits stars in payload" `
    ($levelCompContent -match "this\.calculateStars\(" -and $levelCompContent -match "LevelCompletionSystem\.saveStars\(" -and ($levelCompContent -match "baseStats\.stars\s*=\s*stars" -or $levelCompContent -match "stars:\s*stars"))

# 2. UISystem Level Complete Overlay Tests
Write-Host "`n--- UISystem Level Complete Screen & Star UI ---" -ForegroundColor Yellow

Assert-Test "STAR-06" "UISystem creates completeStarsText with celebratory star glyphs" `
    ($uiSystemContent -match "this\.completeStarsText" -and $uiSystemContent -match "★")

Assert-Test "STAR-07" "UISystem creates completeRatingTitle for rank and title badge" `
    ($uiSystemContent -match "this\.completeRatingTitle" -and $uiSystemContent -match "completePromptText")

Assert-Test "STAR-08" "UISystem provides Next Level action button (▶ NEXT SECTOR)" `
    ($uiSystemContent -match "▶ NEXT SECTOR" -and $uiSystemContent -match "nextBtnBg\.on\('pointerdown'")

Assert-Test "STAR-09" "UISystem provides Main Menu action button (◀ MAIN MENU)" `
    ($uiSystemContent -match "◀ MAIN MENU" -and $uiSystemContent -match "menuBtnBg\.on\('pointerdown'")

Assert-Test "STAR-10" "UISystem connects Main Menu button to returnToTitleScreen" `
    ($uiSystemContent -match "this\.scene\.returnToTitleScreen\(\)")

Assert-Test "STAR-11" "UISystem renders animated star rating in showLevelComplete" `
    ($uiSystemContent -match "completeStarsText\.setText" -and $uiSystemContent -match "completeStarsText\.setScale")

# 3. GameScene Navigation Tests
Write-Host "`n--- GameScene Complete State & Menu Key Handling ---" -ForegroundColor Yellow

Assert-Test "STAR-12" "GameScene handles ESC key on level complete to return to title menu" `
    ($gameSceneContent -match "pauseKey\.on\('down'" -and $gameSceneContent -match "isLevelComplete\(\)" -and $gameSceneContent -match "returnToTitleScreen\(\)")

Assert-Test "STAR-13" "GameScene has explicit returnToTitleScreen method stopping game and resetting state" `
    ($gameSceneContent -match "returnToTitleScreen\s*\(\)")

# 4. LevelSelectScene Tests
Write-Host "`n--- LevelSelectScene Star Rating Display ---" -ForegroundColor Yellow

Assert-Test "STAR-14" "LevelSelectScene imports LevelCompletionSystem" `
    ($levelSelectContent -match "import\s+\{\s*LevelCompletionSystem\s*\}\s+from")

Assert-Test "STAR-15" "LevelSelectScene queries savedStars for each level" `
    ($levelSelectContent -match "LevelCompletionSystem\.getSavedStars\(lvl\.index\)")

Assert-Test "STAR-16" "LevelSelectScene renders star badges (★★★, ★★☆, ★☆☆, or ☆☆☆)" `
    ($levelSelectContent -match "starGlyph" -and $levelSelectContent -match "★★★")

# Summary
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host " RESULTS: $pass Passed, $fail Failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "================================================================" -ForegroundColor Cyan

if ($fail -gt 0) {
    exit 1
} else {
    exit 0
}
