# Seed Sample Data into Land Registry Blockchain

Write-Host "🌱 Seeding sample data into blockchain..." -ForegroundColor Cyan

$CHANNEL_NAME = "land-main-channel"
$CHAINCODE_NAME = "land-registry-contract"

Write-Host "📝 Creating sample land parcels..." -ForegroundColor Yellow

# Sample Parcel 1: Residential land in Mumbai
Write-Host "  Creating parcel: MH-MUM-001..." -ForegroundColor Gray
docker exec cli peer chaincode invoke `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"CreateParcelFromLegacyData\",\"Args\":[\"MH-MUM-001\",\"123/4\",\"Maharashtra\",\"Mumbai\",\"Andheri\",\"Andheri West\",\"400053\",\"500\",\"SQMT\",\"AADHAAR-1001\",\"Rajesh Kumar\",\"INDIVIDUAL\",\"RESIDENTIAL\",\"hash-doc-001\",\"digilocker://doc-001\"]}'

Start-Sleep -Seconds 2

# Sample Parcel 2: Agricultural land in Punjab
Write-Host "  Creating parcel: PB-LDH-002..." -ForegroundColor Gray
docker exec cli peer chaincode invoke `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"CreateParcelFromLegacyData\",\"Args\":[\"PB-LDH-002\",\"789/2\",\"Punjab\",\"Ludhiana\",\"Jagraon\",\"Village Rampur\",\"141401\",\"5\",\"ACRE\",\"AADHAAR-1002\",\"Gurpreet Singh\",\"INDIVIDUAL\",\"AGRICULTURAL\",\"hash-doc-002\",\"digilocker://doc-002\"]}'

Start-Sleep -Seconds 2

# Sample Parcel 3: Commercial land in Bangalore
Write-Host "  Creating parcel: KA-BLR-003..." -ForegroundColor Gray
docker exec cli peer chaincode invoke `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"CreateParcelFromLegacyData\",\"Args\":[\"KA-BLR-003\",\"456/1\",\"Karnataka\",\"Bangalore Urban\",\"Bangalore North\",\"Koramangala\",\"560034\",\"1000\",\"SQMT\",\"AADHAAR-1003\",\"Priya Sharma\",\"COMPANY\",\"COMMERCIAL\",\"hash-doc-003\",\"digilocker://doc-003\"]}'

Start-Sleep -Seconds 2

# Sample Parcel 4: Residential with mortgage
Write-Host "  Creating parcel: DL-NEW-004..." -ForegroundColor Gray
docker exec cli peer chaincode invoke `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"CreateParcelFromLegacyData\",\"Args\":[\"DL-NEW-004\",\"234/5\",\"Delhi\",\"New Delhi\",\"Dwarka\",\"Sector 12\",\"110075\",\"250\",\"SQMT\",\"AADHAAR-1004\",\"Amit Patel\",\"INDIVIDUAL\",\"RESIDENTIAL\",\"hash-doc-004\",\"digilocker://doc-004\"]}'

Start-Sleep -Seconds 2

Write-Host "✅ Sample parcels created" -ForegroundColor Green

# Create a mortgage on parcel 4
Write-Host "🏦 Creating sample mortgage..." -ForegroundColor Yellow
docker exec -e CORE_PEER_LOCALMSPID=OrgBankMSP `
    -e CORE_PEER_ADDRESS=peer0.bank.landregistry.gov.in:11051 `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/users/Admin@bank.landregistry.gov.in/msp `
    cli peer chaincode invoke `
    -o orderer0.orderer.landregistry.gov.in:7050 `
    --tls `
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.landregistry.gov.in/orderers/orderer0.orderer.landregistry.gov.in/tls/ca.crt `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"CreateMortgage\",\"Args\":[\"MTG-001\",\"DL-NEW-004\",\"HOME_LOAN\",\"AADHAAR-1004\",\"Amit Patel\",\"State Bank of India\",\"5000000\",\"8.5\",\"240\",\"hash-sanction-001\",\"digilocker://sanction-001\"]}'

Start-Sleep -Seconds 2
Write-Host "✅ Sample mortgage created" -ForegroundColor Green

# Query sample data
Write-Host "🔍 Querying sample data..." -ForegroundColor Yellow

Write-Host "  Parcel MH-MUM-001:" -ForegroundColor Gray
docker exec cli peer chaincode query `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"GetParcel\",\"Args\":[\"MH-MUM-001\"]}'

Write-Host ""
Write-Host "  Parcels owned by AADHAAR-1001:" -ForegroundColor Gray
docker exec cli peer chaincode query `
    -C $CHANNEL_NAME `
    -n $CHAINCODE_NAME `
    -c '{\"function\":\"QueryParcelsByOwner\",\"Args\":[\"AADHAAR-1001\"]}'

Write-Host ""
Write-Host "✅ Sample Data Seeding Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Sample Parcels Created:" -ForegroundColor Cyan
Write-Host "  1. MH-MUM-001: Residential in Mumbai (Rajesh Kumar)" -ForegroundColor White
Write-Host "  2. PB-LDH-002: Agricultural in Punjab (Gurpreet Singh)" -ForegroundColor White
Write-Host "  3. KA-BLR-003: Commercial in Bangalore (Priya Sharma)" -ForegroundColor White
Write-Host "  4. DL-NEW-004: Residential in Delhi (Amit Patel) - Has Mortgage" -ForegroundColor White
Write-Host ""
Write-Host "Next step: Start API server" -ForegroundColor Yellow
Write-Host "  cd api-server" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
