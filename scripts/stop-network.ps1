# Stop and Clean Hyperledger Fabric Network

Write-Host "🛑 Stopping Land Registry Network..." -ForegroundColor Cyan

# Stop Docker containers
Write-Host "📦 Stopping Docker containers..." -ForegroundColor Yellow
docker-compose -f network\docker-compose.yaml down --volumes --remove-orphans

# Remove generated artifacts
Write-Host "🧹 Cleaning generated artifacts..." -ForegroundColor Yellow
if (Test-Path "organizations") {
    Remove-Item -Recurse -Force "organizations"
}
if (Test-Path "channel-artifacts") {
    Remove-Item -Recurse -Force "channel-artifacts"
}
if (Test-Path "chaincode-builds") {
    Remove-Item -Recurse -Force "chaincode-builds"
}

# Remove chaincode packages
if (Test-Path "chaincode\*.tar.gz") {
    Remove-Item "chaincode\*.tar.gz"
}

# Clean Docker volumes
Write-Host "🗑️  Removing Docker volumes..." -ForegroundColor Yellow
docker volume prune -f

Write-Host "✅ Network stopped and cleaned" -ForegroundColor Green
