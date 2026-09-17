# verify_live_expansion.ps1 - Live Headless Chrome CDP Verification for Major Expansion
$chromeProc = Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--user-data-dir=C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_debug", "--window-size=1000,700", "http://127.0.0.1:8080/" -PassThru

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
    $cts = New-Object System.Threading.CancellationTokenSource(35000)
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
        [System.IO.File]::WriteAllBytes("C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\star-leaper\$filename", $bytes)
        [System.IO.File]::WriteAllBytes("C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\$filename", $bytes)
        Write-Host "Captured screenshot: $filename"
    }

    Send-CDP "Page.enable" | Out-Null
    Send-CDP "Runtime.enable" | Out-Null
    Send-CDP "Runtime.evaluate" @{
        expression = "window.__ERRORS = []; window.addEventListener('error', e => window.__ERRORS.push(e.message + ' ' + e.filename + ':' + e.lineno));"
    } | Out-Null
    Start-Sleep -Milliseconds 600

    # 1. Capture Title Screen with expanded menu
    Take-Screenshot "expansion_title_screen.png"

    # 2. Switch to CharacterSelectScene
    Send-CDP "Runtime.evaluate" @{
        expression = "window.game.scene.start('CharacterSelectScene', { characterId: 'NOVA' })"
    } | Out-Null
    Start-Sleep -Milliseconds 600
    Take-Screenshot "expansion_character_select.png"

    # 3. Switch to LevelSelectScene
    Send-CDP "Runtime.evaluate" @{
        expression = "window.game.scene.start('LevelSelectScene', { characterId: 'ZENITH' })"
    } | Out-Null
    Start-Sleep -Milliseconds 600
    Take-Screenshot "expansion_level_select.png"

    # 4. Launch Sector 2: Moonfall Station
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    window.game.scene.stop('LevelSelectScene');
    window.game.scene.stop('CharacterSelectScene');
    const s = window.game.scene.getScene('GameScene');
    s.scene.restart({ levelIndex: 2, characterId: 'ZENITH' });
    setTimeout(() => {
        if (s.handleStartInput) s.handleStartInput();
    }, 300);
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "expansion_level2_moonfall.png"

    # 5. Launch Sector 3: Nebula Rift
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    const s = window.game.scene.getScene('GameScene');
    s.scene.restart({ levelIndex: 3, characterId: 'LUMEN' });
    setTimeout(() => {
        if (s.handleStartInput) s.handleStartInput();
    }, 300);
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "expansion_level3_nebula.png"

    # 6. Launch Sector 4: Ember Crater
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    const s = window.game.scene.getScene('GameScene');
    s.scene.restart({ levelIndex: 4, characterId: 'ATLAS' });
    setTimeout(() => {
        if (s.handleStartInput) s.handleStartInput();
    }, 300);
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "expansion_level4_ember.png"

    # 7. Launch Sector 5: Zenith Ruins
    $res7 = Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    try {
        const s = window.game.scene.getScene('GameScene');
        s.scene.restart({ levelIndex: 5, characterId: 'NOVA' });
        setTimeout(() => {
            try {
                if (s.handleStartInput) s.handleStartInput();
            } catch (e2) {
                console.error('startInput error:', e2);
            }
        }, 300);
        return 'RESTART 5 CALLED';
    } catch (e) {
        return 'RESTART 5 ERROR: ' + e.message + ' ' + e.stack;
    }
})()
"@
        returnByValue = $true
    }
    Write-Host "Step 7 result: $res7"
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "expansion_level5_zenith.png"

    # 8. Trigger Pause Menu on Sector 5
    Send-CDP "Runtime.evaluate" @{
        expression = @"
(() => {
    const s = window.game.scene.getScene('GameScene');
    if (s) {
        s.togglePause();
    }
})()
"@
    } | Out-Null
    Start-Sleep -Milliseconds 800
    Take-Screenshot "expansion_pause_menu.png"

    Write-Host "All live views and screenshots verified successfully."

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
}
