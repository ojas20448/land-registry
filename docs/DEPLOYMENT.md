# Deployment Guide

## 🚀 Production Deployment

### Prerequisites

#### Hardware Requirements (Per Organization Node)

```yaml
Peer Node:
  CPU: 8 vCPU (Intel Xeon or AMD EPYC)
  Memory: 32 GB RAM
  Storage: 1 TB NVMe SSD (with RAID 10)
  Network: 1 Gbps dedicated bandwidth

Orderer Node:
  CPU: 16 vCPU
  Memory: 64 GB RAM
  Storage: 2 TB NVMe SSD
  Network: 10 Gbps dedicated bandwidth

CouchDB Node:
  CPU: 8 vCPU
  Memory: 32 GB RAM
  Storage: 2 TB SSD (data) + 500 GB (logs)
```

#### Software Requirements

```bash
Operating System: Ubuntu 22.04 LTS Server
Docker: 24.x or later
Docker Compose: 2.x or later
Node.js: 18.x LTS
Go: 1.20+ (for Fabric binaries)
PostgreSQL: 15.x (for API indexing DB)
Redis: 7.x (for caching)
Nginx: 1.24+ (reverse proxy)
```

---

## 📦 Step-by-Step Deployment

### 1. Infrastructure Setup (AWS Example)

#### Network Architecture

```yaml
VPC Configuration:
  Primary Region: ap-south-1 (Mumbai)
  DR Region: ap-southeast-1 (Singapore)
  
  Subnets:
    - Public Subnet (API Gateway): 10.0.1.0/24
    - Private Subnet (Peers): 10.0.2.0/24
    - Database Subnet: 10.0.3.0/24
  
  Security Groups:
    - sg-api: Allow 443 from 0.0.0.0/0
    - sg-peers: Allow 7051,9051,11051 from VPC CIDR
    - sg-orderers: Allow 7050-7054 from peer SG
    - sg-db: Allow 5432,6379 from api SG
```

#### Terraform Deployment

```hcl
# main.tf
terraform {
  required_version = ">= 1.5"
  
  backend "s3" {
    bucket = "landregistry-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-south-1"
    encrypt = true
  }
}

module "network" {
  source = "./modules/network"
  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

module "fabric_nodes" {
  source = "./modules/fabric"
  instance_type = "m5.2xlarge"
  key_name = "landregistry-prod-key"
}

module "database" {
  source = "./modules/database"
  instance_class = "db.r5.2xlarge"
}
```

```bash
# Deploy infrastructure
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 2. Kubernetes Deployment (Production)

#### EKS Cluster Setup

```bash
# Create EKS cluster
eksctl create cluster \
  --name land-registry-prod \
  --version 1.28 \
  --region ap-south-1 \
  --nodegroup-name fabric-nodes \
  --node-type m5.2xlarge \
  --nodes 9 \
  --nodes-min 6 \
  --nodes-max 12 \
  --managed \
  --asg-access \
  --full-ecr-access

# Configure kubectl
aws eks update-kubeconfig --region ap-south-1 --name land-registry-prod
```

#### Deploy Fabric on Kubernetes

```yaml
# k8s/fabric-ca-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ca-revenue
  namespace: land-registry
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ca-revenue
  template:
    metadata:
      labels:
        app: ca-revenue
    spec:
      containers:
      - name: ca
        image: hyperledger/fabric-ca:1.5.7
        env:
        - name: FABRIC_CA_HOME
          value: /etc/hyperledger/fabric-ca-server
        - name: FABRIC_CA_SERVER_CA_NAME
          value: ca-revenue
        - name: FABRIC_CA_SERVER_TLS_ENABLED
          value: "true"
        ports:
        - containerPort: 7054
        volumeMounts:
        - name: ca-data
          mountPath: /etc/hyperledger/fabric-ca-server
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
      volumes:
      - name: ca-data
        persistentVolumeClaim:
          claimName: ca-revenue-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ca-revenue-service
  namespace: land-registry
spec:
  type: LoadBalancer
  selector:
    app: ca-revenue
  ports:
  - port: 7054
    targetPort: 7054
```

```bash
# Deploy Fabric components
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/fabric-ca-deployment.yaml
kubectl apply -f k8s/orderer-deployment.yaml
kubectl apply -f k8s/peer-deployment.yaml
kubectl apply -f k8s/couchdb-statefulset.yaml
```

### 3. Certificate Generation & Distribution

```bash
# Generate crypto material using Fabric CA
./scripts/prod/generate-certs.sh

# Certificate distribution via Kubernetes secrets
kubectl create secret generic revenue-peer-certs \
  --from-file=msp=/path/to/revenue/msp \
  --from-file=tls=/path/to/revenue/tls \
  --namespace=land-registry

# Verify certificates
kubectl get secrets -n land-registry
openssl x509 -in cert.pem -text -noout
```

### 4. Channel & Chaincode Deployment

```bash
# Create production channel
kubectl exec -it orderer0-pod -n land-registry -- \
  peer channel create \
    -o orderer-service:7050 \
    -c land-main-channel \
    -f /config/channel.tx \
    --tls --cafile /certs/orderer-ca.crt

# Join peers to channel
for org in revenue registration bank; do
  kubectl exec -it ${org}-peer0-pod -n land-registry -- \
    peer channel join -b land-main-channel.block
done

# Package and deploy chaincode
cd chaincode
npm run build
kubectl exec -it cli-pod -n land-registry -- \
  peer lifecycle chaincode package land-registry-contract.tar.gz \
    --path /chaincode \
    --lang node \
    --label land-registry-contract_1.0

# Install on all peers
kubectl exec -it revenue-peer0-pod -n land-registry -- \
  peer lifecycle chaincode install land-registry-contract.tar.gz
```

### 5. API Server Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: land-registry-api
  namespace: land-registry
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: land-registry-api
  template:
    metadata:
      labels:
        app: land-registry-api
    spec:
      containers:
      - name: api
        image: land-registry-api:1.0.0
        env:
        - name: NODE_ENV
          value: "production"
        - name: FABRIC_NETWORK_NAME
          value: "land-main-channel"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        ports:
        - containerPort: 4000
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: land-registry
spec:
  type: LoadBalancer
  selector:
    app: land-registry-api
  ports:
  - port: 443
    targetPort: 4000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: land-registry
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: land-registry-api
  minReplicas: 5
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

```bash
# Build and push Docker image
docker build -t land-registry-api:1.0.0 ./api-server
docker tag land-registry-api:1.0.0 ECR_URL/land-registry-api:1.0.0
docker push ECR_URL/land-registry-api:1.0.0

# Deploy API
kubectl apply -f k8s/api-deployment.yaml
kubectl rollout status deployment/land-registry-api -n land-registry
```

### 6. Database Setup

```bash
# PostgreSQL (for indexing)
helm install postgresql bitnami/postgresql \
  --namespace land-registry \
  --set auth.postgresPassword=SECURE_PASSWORD \
  --set primary.persistence.size=500Gi \
  --set metrics.enabled=true \
  --set replication.enabled=true \
  --set replication.readReplicas=2

# Redis (for caching)
helm install redis bitnami/redis \
  --namespace land-registry \
  --set auth.password=SECURE_PASSWORD \
  --set master.persistence.size=50Gi \
  --set replica.replicaCount=3

# Initialize database schema
kubectl exec -it postgresql-pod -n land-registry -- \
  psql -U postgres -d land_registry_index -f /scripts/schema.sql
```

### 7. Monitoring Setup

```bash
# Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Import Fabric dashboards
kubectl apply -f k8s/grafana-dashboards/fabric-metrics.json

# Configure alerts
kubectl apply -f k8s/prometheus-rules/fabric-alerts.yaml
```

### 8. Load Balancer & SSL Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: land-registry-ingress
  namespace: land-registry
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.landregistry.gov.in
    secretName: landregistry-tls
  rules:
  - host: api.landregistry.gov.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 443
```

```bash
# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### 9. Backup Configuration

```bash
# Automated backup script
cat > /usr/local/bin/fabric-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/land-registry"

# Backup peer ledger
kubectl exec -it revenue-peer0-pod -n land-registry -- \
  tar -czf /tmp/ledger-backup-${DATE}.tar.gz /var/hyperledger/production

# Download backup
kubectl cp land-registry/revenue-peer0-pod:/tmp/ledger-backup-${DATE}.tar.gz \
  ${BACKUP_DIR}/ledger-backup-${DATE}.tar.gz

# Upload to S3
aws s3 cp ${BACKUP_DIR}/ledger-backup-${DATE}.tar.gz \
  s3://landregistry-backups/prod/${DATE}/

# Cleanup old backups (keep 30 days)
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/fabric-backup.sh

# Schedule via cron
echo "0 2 * * * /usr/local/bin/fabric-backup.sh" | crontab -
```

### 10. Post-Deployment Verification

```bash
# 1. Check all pods are running
kubectl get pods -n land-registry

# 2. Verify chaincode is deployed
kubectl exec -it cli-pod -n land-registry -- \
  peer lifecycle chaincode querycommitted \
    --channelID land-main-channel \
    --name land-registry-contract

# 3. Test API health
curl https://api.landregistry.gov.in/health

# 4. Run smoke tests
cd tests
npm run test:smoke

# 5. Load test
k6 run --vus 100 --duration 5m load-test.js

# 6. Check monitoring dashboards
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open http://localhost:3000

# 7. Verify backup job ran
ls -lh /backups/land-registry/
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Chaincode
        run: |
          cd chaincode
          npm ci
          npm run build
          npm test
      
      - name: Build API Docker Image
        run: |
          docker build -t ${{ secrets.ECR_URL }}/land-registry-api:${{ github.sha }} ./api-server
          docker push ${{ secrets.ECR_URL }}/land-registry-api:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          aws eks update-kubeconfig --region ap-south-1 --name land-registry-prod
          kubectl set image deployment/land-registry-api \
            api=${{ secrets.ECR_URL }}/land-registry-api:${{ github.sha }} \
            -n land-registry
          kubectl rollout status deployment/land-registry-api -n land-registry
      
      - name: Run Integration Tests
        run: |
          npm run test:integration
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📊 Performance Benchmarks

```yaml
Expected Performance (Prod Environment):
  Transaction Throughput: 3000 TPS
  Average Latency: < 200ms
  P95 Latency: < 500ms
  P99 Latency: < 1000ms
  Concurrent Users: 10,000+
  API Uptime: 99.9% SLA
```

---

## 📞 Deployment Support

**DevOps Team**: devops@landregistry.gov.in  
**Runbook**: https://wiki.landregistry.gov.in/runbook  
**On-call Rotation**: https://pagerduty.com/landregistry
