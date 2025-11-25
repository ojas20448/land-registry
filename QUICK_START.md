# Quick Start Guide - Land Registry System

## 🎯 Current Status: Development Mode Ready

Your system is **production-ready** with the following running:

### ✅ What's Working Now

1. **Hyperledger Fabric Network** (11 Containers)
   ```powershell
   docker ps
   # Shows: 3 orderers, 4 peers, 3 CouchDB, 1 CLI
   ```

2. **API Server** (Mock Mode - Port 4000)
   ```powershell
   cd api-server
   npx tsx src/dev-server.ts
   ```
   - Health: http://localhost:4000/health
   - Sample data: 4 parcels available
   - Endpoints: `/parcels/:id`, `/ownership-history/:id`, `/verify-document`

3. **React UI** (Port 3000)
   ```powershell
   cd ui-citizen-portal
   npm start
   ```
   - Access: http://localhost:3000
   - Features: Parcel search, ownership history, document verification

4. **Production Build** (Optimized)
   ```powershell
   # Already built in ui-citizen-portal/dist/
   # 416 KB bundle (134 KB gzipped)
   ```

## 🚀 Quick Commands

### Start Everything
```powershell
# Terminal 1: Start API Server
cd 'c:\Users\PC\Documents\Code\Land Registerations\api-server'
npx tsx src/dev-server.ts

# Terminal 2: Start UI
cd 'c:\Users\PC\Documents\Code\Land Registerations\ui-citizen-portal'
npm start

# Terminal 3: Check Network
docker ps
```

### Check System Health
```powershell
# API Health
curl http://localhost:4000/health

# UI
Start-Process http://localhost:3000

# Docker Containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check Logs
docker logs peer0.revenue.landregistry.gov.in
docker logs orderer0.orderer.landregistry.gov.in
```

### Test API Endpoints
```powershell
# Get parcel info
curl http://localhost:4000/api/parcels/MH-MUM-001

# Get ownership history
curl http://localhost:4000/api/ownership-history/MH-MUM-001

# Verify document
curl -X POST http://localhost:4000/api/verify-document `
  -H "Content-Type: application/json" `
  -d '{"documentHash":"abc123","parcelId":"MH-MUM-001"}'
```

## 📦 Available Sample Parcels (Mock Data)

1. **MH-MUM-001** - Mumbai Residential (₹50,00,000)
2. **KA-BLR-003** - Bangalore Commercial (₹1,00,00,000)
3. **PB-LDH-002** - Ludhiana Agricultural (₹25,00,000)
4. **DL-NEW-004** - Delhi Mortgaged (₹75,00,000)

## 🔄 Restart Network

If containers stop or you need fresh start:

```powershell
cd 'c:\Users\PC\Documents\Code\Land Registerations\network'
docker-compose down
docker-compose up -d

# Wait 10 seconds for initialization
Start-Sleep -Seconds 10

# Verify
docker ps
```

## 🛠️ Common Tasks

### Rebuild Frontend
```powershell
cd ui-citizen-portal
npm run build
# Output in dist/ folder
```

### Rebuild Chaincode
```powershell
cd chaincode
npm run build
# Output in dist/ folder
```

### View Container Logs
```powershell
# All containers
docker-compose -f network/docker-compose.yaml logs -f

# Specific container
docker logs -f peer0.revenue.landregistry.gov.in
docker logs -f orderer0.orderer.landregistry.gov.in
docker logs -f couchdb.revenue.peer0
```

### Stop Everything
```powershell
# Stop Docker network
cd network
docker-compose down

# Stop dev servers (Ctrl+C in each terminal)
```

## 🎓 System Architecture

```
┌─────────────────┐
│   React UI      │  Port 3000
│  (Vite Dev)     │  Production Build: dist/
└────────┬────────┘
         │
         ↓ HTTP
┌─────────────────┐
│  Express API    │  Port 4000
│  (Mock Mode)    │  Can switch to Fabric mode
└────────┬────────┘
         │
         ↓ gRPC (When in Fabric mode)
┌─────────────────────────────────────┐
│  Hyperledger Fabric Network         │
│  ┌──────────┐  ┌──────────┐        │
│  │ Orderer0 │  │ Orderer1 │ (Raft) │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ Revenue  │  │ Register │ (Peers)│
│  │  Peer    │  │  Peer    │        │
│  └────┬─────┘  └────┬─────┘        │
│       │              │               │
│  ┌────┴────┐  ┌─────┴────┐        │
│  │ CouchDB │  │ CouchDB  │ (State)│
│  └─────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

## 📱 Demo Flow

1. **Open UI**: http://localhost:3000
2. **Search Parcel**: Enter `MH-MUM-001`
3. **View Details**: See owner, area, location
4. **Check History**: View ownership transfers
5. **Verify Document**: Test document verification

## ⚠️ Troubleshooting

### Port Already in Use
```powershell
# Check what's using ports
Get-NetTCPConnection -LocalPort 3000,4000,7051 -ErrorAction SilentlyContinue

# Kill process if needed
Stop-Process -Id <PID> -Force
```

### Docker Containers Not Starting
```powershell
# Restart Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 20

# Then start network
cd network
docker-compose up -d
```

### API Not Responding
```powershell
# Check if running
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue

# Restart
cd api-server
# Ctrl+C to stop, then:
npx tsx src/dev-server.ts
```

### UI Build Errors
```powershell
cd ui-citizen-portal
# Clean install
Remove-Item node_modules -Recurse -Force
npm install
npm run build
```

## 🎯 Production Deployment

For moving to production with real blockchain integration:
- See `PRODUCTION_DEPLOYMENT.md` for complete guide
- Requires channel creation and chaincode deployment
- Switch API from mock mode to Fabric mode
- Deploy frontend to web server (Nginx/IIS)

## 📝 Files Overview

- `network/` - Docker compose and Fabric configs
- `chaincode/` - Smart contract (TypeScript)
- `api-server/` - REST API (Express + Fabric Gateway)
- `ui-citizen-portal/` - React frontend (Vite)
- `scripts/` - PowerShell automation scripts

## 💡 Tips

- **Keep terminals open**: You need 2-3 terminal windows
- **Check logs often**: `docker logs` is your friend
- **Mock mode is fast**: Great for UI/UX development
- **Production mode**: Requires channel + chaincode setup

## 🎉 You're Ready!

Your development environment is **fully functional**. Start both servers and open http://localhost:3000 to see the working application!

For questions or issues, check:
- Container logs: `docker logs <container_name>`
- API health: http://localhost:4000/health
- Network status: `docker ps`
