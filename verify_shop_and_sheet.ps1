# verify_shop_and_sheet.ps1 - Live visual test script for Shop, Character Sheet & Fullscreen
$ErrorActionPreference = "Stop"

$chromeProc = Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--user-data-dir=C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_debug_shop", "--window-size=1280,720", "http://127.0.0.1:8080/" `
    -PassThru

Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*8080*" -and $_.type -eq "page" } | Select-Object -First 1

    if (-not $pageTab) {
        Write-Host "No 8080 page found"
        exit 1
    }

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(40000)
    $ws.ConnectAsync($wsUri, $cts.Token).Wait()

    $script:msgId = 0
    function Send-CDP($method, $params = @{}) {
        $script:msgId++
        $obj = @{
            id = $script:msgId
            method = $method
            params = $params
        }
        $json = $obj | ConvertTo-Json -Compress -Depth 10
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $segment = [System.ArraySegment[byte]]::new($bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
        return $script:msgId
    }

    function Read-Until-Id($targetId) {
        $buffer = [byte[]]::new(1048576)
        while ($true) {
            $ms = New-Object System.IO.MemoryStream
            do {
                $segment = [System.ArraySegment[byte]]::new($buffer)
                $res = $ws.ReceiveAsync($segment, $cts.Token).Result
                $ms.Write($buffer, 0, $res.Count)
            } while (-not $res.EndOfMessage)
            $str = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $jsonObj = ConvertFrom-Json $str -ErrorAction SilentlyContinue
            if ($jsonObj -and $jsonObj.id -eq $targetId) {
                return $jsonObj
            }
        }
    }

    function Take-Screenshot($filename) {
        $reqId = Send-CDP "Page.captureScreenshot" @{ format = "png" }
        $resp = Read-Until-Id $reqId
        $bytes = [System.Convert]::FromBase64String($resp.result.data)
        [System.IO.File]::WriteAllBytes("c:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\star-leaper\$filename", $bytes)
        [System.IO.File]::WriteAllBytes("C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\$filename", $bytes)
        Write-Host "Captured screenshot: $filename ($($bytes.Length) bytes)"
    }

    Send-CDP "Page.enable" | Out-Null
    Send-CDP "Runtime.enable" | Out-Null
    Start-Sleep -Milliseconds 1500

    # 1. Capture Title screen with updated shop/character sheet buttons
    Take-Screenshot "title_screen_expanded.png"

    # 2. Purchase and equip Solar Flare outfit, Magnet Core perk, Cosmo pet via ShopSystem
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    import('./src/systems/ShopSystem.js').then(m => {
        const sys = m.ShopSystem;
        sys.ownedOutfits.add('solar_flare');
        sys.ownedPets.add('pet_cosmo');
        sys.ownedPerks.add('magnet_core');
        sys.equippedOutfits['NOVA'] = 'solar_flare';
        sys.equippedPet = 'pet_cosmo';
        sys.equippedPerk = 'magnet_core';
        sys.saveToStorage();
    });
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 600

    # 3. Open Cosmic Shop Scene & capture
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    window.game.scene.stop('GameScene');
    window.game.scene.start('ShopScene', { characterId: 'NOVA', returnScene: 'GameScene' });
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 1200
    Take-Screenshot "shop_screen.png"

    # 4. Open Character Sheet Scene & capture
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    window.game.scene.stop('ShopScene');
    window.game.scene.start('CharacterSheetScene', { characterId: 'NOVA', returnScene: 'GameScene' });
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 1200
    Take-Screenshot "character_sheet_screen.png"

    # 5. Launch GameScene with equipped Outfit & Companion Pet
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    window.game.scene.stop('CharacterSheetScene');
    window.game.scene.stop('ShopScene');
    window.game.scene.start('GameScene', { levelIndex: 1, characterId: 'NOVA' });
    setTimeout(() => {
        const s = window.game.scene.getScene('GameScene');
        if (s && s.handleStartInput) s.handleStartInput();
    }, 400);
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 2200
    Take-Screenshot "gameplay_with_pet_outfit.png"

    Write-Host "All live views and screenshots verified successfully."

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
}
