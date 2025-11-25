@echo off
echo Starting Land Registry System...
echo.

echo [1/2] Starting API Server...
start "Land Registry API" cmd /k "cd /d %~dp0api-server && node server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Web Application...
start "Land Registry UI" cmd /k "cd /d %~dp0ui-citizen-portal && npx serve dist -l 3000"
timeout /t 3 /nobreak > nul

echo.
echo ============================================
echo   Land Registry System Started!
echo ============================================
echo.
echo   Citizen Portal: http://localhost:3000
echo   Admin Portal:   http://localhost:3000/admin/login
echo   API Server:     http://localhost:4000
echo.
echo   Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ============================================
echo.
pause
