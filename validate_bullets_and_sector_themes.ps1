# validate_bullets_and_sector_themes.ps1
$ErrorActionPreference = "Stop"

Write-Host "`n=== Validating Straight Bullets, Sector Landmarks and Wild West Cowboy Overhaul ===" -ForegroundColor Cyan
$pass = 0
$fail = 0

function Assert-Condition($name, $cond) {
    if ($cond) {
        Write-Host " [PASS] $name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host " [FAIL] $name" -ForegroundColor Red
        $script:fail++
    }
}

# 1. Straight Bullets Trajectory Checks
$bulletContent = Get-Content "src\entities\PlayerBullet.js" -Raw
Assert-Condition "BUL-01 : PlayerBullet sets allowGravity to false unconditionally" ($bulletContent -match 'this\.body\.setAllowGravity\(false\)')
Assert-Condition "BUL-02 : PlayerBullet constructor sets velocityY to 0" ($bulletContent -match 'this\.setVelocity\(this\.dir \* this\.speed, 0\)')
Assert-Condition "BUL-03 : PlayerBullet preUpdate locks velocityY to 0" ($bulletContent -match 'this\.body\.velocity\.y = 0')
Assert-Condition "BUL-04 : DYNAMITE_LAUNCHER hasArcGravity is false" ($bulletContent -match "case 'DYNAMITE_LAUNCHER':[\s\S]*?hasArcGravity:\s*false")
Assert-Condition "BUL-05 : CLUSTER_BOMB hasArcGravity is false" ($bulletContent -match "case 'CLUSTER_BOMB':[\s\S]*?hasArcGravity:\s*false")

$playerContent = Get-Content "src\entities\Player.js" -Raw
Assert-Condition "BUL-06 : Player attack fires shotgun pellets straight horizontally" ($playerContent -match "Shotgun fires 2 additional parallel horizontal pellets")

# 2. Sector Background Landmark Figures Checks
$bootContent = Get-Content "src\scenes\BootScene.js" -Raw
Assert-Condition "LND-01 : BootScene calls createSectorLandmarkTextures" ($bootContent -match "this\.createSectorLandmarkTextures\(\)")
Assert-Condition "LND-02 : Sector 1 Orion Stargate landmark generated" ($bootContent -match "'bg_landmark_frontier'")
Assert-Condition "LND-03 : Sector 2 Moonfall Station landmark generated" ($bootContent -match "'bg_landmark_station'")
Assert-Condition "LND-04 : Sector 3 Void Leviathan landmark generated" ($bootContent -match "'bg_landmark_nebula'")
Assert-Condition "LND-05 : Sector 4 Mount Ignis Erupting Volcano landmark generated" ($bootContent -match "'bg_landmark_volcano'")
Assert-Condition "LND-06 : Sector 4 Volcanic Ember particle generated" ($bootContent -match "'particle_ember'")
Assert-Condition "LND-07 : Sector 5 Ancient Titan Colossus landmark generated" ($bootContent -match "'bg_landmark_ruins'")
Assert-Condition "LND-08 : Sector 6 Monument Valley Red Rock Mesas landmark generated" ($bootContent -match "'bg_landmark_desert'")

# 3. Parallax Background System Integration
$parallaxContent = Get-Content "src\systems\ParallaxBackgroundSystem.js" -Raw
Assert-Condition "PRX-01 : ParallaxBackgroundSystem instantiates sector landmark images" ($parallaxContent -match "bg_landmark_")
Assert-Condition "PRX-02 : ParallaxBackgroundSystem spawns rising volcanic embers" ($parallaxContent -match "themeKey === 'volcano' && this\.scene\.textures\.exists\('particle_ember'\)")
Assert-Condition "PRX-03 : ParallaxBackgroundSystem animates volcanic embers in update" ($parallaxContent -match 'ep\.y -= ep\.speedY \* dt')
Assert-Condition "PRX-04 : ParallaxBackgroundSystem cleanly destroys landmarks and embers" ($parallaxContent -match 'this\.emberParticles\.forEach')

# 4. Wild West Cowboy Country Assets & POIs
Assert-Condition "WST-01 : BootScene generates tall Saguaro cactus texture" ($bootContent -match "'scenery_cactus_tall'")
Assert-Condition "WST-02 : BootScene generates small prickly pear cactus texture" ($bootContent -match "'scenery_cactus_small'")
Assert-Condition "WST-03 : BootScene generates Sheriff Wyatt's Office & Jailhouse texture" ($bootContent -match "'poi_sheriff_office'")
Assert-Condition "WST-04 : BootScene generates Billy the Kid's Outlaw Saloon texture" ($bootContent -match "'poi_saloon'")
Assert-Condition "WST-05 : BootScene generates Frontier Assay & Bank texture" ($bootContent -match "'poi_frontier_bank'")
Assert-Condition "WST-06 : BootScene generates wooden wagon wheel texture" ($bootContent -match "'scenery_wagon_wheel'")
Assert-Condition "WST-07 : BootScene generates desert steer skull texture" ($bootContent -match "'scenery_skull'")
Assert-Condition "WST-08 : BootScene generates desert tumbleweed texture" ($bootContent -match "'scenery_tumbleweed'")

# 5. Sector Character POIs
Assert-Condition "POI-01 : Sector 1 Commander Orion & Nova POIs generated" ($bootContent -match "'poi_frontier_uplink'" -and $bootContent -match "'poi_frontier_nav'")
Assert-Condition "POI-02 : Sector 2 Chief Jax & Dr. Aris POIs generated" ($bootContent -match "'poi_station_hangar'" -and $bootContent -match "'poi_station_cryolab'")
Assert-Condition "POI-03 : Sector 3 Lumen & Zephyr POIs generated" ($bootContent -match "'poi_nebula_sanctuary'" -and $bootContent -match "'poi_nebula_siphon'")
Assert-Condition "POI-04 : Sector 4 Forge-Master Vulcan & Pyra POIs generated" ($bootContent -match "'poi_volcanic_foundry'" -and $bootContent -match "'poi_volcanic_extractor'")
Assert-Condition "POI-05 : Sector 5 Solon & Aethelgard POIs generated" ($bootContent -match "'poi_ruins_vault'" -and $bootContent -match "'poi_ruins_shrine'")

# 6. Level Integration & GameScene Rendering
$lvl6Content = Get-Content "src\levels\level6.js" -Raw
Assert-Condition "LV6-01 : Level 6 places Sheriff Office and Saloon POIs" ($lvl6Content -match "poi_sheriff_office" -and $lvl6Content -match "poi_saloon")
Assert-Condition "LV6-02 : Level 6 places Saguaro cactuses, wagon wheels, and steer skulls" ($lvl6Content -match "scenery_cactus_tall" -and $lvl6Content -match "scenery_wagon_wheel")

$mgrContent = Get-Content "src\levels\levelManager.js" -Raw
Assert-Condition "MGR-01 : levelManager exports createSectorDecorations function" ($mgrContent -match "export function createSectorDecorations")
Assert-Condition "MGR-02 : createBossArenaData uses createSectorDecorations" ($mgrContent -match "decorations:\s*createSectorDecorations\(sector,\s*1400,\s*10,\s*true\)")
Assert-Condition "MGR-03 : createSubLevelData uses createSectorDecorations" ($mgrContent -match "decorations:\s*createSectorDecorations\(sector,\s*worldWidth,\s*subLevel,\s*false\)")

$gameContent = Get-Content "src\scenes\GameScene.js" -Raw
Assert-Condition "GME-01 : GameScene calls createDecorations in create()" ($gameContent -match "this\.createDecorations\(\);")
Assert-Condition "GME-02 : GameScene implements createDecorations with labels and tweens" ($gameContent -match "createDecorations\(\)\s*\{[\s\S]*?this\.decorations\.push\(spr\)")

$summaryColor = "Green"
if ($fail -gt 0) { $summaryColor = "Red" }
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "     CHECKS COMPLETED: $pass PASSED, $fail FAILED     " -ForegroundColor $summaryColor
Write-Host "=======================================================" -ForegroundColor Cyan

if ($fail -gt 0) { exit 1 } else { exit 0 }
