"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocumentRef = createDocumentRef;
function createDocumentRef(documentId, documentHash, documentType, storageUri, uploadedBy, issuedByOrg, metadata) {
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
//# sourceMappingURL=document-ref.js.map