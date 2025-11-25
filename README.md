# Land Registry System

Blockchain-based land registration using Hyperledger Fabric. Handles ownership records, transfers, mortgages, and disputes.

## What it does

- Stores land records on a permissioned blockchain
- Tracks ownership history with full audit trail
- Prevents double-selling through real-time checks
- Manages mortgages and liens
- Handles property disputes with freeze/unfreeze

## Architecture

```
Frontend (React)  -->  API (Express)  -->  Fabric Network
                                               |
                            +------------------+------------------+
                            |                  |                  |
                        Revenue Org     Registration Org      Bank Org
                        (2 peers)         (1 peer)           (1 peer)
                            |                  |                  |
                            +------------------+------------------+
                                               |
                                    Raft Ordering (3 nodes)
                                               |
                                          CouchDB
```

**Orgs:** Revenue, Registration, Bank, GovTech, PublicGateway, Agriculture

**Chaincode:** TypeScript smart contract with CRUD + transfer workflows

## Project Structure

```
├── chaincode/           # Fabric smart contract
│   └── src/
│       ├── contracts/   # Main contract logic
│       └── models/      # Data models
├── api-server/          # Express REST API
│   └── src/
│       ├── routes/      # API endpoints
│       └── services/    # Fabric gateway
├── ui-citizen-portal/   # React frontend
├── network/             # Docker compose, channel config
├── scripts/             # PowerShell automation
└── bin/                 # Fabric CLI binaries
```

## Setup

Needs: Windows 10/11, WSL2, Docker Desktop, Node 18+

```powershell
# Install Fabric
.\scripts\install-fabric.ps1

# Install deps
cd chaincode && npm install && cd ..
cd api-server && npm install && cd ..
cd ui-citizen-portal && npm install && cd ..

# Start network
.\scripts\start-network-simple.ps1
```

## Running

Dev mode (mock API):

```powershell
# Terminal 1
cd api-server && node server.js

# Terminal 2
cd ui-citizen-portal && npm start
```

UI: http://localhost:3000  
API: http://localhost:4000

## Sample Data

Test parcels in mock mode:

| ID | Location | Type |
|----|----------|------|
| MH-MUM-001 | Mumbai | Residential |
| KA-BLR-003 | Bangalore | Commercial |
| PB-LDH-002 | Ludhiana | Agricultural |
| DL-NEW-004 | Delhi | Mortgaged |

## API Endpoints

**Public:**
- `GET /api/v1/public/parcels/:id` - Get parcel details
- `GET /api/v1/public/parcels/:id/history` - Ownership history

**Admin:**
- `POST /api/parcels` - Create parcel
- `POST /api/parcels/:id/transfer/propose` - Start transfer
- `POST /api/parcels/:id/transfer/finalize` - Complete transfer

**Bank:**
- `POST /api/bank/mortgage` - Create mortgage
- `POST /api/bank/mortgage/:id/close` - Close mortgage

**Disputes:**
- `POST /api/disputes` - File dispute
- `POST /api/disputes/:id/resolve` - Resolve

## Chaincode Functions

| Function | Description |
|----------|-------------|
| CreateLandParcel | Register new land |
| GetLandParcel | Get parcel by ID |
| GetOwnershipHistory | Get transfer chain |
| ProposeTransfer | Start sale |
| FinalizeTransfer | Complete sale |
| FileDispute | Freeze parcel |
| ResolveDispute | Unfreeze |
| CreateMortgage | Add lien |
| CloseMortgage | Remove lien |

## Network Details

| Container | Port |
|-----------|------|
| Revenue Peer0 | 7051 |
| Registration Peer0 | 9051 |
| Bank Peer0 | 11051 |
| Orderer0 | 7050 |
| CouchDB (Revenue) | 5984 |

## Troubleshooting

Port in use:
```powershell
netstat -ano | findstr :4000
Stop-Process -Id <PID> -Force
```

Docker issues:
```powershell
docker-compose down
docker-compose up -d
```

Check containers:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```
