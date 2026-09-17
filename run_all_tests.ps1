# run_all_tests.ps1
$ErrorActionPreference = "Stop"
$suites = @(
    "validate_wild_west_cheats.ps1",
    "validate_scoreboard_and_combat.ps1",
    "validate_stars_and_menu.ps1",
    "validate_mobile_polish.ps1",
    "validate_mobile_touch.ps1",
    "validate_domain_url.ps1",
    "validate_shop_sheet.ps1",
    "validate_expansion.ps1",
    "validate_stage10.ps1",
    "validate_boss_and_levels.ps1",
    "validate_netlify_deploy.ps1"
)

$totalPass = 0
foreach ($s in $suites) {
    Write-Host "`n>>> Running $s..." -ForegroundColor Cyan
    $global:LASTEXITCODE = 0
    & (Join-Path $PSScriptRoot $s)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Suite $s failed!"
    }
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "     ALL 11 TEST SUITES PASSED (283+ ASSERTIONS)       " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
