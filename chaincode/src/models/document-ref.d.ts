/**
 * Document Reference Model
 * Stores metadata about documents stored off-chain (DigiLocker/IPFS)
 */
export interface DocumentRef {
    documentId: string;
    documentHash: string;
    documentType: string;
    storageUri: string;
    uploadedAt: string;
    uploadedBy: string;
    issuedByOrg: string;
    encryptionKey?: string;
    metadata?: {
        fileSize?: number;
        mimeType?: string;
        registrationNumber?: string;
        [key: string]: any;
    };
}
export declare function createDocumentRef(documentId: string, documentHash: string, documentType: string, storageUri: string, uploadedBy: string, issuedByOrg: string, metadata?: any): DocumentRef;
//# sourceMappingURL=document-ref.d.ts.map