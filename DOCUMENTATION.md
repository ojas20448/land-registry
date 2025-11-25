# India Land Registry System

Blockchain-based land registration platform using Hyperledger Fabric. Built for the Indian land records digitization initiative.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running](#running)
- [API Reference](#api-reference)
- [Chaincode](#chaincode)
- [Network](#network)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Overview

This project addresses key issues with traditional land registry:

**Current problems:**
- Paper records get damaged or lost
- Fake documents and fraudulent sales
- Disputes take years to resolve
- No easy way to verify ownership history
- Banks struggle to check encumbrances

**What we built:**
- Tamper-proof records on Hyperledger Fabric
- Full ownership chain visible to anyone
- Citizens can verify property details online
- Banks can check mortgage status instantly
- Disputes tracked on-chain

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  Citizen Portal │  │  Admin Portal   │  │  Bank Portal        │ │
│  │  (React + Vite) │  │  (Future)       │  │  (Future)           │ │
│  │  Port: 3000     │  │                 │  │                     │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │
└───────────┼─────────────────────┼─────────────────────┼─────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Express.js REST API Server                    │   │
│  │                      Port: 4000                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │   │
│  │  │ Public APIs  │  │ Admin APIs   │  │ Bank APIs        │   │   │
│  │  │ /api/public/ │  │ /api/admin/  │  │ /api/bank/       │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (Hyperledger Fabric)            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Smart Contract (Chaincode)                │   │
│  │                    land-registry-contract                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │   │
│  │  │  Land    │ │ Transfer │ │ Dispute  │ │   Mortgage   │    │   │
│  │  │  CRUD    │ │ Workflow │ │ Mgmt     │ │   Workflow   │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Channel: land-main-channel                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  Revenue    │  │ Registration│  │    Bank     │          │  │
│  │  │    Org      │  │    Org      │  │    Org      │          │  │
│  │  │  Peer0/1    │  │   Peer0     │  │   Peer0     │          │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │  │
│  │         │                │                │                  │  │
│  │         └────────────────┼────────────────┘                  │  │
│  │                          ▼                                   │  │
│  │              ┌─────────────────────┐                         │  │
│  │              │   Raft Consensus    │                         │  │
│  │              │  (3 Orderer Nodes)  │                         │  │
│  │              └─────────────────────┘                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      State Database                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  CouchDB    │  │  CouchDB    │  │  CouchDB    │          │  │
│  │  │  (Revenue)  │  │(Registration│  │   (Bank)    │          │  │
│  │  │  Port:5984  │  │  Port:6984  │  │  Port:7984  │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### Citizens
- Search properties by Land ID or Survey Number
- View complete ownership history
- Verify document authenticity
- Check property details (area, type, status)

### Revenue Department
- Register new land parcels
- Process ownership transfers
- Manage mutation records
- Handle survey data

### Registration Department
- Register sale deeds
- Collect stamp duty
- Store document hashes on-chain
- Biometric verification of parties

### Banks
- Register mortgages against properties
- Place/release liens
- Track loans against land
- Run encumbrance checks

### Dispute Handling
- File disputes on-chain
- Track case status
- Record resolutions permanently

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite 5 | Build Tool |
| Material-UI 5 | Component Library |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express.js | Web Framework |
| TypeScript | Type Safety |
| Fabric Gateway | Blockchain Connection |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Hyperledger Fabric 2.5 | Blockchain Platform |
| Raft Consensus | Ordering Service |
| CouchDB | State Database |
| Node.js Chaincode | Smart Contracts |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Container Orchestration |
| WSL2 | Linux Compatibility (Windows) |

## Project Structure

```
Land Registerations/
├── chaincode/                  # Fabric smart contract (TypeScript)
│   ├── src/
│   │   ├── contracts/          # Main contract logic
│   │   └── models/             # Data models (parcel, dispute, mortgage)
│   └── package.json
│
├── api-server/                 # Express REST API
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Fabric gateway connection
│   │   └── middleware/         # Auth, etc
│   └── server.js               # Standalone dev server
│
├── ui-citizen-portal/          # React frontend
│   ├── src/
│   │   └── components/         # UI components
│   ├── dist/                   # Production build output
│   └── vite.config.ts
│
├── network/                    # Fabric network config
│   ├── docker-compose.yaml     # All containers
│   ├── configtx.yaml           # Channel config
│   └── organizations/          # Crypto material
│
├── scripts/                    # PowerShell automation
│   ├── install-fabric.ps1
│   ├── start-network.ps1
│   └── deploy-chaincode.ps1
│
└── bin/                        # Fabric CLI binaries
```

## Setup

**Requirements:** Windows 10/11, WSL2, Docker Desktop 4.0+, Node.js 18+

### 1. Enable WSL2

```powershell
# Admin PowerShell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
# Reboot, then:
wsl --install -d Ubuntu
```

### 2. Install Docker Desktop

Download from docker.com, enable WSL2 backend during install.

### 3. Clone and install deps

```powershell
git clone <repo-url>
cd "Land Registerations"

cd chaincode; npm install; cd ..
cd api-server; npm install; cd ..
cd ui-citizen-portal; npm install; cd ..
```

### 4. Get Fabric binaries

```powershell
.\scripts\install-fabric.ps1
```

Pulls Fabric Docker images and downloads CLI tools.

### 5. Start the network

```powershell
.\scripts\start-network-simple.ps1
```

Generates crypto material and spins up all containers.

## Running

### Dev mode

```powershell
# Terminal 1 - API
cd api-server
node server.js

# Terminal 2 - UI
cd ui-citizen-portal
npm start
```

UI at http://localhost:3000, API at http://localhost:4000

### Production build

```powershell
cd ui-citizen-portal
npm run build
npx serve dist -l 3001
```

### Sample data

These land IDs work with the mock API:

- `MH-MUM-001` - Mumbai, Residential
- `KA-BLR-003` - Bangalore, Commercial  
- `PB-LDH-002` - Ludhiana, Agricultural
- `DL-NEW-004` - Delhi, Mortgaged

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000
```

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "mode": "MOCK"
}
```

### Public APIs

#### Get Parcel Details
```http
GET /api/v1/public/parcels/:landId
```
**Example:** `GET /api/v1/public/parcels/MH-MUM-001`

**Response:**
```json
{
  "success": true,
  "data": {
    "landId": "MH-MUM-001",
    "surveyNumber": "SUR-2024-MH-001",
    "state": "Maharashtra",
    "district": "Mumbai City",
    "village": "Bandra East",
    "currentOwnerName": "Rajesh Kumar",
    "status": "ACTIVE",
    "landType": "RESIDENTIAL",
    "area": 1200,
    "areaUnit": "sqft",
    "ownershipHistoryCount": 1,
    "hasDisputes": false,
    "hasMortgages": false
  }
}
```

#### Get Ownership History
```http
GET /api/v1/public/parcels/:landId/history
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "eventType": "Initial Registration",
      "toOwnerName": "Rajesh Kumar",
      "fromOwnerName": "Legacy System",
      "transactionDate": "2024-01-15T00:00:00Z",
      "documentRef": "DOC-MH-MUM-001-001"
    }
  ]
}
```

#### Verify Document
```http
POST /api/public/document/verify
Content-Type: application/json

{
  "docId": "DOC-001",
  "hash": "abc123..."
}
```

### Admin APIs (Protected)

#### Register New Parcel
```http
POST /api/parcels
Content-Type: application/json

{
  "surveyNumber": "SUR-2024-MH-002",
  "district": "Pune",
  "village": "Kothrud",
  "state": "Maharashtra",
  "area": 2000,
  "areaUnit": "sqft",
  "ownerName": "New Owner",
  "landType": "RESIDENTIAL"
}
```

#### Propose Transfer
```http
POST /api/parcels/:landId/transfer/propose
Content-Type: application/json

{
  "newOwner": "Buyer Name",
  "saleAmount": 5000000
}
```

#### Finalize Transfer
```http
POST /api/parcels/:landId/transfer/finalize
Content-Type: application/json

{
  "eventId": "TRANSFER-123",
  "stampDuty": 250000,
  "registrationFee": 50000
}
```

### Bank APIs

#### Create Mortgage
```http
POST /api/bank/mortgage
Content-Type: application/json

{
  "landId": "MH-MUM-001",
  "loanAmount": 2500000,
  "bankName": "State Bank of India"
}
```

#### Close Mortgage
```http
POST /api/bank/mortgage/:mortgageId/close
```

#### Check Mortgage Status
```http
GET /api/bank/mortgage/land/:landId
```

### Dispute APIs

#### File Dispute
```http
POST /api/disputes
Content-Type: application/json

{
  "landId": "MH-MUM-001",
  "disputeType": "BOUNDARY",
  "description": "Boundary encroachment by neighbor"
}
```

#### Resolve Dispute
```http
POST /api/disputes/:disputeId/resolve
Content-Type: application/json

{
  "resolution": "Dispute resolved through mutual agreement"
}
```

---

## 📜 Smart Contract (Chaincode)

### Contract Name
`land-registry-contract`

### Functions

| Function | Description | Access |
|----------|-------------|--------|
| `InitLedger` | Initialize with sample data | Admin |
| `CreateLandParcel` | Register new land | Revenue |
| `GetLandParcel` | Get parcel details | Public |
| `GetOwnershipHistory` | Get transfer history | Public |
| `LandExists` | Check if parcel exists | Public |
| `ProposeTransfer` | Initiate ownership transfer | Revenue |
| `FinalizeTransfer` | Complete transfer | Registration |
| `FileDispute` | Register property dispute | Any Org |
| `ResolveDispute` | Resolve dispute | Revenue |
| `CreateMortgage` | Register mortgage | Bank |
| `CloseMortgage` | Close mortgage | Bank |
| `GetParcelsByOwner` | Query by owner | Public |
| `GetParcelsByDistrict` | Query by location | Public |
| `GetParcelsByStatus` | Query by status | Public |

### Data Models

#### LandParcel
```typescript
interface LandParcel {
  landId: string;
  surveyNumber: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;
  area: number;
  areaUnit: string;
  currentOwner: string;
  currentOwnerName: string;
  ownerType: 'INDIVIDUAL' | 'JOINT' | 'GOVERNMENT' | 'CORPORATE';
  landType: 'AGRICULTURAL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  status: 'ACTIVE' | 'FROZEN' | 'UNDER_DISPUTE' | 'MORTGAGED';
  documentHash?: string;
  documentUri?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### OwnershipEvent
```typescript
interface OwnershipEvent {
  eventId: string;
  landId: string;
  eventType: 'REGISTRATION' | 'SALE' | 'GIFT' | 'INHERITANCE' | 'PARTITION';
  fromOwner?: string;
  fromOwnerName?: string;
  toOwner: string;
  toOwnerName: string;
  registrationNumber: string;
  consideration: number;
  stampDuty: number;
  documentHash: string;
  documentUri: string;
  biometricVerified: boolean;
  transactionDate: string;
}
```

#### Dispute
```typescript
interface Dispute {
  disputeId: string;
  landId: string;
  disputeType: 'BOUNDARY' | 'OWNERSHIP' | 'TITLE' | 'ENCROACHMENT';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  filedBy: string;
  filedByName: string;
  filedAgainst?: string;
  filedAgainstName?: string;
  description: string;
  courtCaseId?: string;
  resolution?: string;
  filedAt: string;
  resolvedAt?: string;
}
```

#### Mortgage
```typescript
interface Mortgage {
  mortgageId: string;
  landId: string;
  mortgageType: 'SIMPLE' | 'ENGLISH' | 'EQUITABLE';
  borrower: string;
  borrowerName: string;
  lenderName: string;
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULT';
  sanctionLetterHash?: string;
  sanctionLetterUri?: string;
  createdAt: string;
  closedAt?: string;
}
```

---

## 🏢 Organizations & Network

### Network Configuration

| Component | Count | Purpose |
|-----------|-------|---------|
| Orderers | 3 | Raft consensus ordering |
| Revenue Peers | 2 | Land records management |
| Registration Peers | 1 | Sale deed registration |
| Bank Peers | 1 | Mortgage management |
| CouchDB | 3 | State database per org |
| CLI | 1 | Admin operations |

### Organizations

| Organization | MSP ID | Role |
|--------------|--------|------|
| Revenue Dept | OrgRevenueMSP | Land records, mutations |
| Registration Dept | OrgRegistrationMSP | Sale deeds, stamp duty |
| Banks | OrgBankMSP | Mortgages, liens |
| GovTech | OrgGovTechMSP | Technical operations |
| PublicGateway | OrgPublicGatewayMSP | Public access |
| Agriculture | OrgAgriMSP | Agricultural land |

### Ports

| Service | Port |
|---------|------|
| Revenue Peer0 | 7051 |
| Registration Peer0 | 9051 |
| Bank Peer0 | 11051 |
| Orderer0 | 7050 |
| Orderer1 | 8050 |
| Orderer2 | 9050 |
| CouchDB (Revenue) | 5984 |
| CouchDB (Registration) | 6984 |
| CouchDB (Bank) | 7984 |

---

## 🔐 Security

### Blockchain Security
- **Immutability**: All transactions are cryptographically linked
- **Consensus**: Raft consensus ensures agreement among orderers
- **MSP**: Membership Service Provider manages identities
- **TLS**: All peer-to-peer communication is encrypted

### Application Security
- **CORS**: Cross-origin requests restricted
- **Helmet**: Security headers enabled
- **Input Validation**: All inputs validated
- **Document Hashing**: Documents stored as SHA-256 hashes

### Access Control
- **Public APIs**: Open for property verification
- **Admin APIs**: Require organization credentials
- **Endorsement Policies**: Multi-org approval for transactions

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :4000

# Kill process
Stop-Process -Id <PID> -Force
```

#### Docker Containers Not Starting
```powershell
# Restart Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait and start network
Start-Sleep -Seconds 20
cd network
docker-compose up -d
```

#### Blank Screen in UI
1. Check API is running: `http://localhost:4000/health`
2. Check browser console for CORS errors
3. Verify `.env.production` has correct API URL
4. Rebuild: `npm run build`

#### API Connection Refused
```powershell
# Start API server
cd api-server
node server.js
```

### Logs

```powershell
# Docker container logs
docker logs peer0.revenue.landregistry.gov.in
docker logs orderer0.orderer.landregistry.gov.in

# All container status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| Fabric Network | ✅ Running (11 containers) |
| Chaincode | ✅ Compiled |
| API Server | ✅ Running (Mock Mode) |
| UI (Dev) | ✅ Working |
| UI (Production Build) | ✅ Ready |
| Channel Creation | ⏳ Pending |
| Chaincode Deployment | ⏳ Pending |
| Production Fabric Integration | ⏳ Pending |

---

##  Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Review container logs
3. Verify network connectivity
4. Check API health endpoint

---

## 📄 License

MIT License 

---

## 🙏 Acknowledgments

- Hyperledger Fabric Community
- Government of India Digital India Initiative
- Open Source Contributors

---

*Last Updated: November 2025*
