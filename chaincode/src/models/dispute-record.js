"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisputeRecord = createDisputeRecord;
function createDisputeRecord(disputeId, landId, disputeType, filedBy, filedByName, description, recordedBy, freezeParcel = true, courtCaseId, filedAgainst, filedAgainstName) {
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
//# sourceMappingURL=dispute-record.js.map