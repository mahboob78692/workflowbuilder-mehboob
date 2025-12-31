# Fix npm installation script
Write-Host "Cleaning up and reinstalling..." -ForegroundColor Cyan
Write-Host ""

# Delete node_modules
Write-Host "1. Removing node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Write-Host "   ✓ node_modules deleted" -ForegroundColor Green

# Delete package-lock.json
Write-Host "2. Removing package-lock.json..." -ForegroundColor Yellow
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Write-Host "   ✓ package-lock.json deleted" -ForegroundColor Green

# Clear npm cache
Write-Host "3. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   ✓ npm cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "4. Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
npm install

Write-Host ""
Write-Host "Done! Now try: npm run dev" -ForegroundColor Green

