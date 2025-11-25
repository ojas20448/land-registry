/**
 * Dispute Record Model
 * Tracks disputes, litigation, and court cases related to land parcels
 */
export interface DisputeRecord {
    disputeId: string;
    landId: string;
    disputeType: string;
    status: string;
    filedBy: string;
    filedByName: string;
    filedAgainst?: string;
    filedAgainstName?: string;
    filedDate: string;
    description: string;
    courtCaseId?: string;
    courtName?: string;
    policeComplaintId?: string;
    resolutionDate?: string;
    resolutionDetails?: string;
    documentRefs?: string[];
    freezeParcel: boolean;
    recordedBy: string;
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
}
export declare function createDisputeRecord(disputeId: string, landId: string, disputeType: string, filedBy: string, filedByName: string, description: string, recordedBy: string, freezeParcel?: boolean, courtCaseId?: string, filedAgainst?: string, filedAgainstName?: string): DisputeRecord;
//# sourceMappingURL=dispute-record.d.ts.map