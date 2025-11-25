import { OwnershipEvent } from './ownership-event';
import { DocumentRef } from './document-ref';
/**
 * Land Parcel Model
 * Core entity representing a single land parcel in the registry
 */
export interface LandParcel {
    landId: string;
    surveyNumber: string;
    subDivisionNumber?: string;
    khasraNumber?: string;
    state: string;
    district: string;
    tehsil: string;
    village: string;
    pincode: string;
    area: number;
    areaUnit: string;
    boundaries?: {
        north?: string;
        south?: string;
        east?: string;
        west?: string;
    };
    gpsCoordinates?: {
        latitude: number;
        longitude: number;
        polygon?: Array<{
            lat: number;
            lng: number;
        }>;
    };
    currentOwner: string;
    currentOwnerName: string;
    ownerType: string;
    status: string;
    landType: string;
    landUse?: string;
    irrigationType?: string;
    marketValue?: number;
    governmentValue?: number;
    annualPropertyTax?: number;
    ownershipHistory: OwnershipEvent[];
    documents: DocumentRef[];
    mortgageIds: string[];
    disputeIds: string[];
    createdAt: string;
    createdBy: string;
    lastUpdatedAt: string;
    lastUpdatedBy: string;
    version: number;
    remarks?: string;
    isGovernmentLand: boolean;
    isTribalLand: boolean;
    isForestLand: boolean;
}
export declare function createLandParcel(landId: string, surveyNumber: string, state: string, district: string, tehsil: string, village: string, pincode: string, area: number, areaUnit: string, currentOwner: string, currentOwnerName: string, ownerType: string, landType: string, createdBy: string, genesisOwnershipEvent: OwnershipEvent, genesisDocument?: DocumentRef): LandParcel;
//# sourceMappingURL=land-parcel.d.ts.map