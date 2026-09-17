# capture_domain_screen.ps1 - Capture Title Screen with starleaper.io domain pill
$ErrorActionPreference = "Stop"

$chromeProc = Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--user-data-dir=C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_debug_domain", "--window-size=1280,750", "http://127.0.0.1:8080/" `
    -PassThru

Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*8080*" -and $_.type -eq "page" } | Select-Object -First 1

    if (-not $pageTab) {
        Write-Host "No 8080 page found"
        exit 1
    }

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
    Start-Sleep -Milliseconds 1200

    $reqId = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $resp = Read-Until-Id $reqId
    $bytes = [System.Convert]::FromBase64String($resp.result.data)
    [System.IO.File]::WriteAllBytes("c:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\star-leaper\starleaper_domain_screen.png", $bytes)
    [System.IO.File]::WriteAllBytes("C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\starleaper_domain_screen.png", $bytes)
    Write-Host "Captured starleaper_domain_screen.png ($($bytes.Length) bytes)"

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
}
