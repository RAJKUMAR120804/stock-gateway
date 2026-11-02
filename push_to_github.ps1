# Stock Shop: Push to GitHub Script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$git = if (Test-Path "$scriptDir\.tools\git\cmd\git.exe") {
    "$scriptDir\.tools\git\cmd\git.exe"
} else {
    "git"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Pushing Stock Shop to GitHub: " -ForegroundColor Cyan
Write-Host "  https://github.com/RAJKUMAR120804/stock-gateway" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

& $git branch -M main
& $git remote remove origin 2>$null
& $git remote add origin https://github.com/RAJKUMAR120804/stock-gateway.git
& $git add .
& $git commit -m "Complete Stock Shop E-Commerce Platform with Simulated Payment Gateway & Admin Dashboard" 2>$null

Write-Host "Connecting to GitHub..." -ForegroundColor Green
& $git push -u origin main

