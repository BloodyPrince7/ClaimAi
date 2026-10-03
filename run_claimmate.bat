@echo off
title ClaimMate Launcher
color 0A

echo ===================================================
echo   ClaimMate: The Modern Bahi-Khata for Insurance
echo ===================================================
echo.
echo [1/3] Starting Backend (FastAPI on Port 8000)...
start "ClaimMate Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo.
echo [2/3] Starting Frontend (Next.js on Port 3000)...
start "ClaimMate Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening ClaimMate in your browser...
start http://localhost:3000

echo.
echo ===================================================
echo ClaimMate is running!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo ===================================================
echo Keep the backend and frontend terminal windows open.
echo You can close this launcher window at any time.
echo.
pause
