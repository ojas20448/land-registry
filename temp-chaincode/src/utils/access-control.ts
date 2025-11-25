import { Context } from 'fabric-contract-api';

/**
 * Access Control Utility
 * Role-based access control using Fabric client identity attributes
 */

export enum Role {
  REVENUE_ADMIN = 'revenue.admin',
  REVENUE_OFFICER = 'revenue.officer',
  REGISTRAR_ADMIN = 'registrar.admin',
  REGISTRAR_OFFICER = 'registrar.officer',
  BANK_ADMIN = 'bank.admin',
  BANK_OFFICER = 'bank.officer',
  GOVTECH_ADMIN = 'govtech.admin',
  CITIZEN = 'citizen',
  PUBLIC = 'public',
}

export class AccessControl {
  /**
   * Get the MSP ID of the client
   */
  static getClientMSPID(ctx: Context): string {
    return ctx.clientIdentity.getMSPID();
  }

  /**
   * Get client ID (X.509 Common Name)
   */
  static getClientID(ctx: Context): string {
    return ctx.clientIdentity.getID();
  }

  /**
   * Get client attribute value
   */
  static getClientAttribute(ctx: Context, attrName: string): string | null {
    return ctx.clientIdentity.getAttributeValue(attrName);
  }

  /**
   * Check if client belongs to Revenue Department
   */
  static isRevenueDept(ctx: Context): boolean {
    const mspId = this.getClientMSPID(ctx);
    return mspId === 'OrgRevenueMSP';
  }

  /**
   * Check if client belongs to Registration Department
   */
  static isRegistrar(ctx: Context): boolean {
    const mspId = this.getClientMSPID(ctx);
    return mspId === 'OrgRegistrationMSP';
  }

  /**
   * Check if client belongs to Bank
   */
  static isBank(ctx: Context): boolean {
    const mspId = this.getClientMSPID(ctx);
    return mspId === 'OrgBankMSP';
  }

  /**
   * Check if client belongs to GovTech (Admin)
   */
  static isGovTech(ctx: Context): boolean {
    const mspId = this.getClientMSPID(ctx);
    return mspId === 'OrgGovTechMSP';
  }

  /**
   * Check if client is authorized to create parcels
   * Only Revenue Dept and Registrar can create new parcels
   */
  static canCreateParcel(ctx: Context): boolean {
    return this.isRevenueDept(ctx) || this.isRegistrar(ctx);
  }

  /**
   * Check if client is authorized to transfer ownership
   * Only Registrar can finalize transfers
   */
  static canTransferOwnership(ctx: Context): boolean {
    return this.isRegistrar(ctx);
  }

  /**
   * Check if client is authorized to raise disputes
   * Revenue Dept, Courts (via Revenue), or GovTech
   */
  static canRaiseDispute(ctx: Context): boolean {
    return this.isRevenueDept(ctx) || this.isGovTech(ctx);
  }

  /**
   * Check if client is authorized to resolve disputes
   * Revenue Dept and GovTech (court orders)
   */
  static canResolveDispute(ctx: Context): boolean {
    return this.isRevenueDept(ctx) || this.isGovTech(ctx);
  }

  /**
   * Check if client is authorized to create/close mortgages
   * Only Banks
   */
  static canManageMortgage(ctx: Context): boolean {
    return this.isBank(ctx);
  }

  /**
   * Check if client has admin privileges
   */
  static isAdmin(ctx: Context): boolean {
    const role = this.getClientAttribute(ctx, 'role');
    return role === 'admin' || this.isGovTech(ctx);
  }

  /**
   * Assert that client has required permission, throw error if not
   */
  static assertPermission(ctx: Context, check: boolean, message: string): void {
    if (!check) {
      const mspId = this.getClientMSPID(ctx);
      const clientId = this.getClientID(ctx);
      throw new Error(`Access Denied: ${message}. Client: ${clientId}, MSP: ${mspId}`);
    }
  }

  /**
   * Validate that current owner matches the claimed owner
   */
  static validateOwnership(
    ctx: Context,
    parcelOwnerId: string,
    claimedOwnerId: string
  ): void {
    if (parcelOwnerId !== claimedOwnerId) {
      throw new Error(
        `Ownership mismatch: Parcel owner is ${parcelOwnerId} but claim is for ${claimedOwnerId}`
      );
    }
  }
}
