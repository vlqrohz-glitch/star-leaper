# capture_netlify_live.ps1 - Take screenshot of live netlify site
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outPng = Join-Path $PSScriptRoot "live_verified.png"
$freshDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_scr_" + [Guid]::NewGuid().ToString("N")

$chromeProc = Start-Process $chromePath `
    -ArgumentList "--headless=new", "--incognito", "--remote-debugging-port=9227", "--window-size=1280,750", "--user-data-dir=$freshDir", "https://starleaper.netlify.app" `
    -PassThru

Start-Sleep -Seconds 5

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9227/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*starleaper.netlify.app*" -and $_.type -eq "page" } | Select-Object -First 1

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(25000)
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

    Send-CDP "Page.enable" | Out-Null
    Send-CDP "Runtime.enable" | Out-Null

    Start-Sleep -Seconds 4

    $evalId = Send-CDP "Runtime.evaluate" @{ expression = "JSON.stringify({ canvas: document.querySelectorAll('canvas').length, phaser: typeof Phaser, game: typeof window.game, scenes: window.game ? window.game.scene.scenes.map(s => s.scene.key) : [] })" }
    $evalResp = Read-Until-Id $evalId
    Write-Host "DOM EVALUATION: $($evalResp.result.result.value)" -ForegroundColor Cyan

    $reqId = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $resp = Read-Until-Id $reqId
    $bytes = [System.Convert]::FromBase64String($resp.result.data)
    [System.IO.File]::WriteAllBytes($outPng, $bytes)
    Write-Host "Captured Netlify Screenshot: $outPng ($($bytes.Length) bytes)" -ForegroundColor Green

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -Path $freshDir -Recurse -Force -ErrorAction SilentlyContinue
}
