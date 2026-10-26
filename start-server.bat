@echo off
title Thunder Bay Brawl server
cd /d "%~dp0server"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed.
  echo Get the LTS version from https://nodejs.org  or run:  winget install OpenJS.NodeJS.LTS
  echo Then close this window and double-click start-server.bat again.
  echo.
  pause
  exit /b 1
)
echo Installing server packages (first run only takes a moment)...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo npm install failed. Check the internet connection and try again.
  pause
  exit /b 1
)
node server.js
echo.
echo The server stopped.
pause
