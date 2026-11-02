@echo off
echo ========================================================
echo Pushing Stock Shop Project to GitHub:
echo https://github.com/RAJKUMAR120804/stock-gateway
echo ========================================================

git init
git remote remove origin 2>nul
git remote add origin https://github.com/RAJKUMAR120804/stock-gateway.git
git branch -M main
git add .
git commit -m "Complete Stock Shop E-Commerce with Simulated Payment Gateway & Admin Dashboard"
git push -u origin main

echo ========================================================
echo Done! Refresh your GitHub repository to see all files:
echo https://github.com/RAJKUMAR120804/stock-gateway
echo ========================================================
pause

