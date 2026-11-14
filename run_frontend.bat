@echo off
echo ========================================================
echo Starting LaunchPulse GTM Studio Frontend (React 19) :5173
echo ========================================================
cd /d "%~dp0frontend"
call pnpm dev
pause
