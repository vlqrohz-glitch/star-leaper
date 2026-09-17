# capture_scoreboard_and_combat.ps1 - Resilient Automated Captures for Star-Leaper
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$serverUrl = "http://127.0.0.1:8080/"
$debugPort = 9248
$tempDir = Join-Path $env:TEMP ("starleaper_cap_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
}

$chromeArgs = @(
    "--headless=new",
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=$tempDir",
    "--window-size=1000,700",
    "--no-first-run",
    "--no-default-browser-check",
    $serverUrl
)

$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru
Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 5
    $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    Write-Host "[OK] Connected to browser tab: $($pageTab.title)" -ForegroundColor Green

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(60000)
    $ws.ConnectAsync([System.Uri]$pageTab.webSocketDebuggerUrl, $cts.Token).Wait()

    $script:msgId = 0
    function Send-CDP($method, $params = @{}) {
        $script:msgId++
        $body = @{
            id = $script:msgId
            method = $method
            params = $params
        } | ConvertTo-Json -Compress -Depth 10
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        $buffer = [byte[]]::new(2097152)
        while ($true) {
            $ms = New-Object System.IO.MemoryStream
            do {
                $res = $ws.ReceiveAsync([System.ArraySegment[byte]]::new($buffer), $cts.Token).Result
                $ms.Write($buffer, 0, $res.Count)
            } while (-not $res.EndOfMessage)
            $str = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $json = ConvertFrom-Json $str -ErrorAction SilentlyContinue
            if ($json -and $json.id -eq $script:msgId) {
                return $json
            }
        }
    }

    function Eval-JS($code) {
        $resp = Send-CDP "Runtime.evaluate" @{ expression = $code; returnByValue = $true }
        if ($resp.result -and $resp.result.result) {
            return $resp.result.result.value
        }
        return $null
    }

    function Take-Shot($filename) {
        $resp = Send-CDP "Page.captureScreenshot" @{ format = "png" }
        $bytes = [System.Convert]::FromBase64String($resp.result.data)
        $localPath = Join-Path $root $filename
        $artifactPath = Join-Path "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334" $filename
        [System.IO.File]::WriteAllBytes($localPath, $bytes)
        [System.IO.File]::WriteAllBytes($artifactPath, $bytes)
        Write-Host "  [SAVED] $filename ($($bytes.Length) bytes)" -ForegroundColor Green
    }

    # Wait for game initialization
    Write-Host "[INFO] Waiting for Phaser game engine..." -ForegroundColor Cyan
    for ($i = 0; $i -lt 25; $i++) {
        Start-Sleep -Milliseconds 400
        $booted = Eval-JS "Boolean(window.game && window.game.isBooted)"
        if ($booted -eq $true) { break }
    }
    Start-Sleep -Milliseconds 1000

    # 1. Gameplay with Health Bar and F-Key Combat
    Write-Host "[1/3] Setting up Active Gameplay with Overhead Health Bar & Combat..." -ForegroundColor Cyan
    Eval-JS "window.game.scene.start('GameScene', { levelIndex: 1, characterId: 'NOVA' })" | Out-Null
    Start-Sleep -Milliseconds 1200
    Eval-JS @"
        (function() {
            const gs = window.game.scene.getScene('GameScene');
            if (gs) {
                if (gs.uiSystem && gs.uiSystem.isTitleActive()) {
                    gs.handleStartInput();
                }
                if (gs.player) {
                    gs.player.setWeapon('REVOLVER');
                    gs.player.attack();
                }
            }
        })()
"@ | Out-Null
    Start-Sleep -Milliseconds 600
    Take-Shot "player_healthbar_weapon_combat.png"

    # 2. Scoreboard Modal Overlay
    Write-Host "[2/3] Opening Galactic Scoreboard & Leaderboard..." -ForegroundColor Cyan
    $scbRes = Eval-JS @"
        (function() {
            const gs = window.game.scene.getScene('GameScene');
            if (gs && gs.uiSystem) {
                gs.uiSystem.showScoreboard();
                return gs.uiSystem.isScoreboardActive();
            }
            return false;
        })()
"@
    Write-Host "  Scoreboard active: $scbRes" -ForegroundColor Cyan
    Start-Sleep -Milliseconds 800
    Take-Shot "scoreboard_overlay.png"

    # 3. Cosmic Shop Inventory Tab with 2D Scrollbars
    Write-Host "[3/3] Opening Cosmic Shop Inventory Tab with 2D Scrollbars..." -ForegroundColor Cyan
    Eval-JS @"
        (function() {
            const gs = window.game.scene.getScene('GameScene');
            if (gs && gs.uiSystem) {
                gs.uiSystem.hideScoreboard();
            }
            if (gs && gs.scene) {
                gs.scene.start('ShopScene', { characterId: 'NOVA', category: 'INVENTORY' });
            } else {
                window.game.scene.start('ShopScene', { characterId: 'NOVA', category: 'INVENTORY' });
            }
        })()
"@ | Out-Null
    Start-Sleep -Milliseconds 1500
    Take-Shot "shop_inventory_scrollbars.png"

    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Captured Scoreboard, Combat & Inventory Screens!" -ForegroundColor Green
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
