"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOwnershipEvent = createOwnershipEvent;
function createOwnershipEvent(eventId, eventType, toOwner, toOwnerName, recordedBy, fromOwner, fromOwnerName, registrationNumber, documentRef, consideration, stampDuty, biometricVerified = false) {
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
//# sourceMappingURL=ownership-event.js.map