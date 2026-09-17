# test_netlify_live.ps1 - Inspect https://starleaper.netlify.app
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$debugDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_debug_netlify"

$chromeProc = Start-Process $chromePath `
    -ArgumentList "--headless=new", "--remote-debugging-port=9223", "--user-data-dir=$debugDir", "https://starleaper.netlify.app" `
    -PassThru

Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9223/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*starleaper.netlify.app*" -and $_.type -eq "page" } | Select-Object -First 1

    if (-not $pageTab) {
        Write-Host "No Netlify tab found. Available tabs:"
        $tabs | ForEach-Object { Write-Host " - $($_.url)" }
        exit 1
    }

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

    function Read-CDPMessages($waitSec = 3) {
        $buffer = New-Object byte[] 65536
        $timeout = [DateTime]::Now.AddSeconds($waitSec)
        while ([DateTime]::Now -lt $timeout -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $segment = [System.ArraySegment[byte]]::new($buffer)
            $receiveTask = $ws.ReceiveAsync($segment, [System.Threading.CancellationToken]::None)
            if ($receiveTask.Wait(500)) {
                $res = $receiveTask.Result
                if ($res.Count -gt 0) {
                    $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
                    Write-Host $text
                }
            }
        }
    }

    Send-CDP "Console.enable" | Out-Null
    Send-CDP "Runtime.enable" | Out-Null
    Send-CDP "Log.enable" | Out-Null
    Send-CDP "Network.enable" | Out-Null

    Send-CDP "Page.reload" | Out-Null

    Write-Host "--- Reading Console & Network Logs ---"
    Read-CDPMessages 4

    Send-CDP "Runtime.evaluate" @{ expression = "({ title: document.title, phaserLoaded: typeof Phaser !== 'undefined', gameExists: typeof window.game !== 'undefined', canvasCount: document.querySelectorAll('canvas').length })" } | Out-Null
    Read-CDPMessages 2

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
}
