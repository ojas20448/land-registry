# Start Hyperledger Fabric Network for Land Registry
# This script sets up the complete network infrastructure

param(
    [switch]$Clean = $false
)

Write-Host "🚀 Starting Land Registry Blockchain Network..." -ForegroundColor Cyan

# Set environment
$COMPOSE_PROJECT_NAME = "land_registry"
$CHANNEL_NAME = "land-main-channel"
$FABRIC_CFG_PATH = "$PWD\network"

# Clean previous network if requested
if ($Clean) {
    Write-Host "🧹 Cleaning previous network..." -ForegroundColor Yellow
    .\scripts\stop-network.ps1
}

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
$DIRS = @(
    "organizations\ordererOrganizations",
    "organizations\peerOrganizations",
    "channel-artifacts",
    "chaincode-builds"
)

foreach ($DIR in $DIRS) {
    if (!(Test-Path $DIR)) {
        New-Item -ItemType Directory -Path $DIR -Force | Out-Null
    }
}

# Generate crypto material using cryptogen
Write-Host "🔐 Generating crypto material..." -ForegroundColor Yellow
Set-Location network

if (Test-Path "..\bin\cryptogen.exe") {
    ..\bin\cryptogen.exe generate --config=crypto-config.yaml --output=..\organizations
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Crypto material generated" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate crypto material" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "❌ cryptogen not found. Run install-fabric.ps1 first" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Generate genesis block and channel configuration
Write-Host "⚙️  Generating genesis block and channel configuration..." -ForegroundColor Yellow
$env:FABRIC_CFG_PATH = $PWD

if (Test-Path "..\bin\configtxgen.exe") {
    # Generate genesis block for orderer
    ..\bin\configtxgen.exe -profile LandRegistryOrdererGenesis -channelID system-channel -outputBlock ..\channel-artifacts\genesis.block
    
    # Generate channel creation transaction
    ..\bin\configtxgen.exe -profile LandMainChannel -outputCreateChannelTx ..\channel-artifacts\$CHANNEL_NAME.tx -channelID $CHANNEL_NAME
    
    # Generate anchor peer transactions
    ..\bin\configtxgen.exe -profile LandMainChannel -outputAnchorPeersUpdate ..\channel-artifacts\OrgRevenueMSPanchors.tx -channelID $CHANNEL_NAME -asOrg OrgRevenueMSP
    ..\bin\configtxgen.exe -profile LandMainChannel -outputAnchorPeersUpdate ..\channel-artifacts\OrgRegistrationMSPanchors.tx -channelID $CHANNEL_NAME -asOrg OrgRegistrationMSP
    ..\bin\configtxgen.exe -profile LandMainChannel -outputAnchorPeersUpdate ..\channel-artifacts\OrgBankMSPanchors.tx -channelID $CHANNEL_NAME -asOrg OrgBankMSP
    
    Write-Host "✅ Channel artifacts generated" -ForegroundColor Green
} else {
    Write-Host "❌ configtxgen not found" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Start Docker containers
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker-compose -f network\docker-compose.yaml up -d

# Wait for containers to start
Write-Host "⏳ Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if containers are running
$CONTAINERS = docker ps --format "{{.Names}}" | Where-Object { $_ -like "*landregistry*" -or $_ -like "*orderer*" -or $_ -like "*peer*" }
if ($CONTAINERS) {
    Write-Host "✅ Containers started successfully:" -ForegroundColor Green
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -like "*peer*" -or $_ -like "*orderer*" }
} else {
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    exit 1
}

# Create channel
Write-Host "📡 Creating channel: $CHANNEL_NAME..." -ForegroundColor Yellow
docker exec cli peer channel create -o orderer0.orderer.landregistry.gov.in:7050 -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/${CHANNEL_NAME}.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Channel created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Channel might already exist or creation failed" -ForegroundColor Yellow
}

# Join peers to channel
Write-Host "🔗 Joining peers to channel..." -ForegroundColor Yellow

# Revenue Org Peer0
Write-Host "  Joining peer0.revenue..." -ForegroundColor Gray
docker exec cli peer channel join -b $CHANNEL_NAME.block

# Registration Org Peer0
Write-Host "  Joining peer0.registration..." -ForegroundColor Gray
docker exec -e CORE_PEER_LOCALMSPID=OrgRegistrationMSP -e CORE_PEER_ADDRESS=peer0.registration.landregistry.gov.in:9051 -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/peers/peer0.registration.landregistry.gov.in/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/users/Admin@registration.landregistry.gov.in/msp cli peer channel join -b $CHANNEL_NAME.block

# Bank Org Peer0
Write-Host "  Joining peer0.bank..." -ForegroundColor Gray
docker exec -e CORE_PEER_LOCALMSPID=OrgBankMSP -e CORE_PEER_ADDRESS=peer0.bank.landregistry.gov.in:11051 -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/users/Admin@bank.landregistry.gov.in/msp cli peer channel join -b $CHANNEL_NAME.block

Write-Host "✅ Peers joined to channel" -ForegroundColor Green

# Update anchor peers
Write-Host "⚓ Updating anchor peers..." -ForegroundColor Yellow
docker exec cli peer channel update -o orderer0.orderer.landregistry.gov.in:7050 -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/OrgRevenueMSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

Write-Host ""
Write-Host "✅ Land Registry Network is UP and RUNNING!" -ForegroundColor Green
Write-Host ""
Write-Host "Network Details:" -ForegroundColor Cyan
Write-Host "  Channel: $CHANNEL_NAME" -ForegroundColor White
Write-Host "  Orderers: 5 (Raft consensus)" -ForegroundColor White
Write-Host "  Organizations: 6 (Revenue, Registration, Bank, GovTech, Public, Agri)" -ForegroundColor White
Write-Host "  Peers: 8+" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Deploy chaincode" -ForegroundColor Yellow
Write-Host "  Run: .\scripts\deploy-chaincode.ps1" -ForegroundColor White
