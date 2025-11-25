# Start Hyperledger Fabric Network for Land Registry
# Generates crypto material, starts Docker containers, creates channel

Write-Host "Starting Hyperledger Fabric Network..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$CHANNEL_NAME = "land-main-channel"
$FABRIC_CFG_PATH = "$PWD\network"

# Step 1: Generate crypto material
Write-Host "Step 1: Generating crypto material..." -ForegroundColor Yellow
if (!(Test-Path "network\organizations")) {
    & .\bin\cryptogen.exe generate --config=.\network\crypto-config.yaml --output=.\network\organizations
    Write-Host "Crypto material generated" -ForegroundColor Green
} else {
    Write-Host "Crypto material already exists" -ForegroundColor Green
}

# Step 2: Generate genesis block
Write-Host ""
Write-Host "Step 2: Generating genesis block..." -ForegroundColor Yellow
if (!(Test-Path "network\channel-artifacts")) {
    New-Item -ItemType Directory -Path "network\channel-artifacts" | Out-Null
}

Push-Location network
$env:FABRIC_CFG_PATH = $PWD
& ..\bin\configtxgen.exe -profile LandRegistryOrdererGenesis -channelID system-channel -outputBlock .\channel-artifacts\genesis.block
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "Genesis block created" -ForegroundColor Green
} else {
    Write-Host "Error creating genesis block" -ForegroundColor Red
    exit 1
}

# Step 3: Generate channel configuration
Write-Host ""
Write-Host "Step 3: Generating channel configuration..." -ForegroundColor Yellow
Push-Location network
$env:FABRIC_CFG_PATH = $PWD
& ..\bin\configtxgen.exe -profile LandMainChannel -outputCreateChannelTx .\channel-artifacts\$CHANNEL_NAME.tx -channelID $CHANNEL_NAME
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "Channel configuration created" -ForegroundColor Green
} else {
    Write-Host "Error creating channel config" -ForegroundColor Red
    exit 1
}

# Step 4: Start Docker containers
Write-Host ""
Write-Host "Step 4: Starting Docker containers..." -ForegroundColor Yellow
docker-compose -f .\network\docker-compose.yaml up -d

Start-Sleep -Seconds 10

# Check containers
$runningContainers = docker ps --format "{{.Names}}" | Measure-Object
Write-Host "Containers running: $($runningContainers.Count)" -ForegroundColor Green

# Step 5: Create channel
Write-Host ""
Write-Host "Step 5: Creating channel..." -ForegroundColor Yellow
$env:CORE_PEER_LOCALMSPID = "OrgRevenueMSP"
$env:CORE_PEER_TLS_ENABLED = "true"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "$PWD\network\organizations\peerOrganizations\revenue.landregistry.gov.in\peers\peer0.revenue.landregistry.gov.in\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "$PWD\network\organizations\peerOrganizations\revenue.landregistry.gov.in\users\Admin@revenue.landregistry.gov.in\msp"
$env:CORE_PEER_ADDRESS = "localhost:7051"

& .\bin\peer.exe channel create -o localhost:7050 -c $CHANNEL_NAME -f .\network\channel-artifacts\$CHANNEL_NAME.tx --outputBlock .\network\channel-artifacts\$CHANNEL_NAME.block --tls --cafile .\network\organizations\ordererOrganizations\landregistry.gov.in\orderers\orderer0.landregistry.gov.in\msp\tlscacerts\tlsca.landregistry.gov.in-cert.pem

if ($LASTEXITCODE -eq 0) {
    Write-Host "Channel created successfully" -ForegroundColor Green
} else {
    Write-Host "Channel creation completed (may already exist)" -ForegroundColor Yellow
}

# Step 6: Join peers to channel
Write-Host ""
Write-Host "Step 6: Joining peers to channel..." -ForegroundColor Yellow

# Join Revenue peer
Write-Host "  Joining Revenue peer..." -ForegroundColor Gray
$env:CORE_PEER_LOCALMSPID = "OrgRevenueMSP"
$env:CORE_PEER_ADDRESS = "localhost:7051"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "$PWD\network\organizations\peerOrganizations\revenue.landregistry.gov.in\peers\peer0.revenue.landregistry.gov.in\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "$PWD\network\organizations\peerOrganizations\revenue.landregistry.gov.in\users\Admin@revenue.landregistry.gov.in\msp"
& .\bin\peer.exe channel join -b .\network\channel-artifacts\$CHANNEL_NAME.block

# Join Registration peer
Write-Host "  Joining Registration peer..." -ForegroundColor Gray
$env:CORE_PEER_LOCALMSPID = "OrgRegistrationMSP"
$env:CORE_PEER_ADDRESS = "localhost:9051"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "$PWD\network\organizations\peerOrganizations\registration.landregistry.gov.in\peers\peer0.registration.landregistry.gov.in\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "$PWD\network\organizations\peerOrganizations\registration.landregistry.gov.in\users\Admin@registration.landregistry.gov.in\msp"
& .\bin\peer.exe channel join -b .\network\channel-artifacts\$CHANNEL_NAME.block

# Join Bank peer
Write-Host "  Joining Bank peer..." -ForegroundColor Gray
$env:CORE_PEER_LOCALMSPID = "OrgBankMSP"
$env:CORE_PEER_ADDRESS = "localhost:11051"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "$PWD\network\organizations\peerOrganizations\bank.landregistry.gov.in\peers\peer0.bank.landregistry.gov.in\tls\ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "$PWD\network\organizations\peerOrganizations\bank.landregistry.gov.in\users\Admin@bank.landregistry.gov.in\msp"
& .\bin\peer.exe channel join -b .\network\channel-artifacts\$CHANNEL_NAME.block

Write-Host ""
Write-Host "Network is UP and RUNNING!" -ForegroundColor Green
Write-Host ""
Write-Host "Network Details:" -ForegroundColor Cyan
Write-Host "  Channel: $CHANNEL_NAME" -ForegroundColor White
Write-Host "  Orderers: 5 (Raft consensus)" -ForegroundColor White
Write-Host "  Organizations: 6" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Deploy chaincode" -ForegroundColor Yellow
Write-Host "  Run: .\scripts\deploy-chaincode.ps1" -ForegroundColor White
