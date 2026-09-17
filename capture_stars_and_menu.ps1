# capture_stars_and_menu.ps1 - Resilient Automated Screenshot Capture for Star-Leaper
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# 1. Verify / Start Local Web Server on Port 8080
$serverUrl = "http://127.0.0.1:8080/"
$serverRunning = $false
try {
    $res = Invoke-WebRequest -Uri $serverUrl -TimeoutSec 2 -ErrorAction Stop
    if ($res.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "[OK] Star-Leaper local server is running at $serverUrl" -ForegroundColor Green
    }
} catch {
    $serverRunning = $false
}

if (-not $serverRunning) {
    Write-Host "[INFO] Starting local Star-Leaper server on port 8080..." -ForegroundColor Yellow
    $serverProc = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$root\server.ps1`" -Port 8080" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# 2. Pick a dedicated, non-conflicting debug port and fresh temp profile
$debugPort = 9244
$tempDir = Join-Path $env:TEMP ("starleaper_chrome_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "[INFO] Launching headless Chrome on debug port $debugPort..." -ForegroundColor Cyan
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
    "--disable-background-networking",
    "--disable-component-update",
    $serverUrl
)

$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru

# 3. Poll for Chrome DevTools Protocol endpoint
$ws = $null
$pageTab = $null
$maxRetries = 15
Write-Host "[INFO] Connecting to Chrome DevTools Protocol..." -ForegroundColor Cyan

for ($i = 1; $i -le $maxRetries; $i++) {
    Start-Sleep -Milliseconds 800
    try {
        $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 2 -ErrorAction Stop
        # Look for the 8080 page or any page tab
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
    Write-Host "[ERROR] Could not connect to Chrome on port $debugPort. Check if Chrome can launch." -ForegroundColor Red
    if ($chromeProc -and -not $chromeProc.HasExited) { $chromeProc.Kill() }
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

try {
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

    # Navigate to 8080 if not already there
    if ($pageTab.url -notlike "*8080*") {
        Write-Host "[INFO] Navigating target to $serverUrl..." -ForegroundColor Cyan
        $navId = Send-CDP "Page.navigate" @{ url = $serverUrl }
        Read-Until-Id $navId | Out-Null
    }

    # Wait for Game and Phaser to be ready
    Write-Host "[INFO] Waiting for Phaser engine to initialize..." -ForegroundColor Cyan
    $booted = $false
    for ($j = 0; $j -lt 25; $j++) {
        Start-Sleep -Milliseconds 400
        $check = Eval-JS "Boolean(window.game && window.game.isBooted && window.game.scene)"
        if ($check -eq $true) {
            $booted = $true
            Write-Host "[OK] Game engine fully initialized!" -ForegroundColor Green
            break
        }
    }

    if (-not $booted) {
        Write-Host "[WARN] Engine took long to boot, proceeding with capture..." -ForegroundColor Yellow
    }

    Start-Sleep -Milliseconds 1200

    # 1. Start Sector Alpha
    Write-Host "[1/3] Starting Sector Alpha..." -ForegroundColor Cyan
    Eval-JS "window.game.scene.start('GameScene', { levelIndex: 1, characterId: 'NOVA' })" | Out-Null
    Start-Sleep -Milliseconds 1200

    # 2. Trigger Level Complete with 3-Star Performance
    Write-Host "[2/3] Simulating 3-Star Level Complete..." -ForegroundColor Cyan
    Eval-JS @"
        const gs = window.game.scene.getScene('GameScene');
        if (gs) {
            if (gs.uiSystem && gs.uiSystem.isTitleActive()) {
                gs.handleStartInput();
            }
            if (gs.levelCompletionSystem) {
                gs.levelCompletionSystem.completeLevel({
                    score: 2850,
                    crystalsCollected: 20,
                    crystalsTotal: 20,
                    enemiesDefeated: 5,
                    enemiesTotal: 5,
                    healthRemaining: 3,
                    livesRemaining: 3
                });
            }
        }
"@ | Out-Null

    Start-Sleep -Milliseconds 1500
    Take-Screenshot "level_complete_3stars_choice.png"

    # 3. View Sector Select Scene with saved stars
    Write-Host "[3/3] Inspecting Sector Select Scene stars badge..." -ForegroundColor Cyan
    Eval-JS "window.game.scene.start('LevelSelectScene', { characterId: 'NOVA' })" | Out-Null
    Start-Sleep -Milliseconds 1000
    Take-Screenshot "level_select_stars_view.png"

    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Captured Star-Leaper Level Complete & Stars View!" -ForegroundColor Green
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
