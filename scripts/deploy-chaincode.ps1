# Deploy Land Registry Chaincode to Fabric Network

Write-Host "📦 Deploying Land Registry Chaincode..." -ForegroundColor Cyan

$CHANNEL_NAME = "land-main-channel"
$CHAINCODE_NAME = "land-registry-contract"
$CHAINCODE_VERSION = "1.0"
$CHAINCODE_SEQUENCE = 1
$CHAINCODE_PATH = "../chaincode"

# Build chaincode
Write-Host "🔨 Building chaincode..." -ForegroundColor Yellow
Set-Location chaincode
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chaincode build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Chaincode built successfully" -ForegroundColor Green
Set-Location ..

# Package chaincode
Write-Host "📦 Packaging chaincode..." -ForegroundColor Yellow
$CHAINCODE_LABEL = "${CHAINCODE_NAME}_${CHAINCODE_VERSION}"

docker exec cli peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz `
    --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode `
    --lang node `
    --label $CHAINCODE_LABEL

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Chaincode packaged" -ForegroundColor Green
} else {
    Write-Host "❌ Chaincode packaging failed" -ForegroundColor Red
    exit 1
}

# Install chaincode on Revenue Org peer
Write-Host "📥 Installing chaincode on Revenue Org..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

# Install chaincode on Registration Org peer
Write-Host "📥 Installing chaincode on Registration Org..." -ForegroundColor Yellow
docker exec -e CORE_PEER_LOCALMSPID=OrgRegistrationMSP `
    -e CORE_PEER_ADDRESS=peer0.registration.landregistry.gov.in:9051 `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/peers/peer0.registration.landregistry.gov.in/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/users/Admin@registration.landregistry.gov.in/msp `
    cli peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

# Install chaincode on Bank Org peer
Write-Host "📥 Installing chaincode on Bank Org..." -ForegroundColor Yellow
docker exec -e CORE_PEER_LOCALMSPID=OrgBankMSP `
    -e CORE_PEER_ADDRESS=peer0.bank.landregistry.gov.in:11051 `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/users/Admin@bank.landregistry.gov.in/msp `
    cli peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

Write-Host "✅ Chaincode installed on all peers" -ForegroundColor Green

# Query installed chaincode to get package ID
Write-Host "🔍 Querying installed chaincode..." -ForegroundColor Yellow
$CC_PACKAGE_ID = docker exec cli peer lifecycle chaincode queryinstalled | Select-String -Pattern "${CHAINCODE_LABEL}" | ForEach-Object { ($_ -split ", ")[0] -replace "Package ID: ", "" }

Write-Host "📌 Package ID: $CC_PACKAGE_ID" -ForegroundColor Cyan

# Approve chaincode for Revenue Org
Write-Host "✅ Approving chaincode for Revenue Org..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode approveformyorg `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $CHAINCODE_VERSION `
    --package-id $CC_PACKAGE_ID `
    --sequence $CHAINCODE_SEQUENCE `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

# Approve chaincode for Registration Org
Write-Host "✅ Approving chaincode for Registration Org..." -ForegroundColor Yellow
docker exec -e CORE_PEER_LOCALMSPID=OrgRegistrationMSP `
    -e CORE_PEER_ADDRESS=peer0.registration.landregistry.gov.in:9051 `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/peers/peer0.registration.landregistry.gov.in/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/users/Admin@registration.landregistry.gov.in/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $CHAINCODE_VERSION `
    --package-id $CC_PACKAGE_ID `
    --sequence $CHAINCODE_SEQUENCE `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

# Approve chaincode for Bank Org
Write-Host "✅ Approving chaincode for Bank Org..." -ForegroundColor Yellow
docker exec -e CORE_PEER_LOCALMSPID=OrgBankMSP `
    -e CORE_PEER_ADDRESS=peer0.bank.landregistry.gov.in:11051 `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/users/Admin@bank.landregistry.gov.in/msp `
    cli peer lifecycle chaincode approveformyorg `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $CHAINCODE_VERSION `
    --package-id $CC_PACKAGE_ID `
    --sequence $CHAINCODE_SEQUENCE `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

# Check commit readiness
Write-Host "🔍 Checking commit readiness..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode checkcommitreadiness `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $CHAINCODE_VERSION `
    --sequence $CHAINCODE_SEQUENCE `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt

# Commit chaincode
Write-Host "🚀 Committing chaincode to channel..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode commit `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --channelID $CHANNEL_NAME `
    --name $CHAINCODE_NAME `
    --version $CHAINCODE_VERSION `
    --sequence $CHAINCODE_SEQUENCE `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    --peerAddresses peer0.revenue.landregistry.gov.in:7051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/revenue.landregistry.gov.in/peers/peer0.revenue.landregistry.gov.in/tls/ca.crt `
    --peerAddresses peer0.registration.landregistry.gov.in:9051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/peers/peer0.registration.landregistry.gov.in/tls/ca.crt `
    --peerAddresses peer0.bank.landregistry.gov.in:11051 `
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Chaincode committed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Chaincode commit failed" -ForegroundColor Red
    exit 1
}

# Query committed chaincode
Write-Host "🔍 Verifying chaincode deployment..." -ForegroundColor Yellow
docker exec cli peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CHAINCODE_NAME

Write-Host ""
Write-Host "✅ Chaincode Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Chaincode Details:" -ForegroundColor Cyan
Write-Host "  Name: $CHAINCODE_NAME" -ForegroundColor White
Write-Host "  Version: $CHAINCODE_VERSION" -ForegroundColor White
Write-Host "  Channel: $CHANNEL_NAME" -ForegroundColor White
Write-Host "  Sequence: $CHAINCODE_SEQUENCE" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Seed sample data" -ForegroundColor Yellow
Write-Host "  Run: .\scripts\seed-data.ps1" -ForegroundColor White
