/**
 * Ownership Event Model
 * Records each ownership transfer in the parcel's history chain
 */
export interface OwnershipEvent {
  eventId: string;             // Unique event identifier
  eventType: string;           // GENESIS, SALE, INHERITANCE, GIFT, COURT_ORDER, MUTATION
  fromOwner?: string;          // Previous owner (Aadhaar ID or entity ID)
  toOwner: string;             // New owner (Aadhaar ID or entity ID)
  fromOwnerName?: string;      // Human-readable name
  toOwnerName: string;         // Human-readable name
  transactionDate: string;     // ISO timestamp
  registrationNumber?: string; // Sub-registrar deed number
  documentRef?: string;        // Reference to DocumentRef ID
  consideration?: number;       // Sale amount in INR
  stampDuty?: number;          // Stamp duty paid in INR
  witnesses?: string[];        // Witness Aadhaar IDs
  remarks?: string;            // Additional notes
  recordedBy: string;          // MSP ID of recording organization
  biometricVerified: boolean;  // Whether biometric auth was performed
}

export function createOwnershipEvent(
  eventId: string,
  eventType: string,
  toOwner: string,
  toOwnerName: string,
  recordedBy: string,
  fromOwner?: string,
  fromOwnerName?: string,
  registrationNumber?: string,
  documentRef?: string,
  consideration?: number,
  stampDuty?: number,
  biometricVerified = false
): OwnershipEvent {
  return {
    eventId,
    eventType,
    fromOwner,
    toOwner,
    fromOwnerName,
    toOwnerName,
    transactionDate: new Date().toISOString(),
    registrationNumber,
    documentRef,
    consideration,
    stampDuty,
    recordedBy,
    biometricVerified,
  };
}
