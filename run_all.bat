@echo off
echo ========================================================
echo Starting LaunchPulse GTM Studio Full-Stack Suite
echo 1. Backend API (FastAPI + SQLite) at http://localhost:8000
echo 2. Frontend Studio (React 19 + Tailwind v4) at http://localhost:5173
echo 3. MCP Server ready for Claude Desktop at mcp-server\server.py
echo ========================================================

start "LaunchPulse Backend API" "%~dp0run_backend.bat"
start "LaunchPulse React Frontend" "%~dp0run_frontend.bat"

echo.
echo Both servers have been launched in separate windows!
echo Open http://localhost:5173 in your browser to view the GTM Studio.
