# Security & Production Considerations

## 🔒 Security Architecture

### 1. Network Security

#### TLS/mTLS Configuration
- **Peer-to-Peer Communication**: All Fabric peers and orderers use TLS 1.3
- **Client-to-Peer**: Mutual TLS (mTLS) for API-to-Fabric connections
- **Certificate Management**: 
  - Automated cert rotation every 90 days
  - Hardware Security Modules (HSM) for private key storage in production
  - Separate CA hierarchy for each organization

```yaml
TLS Configuration:
  - Cipher Suites: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
  - Min Protocol: TLS 1.3
  - Certificate Validity: 90 days (auto-rotation)
```

#### Network Isolation
- **Firewall Rules**:
  ```
  Orderers: 7050-7054 (internal only)
  Peers: 7051, 9051, 11051 (org-specific VPC)
  CouchDB: 5984 (localhost only)
  API Gateway: 443 (public, with WAF)
  ```
- **VPC Segmentation**: Each org in separate AWS VPC with VPC peering
- **DDoS Protection**: CloudFlare + AWS Shield Advanced

### 2. Identity & Access Management

#### Fabric CA Configuration
```yaml
Organizations:
  OrgRevenue:
    CA: ca.revenue.landregistry.gov.in
    Enrollment: LDAP integration with State Employee DB
    Attributes: role=revenue.officer, district=XXX
  
  OrgRegistration:
    CA: ca.registration.landregistry.gov.in
    Enrollment: eSign + Aadhaar verification
    Attributes: role=registrar, office_code=XXX
  
  OrgBank:
    CA: ca.bank.landregistry.gov.in
    Enrollment: SWIFT + RBI verification
    Attributes: bank_code=XXX, ifsc=XXX
```

#### Role-Based Access Control (RBAC)
```typescript
Access Matrix:
┌──────────────────┬─────────┬────────────┬──────┬─────────┬────────┐
│ Function         │ Revenue │ Registrar  │ Bank │ GovTech │ Public │
├──────────────────┼─────────┼────────────┼──────┼─────────┼────────┤
│ Create Parcel    │    ✓    │     ✓      │  ✗   │    ✓    │   ✗    │
│ Transfer         │    ✗    │     ✓      │  ✗   │    ✗    │   ✗    │
│ Raise Dispute    │    ✓    │     ✗      │  ✗   │    ✓    │   ✗    │
│ Create Mortgage  │    ✗    │     ✗      │  ✓   │    ✗    │   ✗    │
│ Read Parcel      │    ✓    │     ✓      │  ✓   │    ✓    │   ✓    │
└──────────────────┴─────────┴────────────┴──────┴─────────┴────────┘
```

#### API Authentication
```javascript
JWT Token Structure:
{
  "sub": "registrar@example.com",
  "role": "registrar.officer",
  "mspId": "OrgRegistrationMSP",
  "officeCode": "MH-MUM-01",
  "aadhaarVerified": true,
  "iat": 1234567890,
  "exp": 1234569690  // 30 min expiry
}

Token Validation Flow:
1. API receives JWT
2. Verify signature (RS256 with public key)
3. Check expiry
4. Validate role against requested operation
5. Map JWT identity to Fabric X.509 cert
6. Execute chaincode with appropriate MSP identity
```

### 3. Data Protection

#### Encryption at Rest
- **Blockchain Ledger**: Encrypted volumes (AWS EBS encrypted, AES-256)
- **CouchDB State Database**: Transparent Data Encryption (TDE)
- **Off-chain Documents**: 
  - DigiLocker: AES-256 encryption
  - IPFS: File-level encryption before storage
  - Encryption keys in AWS KMS with key rotation

#### Encryption in Transit
- All API traffic: HTTPS (TLS 1.3)
- Fabric peer communication: TLS with client cert auth
- Database connections: TLS enforced

#### Private Data Collections
For sensitive PII (Aadhaar numbers, full addresses):
```yaml
Private Data Config:
  - Collection Name: ownerPII
  - Member Orgs: [OrgRevenue, OrgRegistration]
  - Required Peer Count: 2
  - Max Peer Count: 3
  - Block to Live: 1000 (automatic purge after ~2 weeks)
  - Endorsement Policy: OR('OrgRevenueMSP.member', 'OrgRegistrationMSP.member')
```

### 4. Audit & Compliance

#### Immutable Audit Trail
Every transaction stored with:
- Transaction ID
- Timestamp
- Invoking MSP ID
- Function called
- Parameters (hashed if sensitive)
- Block number
- Transaction hash

#### SIEM Integration
```yaml
Log Aggregation:
  - Fabric Peer Logs → Splunk
  - API Access Logs → ELK Stack
  - Blockchain Events → Kafka → Data Lake
  - Security Events → AWS GuardDuty

Alerts:
  - Unauthorized access attempts
  - Abnormal transaction volumes
  - Failed endorsement attempts
  - Certificate expiry warnings (30 days)
```

#### Compliance Standards
- **IT Act 2000**: Digital signature compliance
- **Aadhaar Act 2016**: PII protection via masking
- **DPDPA 2023**: Data minimization, right to erasure (off-chain only)
- **ISO 27001**: Information security management
- **SOC 2 Type II**: For cloud infrastructure

### 5. Smart Contract Security

#### Chaincode Best Practices
```typescript
✅ Implemented:
  - Input validation for all parameters
  - Access control on every function
  - Event emission for audit trail
  - Optimistic locking (version field)
  - Query result size limits
  - Timeout configurations

❌ Prevented:
  - SQL injection (parameterized queries)
  - Reentrancy attacks (state locks)
  - Integer overflow (BigInt usage)
  - Timestamp manipulation (orderer-provided timestamps)
```

#### Upgrade Process
```bash
# Chaincode upgrade with zero-downtime
1. Deploy new version alongside old (v1.1)
2. Test on separate channel
3. Gradual rollout: 10% → 50% → 100% traffic
4. Monitor error rates
5. Rollback capability within 5 minutes
```

### 6. API Security

#### Rate Limiting
```yaml
Public APIs: 100 requests/15 min per IP
Authenticated Users: 500 requests/15 min
Admin Users: 1000 requests/15 min

Burst Protection:
  - Token bucket algorithm
  - Redis-backed distributed rate limiter
  - Custom headers: X-RateLimit-Remaining
```

#### Input Validation & Sanitization
```typescript
// Example: Parcel creation validation
const parcelSchema = Joi.object({
  landId: Joi.string().pattern(/^[A-Z]{2}-[A-Z]{3}-\d{3,}$/).required(),
  surveyNumber: Joi.string().max(50).required(),
  area: Joi.number().positive().max(1000000).required(),
  currentOwner: Joi.string().pattern(/^AADHAAR-\d{12}$/).required(),
  // Prevent XSS, SQL injection
  village: Joi.string().max(100).pattern(/^[a-zA-Z0-9\s]+$/).required()
});
```

#### OWASP Top 10 Mitigation
```yaml
A01 - Broken Access Control: Role-based checks on every API
A02 - Cryptographic Failures: TLS 1.3, encrypted storage
A03 - Injection: Parameterized queries, input validation
A04 - Insecure Design: Threat modeling, security reviews
A05 - Security Misconfiguration: Hardened Docker images
A06 - Vulnerable Components: Dependabot alerts, monthly updates
A07 - Auth Failures: JWT + MFA for admin access
A08 - Integrity Failures: Subresource Integrity (SRI)
A09 - Logging Failures: Centralized logging to SIEM
A10 - SSRF: Whitelist allowed external APIs
```

### 7. Disaster Recovery & Backup

#### Backup Strategy
```yaml
Blockchain Snapshot:
  - Frequency: Daily (full), Hourly (incremental)
  - Retention: 30 days (daily), 7 days (hourly)
  - Storage: AWS S3 with versioning + Glacier for archival
  - Encryption: Client-side before upload

Off-chain Documents:
  - Primary: DigiLocker (Gov Cloud)
  - Replica 1: AWS S3 Multi-Region
  - Replica 2: IPFS pinning service
  - RPO: 1 hour, RTO: 4 hours
```

#### Disaster Recovery Plan
```yaml
Failure Scenarios:

1. Single Peer Failure:
   - Impact: No service disruption (peer redundancy)
   - Recovery: Auto-restart via Kubernetes
   - RTO: < 5 minutes

2. Orderer Failure (< 3 nodes):
   - Impact: Raft maintains consensus with majority
   - Recovery: Restore from backup, rejoin cluster
   - RTO: < 30 minutes

3. Complete Datacenter Loss:
   - Impact: Switch to DR datacenter
   - Recovery: DNS failover, restore from S3 snapshots
   - RTO: 4 hours, RPO: 1 hour

4. Ransomware Attack:
   - Impact: Blockchain immutable, restore off-chain docs
   - Recovery: Restore from clean snapshot
   - RTO: 6 hours
```

### 8. Penetration Testing & Vulnerability Management

#### Regular Security Assessments
```yaml
Schedule:
  - Annual: External penetration test by CERT-In empaneled agency
  - Quarterly: Internal security audit
  - Monthly: Automated vulnerability scans (Nessus, Qualys)
  - Continuous: Dependabot for dependency vulnerabilities

Scope:
  - API endpoints (OWASP testing)
  - Smart contracts (static analysis with MythX)
  - Network infrastructure (port scans, SSL tests)
  - Social engineering (phishing simulations for staff)
```

#### Incident Response Plan
```yaml
Severity Levels:
  Critical (P0): Data breach, service down > 1 hour
  High (P1): Security vulnerability exploited
  Medium (P2): Degraded performance, non-exploited vuln
  Low (P3): Minor bug, cosmetic issue

Response Times:
  P0: Acknowledge 15 min, Resolve 4 hours
  P1: Acknowledge 1 hour, Resolve 24 hours
  P2: Acknowledge 24 hours, Resolve 7 days
  P3: Acknowledge 7 days, Resolve 30 days

Escalation:
  L1: Support Team → L2: Security Team → L3: CISO → L4: CTO
```

### 9. Monitoring & Alerting

#### Real-time Monitoring
```yaml
Infrastructure:
  - Prometheus + Grafana for metrics
  - Jaeger for distributed tracing
  - PagerDuty for on-call alerts

Key Metrics:
  - Transaction throughput (TPS)
  - Endorsement latency (p50, p95, p99)
  - Block creation time
  - Peer CPU/Memory usage
  - API response times
  - Error rates (4xx, 5xx)

Alerts:
  - TPS drop > 50%
  - Latency > 5 seconds
  - Error rate > 1%
  - Certificate expiry < 30 days
  - Disk usage > 80%
  - Failed login attempts > 10/min
```

### 10. Production Hardening Checklist

```yaml
✅ Pre-Production:
  [ ] All certificates use production CA (not self-signed)
  [ ] HSM integration for orderer/peer private keys
  [ ] Firewall rules reviewed and tightened
  [ ] Rate limiting enabled on all APIs
  [ ] DDoS protection active
  [ ] Backup & restore tested successfully
  [ ] Monitoring dashboards configured
  [ ] On-call rotation established
  [ ] Runbook documentation complete
  [ ] Security audit passed
  [ ] Load test passed (10x expected peak)
  [ ] Chaos engineering tests (node failures)
  [ ] Compliance certification obtained
  [ ] Legal review of Terms of Service
  [ ] User training conducted
  [ ] Communication plan for outages

✅ Post-Production (Continuous):
  [ ] Monthly security patches
  [ ] Quarterly penetration tests
  [ ] Annual DR drill
  [ ] Continuous monitoring and alerting
```

---

## 📞 Security Contact

**Security Team**: security@landregistry.gov.in  
**24/7 Incident Hotline**: +91-11-XXXX-XXXX  
**Bug Bounty Program**: https://security.landregistry.gov.in/bounty  

**Responsible Disclosure**: Report vulnerabilities privately before public disclosure. Response within 48 hours guaranteed.
