# test_remote_netlify.ps1
$ErrorActionPreference = "Stop"

$debugPort = 9277
$tempDir = Join-Path $env:TEMP ("starleaper_netcheck_" + (Get-Random))
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
    "https://starleaper.netlify.app"
)

$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru

try {
    Start-Sleep -Seconds 3
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 3
    $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(30000)
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
            if ($jsonObj -and $jsonObj.id -eq $targetId) { return $jsonObj }
        }
    }

    function Eval-JS($code) {
        $reqId = Send-CDP "Runtime.evaluate" @{ expression = $code; returnByValue = $true }
        $resp = Read-Until-Id $reqId
        if ($resp.result -and $resp.result.result) { return $resp.result.result.value }
        return $null
    }

    Start-Sleep -Seconds 4

    $booted = Eval-JS "Boolean(window.game && window.game.isBooted)"
    $sceneActive = Eval-JS "Boolean(window.game && window.game.scene && window.game.scene.isActive('GameScene'))"
    Write-Host "Netlify live check: Booted=$booted, GameSceneActive=$sceneActive"

    $reqId = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $resp = Read-Until-Id $reqId
    $bytes = [System.Convert]::FromBase64String($resp.result.data)
    $artifactPath = Join-Path "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334" "netlify_public_check.png"
    [System.IO.File]::WriteAllBytes($artifactPath, $bytes)
    Write-Host "[SAVED] netlify_public_check.png"
} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) { $chromeProc.Kill() }
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
