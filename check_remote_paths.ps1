# check_remote_paths.ps1
$urls = @(
    "https://starleaper.netlify.app/lib/phaser.min.js",
    "https://starleaper.netlify.app/src/main.js",
    "https://starleaper.netlify.app/star-leaper/lib/phaser.min.js",
    "https://starleaper.netlify.app/star-leaper/src/main.js",
    "https://starleaper.netlify.app/dist_netlify/lib/phaser.min.js",
    "https://starleaper.netlify.app/netlify.toml"
)

foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -MaximumRedirection 0
        $ctype = $r.Headers["Content-Type"]
        $len = $r.Content.Length
        $snip = $r.Content.Substring(0, [math]::Min(60, $len)).Replace("`r", "").Replace("`n", " ")
        Write-Host "$u" -ForegroundColor Cyan
        Write-Host "   Type: $ctype | Length: $len"
        Write-Host "   Snip: $snip"
    } catch {
        Write-Host "$u -> Error: $_" -ForegroundColor Red
    }
}
