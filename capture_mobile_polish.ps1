# capture_mobile_polish.ps1 - Capture screenshots of faded buttons & in-settings sizing
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outGameplayPng = "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\mobile_faded_buttons.png"
$outSettingsPng = "C:\Users\muiz.hameed\.gemini\antigravity-ide\brain\044960da-198e-418f-bf61-f26214234334\mobile_settings_size.png"
$freshDir = "C:\Users\muiz.hameed\.gemini\antigravity-ide\scratch\chrome_scr_" + [Guid]::NewGuid().ToString("N")

$chromeProc = Start-Process $chromePath `
    -ArgumentList "--headless=new", "--incognito", "--remote-debugging-port=9228", "--window-size=920,540", "--user-data-dir=$freshDir", "http://127.0.0.1:8080/" `
    -PassThru

Start-Sleep -Seconds 3

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9228/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*8080*" -and $_.type -eq "page" } | Select-Object -First 1

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

    Start-Sleep -Seconds 2

    # Enable touch controls and start gameplay
    Send-CDP "Runtime.evaluate" @{ expression = "window.toggleTouchControls(true); window.game.scene.keys.GameScene.uiSystem.selectTitleMenuOption('play');" } | Out-Null
    Start-Sleep -Seconds 3

    # 1. Capture Gameplay with Faded Buttons
    $req1 = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $resp1 = Read-Until-Id $req1
    $bytes1 = [System.Convert]::FromBase64String($resp1.result.data)
    [System.IO.File]::WriteAllBytes($outGameplayPng, $bytes1)
    Write-Host "Saved: $outGameplayPng ($($bytes1.Length) bytes)" -ForegroundColor Green

    # 2. Open Settings menu
    Send-CDP "Runtime.evaluate" @{ expression = "window.game.scene.keys.GameScene.uiSystem.showSettings()" } | Out-Null
    Start-Sleep -Milliseconds 800

    $req2 = Send-CDP "Page.captureScreenshot" @{ format = "png" }
    $resp2 = Read-Until-Id $req2
    $bytes2 = [System.Convert]::FromBase64String($resp2.result.data)
    [System.IO.File]::WriteAllBytes($outSettingsPng, $bytes2)
    Write-Host "Saved: $outSettingsPng ($($bytes2.Length) bytes)" -ForegroundColor Green

} finally {
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -Path $freshDir -Recurse -Force -ErrorAction SilentlyContinue
}
