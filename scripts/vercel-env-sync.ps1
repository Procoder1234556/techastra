# Sync selected keys from .env to Vercel (production). Run from repo root.
param(
  [string]$EnvFile = ".env",
  [string[]]$Keys = @(
    "DATABASE_URL",
    "SESSION_SECRET",
    "DEMO_ACCESS_CODE",
    "VITE_DEMO_ACCESS_CODE",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET"
  )
)

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile"
  exit 1
}

$map = @{}
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $pair = $_ -split '=', 2
  $map[$pair[0].Trim()] = $pair[1].Trim()
}

foreach ($key in $Keys) {
  if (-not $map.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($map[$key])) {
    Write-Host "Skip $key (not in .env)"
    continue
  }
  Write-Host "Setting $key on Vercel production..."
  $map[$key] | vercel env add $key production --force 2>&1 | Out-Host
}

Write-Host "Done. Set CLIENT_URL to your production URL after first deploy if redirects fail."
