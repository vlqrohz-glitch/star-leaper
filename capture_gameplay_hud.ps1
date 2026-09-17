# capture_gameplay_hud.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$serverUrl = "http://127.0.0.1:8080/"
$debugPort = 9258
$tempDir = Join-Path $env:TEMP ("starleaper_hud_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
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

try {
    $ws = $null
    $pageTab = $null
    for ($i = 1; $i -le 15; $i++) {
        Start-Sleep -Milliseconds 700
        try {
            $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 2 -ErrorAction Stop
            $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
            if ($pageTab) { break }
        } catch {}
    }

    if (-not $pageTab) {
        Write-Host "Could not connect to Chrome on port $debugPort"
        exit 1
    }

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(35000)
    $ws.ConnectAsync($wsUri, $cts.Token).Wait()

    $script:msgId = 0
    function Send-CDP($method, $params = @{}) {
        $script:msgId++
        $obj = @{ id = $script:msgId; method = $method; params = $params }
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
        if ($resp.result -and $resp.result.result) { return $resp.result.result.value }
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

    Start-Sleep -Seconds 2

    # 1. Start gameplay
    Write-Host "Starting gameplay..."
    Eval-JS "window.game.scene.getScene('GameScene').handleStartInput()" | Out-Null
    Start-Sleep -Milliseconds 1200
    Take-Screenshot "gameplay_clean_hud_buttons.png"

    # 2. Click in-game Settings button
    Write-Host "Clicking in-game Settings button..."
    Eval-JS "window.game.scene.getScene('GameScene').uiSystem.showSettings()" | Out-Null
    Start-Sleep -Milliseconds 800
    Take-Screenshot "gameplay_settings_opened.png"

    # 3. Close Settings and click in-game Pause button
    Write-Host "Closing settings and clicking in-game Pause button..."
    Eval-JS "window.game.scene.getScene('GameScene').uiSystem.hideSettings()" | Out-Null
    Start-Sleep -Milliseconds 300
    Eval-JS "window.game.scene.getScene('GameScene').togglePause()" | Out-Null
    Start-Sleep -Milliseconds 800
    Take-Screenshot "gameplay_paused_view.png"

    Write-Host "All gameplay HUD screenshots captured successfully!"

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
