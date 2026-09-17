# validate_netlify_deploy.ps1 - Automated verification of Netlify deployment configurations
$ErrorActionPreference = "Stop"

Write-Host "`n=== Validating Netlify Deployment Artifacts ===" -ForegroundColor Cyan

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Assert-Check($id, $desc, $cond) {
    if ($cond) {
        Write-Host " [PASS] $id : $desc" -ForegroundColor Green
        $script:results.Add([PSCustomObject]@{ Id = $id; Description = $desc; Status = "PASS" })
    } else {
        Write-Host " [FAIL] $id : $desc" -ForegroundColor Red
        $script:results.Add([PSCustomObject]@{ Id = $id; Description = $desc; Status = "FAIL" })
    }
}

$root = $PSScriptRoot
$tomlPath = Join-Path $root "netlify.toml"
$headersPath = Join-Path $root "_headers"
$redirectsPath = Join-Path $root "_redirects"
$zipPath = Join-Path $root "star-leaper-netlify.zip"
$distPath = Join-Path $root "dist_netlify"

# NET-01: netlify.toml exists
Assert-Check "NET-01" "netlify.toml exists" (Test-Path $tomlPath)

# NET-02: netlify.toml contains publish setting
$tomlContent = if (Test-Path $tomlPath) { Get-Content $tomlPath -Raw } else { "" }
Assert-Check "NET-02" "netlify.toml specifies publish = '.'" ($tomlContent -match 'publish\s*=\s*"\."')

# NET-03: netlify.toml contains security headers
Assert-Check "NET-03" "netlify.toml defines X-Frame-Options and X-Content-Type-Options" `
    ($tomlContent -match "X-Frame-Options" -and $tomlContent -match "X-Content-Type-Options")

# NET-04: netlify.toml contains cache controls
Assert-Check "NET-04" "netlify.toml defines immutable cache for /lib/*" `
    ($tomlContent -match "Cache-Control" -and $tomlContent -match "immutable")

# NET-05: netlify.toml contains SPA redirect
Assert-Check "NET-05" "netlify.toml defines fallback redirect to index.html" `
    ($tomlContent -match 'to\s*=\s*"/index\.html"')

# NET-06: _headers file exists and has security rules
$headersContent = if (Test-Path $headersPath) { Get-Content $headersPath -Raw } else { "" }
Assert-Check "NET-06" "_headers file exists with security headers" `
    ((Test-Path $headersPath) -and ($headersContent -match "X-Frame-Options"))

# NET-07: _redirects file exists and has SPA rule
$redirectsContent = if (Test-Path $redirectsPath) { Get-Content $redirectsPath -Raw } else { "" }
Assert-Check "NET-07" "_redirects file exists with fallback rule" `
    ((Test-Path $redirectsPath) -and ($redirectsContent -match "/\*.*index\.html.*200"))

# NET-08: dist_netlify directory exists and contains key assets
Assert-Check "NET-08" "dist_netlify exists with index.html, lib, and src" `
    ((Test-Path (Join-Path $distPath "index.html")) -and `
     (Test-Path (Join-Path $distPath "lib\phaser.min.js")) -and `
     (Test-Path (Join-Path $distPath "src\main.js")))

# NET-09: star-leaper-netlify.zip exists and valid size
$zipItem = if (Test-Path $zipPath) { Get-Item $zipPath } else { $null }
Assert-Check "NET-09" "star-leaper-netlify.zip exists and is between 200KB and 2MB" `
    ($zipItem -ne $null -and $zipItem.Length -gt 200KB -and $zipItem.Length -lt 2MB)

# NET-10: Zip file structure verification (index.html at root)
$zipEntries = $null
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $zipEntries = $zip.Entries | Select-Object -ExpandProperty FullName
    $zip.Dispose()
} catch {}
Assert-Check "NET-10" "Zip archive contains index.html at root level" `
    ($zipEntries -contains "index.html" -and $zipEntries -contains "netlify.toml")

# NET-14: Forward-slash path normalization for Linux/Netlify
$backslashCount = ($zipEntries | Where-Object { $_ -like "*\*" }).Count
Assert-Check "NET-14" "Zip entries use forward slashes (0 backslashes)" ($backslashCount -eq 0)

# NET-15: Key scripts exist with forward slash paths
Assert-Check "NET-15" "Zip contains lib/phaser.min.js and src/main.js with forward slashes" `
    ($zipEntries -contains "lib/phaser.min.js" -and $zipEntries -contains "src/main.js")

# NET-11: deploy_netlify.ps1 script exists and syntax is valid
$deployScript = Join-Path $root "deploy_netlify.ps1"
$syntaxValid = $false
try {
    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $deployScript -Raw), [ref]$null)
    $syntaxValid = $true
} catch {}
Assert-Check "NET-11" "deploy_netlify.ps1 exists and syntax is valid" `
    ((Test-Path $deployScript) -and $syntaxValid)

# NET-12: deploy_netlify.bat launcher exists
Assert-Check "NET-12" "deploy_netlify.bat exists" (Test-Path (Join-Path $root "deploy_netlify.bat"))

# NET-13: index.html has dynamic protocol for mobile modal
$indexContent = Get-Content (Join-Path $root "index.html") -Raw
Assert-Check "NET-13" "index.html uses dynamic protocol for mobile URL display" `
    ($indexContent -match '\$\{protocol\}//\$\{host\}\$\{port\}/')

# Summary
$failed = $results | Where-Object { $_.Status -eq "FAIL" }
Write-Host "`n------------------------------------------------------------"
Write-Host "Summary: $($results.Count - $failed.Count) / $($results.Count) checks PASSED." -ForegroundColor $(if ($failed.Count -eq 0) { "Green" } else { "Red" })

if ($failed.Count -gt 0) {
    Write-Host "Failed checks:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host " - $($_.Id): $($_.Description)" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "All Netlify deployment assets and configurations verified successfully!" -ForegroundColor Green
    exit 0
}
