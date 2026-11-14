@echo off
echo ========================================================
echo Launching LaunchPulse Claude Model Context Protocol (MCP) Node
echo Connected via Stdio to Claude Desktop
echo ========================================================
cd /d "%~dp0mcp-server"
if exist ..\backend\.venv\Scripts\python.exe (
    ..\backend\.venv\Scripts\python.exe server.py
) else (
    python server.py
)
pause
