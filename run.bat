@echo off
title DevPath Launcher
cls
echo ======================================================================
echo             DevPath - Personal Engineering Learning Tracker
echo ======================================================================
echo.
echo [1/3] Starting DevPath Backend on http://localhost:5000...
start "DevPath Backend (Port 5000)" cmd /k "title DevPath Backend && cd /d %~dp0backend && node src/server.js"

echo [2/3] Waiting 2 seconds for backend to initialize...
timeout /t 2 /nobreak >nul

echo [3/3] Starting DevPath Frontend on http://localhost:5173...
start "DevPath Frontend (Port 5173)" cmd /k "title DevPath Frontend && cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting 2 seconds for frontend development server...
timeout /t 2 /nobreak >nul

echo Launching browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ======================================================================
echo  DevPath is now running in separate Command Prompt windows!
echo  - Frontend Workspace:  http://localhost:5173
echo  - Backend API & Health: http://localhost:5000/api/health
echo ======================================================================
echo.
pause
