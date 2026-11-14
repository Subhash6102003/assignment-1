@echo off
echo ========================================================
echo Starting LaunchPulse GTM Backend (FastAPI + SQLite) :8000
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)
pause
