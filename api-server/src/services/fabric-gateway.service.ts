import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Fabric Gateway Service
 * Manages connection to Hyperledger Fabric network and chaincode interactions
 */
export class FabricGatewayService {
  private gateway: Gateway | null = null;
  private contract: Contract | null = null;

  /**
   * Connect to Fabric network using Fabric Gateway SDK
   */
  async connect(): Promise<void> {
    try {
      // Load certificates and keys
      const certPath = process.env.FABRIC_CERT_PATH || '';
      const keyPath = process.env.FABRIC_KEY_PATH || '';
      const tlsCertPath = process.env.FABRIC_TLS_CERT_PATH || '';
      
      const credentials = await fs.readFile(certPath);
      const privateKey = await fs.readFile(keyPath);
      const tlsCert = await fs.readFile(tlsCertPath);

      // Create identity and signer
      const identity: Identity = {
        mspId: process.env.FABRIC_MSP_ID || 'OrgRegistrationMSP',
        credentials: credentials,
      };

      const signer: Signer = signers.newPrivateKeySigner(crypto.createPrivateKey(privateKey));

      // Create gRPC client
      const peerEndpoint = process.env.PEER_ENDPOINT || 'localhost:9051';
      const peerHostAlias = process.env.PEER_HOST_ALIAS || 'peer0.registration.landregistry.gov.in';
      
      const tlsCredentials = grpc.credentials.createSsl(tlsCert);
      const client = new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
      });

      // Connect to gateway
      this.gateway = connect({
        client,
        identity,
        signer,
      });

      const network = this.gateway.getNetwork(process.env.FABRIC_NETWORK_NAME || 'land-main-channel');
      this.contract = network.getContract(process.env.FABRIC_CHAINCODE_NAME || 'land-registry-contract');

      console.log('✅ Connected to Fabric Gateway');
    } catch (error) {
      console.error('❌ Failed to connect to Fabric Gateway:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Fabric network
   */
  async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.close();
      this.gateway = null;
      this.contract = null;
      console.log('Disconnected from Fabric Gateway');
    }
  }

  /**
   * Get the contract instance
   */
  getContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call connect() first.');
    }
    return this.contract;
  }

  // ===== CHAINCODE METHODS =====

  /**
   * Create a new land parcel from legacy data
   */
  async createParcelFromLegacyData(
    landId: string,
    surveyNumber: string,
    state: string,
    district: string,
    tehsil: string,
    village: string,
    pincode: string,
    area: number,
    areaUnit: string,
    currentOwner: string,
    currentOwnerName: string,
    ownerType: string,
    landType: string,
    documentHash?: string,
    documentUri?: string
  ): Promise<void> {
    const contract = this.getContract();
    
    await contract.submitTransaction(
      'CreateParcelFromLegacyData',
      landId,
      surveyNumber,
      state,
      district,
      tehsil,
      village,
      pincode,
      area.toString(),
      areaUnit,
      currentOwner,
      currentOwnerName,
      ownerType,
      landType,
      documentHash || '',
      documentUri || ''
    );
  }

  /**
   * Get a land parcel by ID
   */
  async getParcel(landId: string): Promise<any> {
    const contract = this.getContract();
    const resultBytes = await contract.evaluateTransaction('GetParcel', landId);
    return JSON.parse(resultBytes.toString());
  }

  /**
   * Get ownership history of a parcel
   */
  async getOwnershipHistory(landId: string): Promise<any[]> {
    const contract = this.getContract();
    const resultBytes = await contract.evaluateTransaction('GetOwnershipHistory', landId);
    return JSON.parse(resultBytes.toString());
  }

  /**
   * Propose a sale transfer
   */
  async proposeSaleTransfer(
    landId: string,
    newOwner: string,
    newOwnerName: string,
    registrationNumber: string,
    consideration: number,
    stampDuty: number,
    documentHash: string,
    documentUri: string,
    biometricVerified: boolean
  ): Promise<string> {
    const contract = this.getContract();
    
    const resultBytes = await contract.submitTransaction(
      'ProposeSaleTransfer',
      landId,
      newOwner,
      newOwnerName,
      registrationNumber,
      consideration.toString(),
      stampDuty.toString(),
      documentHash,
      documentUri,
      biometricVerified.toString()
    );
    
    return resultBytes.toString();
  }

  /**
   * Finalize a sale transfer
   */
  async finalizeSaleTransfer(landId: string, transactionId: string): Promise<void> {
    const contract = this.getContract();
    await contract.submitTransaction('FinalizeSaleTransfer', landId, transactionId);
  }

  /**
   * Raise a dispute
   */
  async raiseDispute(
    disputeId: string,
    landId: string,
    disputeType: string,
    filedBy: string,
    filedByName: string,
    description: string,
    courtCaseId?: string,
    filedAgainst?: string,
    filedAgainstName?: string
  ): Promise<void> {
    const contract = this.getContract();
    
    await contract.submitTransaction(
      'RaiseDispute',
      disputeId,
      landId,
      disputeType,
      filedBy,
      filedByName,
      description,
      courtCaseId || '',
      filedAgainst || '',
      filedAgainstName || ''
    );
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    disputeId: string,
    resolutionDetails: string,
    reassignOwner?: string,
    reassignOwnerName?: string
  ): Promise<void> {
    const contract = this.getContract();
    
    await contract.submitTransaction(
      'ResolveDispute',
      disputeId,
      resolutionDetails,
      reassignOwner || '',
      reassignOwnerName || ''
    );
  }

  /**
   * Create a mortgage
   */
  async createMortgage(
    mortgageId: string,
    landId: string,
    mortgageType: string,
    borrower: string,
    borrowerName: string,
    lenderName: string,
    loanAmount: number,
    interestRate: number,
    loanTenure: number,
    sanctionLetterHash?: string,
    sanctionLetterUri?: string
  ): Promise<void> {
    const contract = this.getContract();
    
    await contract.submitTransaction(
      'CreateMortgage',
      mortgageId,
      landId,
      mortgageType,
      borrower,
      borrowerName,
      lenderName,
      loanAmount.toString(),
      interestRate.toString(),
      loanTenure.toString(),
      sanctionLetterHash || '',
      sanctionLetterUri || ''
    );
  }

  /**
   * Close a mortgage
   */
  async closeMortgage(mortgageId: string, closureReason: string): Promise<void> {
    const contract = this.getContract();
    await contract.submitTransaction('CloseMortgage', mortgageId, closureReason);
  }

  /**
   * Query parcels by owner
   */
  async queryParcelsByOwner(ownerId: string): Promise<any[]> {
    const contract = this.getContract();
    const resultBytes = await contract.evaluateTransaction('QueryParcelsByOwner', ownerId);
    return JSON.parse(resultBytes.toString());
  }

  /**
   * Query parcels by status
   */
  async queryParcelsByStatus(status: string): Promise<any[]> {
    const contract = this.getContract();
    const resultBytes = await contract.evaluateTransaction('QueryParcelsByStatus', status);
    return JSON.parse(resultBytes.toString());
  }

  /**
   * Query parcels by district
   */
  async queryParcelsByDistrict(state: string, district: string): Promise<any[]> {
    const contract = this.getContract();
    const resultBytes = await contract.evaluateTransaction('QueryParcelsByDistrict', state, district);
    return JSON.parse(resultBytes.toString());
  }
}

// Export singleton instance
export const fabricGateway = new FabricGatewayService();
