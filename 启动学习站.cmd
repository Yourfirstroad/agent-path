@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Python environment not found. Please follow README.md setup steps.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo Build not found. Run npm ci and npm run build first.
  pause
  exit /b 1
)
echo Agent Path: http://127.0.0.1:8099
echo Keep this window open. Press Ctrl+C to stop.
".venv\Scripts\python.exe" -m uvicorn backend.app:app --host 127.0.0.1 --port 8099
pause
