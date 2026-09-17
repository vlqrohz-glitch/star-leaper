# uninstall_starleaper_domain.ps1 - Remove starleaper.io mappings from Windows hosts file
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges to clean $hostsPath..." -ForegroundColor Yellow
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $psi.Verb = "runas"
    try {
        $proc = [System.Diagnostics.Process]::Start($psi)
        $proc.WaitForExit()
        exit $proc.ExitCode
    } catch {
        Write-Warning "User declined elevation: $($_.Exception.Message)"
        exit 1
    }
}

try {
    $lines = Get-Content -Path $hostsPath -ErrorAction Stop
    $filtered = $lines | Where-Object { $_ -notmatch "starleaper\.io" -and $_ -notmatch "Star-Leaper Game" }
    [System.IO.File]::WriteAllLines($hostsPath, $filtered)
    ipconfig /flushdns | Out-Null
    Write-Host "Removed starleaper.io from $hostsPath and flushed DNS." -ForegroundColor Green
} catch {
    Write-Error "Failed to clean $hostsPath : $($_.Exception.Message)"
    exit 1
}
