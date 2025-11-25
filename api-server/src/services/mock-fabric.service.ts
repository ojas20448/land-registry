/**
 * Mock Fabric Gateway Service for Development
 * Simulates blockchain responses without requiring Docker/Fabric network
 */

import { LandParcel, ParcelStatus, LandUseClassification } from '../../../chaincode/src/models/land-parcel';
import { OwnershipEvent, TransferType } from '../../../chaincode/src/models/ownership-event';
import { DisputeRecord, DisputeStatus, DisputeType } from '../../../chaincode/src/models/dispute-record';
import { MortgageRecord, MortgageStatus } from '../../../chaincode/src/models/mortgage-record';

export class MockFabricGatewayService {
  private mockParcels: Map<string, LandParcel> = new Map();
  private mockDisputes: Map<string, DisputeRecord> = new Map();
  private mockMortgages: Map<string, MortgageRecord> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Sample parcel 1: Mumbai Residential
    const parcel1: LandParcel = {
      landId: 'MH-MUM-001',
      surveyNumber: 'SUR-2024-MH-001',
      subDivisionNumber: 'A1',
      district: 'Mumbai City',
      taluka: 'Mumbai',
      village: 'Bandra East',
      state: 'Maharashtra',
      pincode: '400051',
      area: 1200,
      areaUnit: 'sqft',
      boundaryCoordinates: [
        { latitude: 19.0596, longitude: 72.8656, sequence: 1 },
        { latitude: 19.0598, longitude: 72.8658, sequence: 2 },
        { latitude: 19.0597, longitude: 72.8659, sequence: 3 },
        { latitude: 19.0595, longitude: 72.8657, sequence: 4 },
      ],
      currentOwner: {
        ownerId: 'OWNER-001',
        name: 'Rajesh Kumar',
        aadhaarHash: 'hash_abc123',
        contactPhone: '+91-9876543210',
        contactEmail: 'rajesh.kumar@example.com',
        ownershipShare: 100,
      },
      previousOwners: [
        {
          ownerId: 'OWNER-LEGACY-001',
          name: 'Legacy Owner',
          aadhaarHash: 'hash_legacy',
          contactPhone: '+91-9876543211',
          contactEmail: 'legacy@example.com',
          ownershipShare: 100,
        },
      ],
      landUseClassification: LandUseClassification.RESIDENTIAL,
      zoneType: 'Urban Residential',
      status: ParcelStatus.VERIFIED,
      khataNumber: 'KHATA-2024-001',
      documents: [
        {
          docId: 'DOC-001',
          docType: 'Title Deed',
          digilockerUrl: 'https://digilocker.gov.in/doc/DOC-001',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'OFFICER-001',
          docHash: 'sha256_hash_of_document',
        },
      ],
      ownershipHistory: ['EVENT-001', 'EVENT-002'],
      encumbrances: [],
      mortgageIds: [],
      disputeIds: [],
      registeredAt: new Date('2024-01-15').toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: 'OFFICER-001',
      remarks: 'Verified property in prime Mumbai location',
    };

    // Sample parcel 2: Bangalore Commercial
    const parcel2: LandParcel = {
      landId: 'KA-BLR-003',
      surveyNumber: 'SUR-2024-KA-003',
      subDivisionNumber: 'C1',
      district: 'Bangalore Urban',
      taluka: 'Bangalore North',
      village: 'Whitefield',
      state: 'Karnataka',
      pincode: '560066',
      area: 5000,
      areaUnit: 'sqft',
      boundaryCoordinates: [
        { latitude: 12.9698, longitude: 77.7499, sequence: 1 },
        { latitude: 12.9700, longitude: 77.7502, sequence: 2 },
        { latitude: 12.9699, longitude: 77.7503, sequence: 3 },
        { latitude: 12.9697, longitude: 77.7500, sequence: 4 },
      ],
      currentOwner: {
        ownerId: 'OWNER-003',
        name: 'Tech Solutions Pvt Ltd',
        aadhaarHash: 'hash_company_003',
        contactPhone: '+91-8012345678',
        contactEmail: 'info@techsolutions.com',
        ownershipShare: 100,
      },
      previousOwners: [],
      landUseClassification: LandUseClassification.COMMERCIAL,
      zoneType: 'IT Park Commercial',
      status: ParcelStatus.VERIFIED,
      khataNumber: 'KHATA-2024-003',
      documents: [
        {
          docId: 'DOC-003',
          docType: 'Commercial Property Deed',
          digilockerUrl: 'https://digilocker.gov.in/doc/DOC-003',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'OFFICER-003',
          docHash: 'sha256_hash_doc_003',
        },
      ],
      ownershipHistory: ['EVENT-005'],
      encumbrances: [],
      mortgageIds: ['MORT-001'],
      disputeIds: [],
      registeredAt: new Date('2024-03-20').toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: 'OFFICER-003',
      remarks: 'Commercial property in IT corridor',
    };

    this.mockParcels.set('MH-MUM-001', parcel1);
    this.mockParcels.set('KA-BLR-003', parcel2);

    // Mock mortgage
    const mortgage1: MortgageRecord = {
      mortgageId: 'MORT-001',
      landId: 'KA-BLR-003',
      lenderBankName: 'State Bank of India',
      lenderBankBranch: 'Whitefield Branch',
      lenderBankIFSC: 'SBIN0001234',
      loanAmount: 25000000,
      loanCurrency: 'INR',
      interestRate: 8.5,
      loanTenureMonths: 180,
      mortgageStartDate: new Date('2024-04-01').toISOString(),
      mortgageEndDate: new Date('2039-04-01').toISOString(),
      status: MortgageStatus.ACTIVE,
      borrowerOwnerId: 'OWNER-003',
      mortgageeDeedHash: 'sha256_mortgage_deed_hash',
      createdAt: new Date('2024-04-01').toISOString(),
      createdBy: 'BANK-SBI-001',
      lastUpdatedAt: new Date().toISOString(),
      remarks: 'Business loan for office space',
    };

    this.mockMortgages.set('MORT-001', mortgage1);
  }

  async connect(): Promise<void> {
    console.log('✅ Mock Fabric Gateway connected (development mode)');
  }

  async disconnect(): Promise<void> {
    console.log('Mock Fabric Gateway disconnected');
  }

  // Parcel operations
  async getParcel(landId: string): Promise<LandParcel | null> {
    await this.simulateDelay(100);
    return this.mockParcels.get(landId) || null;
  }

  async createParcel(parcelData: Partial<LandParcel>): Promise<string> {
    await this.simulateDelay(200);
    const landId = parcelData.landId || `MOCK-${Date.now()}`;
    const newParcel: LandParcel = {
      ...parcelData,
      landId,
      status: ParcelStatus.PENDING,
      registeredAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    } as LandParcel;
    
    this.mockParcels.set(landId, newParcel);
    return landId;
  }

  async queryParcelsByOwner(ownerId: string): Promise<LandParcel[]> {
    await this.simulateDelay(150);
    return Array.from(this.mockParcels.values()).filter(
      (p) => p.currentOwner.ownerId === ownerId
    );
  }

  async queryParcelsByDistrict(district: string): Promise<LandParcel[]> {
    await this.simulateDelay(150);
    return Array.from(this.mockParcels.values()).filter(
      (p) => p.district.toLowerCase().includes(district.toLowerCase())
    );
  }

  async queryParcelsByStatus(status: ParcelStatus): Promise<LandParcel[]> {
    await this.simulateDelay(150);
    return Array.from(this.mockParcels.values()).filter((p) => p.status === status);
  }

  // Transfer operations
  async proposeSaleTransfer(
    landId: string,
    newOwnerId: string,
    newOwnerName: string,
    newOwnerAadhaarHash: string,
    saleAmount: number,
    initiatedBy: string
  ): Promise<string> {
    await this.simulateDelay(200);
    const eventId = `TRANSFER-${Date.now()}`;
    console.log(`Mock transfer proposed: ${landId} -> ${newOwnerName}`);
    return eventId;
  }

  async finalizeSaleTransfer(
    landId: string,
    eventId: string,
    stampDuty: number,
    registrationFee: number,
    finalizedBy: string
  ): Promise<void> {
    await this.simulateDelay(200);
    const parcel = this.mockParcels.get(landId);
    if (parcel) {
      parcel.lastUpdatedAt = new Date().toISOString();
      parcel.lastUpdatedBy = finalizedBy;
    }
    console.log(`Mock transfer finalized: ${landId}`);
  }

  // Dispute operations
  async raiseDispute(
    disputeId: string,
    landId: string,
    disputeType: DisputeType,
    description: string,
    raisedBy: string,
    supportingDocHash: string
  ): Promise<string> {
    await this.simulateDelay(200);
    const dispute: DisputeRecord = {
      disputeId,
      landId,
      disputeType,
      description,
      status: DisputeStatus.OPEN,
      raisedBy,
      raisedAt: new Date().toISOString(),
      supportingDocHash,
      remarks: 'Mock dispute created',
    };
    
    this.mockDisputes.set(disputeId, dispute);
    return disputeId;
  }

  async resolveDispute(disputeId: string, resolution: string, resolvedBy: string): Promise<void> {
    await this.simulateDelay(200);
    const dispute = this.mockDisputes.get(disputeId);
    if (dispute) {
      dispute.status = DisputeStatus.RESOLVED;
      dispute.resolution = resolution;
      dispute.resolvedBy = resolvedBy;
      dispute.resolvedAt = new Date().toISOString();
    }
  }

  async getDispute(disputeId: string): Promise<DisputeRecord | null> {
    await this.simulateDelay(100);
    return this.mockDisputes.get(disputeId) || null;
  }

  // Mortgage operations
  async createMortgage(mortgageData: Partial<MortgageRecord>): Promise<string> {
    await this.simulateDelay(200);
    const mortgageId = mortgageData.mortgageId || `MORT-${Date.now()}`;
    const mortgage: MortgageRecord = {
      ...mortgageData,
      mortgageId,
      status: MortgageStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    } as MortgageRecord;
    
    this.mockMortgages.set(mortgageId, mortgage);
    return mortgageId;
  }

  async closeMortgage(mortgageId: string, closedBy: string): Promise<void> {
    await this.simulateDelay(200);
    const mortgage = this.mockMortgages.get(mortgageId);
    if (mortgage) {
      mortgage.status = MortgageStatus.CLOSED;
      mortgage.lastUpdatedAt = new Date().toISOString();
    }
  }

  async getMortgage(mortgageId: string): Promise<MortgageRecord | null> {
    await this.simulateDelay(100);
    return this.mockMortgages.get(mortgageId) || null;
  }

  async queryMortgagesByLandId(landId: string): Promise<MortgageRecord[]> {
    await this.simulateDelay(150);
    return Array.from(this.mockMortgages.values()).filter((m) => m.landId === landId);
  }

  // Ownership history
  async getOwnershipHistory(landId: string): Promise<OwnershipEvent[]> {
    await this.simulateDelay(150);
    return [
      {
        eventId: 'EVENT-001',
        landId,
        transferType: TransferType.LEGACY_CONVERSION,
        fromOwnerId: 'LEGACY',
        fromOwnerName: 'Legacy System',
        toOwnerId: 'OWNER-001',
        toOwnerName: 'Rajesh Kumar',
        toOwnerAadhaarHash: 'hash_abc123',
        transferDate: new Date('2024-01-15').toISOString(),
        saleAmount: 0,
        saleCurrency: 'INR',
        stampDuty: 0,
        registrationFee: 0,
        deedDocumentHash: 'legacy_hash',
        witnessOfficerId: 'OFFICER-001',
        witnessOfficerName: 'Officer Name',
        biometricVerified: false,
        remarks: 'Legacy system conversion',
      },
    ];
  }

  // Document verification
  async verifyDocumentHash(docId: string, providedHash: string): Promise<boolean> {
    await this.simulateDelay(100);
    // Mock verification - always returns true for demo
    return true;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
