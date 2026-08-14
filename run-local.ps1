# ============================================================
# Local Development Server Startup Script
# Starts both Flask Backend and Next.js Frontend
# ============================================================

Write-Host "🚀 Starting Student Performance Prediction System Locally..." -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Terminal 1: Flask Backend ────────────────────────────────
Write-Host "📦 Starting Flask Backend on port 5000..." -ForegroundColor Yellow
$backendProcess = Start-Process `
    -FilePath "python" `
    -ArgumentList "-m flask --app backend.app run" `
    -WorkingDirectory $projectRoot `
    -PassThru `
    -NoNewWindow

# Wait for Flask to start
Start-Sleep -Seconds 3

# ── Terminal 2: Next.js Frontend ────────────────────────────
Write-Host "🎨 Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
$frontendProcess = Start-Process `
    -FilePath "cmd" `
    -ArgumentList "/c cd $projectRoot\bringx && npm install && npm run dev" `
    -PassThru `
    -NoNewWindow

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access your project at:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   API:       http://localhost:5000/api/status" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers." -ForegroundColor Yellow
Write-Host ""

# Keep the script running
while ($true) {
    Start-Sleep -Seconds 10
    
    # Check if processes are still running
    if (-not (Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Flask backend has stopped!" -ForegroundColor Red
    }
    if (-not (Get-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Next.js frontend has stopped!" -ForegroundColor Red
    }
}
