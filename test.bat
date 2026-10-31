@echo off
title DevPath Verification Suite
cls
echo ======================================================================
echo   DevPath - 10-Scenario Adaptive Progression Engine & Streak Tests
echo ======================================================================
echo.
echo Make sure the backend server is running on http://localhost:5000 first!
echo.
cd /d %~dp0
node verify-adaptive-engine.mjs
echo.
pause
