# capture_sector_landmarks_and_bullets.ps1
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$serverUrl = "http://127.0.0.1:8080/"
$debugPort = 9255
$tempDir = Join-Path $env:TEMP ("starleaper_landmarks_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
}

$chromeArgs = @(
    "--headless=new",
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=$tempDir",
    "--window-size=1100,750",
    "--no-first-run",
    "--no-default-browser-check",
    $serverUrl
)

$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru
Start-Sleep -Seconds 3

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

    Send-CDP "Runtime.enable" | Out-Null
    Send-CDP "Page.enable" | Out-Null

    function Eval-JS($expr) {
        $res = Send-CDP "Runtime.evaluate" @{ expression = $expr; returnByValue = $true }
        if ($res.result.exceptionDetails) {
            Write-Warning "JS Error: $($res.result.exceptionDetails.exception.description)"
        }
        return $res.result.value
    }

    function Capture-Screenshot($path) {
        $res = Send-CDP "Page.captureScreenshot" @{ format = "png" }
        $bytes = [System.Convert]::FromBase64String($res.result.data)
        [System.IO.File]::WriteAllBytes($path, $bytes)
        Write-Host "[SAVED] Screenshot -> $path" -ForegroundColor Green
    }

    Start-Sleep -Seconds 2

    # Dismiss Title Screen and jump to Sector 6 (Wild West)
    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s) {
            s.scene.restart({ levelIndex: 6, subLevel: 1, characterId: 'outlaw' });
        }
    })();
"@
    Start-Sleep -Milliseconds 1600

    # Ensure title screen overlay is hidden on restarted scene
    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s && s.uiSystem) {
            if (s.uiSystem.titleContainer) {
                s.uiSystem.titleContainer.setVisible(false);
                s.uiSystem.titleContainer.setAlpha(0);
            }
            s.uiSystem.currentState = 'GAMEPLAY';
            s.uiSystem.showGameplayHUD();
        }
    })();
"@
    Start-Sleep -Milliseconds 1000

    # 1. Capture Wild West Sector View
    $artDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\2f107b3e-d705-4380-ab01-2eed708b9c2f"
    $shotWest = Join-Path $artDir "wild_west_cowboy_sector_view.png"
    Capture-Screenshot $shotWest
    Copy-Item $shotWest (Join-Path $root "wild_west_cowboy_sector_view.png") -Force

    # 2. Fire Straight Horizontal Bullets towards enemies
    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s && s.player) {
            s.player.setWeapon('PHOTON_RIFLE');
            s.player.attack();
            s.time.delayedCall(90, () => s.player.attack());
        }
    })();
"@
    Start-Sleep -Milliseconds 120
    $shotBullets = Join-Path $artDir "straight_horizontal_bullets_view.png"
    Capture-Screenshot $shotBullets
    Copy-Item $shotBullets (Join-Path $root "straight_horizontal_bullets_view.png") -Force

    # 3. Switch to Sector 4: Volcanic Caldera with Mount Ignis Eruption
    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s) {
            s.scene.restart({ levelIndex: 4, subLevel: 1, characterId: 'nova' });
        }
    })();
"@
    Start-Sleep -Milliseconds 1600

    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s && s.uiSystem) {
            if (s.uiSystem.titleContainer) {
                s.uiSystem.titleContainer.setVisible(false);
                s.uiSystem.titleContainer.setAlpha(0);
            }
            s.uiSystem.currentState = 'GAMEPLAY';
            s.uiSystem.showGameplayHUD();
        }
    })();
"@
    Start-Sleep -Milliseconds 1000

    $shotVolcano = Join-Path $artDir "volcano_erupting_background_view.png"
    Capture-Screenshot $shotVolcano
    Copy-Item $shotVolcano (Join-Path $root "volcano_erupting_background_view.png") -Force

    # 4. Switch to Sector 1: Celestial Frontier with Orion Stargate
    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s) {
            s.scene.restart({ levelIndex: 1, subLevel: 1, characterId: 'nova' });
        }
    })();
"@
    Start-Sleep -Milliseconds 1600

    Eval-JS @"
    (() => {
        const g = window.game;
        if (!g) return;
        const s = g.scene.getScene('GameScene');
        if (s && s.uiSystem) {
            if (s.uiSystem.titleContainer) {
                s.uiSystem.titleContainer.setVisible(false);
                s.uiSystem.titleContainer.setAlpha(0);
            }
            s.uiSystem.currentState = 'GAMEPLAY';
            s.uiSystem.showGameplayHUD();
        }
    })();
"@
    Start-Sleep -Milliseconds 1000

    $shotFrontier = Join-Path $artDir "celestial_frontier_stargate_view.png"
    Capture-Screenshot $shotFrontier
    Copy-Item $shotFrontier (Join-Path $root "celestial_frontier_stargate_view.png") -Force

    Write-Host "`nAll 4 verification screenshots captured successfully!" -ForegroundColor Green

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
