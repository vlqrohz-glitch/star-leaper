<#
.SYNOPSIS
    Automates publishing Star-Leaper to GitHub and guides Netlify linking.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       STAR-LEAPER: GITHUB REPOSITORY INITIALIZER          " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure Git is in PATH for this session if installed in default locations
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    $possibleGitPaths = @(
        "$env:LOCALAPPDATA\Programs\Git\cmd",
        "$env:ProgramFiles\Git\cmd",
        "${env:ProgramFiles(x86)}\Git\cmd"
    )
    foreach ($p in $possibleGitPaths) {
        if (Test-Path "$p\git.exe") {
            $env:Path = "$p;" + $env:Path
            break
        }
    }
}

# 1. Check if git is installed
$gitCmd = Get-Command "git" -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "[!] Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "To push your code to GitHub, please install Git:" -ForegroundColor Yellow
    Write-Host "  Option A: Download Git for Windows: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "  Option B: Download GitHub Desktop: https://desktop.github.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "Press [Enter] to open git-scm.com in your browser, or [Ctrl+C] to exit..." -ForegroundColor Cyan
    Read-Host
    Start-Process "https://git-scm.com/download/win"
    exit 1
}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

# 2. Check or initialize git repo
if (-not (Test-Path (Join-Path $Root ".git"))) {
    Write-Host "[1/4] Initializing new Git repository..." -ForegroundColor Cyan
    git init
} else {
    Write-Host "[1/4] Existing Git repository detected." -ForegroundColor Green
}

# 3. Prompt for GitHub repository URL if not provided
if (-not $RepoUrl) {
    $remotes = git remote
    if ($remotes -contains "origin") {
        $existingRemote = (git remote get-url origin 2>$null)
        if ($existingRemote) {
            Write-Host "Detected existing remote origin: $existingRemote" -ForegroundColor Green
            $RepoUrl = $existingRemote
        }
    }
    
    if (-not $RepoUrl) {
        Write-Host ""
        Write-Host "Please create a new repository on GitHub (e.g. 'star-leaper'):" -ForegroundColor Yellow
        Write-Host "  👉 https://github.com/new" -ForegroundColor Cyan
        Write-Host ""
        $RepoUrl = Read-Host "Enter your GitHub Repository URL (e.g. https://github.com/vlqrohz-glitch/star-leaper.git)"
    }
}

if (-not $RepoUrl) {
    Write-Host "No repository URL provided. Aborting." -ForegroundColor Red
    exit 1
}

# Normalize repo URL if user provided web url without .git
if ($RepoUrl -notmatch '\.git$' -and $RepoUrl -match '^https?://github\.com/') {
    $RepoUrl = "$RepoUrl.git"
}

# 4. Configure remote
$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}

# 5. Stage & commit
Write-Host "[2/4] Staging files (respecting .gitignore)..." -ForegroundColor Cyan
& git add .

$status = & git status --porcelain
if ($status) {
    Write-Host "[3/4] Creating commit..." -ForegroundColor Cyan
    & git commit -m "Star-Leaper: Orion Odyssey v1.0"
} else {
    Write-Host "[3/4] Working directory clean, no new changes to commit." -ForegroundColor Green
}

# 6. Push to main branch
Write-Host "[4/4] Pushing to GitHub main branch..." -ForegroundColor Cyan
& git branch -M main
& git push -u origin main

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Code pushed to GitHub: $RepoUrl" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Step: Link to Netlify for Continuous Deployment:" -ForegroundColor Yellow
Write-Host "1. Open your Netlify site dashboard: https://app.netlify.com" -ForegroundColor White
Write-Host "2. Select your site ('starleaper')" -ForegroundColor White
Write-Host "3. Go to: Site configuration -> Build & deploy -> Continuous deployment" -ForegroundColor White
Write-Host "4. Click 'Link repository' -> Select GitHub -> Choose your repository" -ForegroundColor White
Write-Host "5. Base directory: (leave empty)" -ForegroundColor White
Write-Host "   Build command:  (leave empty)" -ForegroundColor White
Write-Host "   Publish dir:    ." -ForegroundColor White
Write-Host "6. Click 'Deploy'! Any new git push will now automatically update your live site." -ForegroundColor Green
Write-Host ""
