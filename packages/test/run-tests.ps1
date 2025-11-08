# Test Runner Script for SketchKaro (PowerShell)
# This script helps run the test suite with proper setup

Write-Host "🧪 SketchKaro Test Suite" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Check if servers are running
Write-Host "Checking if servers are running..." -ForegroundColor Yellow

# Check WebSocket server (port 8080)
try {
    $wsHealth = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ WebSocket server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ WebSocket server is not running on port 8080" -ForegroundColor Red
    Write-Host "   Start it with: cd apps/ws-backend && bun run dev" -ForegroundColor Yellow
    exit 1
}

# Check HTTP server (port 3001)
try {
    $httpHealth = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ HTTP server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ HTTP server is not running on port 3001" -ForegroundColor Red
    Write-Host "   Start it with: cd apps/http-backend && bun run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
Write-Host ""

# Run the tests
bun test $args
