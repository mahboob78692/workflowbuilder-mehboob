# Create package.json file
$packageJsonContent = @'
{
  "name": "workflow-builder-ui",
  "version": "1.0.0",
  "description": "Workflow Builder UI - React TypeScript",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
'@

$packageJsonContent | Out-File -FilePath "package.json" -Encoding utf8 -NoNewline
Write-Host "✓ package.json created successfully!" -ForegroundColor Green


