# capture_modal_fixed.ps1
$ErrorActionPreference = "Stop"

$debugPort = 9289
$tempDir = Join-Path $env:TEMP ("starleaper_modal_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromeArgs = @("--headless=new", "--remote-debugging-port=$debugPort", "--user-data-dir=$tempDir", "--window-size=1080,750", "http://127.0.0.1:8080/")
$proc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru

Start-Sleep -Seconds 3
try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(25000)
    $ws.ConnectAsync([System.Uri]$pageTab.webSocketDebuggerUrl, $cts.Token).Wait()
    
    $script:id = 0
    function Send-CDP($method, $params = @{}) {
        $script:id++
        $json = @{ id = $script:id; method = $method; params = $params } | ConvertTo-Json -Compress -Depth 5
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $segment = [System.ArraySegment[byte]]::new($bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
        return $script:id
    }

    function Read-Id($targetId) {
        $buf = [byte[]]::new(2097152)
        while ($true) {
            $ms = New-Object System.IO.MemoryStream
            do {
                $segment = [System.ArraySegment[byte]]::new($buf)
                $res = $ws.ReceiveAsync($segment, $cts.Token).Result
                $ms.Write($buf, 0, $res.Count)
            } while (-not $res.EndOfMessage)
            $obj = [System.Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($obj -and $obj.id -eq $targetId) { return $obj }
        }
    }

    # Wait for DOM and function
    for ($k = 0; $k -lt 25; $k++) {
        Start-Sleep -Milliseconds 300
        $req = Send-CDP "Runtime.evaluate" @{ expression = "Boolean(window.toggleMobileModal)"; returnByValue = $true }
        $resp = Read-Id $req
        if ($resp.result -and $resp.result.result -and $resp.result.result.value -eq $true) {
            break
        }
    }

    # Open mobile modal
    $req1 = Send-CDP "Runtime.evaluate" @{ expression = "window.toggleMobileModal(true);"; returnByValue = $true }
    Read-Id $req1 | Out-Null
    Start-Sleep -Milliseconds 800

    # Capture screenshot
    $req2 = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $shot = Read-Id $req2
    $bytes = [System.Convert]::FromBase64String($shot.result.data)
    [System.IO.File]::WriteAllBytes("C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\mobile_share_modal_fixed.png", $bytes)
    Write-Host "[SAVED] mobile_share_modal_fixed.png"
} finally {
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
