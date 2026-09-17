<#
.SYNOPSIS
    Packages and deploys Star-Leaper: Orion Odyssey to Netlify.
.DESCRIPTION
    Creates a clean production distribution bundle and either:
    1. Direct API Deploy: Deploys directly to Netlify using a Personal Access Token (PAT).
    2. Netlify Drop (Instant Drag & Drop): Prepares 'star-leaper-netlify.zip' and opens https://app.netlify.com/drop with the file highlighted in Explorer.
.PARAMETER Token
    Optional Netlify Personal Access Token for headless automated deployment.
.PARAMETER SiteName
    Optional preferred site subdomain (e.g. 'star-leaper-orion').
.PARAMETER SiteId
    Optional existing Netlify site ID to update an existing deployment.
.PARAMETER OpenDrop
    If true, automatically opens Netlify Drop in your default web browser.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Token,

    [Parameter(Mandatory = $false)]
    [string]$SiteName = "star-leaper-orion",

    [Parameter(Mandatory = $false)]
    [string]$SiteId,

    [Parameter(Mandatory = $false)]
    [switch]$OpenDrop = $true,

    [Parameter(Mandatory = $false)]
    [switch]$PackageOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     STAR-LEAPER: ORION ODYSSEY - NETLIFY DEPLOYMENT        " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dist = Join-Path $Root "dist_netlify"
$ZipPath = Join-Path $Root "star-leaper-netlify.zip"

# 1. Clean previous build artifacts
Write-Host "[1/4] Preparing production distribution directory..." -ForegroundColor Cyan
if (Test-Path $Dist) {
    Remove-Item -Path $Dist -Recurse -Force
}
New-Item -Path $Dist -ItemType Directory -Force | Out-Null

# 2. Copy production runtime assets
Write-Host "[2/4] Copying game runtime assets (Phaser, ES modules, configs)..." -ForegroundColor Cyan
Copy-Item (Join-Path $Root "index.html") $Dist
Copy-Item (Join-Path $Root "netlify.toml") $Dist
Copy-Item (Join-Path $Root "_headers") $Dist
Copy-Item (Join-Path $Root "_redirects") $Dist
Copy-Item (Join-Path $Root "lib") $Dist -Recurse
Copy-Item (Join-Path $Root "src") $Dist -Recurse

# 3. Create production ZIP archive (with Unix forward-slash paths for Linux/Netlify compatibility)
Write-Host "[3/4] Compressing deployment package (Linux/Netlify path-compatible)..." -ForegroundColor Cyan
if (Test-Path $ZipPath) {
    Remove-Item -Path $ZipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipArchive = [System.IO.Compression.ZipFile]::Open($ZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $allFiles = Get-ChildItem -Path $Dist -Recurse -File
    foreach ($f in $allFiles) {
        $relPath = $f.FullName.Substring($Dist.Length).TrimStart('\', '/')
        # CRITICAL FOR NETLIFY: Normalize Windows backslash to forward slash
        $entryName = $relPath -replace '\\', '/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zipArchive,
            $f.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $zipArchive.Dispose()
}

$ZipItem = Get-Item $ZipPath
$ZipSizeKB = [math]::Round($ZipItem.Length / 1KB, 1)
Write-Host "  -> Created package: $ZipPath" -ForegroundColor Green
Write-Host "  -> Package Size: $ZipSizeKB KB" -ForegroundColor Green

# 4. Check for Automated API Deployment vs Netlify Drop
if ($Token -and -not $PackageOnly) {
    Write-Host "[4/4] Authenticating with Netlify API & deploying..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type"  = "application/zip"
        }

        $zipBytes = [System.IO.File]::ReadAllBytes($ZipPath)

        if ($SiteId) {
            Write-Host "  -> Updating existing Netlify site ID: $SiteId" -ForegroundColor Cyan
            $apiUrl = "https://api.netlify.com/api/v1/sites/$SiteId/deploys"
            $deployResponse = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $zipBytes
        } else {
            Write-Host "  -> Creating new Netlify site ($SiteName)..." -ForegroundColor Cyan
            $apiUrl = "https://api.netlify.com/api/v1/sites"
            if ($SiteName) {
                $apiUrl += "?name=$SiteName"
            }
            $deployResponse = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $zipBytes
        }

        $liveUrl = if ($deployResponse.ssl_url) { $deployResponse.ssl_url } else { $deployResponse.url }
        $adminUrl = $deployResponse.admin_url

        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "          SUCCESSFULLY DEPLOYED TO NETLIFY!                " -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "  Live Game URL:      $liveUrl" -ForegroundColor Cyan
        Write-Host "  Netlify Dashboard:  $adminUrl" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""

        return
    } catch {
        Write-Warning "Direct API upload failed: $_"
        Write-Host "Falling back to Netlify Drop..." -ForegroundColor Yellow
    }
}

# If no token or Netlify Drop fallback:
Write-Host "[4/4] Package ready for Netlify Drop!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "        HOW TO DEPLOY ON NETLIFY IN 3 SECONDS (FREE)        " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "1. Browser will open: https://app.netlify.com/drop" -ForegroundColor White
Write-Host "2. Drag and drop this file onto the web page:" -ForegroundColor White
Write-Host "   $ZipPath" -ForegroundColor Green
Write-Host "3. Netlify will immediately deploy the game with global CDN & HTTPS!" -ForegroundColor White
Write-Host "4. You can rename your URL or assign custom domain starleaper.io!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($OpenDrop -and -not $PackageOnly) {
    Write-Host "Opening Netlify Drop in default browser..." -ForegroundColor Cyan
    Start-Process "https://app.netlify.com/drop"

    # Also highlight the zip file in Windows Explorer for easy drag & drop
    Start-Process explorer.exe -ArgumentList "/select,`"$ZipPath`""
}
