/**
 * Ownership Event Model
 * Records each ownership transfer in the parcel's history chain
 */
export interface OwnershipEvent {
    eventId: string;
    eventType: string;
    fromOwner?: string;
    toOwner: string;
    fromOwnerName?: string;
    toOwnerName: string;
    transactionDate: string;
    registrationNumber?: string;
    documentRef?: string;
    consideration?: number;
    stampDuty?: number;
    witnesses?: string[];
    remarks?: string;
    recordedBy: string;
    biometricVerified: boolean;
}
export declare function createOwnershipEvent(eventId: string, eventType: string, toOwner: string, toOwnerName: string, recordedBy: string, fromOwner?: string, fromOwnerName?: string, registrationNumber?: string, documentRef?: string, consideration?: number, stampDuty?: number, biometricVerified?: boolean): OwnershipEvent;
//# sourceMappingURL=ownership-event.d.ts.map