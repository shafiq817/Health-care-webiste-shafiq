@echo off
title Premium Healthcare System Launcher
echo ============================================================
echo   [+] Starting Premium Healthcare Management System...
echo ============================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found on your system!
    echo Please install Python (and add it to your PATH) to run the backend.
    echo.
    pause
    exit /b 1
)

:: Install Requirements
echo [>] Checking and installing Python dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install dependencies. Proceeding anyway...
)
echo.

:: Run Flask App in a separate window
echo [>] Starting Flask backend (app.py) in a new window...
start "Healthcare Backend Server" cmd /k "python app.py"

:: Wait a brief moment for Flask to initialize
timeout /t 2 /nobreak >nul

:: Open browser
echo [>] Opening website at http://localhost:5000/
start http://localhost:5000/

echo.
echo ============================================================
echo   [+] System is running! Keep the backend console open.
echo ============================================================
echo.
pause
