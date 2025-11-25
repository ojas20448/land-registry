"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLandParcel = createLandParcel;
function createLandParcel(landId, surveyNumber, state, district, tehsil, village, pincode, area, areaUnit, currentOwner, currentOwnerName, ownerType, landType, createdBy, genesisOwnershipEvent, genesisDocument) {
    const now = new Date().toISOString();
    return {
        landId,
        surveyNumber,
        state,
        district,
        tehsil,
        village,
        pincode,
        area,
        areaUnit,
        currentOwner,
        currentOwnerName,
        ownerType,
        status: 'ACTIVE',
        landType,
        ownershipHistory: [genesisOwnershipEvent],
        documents: genesisDocument ? [genesisDocument] : [],
        mortgageIds: [],
        disputeIds: [],
        createdAt: now,
        createdBy,
        lastUpdatedAt: now,
        lastUpdatedBy: createdBy,
        version: 1,
        isGovernmentLand: false,
        isTribalLand: false,
        isForestLand: false,
    };
}
//# sourceMappingURL=land-parcel.js.map