# capture_inventory_and_hotkeys.ps1 - Automated visual capture of 9-slot inventory modal and 1-9 hotkeys
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$serverUrl = "http://127.0.0.1:8080/"
$debugPort = 9250
$tempDir = Join-Path $env:TEMP ("starleaper_inv_" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
}

$chromeArgs = @(
    "--headless=new",
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=$tempDir",
    "--window-size=1100,750",
    "--no-first-run",
    "--no-default-browser-check",
    $serverUrl
)

$chromeProc = Start-Process $chromePath -ArgumentList $chromeArgs -PassThru
Start-Sleep -Seconds 3

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json" -TimeoutSec 5
    $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    Write-Host "[OK] Connected to browser tab: $($pageTab.title)" -ForegroundColor Green

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(60000)
    $ws.ConnectAsync([System.Uri]$pageTab.webSocketDebuggerUrl, $cts.Token).Wait()

    $script:msgId = 0
    function Send-CDP($method, $params = @{}) {
        $script:msgId++
        $body = @{
            id = $script:msgId
            method = $method
            params = $params
        } | ConvertTo-Json -Compress -Depth 10
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        $buffer = [byte[]]::new(2097152)
        while ($true) {
            $ms = New-Object System.IO.MemoryStream
            do {
                $res = $ws.ReceiveAsync([System.ArraySegment[byte]]::new($buffer), $cts.Token).Result
                $ms.Write($buffer, 0, $res.Count)
            } while (-not $res.EndOfMessage)
            $str = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $json = ConvertFrom-Json $str -ErrorAction SilentlyContinue
            if ($json -and $json.id -eq $script:msgId) {
                return $json
            }
        }
    }

    Send-CDP "Runtime.enable" | Out-Null
    Send-CDP "Page.enable" | Out-Null

    function Eval-JS($expr) {
        $res = Send-CDP "Runtime.evaluate" @{ expression = $expr; returnByValue = $true }
        if ($res.result.exceptionDetails) {
            Write-Host "[JS ERROR]: $($res.result.exceptionDetails.exception.description)" -ForegroundColor Red
        }
        return $res.result.result.value
    }

    function Save-Screenshot($filename) {
        $shot = Send-CDP "Page.captureScreenshot" @{ format = "png" }
        $bytes = [System.Convert]::FromBase64String($shot.result.data)
        $outPath = Join-Path $root $filename
        [System.IO.File]::WriteAllBytes($outPath, $bytes)
        Write-Host "  -> Saved screenshot: $outPath ($([math]::Round($bytes.Length/1024, 1)) KB)" -ForegroundColor Cyan
    }

    Write-Host "`n[1/3] Waiting for game to boot and start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    # Start gameplay from title
    Eval-JS @"
    (function() {
        const gs = window.game && window.game.scene && window.game.scene.getScene('GameScene');
        if (gs && gs.handleStartInput) {
            gs.handleStartInput();
        }
    })()
"@ | Out-Null
    Start-Sleep -Milliseconds 800

    Write-Host "`n[2/3] Opening 9-Slot Inventory Modal via [I]..." -ForegroundColor Yellow
    Eval-JS @"
    (function() {
        const gs = window.game && window.game.scene && window.game.scene.getScene('GameScene');
        if (gs && gs.toggleInventory) {
            gs.toggleInventory();
        }
    })()
"@ | Out-Null
    Start-Sleep -Milliseconds 600

    Save-Screenshot "inventory_modal_view.png"

    Write-Host "`n[3/3] Equipping slot 3 (Photon Rifle) via 1-9 keybind and dismissing modal..." -ForegroundColor Yellow
    $res = Eval-JS @"
    (function() {
        const gs = window.game && window.game.scene && window.game.scene.getScene('GameScene');
        if (!gs) return 'No GameScene';
        if (gs.equipWeaponBySlot) {
            gs.equipWeaponBySlot(3);
        }
        if (gs.uiSystem && gs.uiSystem.hideInventory) {
            gs.uiSystem.hideInventory();
        }
        return 'Equipped: ' + (gs.player ? gs.player.getWeapon() : 'no player') + ' | Inv Visible: ' + (gs.uiSystem ? gs.uiSystem.isInventoryActive() : 'no ui');
    })()
"@
    Write-Host "  -> Result: $res" -ForegroundColor Cyan
    Start-Sleep -Milliseconds 600

    Save-Screenshot "hotkey_weapon_switch_view.png"

    Write-Host "`n[DONE] Both screenshots captured successfully!" -ForegroundColor Green

} finally {
    if ($ws -and $ws.State -eq 'Open') {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", [System.Threading.CancellationToken]::None).Wait()
    }
    if ($chromeProc -and -not $chromeProc.HasExited) {
        Stop-Process -Id $chromeProc.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
