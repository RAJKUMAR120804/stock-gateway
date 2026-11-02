@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Stock Shop: Push to GitHub Repository
echo   Repo: https://github.com/RAJKUMAR120804/stock-gateway
echo ========================================================

REM Locate git executable
set "GIT_CMD=git"
if exist "%~dp0.tools\git\cmd\git.exe" (
    set "GIT_CMD=%~dp0.tools\git\cmd\git.exe"
)

echo [1/4] Verifying Git repository...
"%GIT_CMD%" status >nul 2>&1
if errorlevel 1 (
    "%GIT_CMD%" init
)

echo [2/4] Setting remote origin...
"%GIT_CMD%" remote remove origin >nul 2>&1
"%GIT_CMD%" remote add origin https://github.com/RAJKUMAR120804/stock-gateway.git
"%GIT_CMD%" branch -M main

echo [3/4] Staging and committing files...
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "Complete Stock Shop E-Commerce Platform with Simulated Payment Gateway & Admin Dashboard" >nul 2>&1

echo [4/4] Pushing to GitHub (Sign in with browser or token if prompted)...
"%GIT_CMD%" push -u origin main

if errorlevel 1 (
    echo.
    echo --------------------------------------------------------
    echo If GitHub asks for a token:
    echo 1. Go to https://github.com/settings/tokens
    echo 2. Generate a classic token with "repo" permission.
    echo 3. Paste the token as your password.
    echo --------------------------------------------------------
) else (
    echo.
    echo ========================================================
    echo   SUCCESS! All files are now live on your GitHub repo:
    echo   https://github.com/RAJKUMAR120804/stock-gateway
    echo ========================================================
)

echo.
pause
