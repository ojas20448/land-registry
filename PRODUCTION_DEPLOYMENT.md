# Production Deployment Guide

## ✅ Completed Steps

1. **Infrastructure Setup**
   - ✅ Hyperledger Fabric 2.5.0 network running
   - ✅ 11 Docker containers operational (3 orderers, 4 peers, 3 CouchDB, 1 CLI)
   - ✅ Crypto material generated for 6 organizations
   - ✅ TypeScript chaincode compiled successfully
   - ✅ React frontend built for production (416 KB bundle, 134 KB gzipped)

2. **Network Architecture**
   - **Organizations**: Revenue, Registration, Bank, GovTech, PublicGateway, Agri
   - **Consensus**: Raft (5 orderer nodes configured)
   - **Channel**: land-main-channel
   - **State Database**: CouchDB for each peer
   - **Ports**:
     - Revenue Peer: 7051
     - Registration Peer: 9051
     - Bank Peer: 11051
     - Orderer0: 7050
     - CouchDB instances: 5984, 6984, 7984

3. **Application Status**
   - ✅ React UI development server running (port 3000)
   - ✅ API mock server running (port 4000)
   - ✅ Production build created in `ui-citizen-portal/dist/`

## 🔄 Chaincode Deployment (Manual Steps Required)

### Option 1: Chaincode as a Service (CCA AS) - Recommended for Production

1. **Build Docker Image for Chaincode**:
   ```powershell
   cd chaincode
   
   # Create Dockerfile
   @'
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 9999
CMD ["node", "dist/index.js"]
'@ | Out-File -FilePath Dockerfile -Encoding UTF8

   # Build image
   docker build -t land-registry-chaincode:1.0 .
   ```

2. **Start Chaincode Server**:
   ```powershell
   docker run -d --name chaincode-server \
     --network land_registry_network \
     -p 9999:9999 \
     land-registry-chaincode:1.0
   ```

3. **Package and Install Chaincode**:
   ```powershell
   # Create connection.json
   echo '{"address":"chaincode-server:9999","dial_timeout":"10s","tls_required":false}' > connection.json
   
   # Create metadata.json
   echo '{"type":"ccaas","label":"land-registry-contract_1.0"}' > metadata.json
   
   # Package
   tar czf code.tar.gz connection.json
   tar czf land-registry-contract.tar.gz code.tar.gz metadata.json
   
   # Install on Revenue peer
   docker exec cli peer lifecycle chaincode install land-registry-contract.tar.gz
   
   # Install on Registration peer  
   docker exec -e CORE_PEER_LOCALMSPID=OrgRegistrationMSP \
     -e CORE_PEER_ADDRESS=peer0.registration.landregistry.gov.in:9051 \
     -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/peers/peer0.registration.landregistry.gov.in/tls/ca.crt \
     -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/registration.landregistry.gov.in/users/Admin@registration.landregistry.gov.in/msp \
     cli peer lifecycle chaincode install land-registry-contract.tar.gz
   
   # Install on Bank peer
   docker exec -e CORE_PEER_LOCALMSPID=OrgBankMSP \
     -e CORE_PEER_ADDRESS=peer0.bank.landregistry.gov.in:11051 \
     -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/peers/peer0.bank.landregistry.gov.in/tls/ca.crt \
     -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/bank.landregistry.gov.in/users/Admin@bank.landregistry.gov.in/msp \
     cli peer lifecycle chaincode install land-registry-contract.tar.gz
   ```

4. **Approve and Commit Chaincode** (requires joining channel first - see below)

### Option 2: Traditional Node.js Chaincode Package

Requires proper peer CLI configuration and channel setup. More complex for Windows environment.

## 📋 Channel Creation Steps

Fabric 2.3+ uses application channels without system channel:

```powershell
# 1. Create channel using osnadmin CLI (requires orderer admin port 9443)
# Or use peer channel create with genesis block

# 2. Join peers to channel
docker exec cli peer channel join -b land-main-channel.block

# 3. Verify
docker exec cli peer channel list
```

## 🚀 API Server Production Configuration

Update `api-server/.env`:

```env
# Switch from MOCK to FABRIC
MODE=FABRIC

# Fabric Connection
FABRIC_MSP_ID=OrgRevenueMSP
FABRIC_CERT_PATH=../network/organizations/peerOrganizations/revenue.landregistry.gov.in/users/User1@revenue.landregistry.gov.in/msp/signcerts/cert.pem
FABRIC_KEY_PATH=../network/organizations/peerOrganizations/revenue.landregistry.gov.in/users/User1@revenue.landregistry.gov.in/msp/keystore/priv_sk
FABRIC_TLS_CERT_PATH=../network/organizations/peerOrganizations/revenue.landregistry.gov.in/peers/peer0.revenue.landregistry.gov.in/tls/ca.crt
FABRIC_PEER_ENDPOINT=peer0.revenue.landregistry.gov.in:7051
FABRIC_PEER_HOST_ALIAS=peer0.revenue.landregistry.gov.in

# Channel and Chaincode
CHANNEL_NAME=land-main-channel
CHAINCODE_NAME=land-registry-contract

# Server
PORT=4000
NODE_ENV=production
```

Then restart API server:
```powershell
cd api-server
npm run build
node dist/index.js
```

## 🌐 Frontend Deployment Options

### Option 1: Nginx (Recommended)
```nginx
server {
    listen 80;
    server_name landregistry.gov.in;
    
    root /var/www/land-registry/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Serve Static Files
```powershell
npm install -g serve
serve -s ui-citizen-portal/dist -l 80
```

### Option 3: IIS (Windows Server)
1. Install IIS with Application Request Routing
2. Copy `ui-citizen-portal/dist/*` to `C:\inetpub\wwwroot\land-registry\`
3. Configure reverse proxy to API server on port 4000
4. Enable URL Rewrite for SPA routing

## 🔐 Production Security Checklist

- [ ] Enable TLS on all peer connections
- [ ] Configure proper MSP identities for each organization
- [ ] Set up certificate rotation policies
- [ ] Enable endorsement policies requiring multi-org approval
- [ ] Configure private data collections for sensitive information
- [ ] Set up monitoring and logging (Prometheus, Grafana)
- [ ] Implement rate limiting on API endpoints
- [ ] Configure CORS properly for frontend domain
- [ ] Set up database backups for CouchDB state
- [ ] Enable audit logging for all transactions

## 📊 System Health Checks

```powershell
# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check peer logs
docker logs peer0.revenue.landregistry.gov.in

# Check chaincode logs
docker logs chaincode-server

# Test API health
curl http://localhost:4000/health

# Test UI
curl http://localhost:3000
```

## 🎯 Current System Status

**PRODUCTION READY Components**:
- ✅ Blockchain network (11 containers running)
- ✅ Frontend production build (optimized)
- ✅ API server (mock mode working)

**REQUIRES MANUAL COMPLETION**:
- ⏳ Channel creation and peer joining
- ⏳ Chaincode packaging and deployment
- ⏳ API server connection to real Fabric
- ⏳ Web server deployment (Nginx/IIS)

## 📝 Next Immediate Steps

1. **Create and join channel** (10 minutes)
2. **Deploy chaincode using CCAAS approach** (20 minutes)
3. **Switch API server to production mode** (5 minutes)
4. **Deploy frontend to web server** (10 minutes)
5. **Test end-to-end transaction flow** (15 minutes)

**Estimated time to full production**: 60 minutes

## 🆘 Troubleshooting

### Containers Not Starting
```powershell
docker-compose -f network/docker-compose.yaml logs
```

### Port Conflicts
```powershell
Get-NetTCPConnection -LocalPort 7051,9051,11051,7050 | Select-Object LocalPort, OwningProcess
Stop-Process -Id <PROCESS_ID> -Force
```

### Chaincode Deployment Failures
- Verify channel exists: `docker exec cli peer channel list`
- Check package ID: `docker exec cli peer lifecycle chaincode queryinstalled`
- Verify endorsement policy matches org structure

### API Connection Issues
- Verify peer is reachable: `docker exec cli peer channel getinfo -c land-main-channel`
- Check certificate paths in .env file
- Ensure chaincode is committed: `docker exec cli peer lifecycle chaincode querycommitted`

## 📞 Support

For production deployment assistance:
- Hyperledger Fabric Documentation: https://hyperledger-fabric.readthedocs.io/
- Network Config: `network/docker-compose.yaml`
- Chaincode Source: `chaincode/src/contracts/`
- API Source: `api-server/src/`
- UI Source: `ui-citizen-portal/src/`
