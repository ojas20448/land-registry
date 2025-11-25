import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { LandParcel, createLandParcel } from '../models/land-parcel';
import { OwnershipEvent, createOwnershipEvent } from '../models/ownership-event';
import { DocumentRef, createDocumentRef } from '../models/document-ref';
import { DisputeRecord, createDisputeRecord } from '../models/dispute-record';
import { MortgageRecord, createMortgageRecord } from '../models/mortgage-record';
import { AccessControl } from '../utils/access-control';

@Info({ title: 'LandRegistryContract', description: 'Smart contract for land registration in India' })
export class LandRegistryContract extends Contract {
  /**
   * Initialize the ledger with sample data (optional)
   */
  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    AccessControl.assertPermission(
      ctx,
      AccessControl.isGovTech(ctx),
      'Only GovTech admin can initialize ledger'
    );

    console.log('Ledger initialized successfully');
  }

  // ===== PARCEL MANAGEMENT =====

  /**
   * Create a new land parcel from legacy RoR data
   * Only Revenue Department can onboard legacy data
   */
  @Transaction()
  public async CreateParcelFromLegacyData(
    ctx: Context,
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
    AccessControl.assertPermission(
      ctx,
      AccessControl.canCreateParcel(ctx),
      'Only Revenue/Registrar can create parcels'
    );

    // Check if parcel already exists
    const exists = await this.ParcelExists(ctx, landId);
    if (exists) {
      throw new Error(`Land parcel ${landId} already exists`);
    }

    const mspId = AccessControl.getClientMSPID(ctx);
    const clientId = AccessControl.getClientID(ctx);

    // Create genesis ownership event
    const genesisEvent = createOwnershipEvent(
      `${landId}-GENESIS`,
      'GENESIS',
      currentOwner,
      currentOwnerName,
      mspId,
      undefined,
      undefined,
      undefined,
      undefined,
      0,
      0,
      false
    );

    // Create genesis document reference if provided
    let genesisDoc: DocumentRef | undefined;
    if (documentHash && documentUri) {
      genesisDoc = createDocumentRef(
        `${landId}-DOC-GENESIS`,
        documentHash,
        'ROR',
        documentUri,
        clientId,
        mspId,
        { description: 'Genesis Record of Rights' }
      );
    }

    // Create land parcel
    const parcel = createLandParcel(
      landId,
      surveyNumber,
      state,
      district,
      tehsil,
      village,
      pincode,
      area,
      areaUnit,
      currentOwner,
      currentOwnerName,
      ownerType,
      landType,
      mspId,
      genesisEvent,
      genesisDoc
    );

    // Save to ledger
    await ctx.stub.putState(landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent('ParcelCreated', Buffer.from(JSON.stringify({ landId, surveyNumber })));
  }

  /**
   * Get a land parcel by ID
   */
  @Transaction(false)
  @Returns('string')
  public async GetParcel(ctx: Context, landId: string): Promise<string> {
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }
    return parcelBytes.toString();
  }

  /**
   * Get complete ownership history of a parcel
   */
  @Transaction(false)
  @Returns('string')
  public async GetOwnershipHistory(ctx: Context, landId: string): Promise<string> {
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }

    const parcel: LandParcel = JSON.parse(parcelBytes.toString());
    return JSON.stringify(parcel.ownershipHistory);
  }

  /**
   * Check if parcel exists
   */
  @Transaction(false)
  @Returns('boolean')
  public async ParcelExists(ctx: Context, landId: string): Promise<boolean> {
    const parcelBytes = await ctx.stub.getState(landId);
    return parcelBytes && parcelBytes.length > 0;
  }

  // ===== OWNERSHIP TRANSFER =====

  /**
   * Propose a sale transfer
   * Registrar validates and proposes the transfer before finalization
   */
  @Transaction()
  public async ProposeSaleTransfer(
    ctx: Context,
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
    AccessControl.assertPermission(
      ctx,
      AccessControl.canTransferOwnership(ctx),
      'Only Registrar can propose transfers'
    );

    // Get parcel
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }
    const parcel: LandParcel = JSON.parse(parcelBytes.toString());

    // Validate parcel is transferable
    if (parcel.status === 'FROZEN' || parcel.status === 'UNDER_DISPUTE') {
      throw new Error(`Cannot transfer parcel ${landId}: status is ${parcel.status}`);
    }

    if (parcel.mortgageIds.length > 0) {
      throw new Error(`Cannot transfer parcel ${landId}: parcel has active mortgages`);
    }

    const mspId = AccessControl.getClientMSPID(ctx);
    const clientId = AccessControl.getClientID(ctx);
    const transactionId = ctx.stub.getTxID();

    // Create document reference for sale deed
    const saleDoc = createDocumentRef(
      `${landId}-DOC-${transactionId}`,
      documentHash,
      'SALE_DEED',
      documentUri,
      clientId,
      mspId,
      {
        registrationNumber,
        consideration,
        stampDuty,
        transactionId,
      }
    );

    // Create ownership event
    const ownershipEvent = createOwnershipEvent(
      `${landId}-EVENT-${transactionId}`,
      'SALE',
      newOwner,
      newOwnerName,
      mspId,
      parcel.currentOwner,
      parcel.currentOwnerName,
      registrationNumber,
      saleDoc.documentId,
      consideration,
      stampDuty,
      biometricVerified
    );

    // Update parcel
    parcel.currentOwner = newOwner;
    parcel.currentOwnerName = newOwnerName;
    parcel.ownershipHistory.push(ownershipEvent);
    parcel.documents.push(saleDoc);
    parcel.lastUpdatedAt = new Date().toISOString();
    parcel.lastUpdatedBy = mspId;
    parcel.version += 1;

    // Save updated parcel
    await ctx.stub.putState(landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent(
      'OwnershipTransferred',
      Buffer.from(
        JSON.stringify({
          landId,
          fromOwner: ownershipEvent.fromOwner,
          toOwner: newOwner,
          transactionId,
        })
      )
    );

    return transactionId;
  }

  /**
   * Finalize sale transfer (same as propose, kept for workflow separation)
   * In production, this could be a separate approval step
   */
  @Transaction()
  public async FinalizeSaleTransfer(
    ctx: Context,
    landId: string,
    transactionId: string
  ): Promise<void> {
    AccessControl.assertPermission(
      ctx,
      AccessControl.canTransferOwnership(ctx),
      'Only Registrar can finalize transfers'
    );

    // Validate parcel and transaction exist
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }

    console.log(`Transfer ${transactionId} for parcel ${landId} finalized`);
  }

  // ===== DISPUTE MANAGEMENT =====

  /**
   * Raise a dispute and freeze the parcel
   */
  @Transaction()
  public async RaiseDispute(
    ctx: Context,
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
    AccessControl.assertPermission(
      ctx,
      AccessControl.canRaiseDispute(ctx),
      'Only Revenue/Court can raise disputes'
    );

    // Get parcel
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }
    const parcel: LandParcel = JSON.parse(parcelBytes.toString());

    const mspId = AccessControl.getClientMSPID(ctx);

    // Create dispute record
    const dispute = createDisputeRecord(
      disputeId,
      landId,
      disputeType,
      filedBy,
      filedByName,
      description,
      mspId,
      true,
      courtCaseId,
      filedAgainst,
      filedAgainstName
    );

    // Save dispute record
    await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));

    // Update parcel status
    parcel.status = 'UNDER_DISPUTE';
    parcel.disputeIds.push(disputeId);
    parcel.lastUpdatedAt = new Date().toISOString();
    parcel.lastUpdatedBy = mspId;
    parcel.version += 1;

    await ctx.stub.putState(landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent(
      'DisputeRaised',
      Buffer.from(JSON.stringify({ disputeId, landId, disputeType }))
    );
  }

  /**
   * Resolve a dispute and optionally unfreeze the parcel
   */
  @Transaction()
  public async ResolveDispute(
    ctx: Context,
    disputeId: string,
    resolutionDetails: string,
    reassignOwner?: string,
    reassignOwnerName?: string
  ): Promise<void> {
    AccessControl.assertPermission(
      ctx,
      AccessControl.canResolveDispute(ctx),
      'Only Revenue/Court can resolve disputes'
    );

    // Get dispute
    const disputeBytes = await ctx.stub.getState(disputeId);
    if (!disputeBytes || disputeBytes.length === 0) {
      throw new Error(`Dispute ${disputeId} does not exist`);
    }
    const dispute: DisputeRecord = JSON.parse(disputeBytes.toString());

    const mspId = AccessControl.getClientMSPID(ctx);

    // Update dispute
    dispute.status = 'RESOLVED';
    dispute.resolutionDate = new Date().toISOString();
    dispute.resolutionDetails = resolutionDetails;
    dispute.lastUpdatedBy = mspId;
    dispute.lastUpdatedAt = new Date().toISOString();

    await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));

    // Get parcel
    const parcelBytes = await ctx.stub.getState(dispute.landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${dispute.landId} does not exist`);
    }
    const parcel: LandParcel = JSON.parse(parcelBytes.toString());

    // If owner reassignment is ordered by court
    if (reassignOwner && reassignOwnerName) {
      const courtOrderEvent = createOwnershipEvent(
        `${dispute.landId}-EVENT-COURT-${ctx.stub.getTxID()}`,
        'COURT_ORDER',
        reassignOwner,
        reassignOwnerName,
        mspId,
        parcel.currentOwner,
        parcel.currentOwnerName,
        dispute.courtCaseId
      );

      parcel.currentOwner = reassignOwner;
      parcel.currentOwnerName = reassignOwnerName;
      parcel.ownershipHistory.push(courtOrderEvent);
    }

    // Check if all disputes are resolved
    const allResolved = await this.checkAllDisputesResolved(ctx, parcel.disputeIds);
    if (allResolved) {
      parcel.status = 'ACTIVE';
    }

    parcel.lastUpdatedAt = new Date().toISOString();
    parcel.lastUpdatedBy = mspId;
    parcel.version += 1;

    await ctx.stub.putState(dispute.landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent(
      'DisputeResolved',
      Buffer.from(JSON.stringify({ disputeId, landId: dispute.landId }))
    );
  }

  /**
   * Helper: Check if all disputes for a parcel are resolved
   */
  private async checkAllDisputesResolved(ctx: Context, disputeIds: string[]): Promise<boolean> {
    for (const disputeId of disputeIds) {
      const disputeBytes = await ctx.stub.getState(disputeId);
      if (disputeBytes && disputeBytes.length > 0) {
        const dispute: DisputeRecord = JSON.parse(disputeBytes.toString());
        if (dispute.status !== 'RESOLVED' && dispute.status !== 'DISMISSED') {
          return false;
        }
      }
    }
    return true;
  }

  // ===== MORTGAGE MANAGEMENT =====

  /**
   * Create a mortgage on a parcel
   */
  @Transaction()
  public async CreateMortgage(
    ctx: Context,
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
    AccessControl.assertPermission(
      ctx,
      AccessControl.canManageMortgage(ctx),
      'Only Banks can create mortgages'
    );

    // Get parcel
    const parcelBytes = await ctx.stub.getState(landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${landId} does not exist`);
    }
    const parcel: LandParcel = JSON.parse(parcelBytes.toString());

    // Validate parcel is mortgageable
    if (parcel.status === 'FROZEN' || parcel.status === 'UNDER_DISPUTE') {
      throw new Error(`Cannot mortgage parcel ${landId}: status is ${parcel.status}`);
    }

    // Validate borrower is current owner
    if (parcel.currentOwner !== borrower) {
      throw new Error(`Borrower ${borrower} is not the current owner of parcel ${landId}`);
    }

    const mspId = AccessControl.getClientMSPID(ctx);
    const clientId = AccessControl.getClientID(ctx);

    // Create sanction letter document if provided
    let sanctionDoc: string | undefined;
    if (sanctionLetterHash && sanctionLetterUri) {
      const doc = createDocumentRef(
        `${mortgageId}-DOC-SANCTION`,
        sanctionLetterHash,
        'SANCTION_LETTER',
        sanctionLetterUri,
        clientId,
        mspId
      );
      await ctx.stub.putState(doc.documentId, Buffer.from(JSON.stringify(doc)));
      sanctionDoc = doc.documentId;
    }

    // Create mortgage record
    const mortgage = createMortgageRecord(
      mortgageId,
      landId,
      mortgageType,
      borrower,
      borrowerName,
      mspId,
      lenderName,
      loanAmount,
      interestRate,
      loanTenure,
      mspId,
      sanctionDoc
    );

    await ctx.stub.putState(mortgageId, Buffer.from(JSON.stringify(mortgage)));

    // Update parcel
    parcel.mortgageIds.push(mortgageId);
    parcel.status = 'MORTGAGED';
    parcel.lastUpdatedAt = new Date().toISOString();
    parcel.lastUpdatedBy = mspId;
    parcel.version += 1;

    await ctx.stub.putState(landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent(
      'MortgageCreated',
      Buffer.from(JSON.stringify({ mortgageId, landId, loanAmount }))
    );
  }

  /**
   * Close a mortgage
   */
  @Transaction()
  public async CloseMortgage(
    ctx: Context,
    mortgageId: string,
    closureReason: string
  ): Promise<void> {
    AccessControl.assertPermission(
      ctx,
      AccessControl.canManageMortgage(ctx),
      'Only Banks can close mortgages'
    );

    // Get mortgage
    const mortgageBytes = await ctx.stub.getState(mortgageId);
    if (!mortgageBytes || mortgageBytes.length === 0) {
      throw new Error(`Mortgage ${mortgageId} does not exist`);
    }
    const mortgage: MortgageRecord = JSON.parse(mortgageBytes.toString());

    const mspId = AccessControl.getClientMSPID(ctx);

    // Update mortgage
    mortgage.status = 'CLOSED';
    mortgage.closureDate = new Date().toISOString();
    mortgage.closureReason = closureReason;
    mortgage.outstandingAmount = 0;
    mortgage.lastUpdatedBy = mspId;
    mortgage.lastUpdatedAt = new Date().toISOString();

    await ctx.stub.putState(mortgageId, Buffer.from(JSON.stringify(mortgage)));

    // Get parcel
    const parcelBytes = await ctx.stub.getState(mortgage.landId);
    if (!parcelBytes || parcelBytes.length === 0) {
      throw new Error(`Land parcel ${mortgage.landId} does not exist`);
    }
    const parcel: LandParcel = JSON.parse(parcelBytes.toString());

    // Remove mortgage from parcel
    parcel.mortgageIds = parcel.mortgageIds.filter((id) => id !== mortgageId);

    // Update status if no more mortgages
    if (parcel.mortgageIds.length === 0 && parcel.status === 'MORTGAGED') {
      parcel.status = 'ACTIVE';
    }

    parcel.lastUpdatedAt = new Date().toISOString();
    parcel.lastUpdatedBy = mspId;
    parcel.version += 1;

    await ctx.stub.putState(mortgage.landId, Buffer.from(JSON.stringify(parcel)));

    // Emit event
    ctx.stub.setEvent(
      'MortgageClosed',
      Buffer.from(JSON.stringify({ mortgageId, landId: mortgage.landId }))
    );
  }

  // ===== RICH QUERIES =====

  /**
   * Query parcels by owner (requires CouchDB)
   */
  @Transaction(false)
  @Returns('string')
  public async QueryParcelsByOwner(ctx: Context, ownerId: string): Promise<string> {
    const query = {
      selector: {
        currentOwner: ownerId,
      },
    };

    const queryString = JSON.stringify(query);
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const results = await this.getAllResults(resultsIterator);
    return JSON.stringify(results);
  }

  /**
   * Query parcels by status
   */
  @Transaction(false)
  @Returns('string')
  public async QueryParcelsByStatus(ctx: Context, status: string): Promise<string> {
    const query = {
      selector: {
        status: status,
      },
    };

    const queryString = JSON.stringify(query);
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const results = await this.getAllResults(resultsIterator);
    return JSON.stringify(results);
  }

  /**
   * Query parcels by location (district)
   */
  @Transaction(false)
  @Returns('string')
  public async QueryParcelsByDistrict(
    ctx: Context,
    state: string,
    district: string
  ): Promise<string> {
    const query = {
      selector: {
        state: state,
        district: district,
      },
    };

    const queryString = JSON.stringify(query);
    const resultsIterator = await ctx.stub.getQueryResult(queryString);
    const results = await this.getAllResults(resultsIterator);
    return JSON.stringify(results);
  }

  /**
   * Helper: Convert iterator to array
   */
  private async getAllResults(iterator: any): Promise<any[]> {
    const allResults = [];
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    await iterator.close();
    return allResults;
  }
}
