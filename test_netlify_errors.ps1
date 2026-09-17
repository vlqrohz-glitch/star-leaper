# test_netlify_errors.ps1
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$debugDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_debug_netlify"

$chromeProc = Start-Process $chromePath `
    -ArgumentList "--headless=new", "--remote-debugging-port=9224", "--user-data-dir=$debugDir", "https://starleaper.netlify.app" `
    -PassThru

Start-Sleep -Seconds 3

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9224/json"
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
    }

    Send-CDP "Runtime.enable"
    Send-CDP "Log.enable"
    Send-CDP "Network.enable"

    $buffer = New-Object byte[] 65536
    $timeout = [DateTime]::Now.AddSeconds(5)

    while ([DateTime]::Now -lt $timeout -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $segment = [System.ArraySegment[byte]]::new($buffer)
        $receiveTask = $ws.ReceiveAsync($segment, [System.Threading.CancellationToken]::None)
        if ($receiveTask.Wait(400)) {
            $res = $receiveTask.Result
            if ($res.Count -gt 0) {
                $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
                $lines = $text -split "\r?\n"
                foreach ($line in $lines) {
                    if ($line -match "exceptionThrown|Log\.entryAdded|console|error|failed" -and $line -notmatch "pushStart") {
                        Write-Host $line -ForegroundColor Red
                    }
                }
            }
        }
    }

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
}
