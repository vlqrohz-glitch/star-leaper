# test_netlify_fresh.ps1
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$freshDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_fresh_" + [Guid]::NewGuid().ToString("N")

$chromeProc = Start-Process $chromePath `
    -ArgumentList "--headless=new", "--incognito", "--remote-debugging-port=9225", "--user-data-dir=$freshDir", "https://starleaper.netlify.app?v=fresh" `
    -PassThru

Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9225/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*starleaper.netlify.app*" -and $_.type -eq "page" } | Select-Object -First 1

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(15000)
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

    Send-CDP "Runtime.enable" | Out-Null
    Send-CDP "Log.enable" | Out-Null
    Send-CDP "Network.enable" | Out-Null
    Send-CDP "Network.setCacheDisabled" @{ cacheDisabled = $true } | Out-Null

    Send-CDP "Page.reload" @{ ignoreCache = $true } | Out-Null

    $buffer = New-Object byte[] 65536
    $timeout = [DateTime]::Now.AddSeconds(6)

    while ([DateTime]::Now -lt $timeout -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $segment = [System.ArraySegment[byte]]::new($buffer)
        $receiveTask = $ws.ReceiveAsync($segment, [System.Threading.CancellationToken]::None)
        if ($receiveTask.Wait(400)) {
            $res = $receiveTask.Result
            if ($res.Count -gt 0) {
                $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
                $lines = $text -split "\r?\n"
                foreach ($line in $lines) {
                    if ($line -match "exceptionThrown|Log\.entryAdded|console" -and $line -notmatch "pushStart") {
                        Write-Host $line -ForegroundColor Yellow
                    }
                    if ($line -match "ResponseReceived" -and $line -match "(phaser|main)") {
                        Write-Host $line -ForegroundColor Cyan
                    }
                }
            }
        }
    }

    # Check canvas and Phaser state in DOM
    $evalId = Send-CDP "Runtime.evaluate" @{ expression = "({ title: document.title, phaserLoaded: typeof Phaser !== 'undefined', gameLoaded: typeof window.game !== 'undefined', canvasCount: document.querySelectorAll('canvas').length, activeScene: window.game ? window.game.scene.scenes.map(s => s.scene.key) : [] })" }
    
    $timeout2 = [DateTime]::Now.AddSeconds(3)
    while ([DateTime]::Now -lt $timeout2) {
        $segment = [System.ArraySegment[byte]]::new($buffer)
        $receiveTask = $ws.ReceiveAsync($segment, [System.Threading.CancellationToken]::None)
        if ($receiveTask.Wait(300)) {
            $res = $receiveTask.Result
            if ($res.Count -gt 0) {
                $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
                if ($text -match "result") {
                    Write-Host "DOM EVALUATION:" -ForegroundColor Green
                    Write-Host $text -ForegroundColor Green
                }
            }
        }
    }

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -Path $freshDir -Recurse -Force -ErrorAction SilentlyContinue
}
