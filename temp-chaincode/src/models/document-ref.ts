/**
 * Document Reference Model
 * Stores metadata about documents stored off-chain (DigiLocker/IPFS)
 */
export interface DocumentRef {
  documentId: string;          // Unique document identifier
  documentHash: string;         // SHA-256 hash of the document
  documentType: string;         // SALE_DEED, MORTGAGE_DEED, COURT_ORDER, ROR, etc.
  storageUri: string;          // DigiLocker URI or IPFS hash
  uploadedAt: string;          // ISO timestamp
  uploadedBy: string;          // User/org who uploaded
  issuedByOrg: string;         // Issuing organization MSP ID
  encryptionKey?: string;      // Optional: reference to encryption key
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    registrationNumber?: string;
    [key: string]: any;
  };
}

export function createDocumentRef(
  documentId: string,
  documentHash: string,
  documentType: string,
  storageUri: string,
  uploadedBy: string,
  issuedByOrg: string,
  metadata?: any
): DocumentRef {
  return {
    documentId,
    documentHash,
    documentType,
    storageUri,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    issuedByOrg,
    metadata,
  };
}
