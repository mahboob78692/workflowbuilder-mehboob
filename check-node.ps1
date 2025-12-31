# Quick Node.js and npm Check Script
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "  Please install from: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is NOT installed" -ForegroundColor Red
}

Write-Host ""
Write-Host "If both show ✓, you're ready to run 'npm install' and 'npm run dev'!" -ForegroundColor Green


