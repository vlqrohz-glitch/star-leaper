param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Prefixes.Add("http://starleaper.io:$Port/")
    $listener.Start()
} catch {
    # Non-admin fallback: start with loopback prefixes
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

# Auto-detect local LAN / Wi-Fi IPv4 address for phone play
$lanIp = "127.0.0.1"
try {
    $ipObj = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object {
        $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and $_.ToString() -ne "127.0.0.1"
    } | Select-Object -First 1
    if ($ipObj) {
        $lanIp = $ipObj.ToString()
    }
} catch {}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      STAR-LEAPER: ORION ODYSSEY WEB SERVER               " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Domain URL:  http://starleaper.io:$Port/                " -ForegroundColor Yellow
Write-Host "  Local URL:   http://127.0.0.1:$Port/                    " -ForegroundColor Green
Write-Host "  Mobile URL:  http://$($lanIp):$Port/ (Phone / Wi-Fi)    " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
    ".ogg"  = "audio/ogg"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $req = $context.Request
            $res = $context.Response

            $urlPath = $req.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }

            $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($baseDir, $urlPath))
            if (-not $filePath.StartsWith($baseDir, [System.StringComparison]::OrdinalIgnoreCase)) {
                $res.StatusCode = 403
                $res.Close()
                continue
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) {
                    $contentType = $mimeTypes[$ext]
                }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentType = $contentType
                $res.ContentLength64 = $bytes.Length
                $res.AddHeader("Access-Control-Allow-Origin", "*")
                $res.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
                $res.StatusCode = 200

                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $res.StatusCode = 404
                $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
                $res.ContentType = "text/plain"
                $res.ContentLength64 = $notFoundMsg.Length
                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
                }
            }
            $res.Close()
        } catch {
            try { $context.Response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
