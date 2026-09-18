# validate_inventory_slots.ps1
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

Write-Host "`n=== Validating 9-Slot Inventory System & Keybinds (1-9 & I) ===" -ForegroundColor Cyan

$inventoryConfig = Get-Content "src/config/inventoryConfig.js" -Raw
$inputSystem = Get-Content "src/systems/InputSystem.js" -Raw
$uiSystem = Get-Content "src/systems/UISystem.js" -Raw
$gameScene = Get-Content "src/scenes/GameScene.js" -Raw
$playerBullet = Get-Content "src/entities/PlayerBullet.js" -Raw
$bootScene = Get-Content "src/scenes/BootScene.js" -Raw
$weaponPickup = Get-Content "src/entities/WeaponPickup.js" -Raw
$indexHtml = Get-Content "index.html" -Raw

# 1. Inventory Catalog Configuration (9 Slots)
Assert-Check "INV-01" "inventoryConfig.js exports INVENTORY_CATALOG with all 9 weapon slots" `
    ((Test-Path "src/config/inventoryConfig.js") -and `
     ($inventoryConfig -match "slot:\s*1") -and ($inventoryConfig -match "REVOLVER") -and `
     ($inventoryConfig -match "slot:\s*2") -and ($inventoryConfig -match "PLASMA_BLASTER") -and `
     ($inventoryConfig -match "slot:\s*3") -and ($inventoryConfig -match "PHOTON_RIFLE") -and `
     ($inventoryConfig -match "slot:\s*4") -and ($inventoryConfig -match "DYNAMITE_LAUNCHER") -and `
     ($inventoryConfig -match "slot:\s*5") -and ($inventoryConfig -match "SHOTGUN") -and `
     ($inventoryConfig -match "slot:\s*6") -and ($inventoryConfig -match "AEGIS_BLASTER") -and `
     ($inventoryConfig -match "slot:\s*7") -and ($inventoryConfig -match "CHRONO_WARP") -and `
     ($inventoryConfig -match "slot:\s*8") -and ($inventoryConfig -match "HYPER_LASER") -and `
     ($inventoryConfig -match "slot:\s*9") -and ($inventoryConfig -match "CLUSTER_BOMB"))

# 2. Input System Keybinds & Methods
Assert-Check "INV-02" "InputSystem.js binds I key for inventory and defines slotKeys array (ONE to NINE)" `
    (($inputSystem -match "inventory:\s*Phaser\.Input\.Keyboard\.KeyCodes\.I") -and `
     ($inputSystem -match "this\.slotKeys") -and `
     ($inputSystem -match "KeyCodes\.ONE") -and ($inputSystem -match "KeyCodes\.NINE"))

Assert-Check "INV-03" "InputSystem.js implements isInventoryJustPressed() and getJustPressedSlot()" `
    (($inputSystem -match "isInventoryJustPressed\(\)") -and ($inputSystem -match "getJustPressedSlot\(\)"))

# 3. UI System Inventory Modal
Assert-Check "INV-04" "UISystem.js imports INVENTORY_CATALOG and calls createInventoryModal() in initialize()" `
    (($uiSystem -match "INVENTORY_CATALOG") -and ($uiSystem -match "this\.createInventoryModal\(\)"))

Assert-Check "INV-05" "UISystem.js creates 9-card weapon arsenal modal with number badges and status pills" `
    (($uiSystem -match "createInventoryModal\(\)") -and ($uiSystem -match "this\.inventoryCardElements") -and ($uiSystem -match "badgeText") -and ($uiSystem -match "● EQUIPPED"))

Assert-Check "INV-06" "UISystem.js implements showInventory, hideInventory, toggleInventory, isInventoryActive, and refreshInventoryCards" `
    (($uiSystem -match "showInventory\(\)") -and ($uiSystem -match "hideInventory\(\)") -and ($uiSystem -match "toggleInventory\(\)") -and `
     ($uiSystem -match "isInventoryActive\(\)") -and ($uiSystem -match "refreshInventoryCards\(\)"))

Assert-Check "INV-07" "UISystem.js HUD displays INV [I] button and interactive weapon readout with slot number" `
    (($uiSystem -match "INV \[I\]") -and ($uiSystem -match "hudWeaponText") -and ($uiSystem -match "WEAPON:\s*\[\$\{slotNum\}"))

# 4. GameScene Keybinds & Execution
Assert-Check "INV-08" "GameScene.js binds I key and 1-9 number keys for direct weapon slot equip" `
    (($gameScene -match "addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.I\)") -and `
     ($gameScene -match "slotKeyCodes") -and `
     ($gameScene -match "this\.equipWeaponBySlot\(idx \+ 1\)"))

Assert-Check "INV-09" "GameScene.js implements equipWeaponBySlot(slot) with player setWeapon and HUD update" `
    (($gameScene -match "equipWeaponBySlot\(slot\)") -and `
     ($gameScene -match "this\.player\.setWeapon\(item\.id\)") -and `
     ($gameScene -match "this\.uiSystem\.refreshInventoryCards"))

Assert-Check "INV-10" "GameScene.js implements toggleInventory() and updates ESC handler to dismiss modal" `
    (($gameScene -match "toggleInventory\(\)") -and `
     ($gameScene -match "this\.uiSystem\.isInventoryActive\(\)") -and `
     ($gameScene -match "this\.uiSystem\.hideInventory\(\)"))

# 5. High Damage Combat & Weapon Centering
Assert-Check "INV-11" "PlayerBullet.js scales damage for high impact (12-60 HP) across all 9 weapons" `
    (($playerBullet -match "damage:\s*12") -and ($playerBullet -match "damage:\s*40") -and `
     ($playerBullet -match "damage:\s*50") -and ($playerBullet -match "damage:\s*60"))

Assert-Check "INV-12" "GameScene.js spawns damage popups on bullet enemy and boss hits" `
    (($gameScene -match "spawnDamagePopup\(enemy\.x") -and ($gameScene -match "spawnDamagePopup\(boss\.x") -and ($gameScene -match "spawnDamagePopup\(x, y, amount"))

Assert-Check "INV-13" "WeaponPickup.js centers gun inside circle and locks position with preUpdate" `
    (($weaponPickup -match "preUpdate\(time, delta\)") -and ($weaponPickup -match "this\.halo\.setPosition") -and ($weaponPickup -match "setOrigin\(0\.5,\s*0\.5\)"))

# 6. HTML Integration
Assert-Check "INV-14" "index.html includes INV [I] button in header, virtual touch gamepad, and keybind badges" `
    (($indexHtml -match "inventory-btn") -and ($indexHtml -match "btn-touch-inventory") -and `
     ($indexHtml -match "Inv: <span class=.key-badge.>I</span>") -and ($indexHtml -match "Weapons: <span class=.key-badge.>1-9</span>"))

$failed = $script:testResults | Where-Object { -not $_.Passed }
if ($failed.Count -gt 0) {
    Write-Error "$($failed.Count) checks failed in Inventory Slots test suite!"
} else {
    Write-Host "`n>>> ALL 14 CHECKS PASSED IN 9-SLOT INVENTORY SUITE! <<<" -ForegroundColor Green
}
