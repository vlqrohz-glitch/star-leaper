# capture_wild_west.ps1 - Automated Screenshot Capture for Wild West & Cheat System
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$serverUrl = "http://127.0.0.1:8080/"
$serverRunning = $false
try {
    $res = Invoke-WebRequest -Uri $serverUrl -TimeoutSec 2 -ErrorAction Stop
    if ($res.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "[OK] Star-Leaper local server running at $serverUrl" -ForegroundColor Green
    }
} catch {
    $serverRunning = $false
}

if (-not $serverRunning) {
    Write-Host "[INFO] Starting local server..." -ForegroundColor Yellow
    $serverProc = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$root\server.ps1`" -Port 8080" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

$debugPort = 9255
$tempDir = Join-Path $env:TEMP ("starleaper_west_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
}

$chromeArgs = @(
    "--headless=new",
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=$tempDir",
    "--window-size=1080,750",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    $serverUrl
)

Write-Host "[INFO] Launching headless Chrome on port $debugPort..." -ForegroundColor Cyan
$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru

$ws = $null
$pageTab = $null
$maxRetries = 15

for ($i = 1; $i -le $maxRetries; $i++) {
    Start-Sleep -Milliseconds 800
    try {
        $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 2 -ErrorAction Stop
        $pageTab = $tabs | Where-Object { $_.type -eq "page" -and ($_.url -like "*8080*" -or $_.url -like "*starleaper*") } | Select-Object -First 1
        if (-not $pageTab) {
            $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
        }
        if ($pageTab) {
            Write-Host "[OK] Connected to browser target: $($pageTab.title) ($($pageTab.url))" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "  ... waiting for Chrome CDP (attempt $i/$maxRetries)" -ForegroundColor Gray
    }
}

if (-not $pageTab) {
    Write-Host "[ERROR] Could not connect to Chrome CDP." -ForegroundColor Red
    if ($chromeProc -and -not $chromeProc.HasExited) { $chromeProc.Kill() }
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

try {
    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(60000)
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
        $buffer = [byte[]]::new(2097152)
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

    function Eval-JS($code) {
        $reqId = Send-CDP "Runtime.evaluate" @{ expression = $code; returnByValue = $true }
        $resp = Read-Until-Id $reqId
        if ($resp.result -and $resp.result.result) {
            return $resp.result.result.value
        }
        return $null
    }

    function Take-Screenshot($filename) {
        $reqId = Send-CDP "Page.captureScreenshot" @{ format = "png" }
        $resp = Read-Until-Id $reqId
        $bytes = [System.Convert]::FromBase64String($resp.result.data)
        $localPath = Join-Path $root $filename
        $artifactPath = Join-Path "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334" $filename
        [System.IO.File]::WriteAllBytes($localPath, $bytes)
        [System.IO.File]::WriteAllBytes($artifactPath, $bytes)
        Write-Host "  [SAVED] $filename" -ForegroundColor Green
    }

    # Wait for Phaser engine
    Write-Host "[INFO] Waiting for Phaser engine to initialize..." -ForegroundColor Cyan
    for ($j = 0; $j -lt 25; $j++) {
        Start-Sleep -Milliseconds 400
        $check = Eval-JS "Boolean(window.game && window.game.isBooted && window.game.scene)"
        if ($check -eq $true) {
            Write-Host "[OK] Game engine ready!" -ForegroundColor Green
            break
        }
    }

    Start-Sleep -Milliseconds 1500

    # 1. Cheat Terminal Modal View
    Write-Host "[1/4] Opening Cheat Terminal modal and redeeming YEEHAW..." -ForegroundColor Cyan
    Eval-JS @'
        const gs = window.game.scene.getScene('GameScene');
        if (gs && gs.uiSystem) {
            gs.uiSystem.showCheatTerminal();
            const input = document.getElementById('cheat-code-input');
            if (input) input.value = 'YEEHAW';
            const btn = document.getElementById('btn-cheat-submit');
            if (btn) btn.click();
        }
'@ | Out-Null
    Start-Sleep -Milliseconds 1200
    Take-Screenshot "cheat_terminal_modal.png"

    # Close cheat modal
    Eval-JS @'
        const gs = window.game.scene.getScene('GameScene');
        if (gs && gs.uiSystem) {
            gs.uiSystem.hideCheatTerminal();
        }
'@ | Out-Null
    Start-Sleep -Milliseconds 500

    # 2. Wild West Characters in CharacterSelectScene
    Write-Host "[2/4] Capturing Explorer Select with Sheriff Wyatt and Desperado Billy..." -ForegroundColor Cyan
    Eval-JS @'
        window.game.scene.start('CharacterSelectScene', { selectedId: 'WYATT' });
'@ | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "wild_west_characters_select.png"

    # 3. Wild West Pets in Cosmic Shop
    Write-Host "[3/4] Capturing Cosmic Shop with Mustang Spirit & Barnaby the Bear..." -ForegroundColor Cyan
    Eval-JS @'
        window.game.scene.start('ShopScene', { category: 'pets', characterId: 'WYATT' });
'@ | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Screenshot "wild_west_pets_horse_bear.png"

    # 4. Sector 6 Desert Biome Gameplay with Gunslingers & Dynamite Bandits
    Write-Host "[4/4] Starting Sector 6 Dust Devil Canyon with Wyatt & Mustang Spirit..." -ForegroundColor Cyan
    Eval-JS @'
        try {
            const ss = window.game.scene.getScene('ShopScene');
            if (ss && ss.shopSystem) {
                ss.shopSystem.equipItem({ id: 'pet_horse', category: 'pets' }, 'WYATT');
            }
        } catch(e) {}
        window.game.scene.stop('ShopScene');
        window.game.scene.stop('CharacterSelectScene');
        window.game.scene.start('GameScene', { levelIndex: 6, characterId: 'WYATT' });
'@ | Out-Null

    Start-Sleep -Milliseconds 2500

    # Ensure title overlay is hidden and player has action
    Eval-JS @'
        const gs = window.game.scene.getScene('GameScene');
        if (gs && gs.uiSystem) {
            if (gs.uiSystem.titleContainer) {
                gs.uiSystem.titleContainer.setVisible(false);
                gs.uiSystem.titleContainer.setAlpha(0);
            }
            gs.uiSystem.currentState = 'GAMEPLAY';
            gs.uiSystem.showGameplayHUD();
            gs.uiSystem.updateHUD();
            if (gs.player) {
                gs.player.setVelocityX(160);
            }
        }
'@ | Out-Null

    Start-Sleep -Milliseconds 1500
    Take-Screenshot "sector6_desert_biome.png"

    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Captured all Wild West & Cheat System visual artifacts!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.ClientWebSocket]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", [System.Threading.CancellationToken]::None).Wait()
    }
    if ($chromeProc -and -not $chromeProc.HasExited) {
        $chromeProc.Kill()
    }
    Start-Sleep -Milliseconds 500
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
