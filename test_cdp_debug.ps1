$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ct = New-Object System.Threading.CancellationToken
$chromeProc = Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--headless=new', '--disable-gpu', 'http://127.0.0.1:8080/' -PassThru
Start-Sleep -Milliseconds 1500

try {
    $uri = New-Object System.Uri('ws://localhost:9222/devtools/page/' + (Invoke-RestMethod http://localhost:9222/json/list)[0].id)
    $ws.ConnectAsync($uri, $ct).Wait()

    function Send-CDP($method, $params) {
        $id = [System.Threading.Interlocked]::Increment([ref]100)
        $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $seg = New-Object System.ArraySegment[byte](@(,$bytes))
        $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()
        $buf = New-Object byte[] 65536
        $rseg = New-Object System.ArraySegment[byte](@(,$buf))
        $res = $ws.ReceiveAsync($rseg, $ct)
        $res.Wait()
        return [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
    }

    Start-Sleep -Milliseconds 1200

    # 1. Start Game
    $code1 = 'window.game.scene.getScene("GameScene").handleStartInput()'
    Write-Host "Triggering start..."
    $res1 = Send-CDP 'Runtime.evaluate' @{ expression = $code1 }
    Write-Host "Res1: $res1"

    Start-Sleep -Milliseconds 600

    # 2. Check UI state
    $code2 = '(() => { const s = window.game.scene.getScene("GameScene"); return { state: s.uiSystem.currentState, titleVis: s.uiSystem.titleContainer.visible, hudVis: s.uiSystem.hudContainer.visible }; })()'
    $res2 = Send-CDP 'Runtime.evaluate' @{ expression = $code2; returnByValue = $true }
    Write-Host "Res2: $res2"

    # 3. Trigger Pause
    $code3 = 'window.game.scene.getScene("GameScene").togglePause()'
    Write-Host "Triggering pause..."
    $res3 = Send-CDP 'Runtime.evaluate' @{ expression = $code3 }
    Write-Host "Res3: $res3"

    Start-Sleep -Milliseconds 400

    # 4. Check Pause state
    $code4 = '(() => { const s = window.game.scene.getScene("GameScene"); return { state: s.uiSystem.currentState, pauseVis: s.uiSystem.pauseContainer.visible, isPaused: s.uiSystem.isPaused() }; })()'
    $res4 = Send-CDP 'Runtime.evaluate' @{ expression = $code4; returnByValue = $true }
    Write-Host "Res4: $res4"

} finally {
    if ($chromeProc) { Stop-Process -Id $chromeProc.Id -Force }
}
