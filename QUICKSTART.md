# 🚀 Quick Start Guide

## Prerequisites Installation

### Required Software

Since Docker is not currently installed on your system, you have two options:

#### Option 1: Install Docker Desktop (Recommended for Testing)

1. **Download Docker Desktop for Windows**
   - Visit: https://www.docker.com/products/docker-desktop
   - Download and install Docker Desktop
   - Restart your computer after installation
   - Start Docker Desktop and wait for it to fully initialize

2. **Verify Docker Installation**
   ```powershell
   docker --version
   docker compose version
   ```

#### Option 2: Development Mode (No Docker Required)

Run the API server and UI in development mode with a mock Fabric connection.

---

## 🎯 Quick Start with Docker

Once Docker is installed, follow these steps:

### Step 1: Install Fabric Tools

```powershell
cd 'c:\Users\PC\Documents\Code\Land Registerations'
.\scripts\install-fabric.ps1
```

This will:
- Download Hyperledger Fabric binaries (cryptogen, configtxgen, peer)
- Pull Docker images (fabric-peer, fabric-orderer, fabric-ca, couchdb)
- Takes ~10-15 minutes depending on internet speed

### Step 2: Start the Fabric Network

```powershell
.\scripts\start-network.ps1
```

This will:
- Generate crypto material for all 6 organizations
- Start 5 orderer nodes (Raft consensus)
- Start 6 peer nodes (one per organization)
- Start 6 CouchDB instances
- Create the `land-main-channel`
- Join all peers to the channel

**Expected Output:**
```
✅ Crypto material generated
✅ Genesis block created
✅ Docker containers started (17 containers)
✅ Channel created: land-main-channel
✅ All peers joined channel
✅ Network is ready!
```

### Step 3: Deploy Chaincode

```powershell
.\scripts\deploy-chaincode.ps1
```

This will:
- Build the TypeScript chaincode
- Package it as a tar.gz
- Install on Revenue, Registration, and Bank peers
- Approve chaincode definition for each org
- Commit the chaincode to the channel

**Expected Duration:** 3-5 minutes

### Step 4: Seed Sample Data

```powershell
.\scripts\seed-data.ps1
```

This will create:
- 4 sample land parcels (Mumbai, Ludhiana, Bangalore, Delhi)
- 1 mortgage record
- Ownership history events

### Step 5: Start the API Server

```powershell
cd api-server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**API will be available at:** http://localhost:4000

### Step 6: Start the Citizen Portal

```powershell
cd ui-citizen-portal
npm install
npm start
```

**UI will be available at:** http://localhost:3000

---

## 🧪 Development Mode (Without Docker)

If you want to develop the API and UI without running Fabric:

### 1. Install Dependencies

```powershell
# API Server
cd api-server
npm install

# Citizen Portal
cd ..\ui-citizen-portal
npm install
```

### 2. Run in Mock Mode

```powershell
# Terminal 1: Start API in mock mode
cd api-server
$env:MOCK_FABRIC = "true"
npm run dev

# Terminal 2: Start UI
cd ui-citizen-portal
npm start
```

In mock mode:
- API returns simulated responses
- No blockchain backend required
- Good for UI development and testing
- Data is not persisted

---

## 📊 Verify Installation

### Check Network Status

```powershell
# View running containers
docker ps

# Expected: 17 containers running
# - 5 orderers (orderer0-4)
# - 6 peers (revenue, registration, bank, govtech, public, agri)
# - 6 CouchDB instances
```

### Test API Endpoints

```powershell
# Health check
curl http://localhost:4000/health

# Get a parcel (after seeding data)
curl http://localhost:4000/api/public/parcel/MH-MUM-001

# Get ownership history
curl http://localhost:4000/api/public/parcel/MH-MUM-001/history
```

### Import Postman Collection

1. Open Postman
2. Import `tests/postman/LandRegistry-API-Tests.json`
3. Set environment variables:
   - `baseUrl`: http://localhost:4000
   - `authToken`: (generate from login endpoint)
4. Run the test collection

---

## 🐛 Troubleshooting

### Docker Errors

**Error: Cannot connect to Docker daemon**
```powershell
# Start Docker Desktop
# Wait for it to fully initialize (check system tray icon)
```

**Error: Port already in use**
```powershell
# Stop existing containers
docker-compose -f network/docker-compose.yaml down -v

# Check for processes using ports
netstat -ano | findstr "7050 7051 5984"
```

### Chaincode Errors

**Error: Chaincode already installed**
```powershell
# This is normal - chaincode is already deployed
# To redeploy, increment the version in deploy-chaincode.ps1
```

**Error: Endorsement policy not satisfied**
```powershell
# Ensure at least 3 orgs have approved the chaincode
# Check with: peer lifecycle chaincode querycommitted
```

### API Errors

**Error: Cannot connect to Fabric network**
```powershell
# Check network is running
docker ps

# Verify .env file has correct paths
cat api-server/.env

# Check peer container logs
docker logs peer0.revenue.landregistry.gov.in
```

### Network Reset

If you need to completely reset the network:

```powershell
# Stop and remove all containers
.\scripts\stop-network.ps1

# Remove generated artifacts
Remove-Item -Recurse -Force network/organizations
Remove-Item -Recurse -Force network/channel-artifacts
Remove-Item -Recurse -Force bin

# Start fresh
.\scripts\install-fabric.ps1
.\scripts\start-network.ps1
.\scripts\deploy-chaincode.ps1
```

---

## 📁 Project Structure

```
Land Registerations/
├── README.md                  # Architecture overview
├── QUICKSTART.md             # This file
├── network/                  # Fabric network config
│   ├── docker-compose.yaml
│   ├── configtx.yaml
│   └── crypto-config.yaml
├── chaincode/                # Smart contracts
│   └── src/
│       ├── models/
│       └── contracts/
├── api-server/               # Node.js REST API
│   └── src/
│       ├── controllers/
│       ├── services/
│       └── routes/
├── ui-citizen-portal/        # React citizen portal
│   └── src/components/
├── scripts/                  # Automation scripts
│   ├── install-fabric.ps1
│   ├── start-network.ps1
│   ├── deploy-chaincode.ps1
│   ├── seed-data.ps1
│   └── stop-network.ps1
├── tests/                    # Test suites
│   └── postman/
└── docs/                     # Documentation
    ├── SECURITY.md
    └── DEPLOYMENT.md
```

---

## 🎓 Learning Resources

- **Hyperledger Fabric Docs**: https://hyperledger-fabric.readthedocs.io
- **Fabric Gateway SDK**: https://hyperledger.github.io/fabric-gateway/
- **Architecture Diagram**: See README.md
- **API Documentation**: Import Postman collection

---

## 📞 Next Steps

1. **Install Docker Desktop** (if not already installed)
2. **Run the network** with `.\scripts\start-network.ps1`
3. **Deploy chaincode** with `.\scripts\deploy-chaincode.ps1`
4. **Seed test data** with `.\scripts\seed-data.ps1`
5. **Start API server** with `npm run dev` in api-server/
6. **Start UI** with `npm start` in ui-citizen-portal/
7. **Test with Postman** using the provided collection

---

## 💡 Current Status

✅ All code and configuration files are ready  
⚠️ Docker needs to be installed  
⚠️ Node.js dependencies need to be installed (`npm install`)  

**Time to first run:** ~30 minutes (including Docker Desktop installation and image downloads)
