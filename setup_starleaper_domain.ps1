# setup_starleaper_domain.ps1 - Map starleaper.io to 127.0.0.1 in Windows hosts file
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entryComment = "# Star-Leaper Game Local Domain"
$domainIpv4 = "127.0.0.1 starleaper.io www.starleaper.io"
$domainIpv6 = "::1 starleaper.io www.starleaper.io"

# Check for Administrator privileges
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges to update $hostsPath..." -ForegroundColor Yellow
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $psi.Verb = "runas"
    try {
        $proc = [System.Diagnostics.Process]::Start($psi)
        $proc.WaitForExit()
        if ($proc.ExitCode -eq 0) {
            Write-Host "Hosts file configured successfully via elevated process." -ForegroundColor Green
        }
        exit $proc.ExitCode
    } catch {
        Write-Warning "User declined elevation or elevation failed: $($_.Exception.Message)"
        Write-Host ""
        Write-Host "Manual Setup Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open PowerShell as Administrator (Right click -> Run as administrator)"
        Write-Host "2. Run this command:"
        Write-Host "   Add-Content -Path '$hostsPath' -Value `"`r`n127.0.0.1 starleaper.io www.starleaper.io`""
        Write-Host "   ipconfig /flushdns"
        exit 1
    }
}

try {
    $content = Get-Content -Path $hostsPath -Raw -ErrorAction Stop
    $updated = $false

    if ($content -notmatch "starleaper\.io") {
        $linesToAdd = "`r`n$entryComment`r`n$domainIpv4`r`n$domainIpv6"
        Add-Content -Path $hostsPath -Value $linesToAdd -Encoding utf8 -ErrorAction Stop
        Write-Host "Added 'starleaper.io' mappings to $hostsPath" -ForegroundColor Green
        $updated = $true
    } else {
        Write-Host "'starleaper.io' already exists in $hostsPath" -ForegroundColor Cyan
    }

    # Flush DNS Resolver Cache
    ipconfig /flushdns | Out-Null
    Write-Host "Windows DNS cache flushed successfully." -ForegroundColor Green
    Write-Host ""
    Write-Host "Game URL is now configured as: http://starleaper.io/ (or http://starleaper.io:8080/)" -ForegroundColor Yellow

} catch {
    Write-Error "Failed to update $hostsPath : $($_.Exception.Message)"
    exit 1
}
