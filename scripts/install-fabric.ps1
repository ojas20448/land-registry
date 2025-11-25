# Install Hyperledger Fabric Binaries and Docker Images
# This script downloads Fabric tools and Docker images for v2.5

Write-Host "🔧 Installing Hyperledger Fabric Binaries and Docker Images..." -ForegroundColor Cyan

# Set Fabric version
$FABRIC_VERSION = "2.5.0"
$CA_VERSION = "1.5.7"

# Create bin directory if it doesn't exist
$BIN_DIR = ".\bin"
if (!(Test-Path $BIN_DIR)) {
    New-Item -ItemType Directory -Path $BIN_DIR | Out-Null
}

# Download Fabric binaries for Windows
Write-Host "📥 Downloading Fabric binaries..." -ForegroundColor Yellow
$FABRIC_URL = "https://github.com/hyperledger/fabric/releases/download/v$FABRIC_VERSION/hyperledger-fabric-windows-amd64-$FABRIC_VERSION.tar.gz"

try {
    Invoke-WebRequest -Uri $FABRIC_URL -OutFile "fabric-binaries.tar.gz"
    tar -xzf fabric-binaries.tar.gz -C $BIN_DIR
    Remove-Item "fabric-binaries.tar.gz"
    Write-Host "✅ Fabric binaries installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Fabric binaries" -ForegroundColor Red
    Write-Host "Please download manually from: $FABRIC_URL" -ForegroundColor Yellow
}

# Pull Docker images
Write-Host "📥 Pulling Hyperledger Fabric Docker images..." -ForegroundColor Yellow

$IMAGES = @(
    "hyperledger/fabric-peer:$FABRIC_VERSION",
    "hyperledger/fabric-orderer:$FABRIC_VERSION",
    "hyperledger/fabric-ccenv:$FABRIC_VERSION",
    "hyperledger/fabric-tools:$FABRIC_VERSION",
    "hyperledger/fabric-baseos:$FABRIC_VERSION",
    "hyperledger/fabric-ca:$CA_VERSION",
    "couchdb:3.3"
)

foreach ($IMAGE in $IMAGES) {
    Write-Host "  Pulling $IMAGE..." -ForegroundColor Gray
    docker pull $IMAGE
}

Write-Host "✅ Docker images pulled successfully" -ForegroundColor Green

# Add bin directory to PATH for current session
$env:PATH += ";$PWD\bin"

Write-Host ""
Write-Host "✅ Hyperledger Fabric installation complete!" -ForegroundColor Green
Write-Host "📌 Fabric version: $FABRIC_VERSION" -ForegroundColor Cyan
Write-Host "📌 CA version: $CA_VERSION" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: .\scripts\start-network.ps1" -ForegroundColor White
Write-Host "  2. Run: .\scripts\deploy-chaincode.ps1" -ForegroundColor White
