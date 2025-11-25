/**
 * Dispute Record Model
 * Tracks disputes, litigation, and court cases related to land parcels
 */
export interface DisputeRecord {
  disputeId: string;           // Unique dispute identifier
  landId: string;              // Reference to Land Parcel
  disputeType: string;         // BOUNDARY, OWNERSHIP, FRAUD, INHERITANCE, etc.
  status: string;              // OPEN, UNDER_INVESTIGATION, IN_COURT, RESOLVED, DISMISSED
  filedBy: string;             // Aadhaar ID or entity ID of complainant
  filedByName: string;         // Human-readable name
  filedAgainst?: string;       // Aadhaar ID of defendant
  filedAgainstName?: string;   // Human-readable name
  filedDate: string;           // ISO timestamp
  description: string;         // Dispute description
  courtCaseId?: string;        // Court case number if litigation initiated
  courtName?: string;          // Name of court
  policeComplaintId?: string;  // FIR number if applicable
  resolutionDate?: string;     // Date when resolved
  resolutionDetails?: string;  // Outcome of dispute
  documentRefs?: string[];     // Related document IDs
  freezeParcel: boolean;       // Whether parcel should be frozen
  recordedBy: string;          // MSP ID of recording organization
  lastUpdatedBy?: string;      // MSP ID of last updater
  lastUpdatedAt?: string;      // Last update timestamp
}

export function createDisputeRecord(
  disputeId: string,
  landId: string,
  disputeType: string,
  filedBy: string,
  filedByName: string,
  description: string,
  recordedBy: string,
  freezeParcel = true,
  courtCaseId?: string,
  filedAgainst?: string,
  filedAgainstName?: string
): DisputeRecord {
  return {
    disputeId,
    landId,
    disputeType,
    status: 'OPEN',
    filedBy,
    filedByName,
    filedAgainst,
    filedAgainstName,
    filedDate: new Date().toISOString(),
    description,
    courtCaseId,
    freezeParcel,
    recordedBy,
  };
}
