$r = Invoke-WebRequest -Uri "https://starleaper.netlify.app/lib/phaser.min.js" -UseBasicParsing
foreach ($k in $r.Headers.Keys) {
    Write-Host "$k : $($r.Headers[$k])"
}
Write-Host "Length: $($r.Content.Length)"
Write-Host "Snippet: $($r.Content.Substring(0, 100))"
